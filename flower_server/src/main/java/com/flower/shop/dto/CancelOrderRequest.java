package com.flower.shop.dto;

import lombok.Data;

/**
 * 取消订单请求DTO
 */
@Data
public class CancelOrderRequest {
    /**
     * 取消原因（可选）
     */
    private String reason;
}
