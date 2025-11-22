package com.flower.shop.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.flower.shop.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单Mapper接口
 *
 * 功能说明：
 * - 订单CRUD操作
 * - 订单状态管理
 * - 订单统计查询
 */
@Mapper
public interface OrderMapper extends BaseMapper<Order> {

    /**
     * 分页查询订单列表
     */
    @Select("SELECT o.*, " +
            "u.username as user_name " +
            "FROM orders o " +
            "LEFT JOIN users u ON o.user_id = u.id " +
            "WHERE 1=1 " +
            "ORDER BY o.created_at DESC")
    IPage<Order> selectOrderPage(Page<Order> page);

    /**
     * 根据订单状态查询订单
     */
    @Select("SELECT o.*, " +
            "u.username as user_name " +
            "FROM orders o " +
            "LEFT JOIN users u ON o.user_id = u.id " +
            "WHERE o.status = #{status} " +
            "ORDER BY o.created_at DESC")
    List<Order> selectOrdersByStatus(@Param("status") Integer status);

    /**
     * 根据用户ID查询订单
     */
    @Select("SELECT o.* " +
            "FROM orders o " +
            "WHERE o.user_id = #{userId} " +
            "ORDER BY o.created_at DESC")
    List<Order> selectOrdersByUserId(@Param("userId") Long userId);

    /**
     * 根据客户手机号查询订单
     */
    @Select("SELECT o.*, " +
            "u.username as user_name " +
            "FROM orders o " +
            "LEFT JOIN users u ON o.user_id = u.id " +
            "WHERE o.customer_phone = #{customerPhone} " +
            "ORDER BY o.created_at DESC")
    List<Order> selectOrdersByCustomerPhone(@Param("customerPhone") String customerPhone);

    /**
     * 根据订单号查询订单
     */
    @Select("SELECT o.*, " +
            "u.username as user_name " +
            "FROM orders o " +
            "LEFT JOIN users u ON o.user_id = u.id " +
            "WHERE o.order_no = #{orderNo}")
    Order selectByOrderNo(@Param("orderNo") String orderNo);

    /**
     * 查询待处理订单（待确认、准备中）
     */
    @Select("SELECT o.*, " +
            "u.username as user_name " +
            "FROM orders o " +
            "LEFT JOIN users u ON o.user_id = u.id " +
            "WHERE o.status IN (1, 2) " +
            "ORDER BY o.created_at ASC")
    List<Order> selectPendingOrders();

    /**
     * 查询今日订单
     */
    @Select("SELECT o.*, " +
            "u.username as user_name " +
            "FROM orders o " +
            "LEFT JOIN users u ON o.user_id = u.id " +
            "WHERE DATE(o.created_at) = CURDATE() " +
            "ORDER BY o.created_at DESC")
    List<Order> selectTodayOrders();

    /**
     * 查询指定日期范围的订单
     */
    @Select("SELECT o.*, " +
            "u.username as user_name " +
            "FROM orders o " +
            "LEFT JOIN users u ON o.user_id = u.id " +
            "WHERE o.created_at >= #{startDate} AND o.created_at <= #{endDate} " +
            "ORDER BY o.created_at DESC")
    List<Order> selectOrdersByDateRange(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);

    /**
     * 查询游客订单
     */
    @Select("SELECT o.* " +
            "FROM orders o " +
            "WHERE o.user_id IS NULL " +
            "ORDER BY o.created_at DESC")
    List<Order> selectGuestOrders();

    /**
     * 查询已支付订单
     */
    @Select("SELECT o.*, " +
            "u.username as user_name " +
            "FROM orders o " +
            "LEFT JOIN users u ON o.user_id = u.id " +
            "WHERE o.payment_status = 1 " +
            "ORDER BY o.payment_time DESC")
    List<Order> selectPaidOrders();

    /**
     * 检查订单号是否存在
     */
    @Select("SELECT COUNT(*) FROM orders WHERE order_no = #{orderNo}")
    int countByOrderNo(@Param("orderNo") String orderNo);

    /**
     * 统计订单总数
     */
    @Select("SELECT COUNT(*) FROM orders")
    int countAllOrders();

    /**
     * 统计各状态订单数量
     */
    @Select("SELECT status, COUNT(*) as count " +
            "FROM orders " +
            "GROUP BY status")
    List<java.util.Map<String, Object>> countOrdersByStatus();

    /**
     * 统计今日订单数
     */
    @Select("SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE()")
    int countTodayOrders();

    /**
     * 统计今日销售额
     */
    @Select("SELECT COALESCE(SUM(total_amount), 0) " +
            "FROM orders " +
            "WHERE status = 4 AND DATE(completed_at) = CURDATE()")
    java.math.BigDecimal getTodaySales();

    /**
     * 统计月度销售额
     */
    @Select("SELECT COALESCE(SUM(total_amount), 0) " +
            "FROM orders " +
            "WHERE status = 4 AND YEAR(created_at) = #{year} AND MONTH(created_at) = #{month}")
    java.math.BigDecimal getMonthlySales(@Param("year") Integer year, @Param("month") Integer month);

    /**
     * 获取最近的订单
     */
    @Select("SELECT o.*, " +
            "u.username as user_name " +
            "FROM orders o " +
            "LEFT JOIN users u ON o.user_id = u.id " +
            "WHERE 1=1 " +
            "ORDER BY o.created_at DESC " +
            "LIMIT #{limit}")
    List<Order> selectRecentOrders(@Param("limit") Integer limit);
}