package com.flower.shop.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.flower.shop.entity.OrderItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 订单项Mapper接口
 *
 * 功能说明：
 * - 订单项CRUD操作
 * - 订单商品详情查询
 * - 商品销售统计
 */
@Mapper
public interface OrderItemMapper extends BaseMapper<OrderItem> {

    /**
     * 根据订单ID查询订单项列表
     */
    @Select("SELECT oi.*, " +
            "p.name as product_name, " +
            "p.main_image_url as product_image, " +
            "p.specification as product_specification, " +
            "c.name as category_name, " +
            "pkg.name as packaging_name " +
            "FROM order_items oi " +
            "LEFT JOIN products p ON oi.product_id = p.id " +
            "LEFT JOIN categories c ON oi.category_snapshot_name = c.name " +
            "LEFT JOIN categories pkg ON oi.packaging_snapshot_name = pkg.name " +
            "WHERE oi.order_id = #{orderId} AND oi. " +
            "ORDER BY oi.id ASC")
    List<OrderItem> selectByOrderIdWithDetails(@Param("orderId") Long orderId);

    /**
     * 根据商品ID查询相关订单项
     */
    @Select("SELECT oi.*, " +
            "o.order_no, " +
            "o.customer_name, " +
            "o.customer_phone, " +
            "o.status as order_status, " +
            "o.created_at as order_created_at " +
            "FROM order_items oi " +
            "LEFT JOIN orders o ON oi.order_id = o.id " +
            "WHERE oi.product_id = #{productId} AND oi. AND o. " +
            "ORDER BY o.created_at DESC")
    List<OrderItem> selectByProductIdWithOrderInfo(@Param("productId") Long productId);

    /**
     * 统计商品总销量
     */
    @Select("SELECT COALESCE(SUM(quantity), 0) " +
            "FROM order_items oi " +
            "LEFT JOIN orders o ON oi.order_id = o.id " +
            "WHERE oi.product_id = #{productId} AND oi. " +
            "AND o.status = 4 AND o.")
    Integer countSalesByProductId(@Param("productId") Long productId);

    /**
     * 统计商品销售额
     */
    @Select("SELECT COALESCE(SUM(subtotal), 0) " +
            "FROM order_items oi " +
            "LEFT JOIN orders o ON oi.order_id = o.id " +
            "WHERE oi.product_id = #{productId} AND oi. " +
            "AND o.status = 4 AND o.")
    java.math.BigDecimal getSalesRevenueByProductId(@Param("productId") Long productId);

    /**
     * 查询热销商品排行
     */
    @Select("SELECT " +
            "oi.product_id, " +
            "oi.product_snapshot_name as product_name, " +
            "SUM(oi.quantity) as total_quantity, " +
            "SUM(oi.subtotal) as total_revenue, " +
            "COUNT(DISTINCT oi.order_id) as order_count " +
            "FROM order_items oi " +
            "LEFT JOIN orders o ON oi.order_id = o.id " +
            "WHERE oi. AND o. " +
            "AND o.status = 4 AND o.created_at >= #{startDate} AND o.created_at <= #{endDate} " +
            "GROUP BY oi.product_id, oi.product_snapshot_name " +
            "ORDER BY total_quantity DESC " +
            "LIMIT #{limit}")
    List<java.util.Map<String, Object>> selectTopSellingProducts(@Param("startDate") java.time.LocalDateTime startDate,
                                                                  @Param("endDate") java.time.LocalDateTime endDate,
                                                                  @Param("limit") Integer limit);

    /**
     * 根据订单ID列表批量查询订单项
     */
    @Select("SELECT oi.*, " +
            "p.name as product_name, " +
            "p.main_image_url as product_image " +
            "FROM order_items oi " +
            "LEFT JOIN products p ON oi.product_id = p.id " +
            "WHERE oi.order_id IN #{orderIds} AND oi. " +
            "ORDER BY oi.order_id, oi.id")
    List<OrderItem> selectByOrderIds(@Param("orderIds") List<Long> orderIds);

    /**
     * 统计订单项数量（根据订单ID）
     */
    @Select("SELECT COUNT(*) FROM order_items WHERE order_id = #{orderId} AND ")
    int countByOrderId(@Param("orderId") Long orderId);

    /**
     * 计算订单商品总金额
     */
    @Select("SELECT COALESCE(SUM(subtotal), 0) " +
            "FROM order_items " +
            "WHERE order_id = #{orderId} AND ")
    java.math.BigDecimal getOrderProductAmount(@Param("orderId") Long orderId);

    /**
     * 查询指定时间范围内的订单项统计
     */
    @Select("SELECT " +
            "DATE(o.created_at) as order_date, " +
            "COUNT(*) as item_count, " +
            "SUM(oi.quantity) as total_quantity, " +
            "SUM(oi.subtotal) as total_revenue " +
            "FROM order_items oi " +
            "LEFT JOIN orders o ON oi.order_id = o.id " +
            "WHERE oi. AND o. " +
            "AND o.created_at >= #{startDate} AND o.created_at <= #{endDate} " +
            "GROUP BY DATE(o.created_at) " +
            "ORDER BY order_date DESC")
    List<java.util.Map<String, Object>> getDailySalesStats(@Param("startDate") java.time.LocalDateTime startDate,
                                                          @Param("endDate") java.time.LocalDateTime endDate);

    /**
     * 根据花材分类统计销量
     */
    @Select("SELECT " +
            "oi.category_snapshot_name as category_name, " +
            "SUM(oi.quantity) as total_quantity, " +
            "SUM(oi.subtotal) as total_revenue, " +
            "COUNT(DISTINCT oi.order_id) as order_count " +
            "FROM order_items oi " +
            "LEFT JOIN orders o ON oi.order_id = o.id " +
            "WHERE oi. AND o. " +
            "AND o.status = 4 AND o.created_at >= #{startDate} AND o.created_at <= #{endDate} " +
            "GROUP BY oi.category_snapshot_name " +
            "ORDER BY total_quantity DESC")
    List<java.util.Map<String, Object>> getSalesStatsByCategory(@Param("startDate") java.time.LocalDateTime startDate,
                                                                @Param("endDate") java.time.LocalDateTime endDate);

    /**
     * 根据包装类型统计销量
     */
    @Select("SELECT " +
            "oi.packaging_snapshot_name as packaging_name, " +
            "SUM(oi.quantity) as total_quantity, " +
            "SUM(oi.subtotal) as total_revenue, " +
            "COUNT(DISTINCT oi.order_id) as order_count " +
            "FROM order_items oi " +
            "LEFT JOIN orders o ON oi.order_id = o.id " +
            "WHERE oi. AND o. " +
            "AND o.status = 4 AND o.created_at >= #{startDate} AND o.created_at <= #{endDate} " +
            "GROUP BY oi.packaging_snapshot_name " +
            "ORDER BY total_quantity DESC")
    List<java.util.Map<String, Object>> getSalesStatsByPackaging(@Param("startDate") java.time.LocalDateTime startDate,
                                                                  @Param("endDate") java.time.LocalDateTime endDate);
}