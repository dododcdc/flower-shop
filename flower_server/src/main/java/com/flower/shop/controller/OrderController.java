package com.flower.shop.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.flower.shop.dto.CreateOrderRequest;
import com.flower.shop.dto.Result;
import com.flower.shop.entity.Order;
import com.flower.shop.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    /**
     * 根据手机号查询订单（分页）
     */
    @GetMapping("/by-phone")
    public Result<IPage<Order>> getOrdersByPhone(
            @RequestParam("phone") String phone,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "size", defaultValue = "10") Integer size) {
        try {
            System.out.println("查询订单 - 手机号: " + phone + ", 页码: " + page + ", 每页大小: " + size);
            com.baomidou.mybatisplus.core.metadata.IPage<Order> orders = orderService.getOrdersByPhone(phone, page,
                    size);
            System.out.println("查询结果 - orders对象: " + orders);
            if (orders != null) {
                System.out.println("查询结果 - 总数: " + orders.getTotal());
                System.out.println("查询结果 - 记录数: " + orders.getRecords().size());
                System.out.println("查询结果 - 记录内容: " + orders.getRecords());
            } else {
                System.out.println("查询结果 - orders对象为null!");
            }
            return Result.success(orders);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("查询订单失败: " + e.getMessage());
        }
    }
}
