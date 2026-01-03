package com.flower.shop.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.flower.shop.dto.CreateOrderRequest;
import com.flower.shop.common.Result;
import com.flower.shop.entity.Order;
import com.flower.shop.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Tag(name = "订单管理", description = "订单相关接口")
public class OrderController {

    private final OrderService orderService;

    /**
     * 创建订单
     */
    @PostMapping
    @Operation(summary = "创建订单", description = "创建新的订单")
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
    @Operation(summary = "查询我的订单", description = "查询当前登录用户的订单列表，支持分页和状态筛选")
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
    @Operation(summary = "按手机号查询订单", description = "根据客户手机号查询订单列表，支持分页和状态筛选")
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

    /**
     * 管理端：搜索订单（分页、筛选、排序）
     */
    @GetMapping("/search")
    @Operation(summary = "搜索订单", description = "管理端：按关键词、状态、日期范围搜索订单，支持分页和排序")
    public Result<IPage<Order>> searchOrders(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "size", defaultValue = "10") Integer size,
            @RequestParam(value = "sortBy", defaultValue = "created_at") String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "desc") String sortOrder) {
        try {
            IPage<Order> orders = orderService.searchOrders(keyword, status, startDate, endDate, page, size, sortBy, sortOrder);
            return Result.success(orders);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("搜索订单失败: " + e.getMessage());
        }
    }

    /**
     * 查询订单详情（包含配送地址和订单项）
     */
    @GetMapping("/{id}")
    @Operation(summary = "查询订单详情", description = "根据订单ID查询订单详情，包含配送地址和订单项")
    public Result<Order> getOrderDetail(@PathVariable("id") Long id) {
        try {
            Order order = orderService.getOrderDetail(id);
            if (order == null) {
                return Result.error("订单不存在");
            }
            return Result.success(order);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("查询订单详情失败: " + e.getMessage());
        }
    }

    /**
     * 确认订单
     */
    @PutMapping("/{id}/confirm")
    @Operation(summary = "确认订单", description = "将订单状态从待确认改为准备中")
    public Result<Order> confirmOrder(@PathVariable("id") Long id) {
        try {
            Order order = orderService.confirmOrder(id);
            return Result.success(order);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("确认订单失败: " + e.getMessage());
        }
    }

    /**
     * 开始配送
     */
    @PutMapping("/{id}/deliver")
    @Operation(summary = "开始配送", description = "将订单状态从准备中改为配送中")
    public Result<Order> startDelivery(@PathVariable("id") Long id) {
        try {
            Order order = orderService.startDelivery(id);
            return Result.success(order);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("开始配送失败: " + e.getMessage());
        }
    }

    /**
     * 完成配送并收款
     */
    @PutMapping("/{id}/complete")
    @Operation(summary = "完成订单", description = "将订单状态从配送中改为已完成")
    public Result<Order> completeOrder(@PathVariable("id") Long id) {
        try {
            Order order = orderService.completeOrder(id);
            return Result.success(order);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("完成配送失败: " + e.getMessage());
        }
    }

    /**
     * 取消订单
     */
    @PutMapping("/{id}/cancel")
    @Operation(summary = "取消订单", description = "取消订单，恢复库存，需要提供取消原因（可选）")
    public Result<Order> cancelOrder(
            @PathVariable("id") Long id,
            @RequestBody(required = false) java.util.Map<String, String> request) {
        try {
            String reason = request != null ? request.get("reason") : null;
            Order order = orderService.cancelOrder(id, reason);
            return Result.success(order);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("取消订单失败: " + e.getMessage());
        }
    }
}
