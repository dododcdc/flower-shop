package com.flower.shop.controller;

import com.flower.shop.common.Result;
import com.flower.shop.dto.DashboardStatsDTO;
import com.flower.shop.dto.OrderDistributionDTO;
import com.flower.shop.dto.SalesTrendDTO;
import com.flower.shop.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 仪表盘控制器
 */
@Tag(name = "仪表盘管理", description = "Dashboard相关接口")
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "获取核心统计数据")
    @GetMapping("/stats")
    public Result<DashboardStatsDTO> getStats() {
        DashboardStatsDTO stats = dashboardService.getStats();
        return Result.success(stats);
    }

    @Operation(summary = "获取订单状态分布")
    @GetMapping("/order-distribution")
    public Result<List<OrderDistributionDTO>> getOrderDistribution() {
        List<OrderDistributionDTO> distribution = dashboardService.getOrderDistribution();
        return Result.success(distribution);
    }

    @Operation(summary = "获取最近7天销售趋势")
    @GetMapping("/sales-trend")
    public Result<List<SalesTrendDTO>> getSalesTrend() {
        List<SalesTrendDTO> trend = dashboardService.getSalesTrend();
        return Result.success(trend);
    }

    @Operation(summary = "获取最近5条订单")
    @GetMapping("/recent-orders")
    public Result<List<Map<String, Object>>> getRecentOrders() {
        List<Map<String, Object>> orders = dashboardService.getRecentOrders();
        return Result.success(orders);
    }

    @Operation(summary = "获取低库存商品列表")
    @GetMapping("/low-stock")
    public Result<List<Map<String, Object>>> getLowStockProducts() {
        List<Map<String, Object>> products = dashboardService.getLowStockProducts();
        return Result.success(products);
    }
}
