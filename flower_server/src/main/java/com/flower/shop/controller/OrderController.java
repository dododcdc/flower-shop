package com.flower.shop.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.flower.shop.dto.CreateOrderRequest;
import com.flower.shop.dto.Result;
import com.flower.shop.entity.Order;
import com.flower.shop.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    /**
     * 查询当前登录用户的订单（分页）
     */
    @GetMapping("/my")
    public Result<IPage<Order>> getMyOrders(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "size", defaultValue = "10") Integer size) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || !(auth.getDetails() instanceof Long)) {
                return Result.error("请先登录");
            }

            Long userId = (Long) auth.getDetails();
            IPage<Order> orders = orderService.getOrdersByUserId(userId, status, page, size);

            return Result.success(orders);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("查询订单失败: " + e.getMessage());
        }
    }

    /**
     * 根据手机号查询订单（分页）
     */
    @GetMapping("/by-phone")
    public Result<IPage<Order>> getOrdersByPhone(
            @RequestParam("phone") String phone,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "size", defaultValue = "10") Integer size) {
        try {
            IPage<Order> orders = orderService.getOrdersByPhone(phone, status, page, size);
            return Result.success(orders);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("查询订单失败: " + e.getMessage());
        }
    }
}
