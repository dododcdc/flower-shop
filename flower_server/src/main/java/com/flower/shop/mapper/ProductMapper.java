package com.flower.shop.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.flower.shop.entity.Product;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.math.BigDecimal;
import java.util.List;

/**
 * 商品Mapper接口
 *
 * 功能说明：
 * - 商品CRUD操作
 * - 多条件查询和筛选
 * - 关联分类查询
 */
@Mapper
public interface ProductMapper extends BaseMapper<Product> {

    /**
     * 分页查询商品列表（包含分类信息）
     */
    @Select("SELECT p.*, " +
            "c.name as category_name " +
            "FROM products p " +
            "LEFT JOIN categories c ON p.category_id = c.id " +
            "ORDER BY p.created_at DESC")
    IPage<Product> selectProductsWithDetails(Page<Product> page);

    /**
     * 根据分类ID查询商品
     */
    @Select("SELECT p.*, " +
            "c.name as category_name " +
            "FROM products p " +
            "LEFT JOIN categories c ON p.category_id = c.id " +
            "WHERE p.category_id = #{categoryId} " +
            "ORDER BY p.created_at DESC")
    List<Product> selectProductsByCategoryId(@Param("categoryId") Long categoryId);

    /**
     * 查询上架商品列表
     */
    @Select("SELECT p.*, " +
            "c.name as category_name " +
            "FROM products p " +
            "LEFT JOIN categories c ON p.category_id = c.id " +
            "WHERE p.status = 1 " +
            "ORDER BY p.created_at DESC")
    List<Product> selectOnlineProducts();

    /**
     * 分页查询上架商品列表
     */
    @Select("SELECT p.*, " +
            "c.name as category_name " +
            "FROM products p " +
            "LEFT JOIN categories c ON p.category_id = c.id " +
            "WHERE p.status = 1 " +
            "ORDER BY p.created_at DESC")
    IPage<Product> selectOnlineProductsPage(Page<Product> page);

    /**
     * 查询推荐商品
     */
    @Select("SELECT p.*, " +
            "c.name as category_name " +
            "FROM products p " +
            "LEFT JOIN categories c ON p.category_id = c.id " +
            "WHERE p.status = 1 AND p.featured = 1 " +
            "ORDER BY p.created_at DESC " +
            "LIMIT #{limit}")
    List<Product> selectFeaturedProducts(@Param("limit") Integer limit);

    /**
     * 按销量查询热门商品（基于订单统计）
     */
    @Select("SELECT p.*, " +
            "c.name as category_name, " +
            "COALESCE(SUM(oi.quantity), 0) as total_sales " +
            "FROM products p " +
            "LEFT JOIN categories c ON p.category_id = c.id " +
            "LEFT JOIN order_items oi ON p.id = oi.product_id " +
            "LEFT JOIN orders o ON oi.order_id = o.id " +
            "WHERE p.status = 1 AND (o.status = 'COMPLETED' OR o.status IS NULL) " +
            "GROUP BY p.id " +
            "ORDER BY total_sales DESC, p.created_at DESC " +
            "LIMIT #{limit}")
    List<Product> selectTopSellingProducts(@Param("limit") Integer limit);

    /**
     * 按价格区间查询商品
     */
    @Select("SELECT p.*, " +
            "c.name as category_name " +
            "FROM products p " +
            "LEFT JOIN categories c ON p.category_id = c.id " +
            "WHERE p.price >= #{minPrice} AND p.price <= #{maxPrice} " +
            "AND p.status = 1 " +
            "ORDER BY p.price ASC")
    List<Product> selectProductsByPriceRange(@Param("minPrice") BigDecimal minPrice,
                                             @Param("maxPrice") BigDecimal maxPrice);

    /**
     * 搜索商品（按名称或描述）
     */
    @Select("SELECT p.*, " +
            "c.name as category_name " +
            "FROM products p " +
            "LEFT JOIN categories c ON p.category_id = c.id " +
            "WHERE (p.name LIKE CONCAT('%', #{keyword}, '%') " +
            "OR p.description LIKE CONCAT('%', #{keyword}, '%')) " +
            "AND p.status = 1 " +
            "ORDER BY p.created_at DESC")
    List<Product> searchProducts(@Param("keyword") String keyword);

    
    /**
     * 统计商品总数
     */
    @Select("SELECT COUNT(*) FROM products")
    int countAllProducts();

    /**
     * 统计上架商品数
     */
    @Select("SELECT COUNT(*) FROM products WHERE status = 1")
    int countOnlineProducts();

    /**
     * 统计指定分类下的商品数
     */
    @Select("SELECT COUNT(*) FROM products WHERE category_id = #{categoryId}")
    int countProductsByCategory(@Param("categoryId") Long categoryId);

    /**
     * 检查商品名称是否存在
     */
    @Select("SELECT COUNT(*) FROM products WHERE name = #{name} AND id != #{excludeId}")
    int countByNameExcludeId(@Param("name") String name, @Param("excludeId") Long excludeId);

    
    /**
     * 批量更新商品状态
     */
    @Update("UPDATE products SET status = #{status} WHERE id IN #{productIds}")
    int batchUpdateStatus(@Param("productIds") List<Long> productIds, @Param("status") Integer status);

    /**
     * 批量查询商品
     */
    @Select("SELECT * FROM products WHERE id IN #{productIds}")
    List<Product> selectBatchIds(@Param("productIds") List<Long> productIds);
}