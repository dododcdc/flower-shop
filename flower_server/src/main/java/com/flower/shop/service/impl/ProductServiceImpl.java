package com.flower.shop.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.flower.shop.dto.ProductSearchRequest;
import com.flower.shop.entity.Product;
import com.flower.shop.mapper.ProductMapper;
import com.flower.shop.service.ProductService;
import com.flower.shop.service.CategoryService;
import com.flower.shop.config.FileUploadConfig;
import com.flower.shop.util.FileUploadUtil;
import com.flower.shop.mapper.ProductImageMapper;
import com.flower.shop.entity.ProductImage;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * 商品服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements ProductService {

    private final ProductMapper productMapper;
    private final CategoryService categoryService;
    private final FileUploadConfig fileUploadConfig;

    private final ProductImageMapper productImageMapper;

    @Override
    public IPage<Product> getProductPage(int current, int size) {
        Page<Product> page = new Page<>(current, size);
        IPage<Product> productPage = productMapper.selectProductsWithDetails(page);

        // 为每个商品设置主图信息
        List<Product> products = productPage.getRecords();
        if (products != null && !products.isEmpty()) {
            for (Product product : products) {
                String mainImagePath = productMapper.selectMainImageByProductId(product.getId());
                if (mainImagePath != null) {
                    product.setMainImagePath(mainImagePath);
                }
            }
        }

        return productPage;
    }

    @Override
    public List<Product> getProductsByCategoryId(Long categoryId) {
        List<Product> products = productMapper.selectProductsByCategoryId(categoryId);

        if (products != null && !products.isEmpty()) {
            for (Product product : products) {
                String mainImagePath = productMapper.selectMainImageByProductId(product.getId());
                if (mainImagePath != null) {
                    product.setMainImagePath(mainImagePath);
                }
            }
        }

        return products;
    }

    @Override
    public IPage<Product> getOnlineProductsPage(int current, int size) {
        Page<Product> page = new Page<>(current, size);
        return productMapper.selectOnlineProductsPage(page);
    }

    @Override
    public List<Product> getFeaturedProducts(Integer limit) {
        if (limit == null) {
            limit = 10;
        }
        return productMapper.selectFeaturedProducts(limit);
    }

    @Override
    public List<Product> getTopSellingProducts(Integer limit) {
        if (limit == null) {
            limit = 10;
        }
        return productMapper.selectTopSellingProducts(limit);
    }

    @Override
    public List<Product> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return productMapper.selectProductsByPriceRange(minPrice, maxPrice);
    }

    @Override
    public IPage<Product> searchProductsAdvanced(ProductSearchRequest request) {
        Page<Product> page = new Page<>(request.getCurrent(), request.getSize());
        IPage<Product> productPage = productMapper.searchProductsAdvanced(page, request);

        // 为每个商品设置主图信息
        List<Product> products = productPage.getRecords();
        if (products != null && !products.isEmpty()) {
            for (Product product : products) {
                // 只查询主图（通过image_type=1查询）
                String mainImagePath = productMapper.selectMainImageByProductId(product.getId());
                if (mainImagePath != null) {
                    product.setMainImagePath(mainImagePath);
                }
            }
        }

        return productPage;
    }

    
    @Override
    @Transactional
    public Product createProduct(Product product) {
        // 验证商品数据
        if (!validateProduct(product)) {
            throw new IllegalArgumentException("商品数据不完整或无效");
        }

        // 检查名称是否重复
        if (isNameDuplicate(product.getName(), null)) {
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
    public Product updateProduct(Product product) {
        // 检查商品是否存在
        Product existingProduct = getById(product.getId());
        if (existingProduct == null) {
            throw new IllegalArgumentException("商品不存在：" + product.getId());
        }

        // 检查名称是否重复
        if (isNameDuplicate(product.getName(), product.getId())) {
            throw new IllegalArgumentException("商品名称已存在：" + product.getName());
        }

        // 更新商品
        updateById(product);
        log.info("更新商品成功：{}", product.getName());

        return getProductWithDetails(product.getId());
    }

    @Override
    @Transactional
    public Product createProductWithImages(Product product, List<String> imagePaths, Integer mainImageIndex) {
        // 首先创建商品基本信息
        Product createdProduct = this.createProduct(product);

        if (imagePaths != null && !imagePaths.isEmpty()) {
            // 保存图片信息
            for (int i = 0; i < imagePaths.size(); i++) {
                ProductImage productImage = new ProductImage();
                productImage.setProductId(createdProduct.getId());
                productImage.setImagePath(imagePaths.get(i));

                // 验证主图索引（数组索引）
                if (mainImageIndex == null) {
                    throw new IllegalArgumentException("创建商品必须指定主图索引");
                }
                if (mainImageIndex < 0 || mainImageIndex >= imagePaths.size()) {
                    throw new IllegalArgumentException("主图索引无效：" + mainImageIndex + "，图片总数：" + imagePaths.size());
                }

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
            List<String> imagePaths = productImages.stream()
                .map(ProductImage::getImagePath)
                .collect(Collectors.toList());

            // 删除图片记录
            productImageMapper.deleteByProductId(productId);

            // 删除物理文件
            if (!imagePaths.isEmpty()) {
                FileUploadUtil.deleteFiles(imagePaths, fileUploadConfig.getUploadPath());
                log.info("已删除商品 {} 的 {} 个图片文件", productId, imagePaths.size());
            }
        } catch (Exception e) {
            log.warn("删除商品图片文件失败，商品ID: {}, 错误: {}", productId, e.getMessage());
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
    @Transactional
    public boolean setFeaturedProduct(Long productId, Integer isFeatured) {
        Product product = getById(productId);
        if (product == null) {
            throw new IllegalArgumentException("商品不存在：" + productId);
        }

        product.setFeatured(isFeatured);
        boolean result = updateById(product);
        if (result) {
            log.info("更新商品推荐状态成功：productId={}, isFeatured={}", productId, isFeatured);
        }
        return result;
    }

    @Override
    @Transactional
    public boolean batchUpdateStatus(List<Long> productIds, Integer status) {
        if (productIds == null || productIds.isEmpty()) {
            return false;
        }

        int result = productMapper.batchUpdateStatus(productIds, status);
        log.info("批量更新商品状态成功，共{}个商品，状态设置为{}", productIds.size(), status);
        return result > 0;
    }

    @Override
    public boolean isNameDuplicate(String name, Long excludeId) {
        int count = productMapper.countByNameExcludeId(name, excludeId);
        return count > 0;
    }

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
                    detail.setImageUrl("http://localhost:8080/api" + info.getImagePath());
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

    
    
    @Override
    public int countAllProducts() {
        return productMapper.countAllProducts();
    }

    @Override
    public int countOnlineProducts() {
        return productMapper.countOnlineProducts();
    }

    @Override
    public List<Product> getLowStockProducts() {
        // 查询所有商品，然后过滤出库存不足的商品
        // 库存不足条件：stock_quantity > 0 AND stock_quantity <= low_stock_threshold
        List<Product> allProducts = list();
        return allProducts.stream()
                .filter(Product::isLowStock)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public int countProductsByCategory(Long categoryId) {
        return productMapper.countProductsByCategory(categoryId);
    }

    @Override
    public List<Product> getProductsByIds(List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<Product> products = listByIds(productIds);

        // 为每个商品设置关联信息
        for (Product product : products) {
            // 设置分类名称和库存信息（简化处理）
        }

        return products;
    }

    @Override
    public Map<String, Object> getProductStatistics() {
        Map<String, Object> statistics = new HashMap<>();

        statistics.put("totalProducts", countAllProducts());
        statistics.put("onlineProducts", countOnlineProducts());
        statistics.put("featuredProducts", countFeaturedProducts());
        statistics.put("lowStockProducts", getLowStockProducts().size());

        // 可以添加更多统计信息

        return statistics;
    }

    @Override
    @Transactional
    public void createSampleProducts() {
        log.info("开始创建更多示例商品数据");

        // 获取分类信息
        List<com.flower.shop.entity.Category> flowerCategories = categoryService.getFlowerCategories();
        List<com.flower.shop.entity.Category> packagingCategories = categoryService.getPackagingCategories();

        // 删除现有数据重新创建
        remove(null);

        // 商品名称前缀列表，用于创建多样化商品
        String[] namePrefixes = {"精品", "豪华", "浪漫", "经典", "雅致", "清新", "温馨", "时尚"};
        String[] occasions = {"生日", "纪念日", "求婚", "道歉", "感谢", "祝福", "商务", "节日"};

        int productId = 1;

        // 为每个花材和包装组合创建多个变体
        for (com.flower.shop.entity.Category flowerCategory : flowerCategories) {
            for (com.flower.shop.entity.Category packagingCategory : packagingCategories) {

                // 创建基础版本
                createSampleProduct(flowerCategory, packagingCategory, "", "");
                productId++;

                // 创建不同场合的版本
                for (int i = 0; i < 2 && productId <= 40; i++) { // 限制最多40个商品
                    String prefix = namePrefixes[i % namePrefixes.length];
                    String occasion = occasions[i % occasions.length];
                    createSampleProduct(flowerCategory, packagingCategory, prefix, occasion);
                    productId++;
                }
            }
        }

        log.info("更多示例商品数据创建完成，共{}个商品", productId - 1);
    }

    /**
     * 创建单个示例商品
     */
    private void createSampleProduct(com.flower.shop.entity.Category flowerCategory,
                                   com.flower.shop.entity.Category packagingCategory,
                                   String prefix, String occasion) {
        Product product = new Product();

        // 构建商品名称
        String productName = flowerCategory.getName() + packagingCategory.getName();
        if (!prefix.isEmpty()) {
            productName = prefix + productName;
        }
        if (!occasion.isEmpty()) {
            productName += "(" + occasion + ")";
        }
        product.setName(productName);

        product.setCategoryId(flowerCategory.getId());

        // 构建商品描述
        String description = prefix + "的" + flowerCategory.getName() + packagingCategory.getName();
        if (!occasion.isEmpty()) {
            description += "，特别适合" + occasion + "使用";
        } else {
            description += "，适合各种场合赠送";
        }
        description += "。由新鲜" + flowerCategory.getName() + "精心制作，" +
                      packagingCategory.getName() + "包装，寓意美好，是表达心意的完美选择。";
        product.setDescription(description);

        // 根据前缀和场合调整价格
        double basePrice = getRandomPrice(flowerCategory.getName(), packagingCategory.getName());
        if (!prefix.isEmpty()) {
            if (prefix.contains("豪华")) {
                basePrice *= 1.5;
            } else if (prefix.contains("精品") || prefix.contains("浪漫")) {
                basePrice *= 1.3;
            } else {
                basePrice *= 1.2;
            }
        }
        product.setPrice(new BigDecimal(basePrice));
        product.setOriginalPrice(product.getPrice().multiply(new BigDecimal("1.2")));

        // 根据花材类型设置花语
        String flowerLanguage = getFlowerLanguage(flowerCategory.getName());
        product.setFlowerLanguage(flowerLanguage);

        // 根据花材类型设置养护说明
        String careGuide = getCareGuide(flowerCategory.getName());
        product.setCareGuide(careGuide);

        product.setStatus(1);

        // 随机设置一些商品为推荐
        product.setFeatured(Math.random() > 0.6 ? 1 : 0);

        // 随机设置库存数量 (20-100之间)
        product.setStockQuantity(20 + (int)(Math.random() * 80));
        product.setLowStockThreshold(5 + (int)(Math.random() * 10));

        createProduct(product);
    }

    /**
     * 获取花语（根据花材类型）
     */
    private String getFlowerLanguage(String flowerName) {
        switch (flowerName) {
            case "玫瑰":
                return "玫瑰象征着爱情、美丽和热情，是表达爱意的经典选择。";
            case "百合":
                return "百合寓意纯洁、高雅和百年好合，象征美好的祝愿。";
            case "夜来香":
                return "夜来香代表着默默的爱和不朽的情感，夜晚散发迷人香气。";
            case "康乃馨":
                return "康乃馨象征着母爱、感恩和温馨，是表达敬意的最佳选择。";
            case "向日葵":
                return "向日葵代表着阳光、希望和忠诚，永远追寻光明的方向。";
            default:
                return "美丽的花朵，传递着美好祝愿和真挚情感。";
        }
    }

    /**
     * 获取养护说明（根据花材类型）
     */
    private String getCareGuide(String flowerName) {
        switch (flowerName) {
            case "玫瑰":
                return "1. 每日换水，保持水位充足；2. 剪去茎部2-3厘米，45度角斜剪；3. 避免阳光直射，放置阴凉处；4. 定期喷雾保湿，保持环境湿润。";
            case "百合":
                return "1. 花粉易染色，及时去除花蕊；2. 水位保持在花瓶1/3处；3. 避免与水果同放，防止乙烯影响；4. 定期换水，保持水质清洁。";
            case "夜来香":
                return "1. 喜湿润环境，保持土壤微湿；2. 避免强光直射，半阴环境最佳；3. 定期修剪枯叶，促进新芽生长；4. 夜间香味浓郁，保持通风。";
            case "康乃馨":
                return "1. 水位不宜过高，花茎1/3即可；2. 避免阳光暴晒和高温环境；3. 定期喷水增加湿度；4. 及时去除凋谢花朵，延长花期。";
            case "向日葵":
                return "1. 需充足阳光，每天至少6小时直射；2. 水位要高，花茎2/3浸入水中；3. 茎部较硬，可适当剪短；4. 避免放置在空调直吹处。";
            default:
                return "1. 保持水质清洁，定期换水；2. 避免阳光直射，放置阴凉处；3. 适当修剪花茎，延长花期；4. 保持环境通风，避免湿度过高。";
        }
    }

    /**
     * 获取随机价格（根据花材和包装类型）
     */
    private double getRandomPrice(String flowerName, String packagingName) {
        // 这里简化处理，实际应该根据不同花材和包装设置不同价格
        double basePrice = 68.0;

        if (packagingName.contains("花篮")) {
            basePrice += 32.0; // 花篮比花束贵
        }

        // 根据花材类型调整价格
        switch (flowerName) {
            case "玫瑰":
                basePrice += 20.0;
                break;
            case "百合":
                basePrice += 15.0;
                break;
            case "夜来香":
                basePrice += 25.0;
                break;
            case "康乃馨":
                basePrice += 10.0;
                break;
            case "向日葵":
                basePrice += 18.0;
                break;
        }

        // 添加一些随机性
        basePrice += (Math.random() * 20 - 10); // ±10元随机浮动

        return basePrice;
    }

    private int countFeaturedProducts() {
        return Math.toIntExact(lambdaQuery().eq(Product::getFeatured, 1).count());
    }

    @Override
    public boolean validateProduct(Product product) {
        if (product == null) {
            return false;
        }

        if (product.getName() == null || product.getName().trim().isEmpty()) {
            return false;
        }

        if (product.getCategoryId() == null) {
            return false;
        }

        
        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }

        return true;
    }


    @Override
    public List<Product> getRecommendedProducts(Long categoryId, Integer limit) {
        if (categoryId == null) {
            return getFeaturedProducts(limit);
        }

        return getProductsByCategoryId(categoryId).stream()
                .filter(Product::isOnline)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt())) // 按创建时间排序
                .limit(limit != null ? limit : 5)
                .toList();
    }

    @Override
    public Product getProductWithRelations(Long productId) {
        return getProductWithDetails(productId);
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