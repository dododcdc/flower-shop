package com.flower.shop.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.flower.shop.dto.CreateOrderRequest;
import com.flower.shop.entity.Order;

public interface OrderService extends IService<Order> {
    /**
     * 创建订单
     * 
     * @param request 订单创建请求
     * @return 创建的订单对象
     */
    Order createOrder(CreateOrderRequest request);
}
