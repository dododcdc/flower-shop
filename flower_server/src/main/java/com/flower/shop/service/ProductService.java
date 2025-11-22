package com.flower.shop.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.flower.shop.entity.Product;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 商品服务接口
 *
 * 功能说明：
 * - 商品管理业务逻辑
 * - 商品搜索和筛选
 * - 商品状态管理
 */
public interface ProductService extends IService<Product> {

    /**
     * 分页查询商品列表（包含分类和库存信息）
     */
    IPage<Product> getProductPage(int current, int size);

    /**
     * 根据分类ID查询商品
     */
    List<Product> getProductsByCategoryId(Long categoryId);

    /**
     * 获取上架商品列表（分页）
     */
    IPage<Product> getOnlineProductsPage(int current, int size);

    /**
     * 获取推荐商品列表
     */
    List<Product> getFeaturedProducts(Integer limit);

    /**
     * 获取热销商品列表
     */
    List<Product> getTopSellingProducts(Integer limit);

    /**
     * 按价格区间查询商品
     */
    List<Product> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice);

    /**
     * 搜索商品
     */
    List<Product> searchProducts(String keyword);

    
    /**
     * 创建新商品
     */
    Product createProduct(Product product);

    /**
     * 更新商品信息
     */
    Product updateProduct(Product product);

    /**
     * 删除商品
     */
    boolean deleteProduct(Long productId);

    /**
     * 上架/下架商品
     */
    boolean toggleProductStatus(Long productId, Integer status);

    /**
     * 设置推荐商品
     */
    boolean setFeaturedProduct(Long productId, Integer isFeatured);

    /**
     * 批量更新商品状态
     */
    boolean batchUpdateStatus(List<Long> productIds, Integer status);

    /**
     * 检查商品名称是否重复
     */
    boolean isNameDuplicate(String name, Long excludeId);

    /**
     * 获取商品详情（包含分类和库存信息）
     */
    Product getProductWithDetails(Long productId);

    
    /**
     * 统计商品总数
     */
    int countAllProducts();

    /**
     * 统计上架商品数
     */
    int countOnlineProducts();

    /**
     * 统计指定分类下的商品数
     */
    int countProductsByCategory(Long categoryId);

    /**
     * 根据商品ID列表批量查询商品
     */
    List<Product> getProductsByIds(List<Long> productIds);

    /**
     * 获取商品统计数据
     */
    Map<String, Object> getProductStatistics();

    /**
     * 创建示例商品数据
     */
    void createSampleProducts();

    /**
     * 验证商品数据完整性
     */
    boolean validateProduct(Product product);

    /**
     * 处理商品图片URLs
     */
    List<String> parseImageUrls(String imageUrlsJson);

    /**
     * 序列化图片URLs
     */
    String serializeImageUrls(List<String> imageUrls);

    /**
     * 获取推荐商品详情
     */
    List<Product> getRecommendedProducts(Long categoryId, Integer limit);

    /**
     * 获取库存不足商品列表
     */
    List<Product> getLowStockProducts();

    /**
     * 获取商品关联信息（分类、库存等）
     */
    Product getProductWithRelations(Long productId);
}