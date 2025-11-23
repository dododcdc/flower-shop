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
import com.flower.shop.util.ProductImagesUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

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

    @Override
    public IPage<Product> getProductPage(int current, int size) {
        Page<Product> page = new Page<>(current, size);
        return productMapper.selectProductsWithDetails(page);
    }

    @Override
    public List<Product> getProductsByCategoryId(Long categoryId) {
        return productMapper.selectProductsByCategoryId(categoryId);
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
        return productMapper.searchProductsAdvanced(page, request);
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
    public boolean deleteProduct(Long productId) {
        // 检查商品是否存在
        Product product = getById(productId);
        if (product == null) {
            throw new IllegalArgumentException("商品不存在：" + productId);
        }

        // 检查是否有未完成的订单（这里简化处理）
        // 实际业务中需要检查订单状态

        // 删除商品相关的图片文件
        if (product.getImages() != null && !product.getImages().trim().isEmpty()) {
            try {
                // 解析图片路径
                ProductImagesUtil.ProductImages productImages =
                    ProductImagesUtil.ProductImages.fromJson(product.getImages());

                // 获取所有图片路径
                List<String> imagePaths = new ArrayList<>();
                if (productImages.getMain() != null) {
                    imagePaths.add(productImages.getMain());
                }
                if (productImages.getSubImages() != null) {
                    imagePaths.addAll(productImages.getSubImages());
                }

                // 删除物理文件
                if (!imagePaths.isEmpty()) {
                    FileUploadUtil.deleteFiles(imagePaths, fileUploadConfig.getUploadPath());
                    log.info("已删除商品 {} 的 {} 个图片文件", productId, imagePaths.size());
                }
            } catch (Exception e) {
                log.warn("删除商品图片文件失败，商品ID: {}, 错误: {}", productId, e.getMessage());
                // 图片删除失败不影响商品删除操作
            }
        }

        // 逻辑删除商品
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
        // 这里简化处理，实际应该使用包含关联信息的查询
        Product product = getById(productId);
        if (product == null) {
            return null;
        }

        // 设置分类名称（临时存储）
        if (product.getCategoryId() != null) {
            // 这里应该从categoryService获取分类信息
            // 简化处理
        }

        // 库存信息已经直接在product对象中，无需额外设置

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

        product.setImages("[\"/images/placeholder.jpg\"]");
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
    public List<String> parseImageUrls(String imageUrlsJson) {
        if (imageUrlsJson == null || imageUrlsJson.trim().isEmpty()) {
            return new ArrayList<>();
        }

        try {
            // 这里应该使用JSON解析库，简化处理
            return Arrays.asList(imageUrlsJson.replaceAll("[\\[\\]\"]", "").split(","));
        } catch (Exception e) {
            log.error("解析图片URLs失败：{}", imageUrlsJson, e);
            return new ArrayList<>();
        }
    }

    @Override
    public String serializeImageUrls(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return "[]";
        }

        // 这里应该使用JSON序列化库，简化处理
        return imageUrls.toString();
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
}