package com.flower.shop.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.flower.shop.entity.Product;
import com.flower.shop.mapper.ProductMapper;
import com.flower.shop.service.ProductService;
import com.flower.shop.service.CategoryService;
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
    public List<Product> searchProducts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return productMapper.searchProducts(keyword.trim());
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
        log.info("开始创建示例商品数据");

        // 检查是否已有商品
        long existingCount = count();
        if (existingCount > 0) {
            log.info("商品数据已存在，跳过示例数据创建");
            return;
        }

        // 获取分类信息
        List<com.flower.shop.entity.Category> flowerCategories = categoryService.getTopLevelCategories();
        List<com.flower.shop.entity.Category> packagingCategories = categoryService.getEnabledCategories()
                .stream()
                .filter(cat -> !cat.isTopLevel())
                .toList();

        // 创建示例商品
        for (com.flower.shop.entity.Category flowerCategory : flowerCategories) {
            for (com.flower.shop.entity.Category packagingCategory : packagingCategories) {
                // 只创建对应花材的包装商品
                if (packagingCategory.getParentId() != null &&
                    packagingCategory.getParentId().equals(flowerCategory.getId())) {

                    createSampleProduct(flowerCategory, packagingCategory);
                }
            }
        }

        log.info("示例商品数据创建完成");
    }

    /**
     * 创建单个示例商品
     */
    private void createSampleProduct(com.flower.shop.entity.Category flowerCategory,
                                   com.flower.shop.entity.Category packagingCategory) {
        Product product = new Product();
        product.setName(flowerCategory.getName() + packagingCategory.getName());
        product.setCategoryId(flowerCategory.getId());
        product.setDescription("精美的" + flowerCategory.getName() + packagingCategory.getName() +
                             "，适合各种场合赠送");
        product.setSpecification("11朵");
        product.setPrice(new BigDecimal(getRandomPrice(flowerCategory.getName(), packagingCategory.getName())));
        product.setOriginalPrice(product.getPrice().multiply(new BigDecimal("1.2")));
        product.setFlowerLanguage(flowerCategory.getFlowerMeaning());
        product.setCareGuide(flowerCategory.getCareInstructions());
        product.setImages("[\"/images/placeholder.jpg\"]");
        product.setStatus(1);
        product.setFeatured(1); // 示例商品设为推荐
        // 设置初始库存
        product.setStockQuantity(50);
        product.setLowStockThreshold(5);

        createProduct(product);
    }

    /**
     * 获取随机价格（根据花材和包装类型）
     */
    private String getRandomPrice(String flowerName, String packagingName) {
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

        return String.valueOf(basePrice);
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