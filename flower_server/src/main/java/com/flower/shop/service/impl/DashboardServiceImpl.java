package com.flower.shop.service.impl;

import com.flower.shop.dto.*;
import com.flower.shop.entity.Order;
import com.flower.shop.entity.Product;
import com.flower.shop.mapper.OrderMapper;
import com.flower.shop.mapper.ProductMapper;
import com.flower.shop.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 仪表盘服务实现
 */
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final OrderMapper orderMapper;
    private final ProductMapper productMapper;

    @Override
    public DashboardStatsDTO getStats() {
        Integer todayOrderCount = orderMapper.countTodayOrders();
        BigDecimal todaySales = getTodaySalesAmount();
        Integer pendingOrderCount = getPendingOrderCount();
        Integer lowStockCount = getLowStockCount();

        return DashboardStatsDTO.builder()
                .todayOrderCount(todayOrderCount)
                .todaySalesAmount(todaySales)
                .pendingOrderCount(pendingOrderCount)
                .lowStockCount(lowStockCount)
                .build();
    }

    @Override
    public List<OrderDistributionDTO> getOrderDistribution() {
        List<Map<String, Object>> statusCounts = orderMapper.countOrdersByStatus();

        Map<String, String> statusTextMap = new HashMap<>();
        statusTextMap.put("PENDING", "待确认");
        statusTextMap.put("PREPARING", "准备中");
        statusTextMap.put("DELIVERING", "配送中");
        statusTextMap.put("COMPLETED", "已完成");
        statusTextMap.put("CANCELLED", "已取消");

        List<OrderDistributionDTO> result = new ArrayList<>();
        for (Map<String, Object> row : statusCounts) {
            String status = (String) row.get("status");
            Long count = ((Number) row.get("count")).longValue();

            OrderDistributionDTO dto = OrderDistributionDTO.builder()
                    .status(status)
                    .count(count.intValue())
                    .statusText(statusTextMap.getOrDefault(status, status))
                    .build();
            result.add(dto);
        }

        return result;
    }

    @Override
    public List<SalesTrendDTO> getSalesTrend() {
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd");

        List<SalesTrendDTO> trend = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            String dateStr = date.format(formatter);

            BigDecimal amount = getSalesAmountByDate(date);
            Integer orderCount = getOrderCountByDate(date);

            trend.add(SalesTrendDTO.builder()
                    .date(dateStr)
                    .amount(amount)
                    .orderCount(orderCount)
                    .build());
        }

        return trend;
    }

    @Override
    public List<Map<String, Object>> getRecentOrders() {
        List<Order> orders = orderMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Order>()
                        .orderByDesc(Order::getCreatedAt)
                        .last("LIMIT 10")
        );

        List<Map<String, Object>> result = new ArrayList<>();

        Map<String, Integer> priorityMap = new HashMap<>();
        priorityMap.put("PENDING", 4);
        priorityMap.put("PREPARING", 3);
        priorityMap.put("DELIVERING", 2);
        priorityMap.put("COMPLETED", 1);
        priorityMap.put("CANCELLED", 0);

        orders.sort((o1, o2) -> {
            int priority1 = priorityMap.getOrDefault(o1.getStatus(), 0);
            int priority2 = priorityMap.getOrDefault(o2.getStatus(), 0);
            if (priority1 != priority2) {
                return priority2 - priority1;
            }
            return o2.getCreatedAt().compareTo(o1.getCreatedAt());
        });

        for (Order order : orders.subList(0, Math.min(5, orders.size()))) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", order.getId());
            map.put("orderNo", order.getOrderNo());
            map.put("customerName", order.getCustomerName());
            map.put("customerPhone", order.getCustomerPhone());
            map.put("finalAmount", order.getFinalAmount());
            map.put("status", order.getStatus());
            map.put("statusText", order.getStatusText());
            map.put("createdAt", order.getCreatedAt());
            map.put("itemCount", order.getItemCount());
            result.add(map);
        }

        return result;
    }

    @Override
    public List<Map<String, Object>> getLowStockProducts() {
        List<Product> products = productMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Product>()
                        .le(Product::getStockQuantity, 10)
                        .orderByAsc(Product::getStockQuantity)
                        .last("LIMIT 10")
        );

        List<Map<String, Object>> result = new ArrayList<>();
        for (Product product : products) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", product.getId());
            map.put("name", product.getName());
            map.put("stockQuantity", product.getStockQuantity());
            map.put("lowStockThreshold", product.getLowStockThreshold());
            map.put("price", product.getPrice());
            map.put("statusText", product.getStockStatusText());
            result.add(map);
        }

        return result;
    }

    private BigDecimal getTodaySalesAmount() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();

        List<Order> completedOrders = orderMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Order>()
                        .eq(Order::getStatus, "COMPLETED")
                        .ge(Order::getCreatedAt, startOfDay)
                        .lt(Order::getCreatedAt, endOfDay)
        );

        BigDecimal total = BigDecimal.ZERO;
        for (Order order : completedOrders) {
            if (order.getFinalAmount() != null) {
                total = total.add(order.getFinalAmount());
            }
        }

        return total;
    }

    private Integer getPendingOrderCount() {
        long pendingCount = orderMapper.selectCount(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Order>()
                        .in(Order::getStatus, Arrays.asList("PENDING", "PREPARING"))
        );

        return ((Long) pendingCount).intValue();
    }

    private Integer getLowStockCount() {
        long lowStockCount = productMapper.selectCount(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Product>()
                        .le(Product::getStockQuantity, 10)
        );

        return ((Long) lowStockCount).intValue();
    }

    private BigDecimal getSalesAmountByDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();

        List<Order> completedOrders = orderMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Order>()
                        .eq(Order::getStatus, "COMPLETED")
                        .ge(Order::getCreatedAt, startOfDay)
                        .lt(Order::getCreatedAt, endOfDay)
        );

        BigDecimal total = BigDecimal.ZERO;
        for (Order order : completedOrders) {
            if (order.getFinalAmount() != null) {
                total = total.add(order.getFinalAmount());
            }
        }

        return total;
    }

    private Integer getOrderCountByDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();

        long count = orderMapper.selectCount(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Order>()
                        .ge(Order::getCreatedAt, startOfDay)
                        .lt(Order::getCreatedAt, endOfDay)
        );

        return ((Long) count).intValue();
    }
}
