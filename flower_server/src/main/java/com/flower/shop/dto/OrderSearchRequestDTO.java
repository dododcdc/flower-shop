package com.flower.shop.dto;

import lombok.Data;

/**
 * 订单搜索请求DTO
 */
@Data
public class OrderSearchRequestDTO {
    /**
     * 搜索关键词（订单号、客户姓名、手机号）
     */
    private String keyword;

    /**
     * 订单状态
     */
    private String status;

    /**
     * 开始日期（格式：yyyy-MM-dd）
     */
    private String startDate;

    /**
     * 结束日期（格式：yyyy-MM-dd）
     */
    private String endDate;

    /**
     * 页码（从1开始）
     */
    private Integer page = 1;

    /**
     * 每页大小
     */
    private Integer size = 10;

    /**
     * 排序字段
     */
    private String sortBy = "created_at";

    /**
     * 排序方向（asc/desc）
     */
    private String sortOrder = "desc";
}
