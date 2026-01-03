package com.flower.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 销售趋势DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesTrendDTO {
    /**
     * 日期（格式：MM-dd）
     */
    private String date;

    /**
     * 当日销售额
     */
    private BigDecimal amount;

    /**
     * 当日订单数
     */
    private Integer orderCount;
}
