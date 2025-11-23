package com.flower.shop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.flower.shop.dto.ProductSearchRequest;
import com.flower.shop.entity.Product;
import com.flower.shop.entity.ProductImage;
import com.flower.shop.mapper.ProductImageMapper;
import com.flower.shop.mapper.ProductMapper;
import com.flower.shop.service.ProductService;
import com.flower.shop.config.FileUploadConfig;
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

    
    @Override
    public IPage<Product> searchProductsAdvanced(ProductSearchRequest request) {
        Page<Product> page = new Page<>(request.getCurrent(), request.getSize());
        IPage<Product> productPage = productMapper.searchProductsAdvanced(page, request);

        // 批量设置主图信息，避免N+1查询
        List<Product> products = productPage.getRecords();
        if (products != null && !products.isEmpty()) {
            setMainImagesForProducts(products);
        }

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

            // 1. 更新商品基本信息
            Product product = request.getProduct();
            updateById(product);

            // 2. 验证主图唯一性
            validateMainImageUniqueness(request);

            // 3. 处理现有图片
            List<String> imagePathsToDelete = new ArrayList<>();
            if (request.getExistingImages() != null) {
                for (ProductService.ExistingImageInfo existingImg : request.getExistingImages()) {
                    if (existingImg.getIsDeleted()) {
                        // 标记待删除的物理文件路径
                        imagePathsToDelete.add(existingImg.getImagePath());
                        // 删除数据库记录
                        productImageMapper.deleteById(existingImg.getId());
                    } else {
                        // 更新图片信息
                        ProductImage updateImg = new ProductImage();
                        updateImg.setId(existingImg.getId());
                        updateImg.setImageType(existingImg.getImageType());
                        updateImg.setSortOrder(existingImg.getSortOrder());
                        productImageMapper.updateById(updateImg);
                    }
                }
            }

            // 4. 处理新增图片
            if (request.getNewImages() != null) {
                for (ProductService.NewImageInfo newImg : request.getNewImages()) {
                    // 上传文件
                    String imagePath = FileUploadUtil.uploadFile(newImg.getImageFile(), fileUploadConfig.getUploadPath());

                    // 插入数据库记录
                    ProductImage productImage = new ProductImage();
                    productImage.setProductId(productId);
                    productImage.setImagePath(imagePath);
                    productImage.setImageType(newImg.getImageType());
                    productImage.setSortOrder(newImg.getSortOrder());
                    productImageMapper.insert(productImage);
                }
            }

            // 5. 确保只有一个主图
            ensureSingleMainImage(productId);

            // 6. 清理已删除的物理文件（在事务成功后执行）
            TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        deletePhysicalFiles(imagePathsToDelete);
                    }
                }
            );

            log.info("更新商品并处理图片成功：{}", product.getName());
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


    // todo 评估这个方法
    @Override
    public Product getProductWithDetails(Long productId) {
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

        // 获取商品图片信息
        List<ProductMapper.ProductImageInfo> productImageInfos = productMapper.selectProductImagesWithDetails(productId);
        if (productImageInfos != null && !productImageInfos.isEmpty()) {
            // 提取图片路径列表
            List<String> imagePaths = productImageInfos.stream()
                .map(ProductMapper.ProductImageInfo::getImagePath)
                .collect(Collectors.toList());

            product.setImageList(imagePaths);

            // 创建详细的图片信息
            List<Product.ProductImageDetail> imageDetails = productImageInfos.stream()
                .map(info -> {
                    Product.ProductImageDetail detail = new Product.ProductImageDetail();
                    detail.setId(info.getId());
                    detail.setImagePath(info.getImagePath());
                    detail.setImageType(info.getImageType());
                    detail.setSortOrder(info.getSortOrder());
                    detail.setImageUrl(fileUploadConfig.getBaseUrl() + info.getImagePath());
                    return detail;
                })
                .collect(Collectors.toList());

            product.setImages(imageDetails);

            // 获取主图
            ProductImage mainImage = productImageMapper.selectMainImage(productId);
            if (mainImage != null) {
                product.setMainImagePath(mainImage.getImagePath());
            } else if (!imagePaths.isEmpty()) {
                // 如果没有标记为主图的图片，使用第一张图片作为主图
                product.setMainImagePath(imagePaths.get(0));
            }
        }

        return product;
    }

    
    
    
    // ==================== 辅助方法 ====================

    /**
     * 批量设置商品主图信息，避免N+1查询
     */
    private void setMainImagesForProducts(List<Product> products) {
        if (products == null || products.isEmpty()) {
            return;
        }

        List<Long> productIds = products.stream()
                .filter(Objects::nonNull)
                .map(Product::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (productIds.isEmpty()) {
            return;
        }

        List<ProductMapper.MainImageInfo> mainImageInfos = productMapper.selectMainImageByProductIds(productIds);
        if (mainImageInfos == null) {
            mainImageInfos = Collections.emptyList();
        }

        // 将查询结果转换为Map，方便查找
        Map<Long, String> mainImageMap = mainImageInfos.stream()
                .collect(Collectors.toMap(
                        ProductMapper.MainImageInfo::getProductId,
                        ProductMapper.MainImageInfo::getImagePath
                ));

        // 为每个商品设置主图信息
        for (Product product : products) {
            String mainImagePath = mainImageMap.get(product.getId());
            if (mainImagePath != null) {
                product.setMainImagePath(mainImagePath);
            }
        }
    }

    // ==================== 图片管理支持类 ====================

    /**
     * 验证主图唯一性
     */
    private void validateMainImageUniqueness(ProductService.ProductUpdateRequest request) {
        long mainImageCount = 0;

        // 统计现有图片中的主图数量
        if (request.getExistingImages() != null) {
            mainImageCount += request.getExistingImages().stream()
                .filter(img -> !img.getIsDeleted() && img.getImageType() == 1)
                .count();
        }

        // 统计新图片中的主图数量
        if (request.getNewImages() != null) {
            mainImageCount += request.getNewImages().stream()
                .filter(img -> img.getImageType() == 1)
                .count();
        }

        if (mainImageCount > 1) {
            throw new IllegalArgumentException("一个商品只能有一个主图");
        }
    }

    /**
     * 验证只有一个主图（仅验证，不自动修复）
     */
    private void ensureSingleMainImage(Long productId) {
        List<ProductImage> mainImages = productImageMapper.selectList(
            new LambdaQueryWrapper<ProductImage>()
                .eq(ProductImage::getProductId, productId)
                .eq(ProductImage::getImageType, 1)
        );

        if (mainImages.size() > 1) {
            throw new IllegalArgumentException("一个商品只能有一个主图，当前存在 " + mainImages.size() + " 个主图");
        }
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

    // 这些支持类已移到ProductService接口中
}