package com.flower.shop.dto;

import lombok.Data;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

/**
 * 商品搜索请求DTO
 *
 * 设计说明：
 * - 支持多条件组合查询
 * - 包含分页和排序参数
 * - 支持库存状态筛选
 */
@Data
public class ProductSearchRequest {

    /**
     * 关键词搜索（商品名称、描述、花语）
     */
    private String keyword;

    /**
     * 分类ID
     */
    private Long categoryId;

    /**
     * 商品状态：0-下架，1-上架
     */
    private Integer status;

    /**
     * 是否推荐：0-不推荐，1-推荐
     */
    private Integer featured;

    /**
     * 最低价格
     */
    @Min(value = 0, message = "最低价格不能小于0")
    private BigDecimal minPrice;

    /**
     * 最高价格
     */
    @Min(value = 0, message = "最高价格不能小于0")
    private BigDecimal maxPrice;

    /**
     * 库存状态筛选
     * in_stock - 有货
     * low_stock - 库存不足
     * out_of_stock - 缺货
     */
    @Pattern(regexp = "in_stock|low_stock|out_of_stock", message = "库存状态必须是: in_stock, low_stock, out_of_stock")
    private String stockStatus;

    /**
     * 排序字段
     * created_at - 创建时间
     * price - 价格
     * name - 名称
     * stock_quantity - 库存数量
     * sales - 销量
     */
    @Pattern(regexp = "created_at|price|name|stock_quantity|sales", message = "排序字段必须是: created_at, price, name, stock_quantity, sales")
    private String sortBy = "created_at";

    /**
     * 排序方向：asc-升序，desc-降序
     */
    @Pattern(regexp = "asc|desc", message = "排序方向必须是: asc 或 desc")
    private String sortOrder = "desc";

    /**
     * 当前页码
     */
    @Min(value = 1, message = "页码必须大于0")
    private Integer current = 1;

    /**
     * 每页数量
     */
    @Min(value = 1, message = "每页数量必须大于0")
    private Integer size = 12;

    /**
     * 验证价格范围
     */
    public boolean hasValidPriceRange() {
        if (minPrice != null && maxPrice != null) {
            return minPrice.compareTo(maxPrice) <= 0;
        }
        return true;
    }
}