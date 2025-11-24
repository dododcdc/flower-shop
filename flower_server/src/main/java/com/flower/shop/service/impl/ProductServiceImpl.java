package com.flower.shop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.flower.shop.dto.ProductSearchRequest;
import com.flower.shop.dto.ImageDetailResult;
import com.flower.shop.entity.Product;
import com.flower.shop.entity.ProductImage;
import com.flower.shop.mapper.ProductImageMapper;
import com.flower.shop.mapper.ProductMapper;
import com.flower.shop.service.ProductService;
import com.flower.shop.config.FileUploadConfig;
import com.flower.shop.service.ProductImageService;
import com.flower.shop.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 商品服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements ProductService {

    
    private final ProductMapper productMapper;
    private final FileUploadConfig fileUploadConfig;
    private final ProductImageMapper productImageMapper;
    private final ProductImageService productImageService;

    
    @Override
    public IPage<Product> searchProductsAdvanced(ProductSearchRequest request) {
        log.debug("搜索商品，请求参数: {}", request);

        Page<Product> page = new Page<>(request.getCurrent(), request.getSize());

        // 使用优化的查询，一次性获取主图信息，避免N+1查询
        IPage<Product> productPage = productMapper.searchProductsWithMainImage(page, request);

        log.debug("搜索完成，返回{}个商品", productPage.getRecords().size());
        return productPage;
    }

    
    @Override
    @Transactional
    public Product createProduct(Product product) {
        // 验证商品数据
        if (product == null) {
            throw new IllegalArgumentException("商品数据不能为空");
        }
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("商品名称不能为空");
        }
        if (product.getCategoryId() == null) {
            throw new IllegalArgumentException("商品分类不能为空");
        }
        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("商品价格必须大于0");
        }

        // 检查名称是否重复
        int count = productMapper.countByNameExcludeId(product.getName(), null);
        if (count > 0) {
            throw new IllegalArgumentException("商品名称已存在：" + product.getName());
        }

        // 设置默认值
        if (product.getStatus() == null) {
            product.setStatus(1); // 默认上架
        }
        if (product.getFeatured() == null) {
            product.setFeatured(0); // 默认不推荐
        }

        // 保存商品
        save(product);
        log.info("创建商品成功：{}", product.getName());

        return getProductWithDetails(product.getId());
    }

    
    @Override
    @Transactional
    public Product createProductWithImages(Product product, List<String> imagePaths, Integer mainImageIndex) {
        // 首先创建商品基本信息
        Product createdProduct = this.createProduct(product);

        if (imagePaths != null && !imagePaths.isEmpty()) {
            // 验证主图索引（移到循环外部）
            if (mainImageIndex == null) {
                throw new IllegalArgumentException("创建商品必须指定主图索引");
            }
            if (mainImageIndex < 0 || mainImageIndex >= imagePaths.size()) {
                throw new IllegalArgumentException("主图索引无效：" + mainImageIndex + "，图片总数：" + imagePaths.size());
            }

            // 保存图片信息
            for (int i = 0; i < imagePaths.size(); i++) {
                ProductImage productImage = new ProductImage();
                productImage.setProductId(createdProduct.getId());
                productImage.setImagePath(imagePaths.get(i));

                // 设置图片类型：根据传入的主图索引
                if (i == mainImageIndex) {
                    productImage.setImageType(1); // 主图
                } else {
                    productImage.setImageType(2); // 副图
                }

                productImage.setSortOrder(i); // 根据列表顺序排序
                productImageMapper.insert(productImage);
            }
        }

        log.info("创建商品并保存图片成功：{}", createdProduct.getName());
        // 重新查询并返回完整信息
        return getProductWithDetails(createdProduct.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Product updateProductWithImages(ProductService.ProductUpdateRequest request) {
        try {
            Long productId = request.getProduct().getId();
            log.debug("开始更新商品及其图片，商品ID: {}", productId);

            // 1. 更新商品基本信息
            updateById(request.getProduct());

            // 2. 验证主图唯一性
            validateMainImageUniqueness(request);

            // 3. 处理图片更新
            ImageUpdateResult updateResult = processImageUpdates(request, productId);

            // 4. 确保只有一个主图
            ensureSingleMainImage(productId);

            // 5. 异步清理已删除的物理文件
            scheduleFileDeletion(updateResult.getDeletedImagePaths());

            log.info("更新商品并处理图片成功：{}", request.getProduct().getName());
            return getProductWithDetails(productId);

        } catch (Exception e) {
            log.error("更新商品失败，事务回滚", e);
            throw new RuntimeException("更新商品失败: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public boolean deleteProduct(Long productId) {
        // 检查商品是否存在
        Product product = getById(productId);
        if (product == null) {
            throw new IllegalArgumentException("商品不存在：" + productId);
        }

        // 检查是否有未完成的订单（这里简化处理）
        // 实际业务中需要检查订单状态

        // 删除商品相关的图片记录和物理文件
        try {
            // 获取商品的所有图片路径
            List<ProductImage> productImages = productImageMapper.selectByProductId(productId);
            List<String> imagePaths = Collections.emptyList();
            if (productImages != null) {
                imagePaths = productImages.stream()
                    .filter(Objects::nonNull)
                    .map(ProductImage::getImagePath)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            }

            // 删除图片记录
            productImageMapper.deleteByProductId(productId);

            // 删除物理文件
            if (!imagePaths.isEmpty()) {
                FileUploadUtil.deleteFiles(imagePaths, fileUploadConfig.getUploadPath());
                log.info("已删除商品 {} 的 {} 个图片文件", productId, imagePaths.size());
            }
        } catch (Exception e) {
            log.error("删除商品图片文件失败，商品ID: {}, 错误: {}", productId, e.getMessage());
            // 图片删除失败不影响商品删除操作
        }

        // 删除商品
        boolean result = removeById(productId);
        if (result) {
            log.info("删除商品成功：{}", productId);
        }
        return result;
    }

    @Override
    @Transactional
    public boolean toggleProductStatus(Long productId, Integer status) {
        Product product = getById(productId);
        if (product == null) {
            throw new IllegalArgumentException("商品不存在：" + productId);
        }

        product.setStatus(status);
        boolean result = updateById(product);
        if (result) {
            log.info("更新商品状态成功：productId={}, status={}", productId, status);
        }
        return result;
    }



    @Override
    public Product getProductWithDetails(Long productId) {
        log.debug("获取商品详情，商品ID: {}", productId);

        // 获取商品基本信息
        Product product = getById(productId);
        if (product == null) {
            return null;
        }

        // 设置分类名称（临时存储）
        if (product.getCategoryId() != null) {
            // 这里应该从categoryService获取分类信息
            // 简化处理
        }

        // 委托给图片服务处理图片逻辑
        ImageDetailResult imageResult = productImageService.getProductImageDetails(productId);

        // 设置图片信息
        product.setImageList(imageResult.getImagePaths());
        product.setImages(imageResult.getImageDetails());
        product.setMainImagePath(imageResult.getMainImagePath());

        return product;
    }

    
    
    
    // ==================== 图片管理支持类 ====================

    /**
     * 验证主图唯一性
     */
    private void validateMainImageUniqueness(ProductService.ProductUpdateRequest request) {
        productImageService.validateMainImageUniqueness(
            request.getExistingImages(),
            request.getNewImages()
        );
    }

    /**
     * 验证只有一个主图（仅验证，不自动修复）
     */
    private void ensureSingleMainImage(Long productId) {
        productImageService.ensureSingleMainImage(productId);
    }

    /**
     * 删除物理文件
     */
    private void deletePhysicalFiles(List<String> imagePaths) {
        if (imagePaths != null && !imagePaths.isEmpty()) {
            for (String imagePath : imagePaths) {
                try {
                    FileUploadUtil.deleteFile(imagePath, fileUploadConfig.getUploadPath());
                    log.info("已删除图片文件: {}", imagePath);
                } catch (Exception e) {
                    log.warn("删除图片文件失败: {}", imagePath, e);
                }
            }
        }
    }

    /**
     * 处理图片更新
     */
    private ImageUpdateResult processImageUpdates(ProductService.ProductUpdateRequest request, Long productId) {
        List<String> deletedImagePaths = new ArrayList<>();
        List<String> addedImagePaths = new ArrayList<>();

        // 处理现有图片
        if (request.getExistingImages() != null) {
            for (ProductService.ExistingImageInfo existingImg : request.getExistingImages()) {
                if (existingImg.getIsDeleted()) {
                    deletedImagePaths.add(existingImg.getImagePath());
                    productImageMapper.deleteById(existingImg.getId());
                } else {
                    ProductImage updateImg = new ProductImage();
                    updateImg.setId(existingImg.getId());
                    updateImg.setImageType(existingImg.getImageType());
                    updateImg.setSortOrder(existingImg.getSortOrder());
                    productImageMapper.updateById(updateImg);
                }
            }
        }

        // 处理新增图片
        if (request.getNewImages() != null) {
            for (ProductService.NewImageInfo newImg : request.getNewImages()) {
                try {
                    String imagePath = FileUploadUtil.uploadFile(newImg.getImageFile(), fileUploadConfig.getUploadPath());
                    addedImagePaths.add(imagePath);

                    ProductImage productImage = new ProductImage();
                    productImage.setProductId(productId);
                    productImage.setImagePath(imagePath);
                    productImage.setImageType(newImg.getImageType());
                    productImage.setSortOrder(newImg.getSortOrder());
                    productImageMapper.insert(productImage);

                } catch (Exception e) {
                    log.error("上传图片失败", e);
                    throw new RuntimeException("图片上传失败: " + e.getMessage(), e);
                }
            }
        }

        return new ImageUpdateResult(deletedImagePaths, addedImagePaths);
    }

    /**
     * 异步清理删除的文件
     */
    private void scheduleFileDeletion(List<String> imagePaths) {
        if (imagePaths == null || imagePaths.isEmpty()) {
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(
            new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    deletePhysicalFiles(imagePaths);
                }
            }
        );
    }

    /**
     * 图片更新结果
     */
    private static class ImageUpdateResult {
        private final List<String> deletedImagePaths;
        private final List<String> addedImagePaths;

        public ImageUpdateResult(List<String> deletedImagePaths, List<String> addedImagePaths) {
            this.deletedImagePaths = new ArrayList<>(deletedImagePaths);
            this.addedImagePaths = new ArrayList<>(addedImagePaths);
        }

        public List<String> getDeletedImagePaths() {
            return Collections.unmodifiableList(deletedImagePaths);
        }

        public List<String> getAddedImagePaths() {
            return Collections.unmodifiableList(addedImagePaths);
        }
    }

    // 这些支持类已移到ProductService接口中
}