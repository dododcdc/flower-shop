package com.flower.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 订单状态分布DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDistributionDTO {
    /**
     * 订单状态：PENDING, PREPARING, DELIVERING, COMPLETED, CANCELLED
     */
    private String status;

    /**
     * 该状态的订单数量
     */
    private Integer count;

    /**
     * 状态文本（用于前端显示）
     */
    private String statusText;
}
