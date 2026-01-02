package com.flower.shop.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.flower.shop.dto.CreateOrderRequest;
import com.flower.shop.entity.Order;

import java.util.List;

public interface OrderService extends IService<Order> {
    /**
     * 创建订单
     *
     * @param request 订单创建请求
     * @return 创建的订单对象
     */
    Order createOrder(CreateOrderRequest request);

    /**
     * 根据手机号查询订单（分页）
     *
     * @param phone 客户手机号
     * @param page  页码，从1开始
     * @param size  每页大小
     * @return 分页订单对象
     */
    IPage<Order> getOrdersByPhone(String phone, String status, Integer page, Integer size);

    /**
     * 根据用户ID查询订单（分页）
     */
    IPage<Order> getOrdersByUserId(Long userId, String status, Integer page, Integer size);

    /**
     * 管理端：搜索订单（支持分页、筛选、排序）
     *
     * @param keyword 关键词（订单号/客户姓名/手机号）
     * @param status 订单状态
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param page 页码
     * @param size 每页大小
     * @param sortBy 排序字段
     * @param sortOrder 排序方向
     * @return 分页订单对象
     */
    IPage<Order> searchOrders(String keyword, String status, String startDate, String endDate,
                               Integer page, Integer size, String sortBy, String sortOrder);

    /**
     * 查询订单详情（包含配送地址和订单项）
     *
     * @param orderId 订单ID
     * @return 订单详情
     */
    Order getOrderDetail(Long orderId);

    /**
     * 确认订单（待确认 → 准备中）
     *
     * @param orderId 订单ID
     * @return 更新后的订单
     */
    Order confirmOrder(Long orderId);

    /**
     * 开始配送（准备中 → 配送中）
     *
     * @param orderId 订单ID
     * @return 更新后的订单
     */
    Order startDelivery(Long orderId);

    /**
     * 完成配送并收款（配送中 → 已完成，支付状态 → 已支付）
     *
     * @param orderId 订单ID
     * @return 更新后的订单
     */
    Order completeOrder(Long orderId);

    /**
     * 取消订单（恢复库存）
     *
     * @param orderId 订单ID
     * @param reason 取消原因
     * @return 更新后的订单
     */
    Order cancelOrder(Long orderId, String reason);
}
