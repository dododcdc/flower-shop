package com.flower.shop.controller;

import com.flower.shop.dto.CreateOrderRequest;
import com.flower.shop.dto.Result;
import com.flower.shop.entity.Order;
import com.flower.shop.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * 创建订单
     */
    @PostMapping
    public Result<Order> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            Order order = orderService.createOrder(request);
            return Result.success(order);
        } catch (Exception e) {
            return Result.error("创建订单失败: " + e.getMessage());
        }
    }
}
