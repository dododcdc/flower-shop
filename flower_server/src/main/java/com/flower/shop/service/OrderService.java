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
     * @param page 页码，从1开始
     * @param size 每页大小
     * @return 分页订单对象
     */
    IPage<Order> getOrdersByPhone(String phone, Integer page, Integer size);
}
