package com.flower.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 仪表盘统计数据DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    /**
     * 今日订单数
     */
    private Integer todayOrderCount;

    /**
     * 今日销售额
     */
    private BigDecimal todaySalesAmount;

    /**
     * 待处理订单数（待确认 + 准备中）
     */
    private Integer pendingOrderCount;

    /**
     * 低库存商品数
     */
    private Integer lowStockCount;
}
