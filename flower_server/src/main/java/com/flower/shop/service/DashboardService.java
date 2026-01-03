package com.flower.shop.service;

import com.flower.shop.dto.DashboardStatsDTO;
import com.flower.shop.dto.OrderDistributionDTO;
import com.flower.shop.dto.SalesTrendDTO;

import java.util.List;
import java.util.Map;

/**
 * 仪表盘服务接口
 */
public interface DashboardService {

    /**
     * 获取核心统计数据
     * 今日订单数、今日销售额、待处理订单数、低库存商品数
     */
    DashboardStatsDTO getStats();

    /**
     * 获取订单状态分布
     * 用于饼图展示
     */
    List<OrderDistributionDTO> getOrderDistribution();

    /**
     * 获取最近7天销售趋势
     * 用于折线图展示
     */
    List<SalesTrendDTO> getSalesTrend();

    /**
     * 获取最近5条订单（按优先级排序）
     * 待确认 > 准备中 > 配送中 > 已完成
     */
    List<Map<String, Object>> getRecentOrders();

    /**
     * 获取低库存商品列表
     * 库存 <= 10 的商品
     */
    List<Map<String, Object>> getLowStockProducts();
}
