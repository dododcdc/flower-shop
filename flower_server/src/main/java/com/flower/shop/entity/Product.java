package com.flower.shop.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品实体类
 *
 * 设计说明：
 * - 每个商品都关联花材分类和包装分类
 * - 支持多图片展示
 * - 包含价格、描述等基本信息
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("products")
public class Product {

    /**
     * 商品ID - 主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 商品名称
     * 格式建议：[花材名称] + [包装类型] + [特色描述]
     * 如：11朵红玫瑰花束、精美百合花篮
     */
    @TableField("name")
    private String name;

    /**
     * 花材分类ID（关联categories表，parent_id为NULL的分类）
     */
    @TableField("category_id")
    private Long categoryId;

    // 注意：当前数据库设计中没有packaging_id字段
// 包装信息通过category_id的层级关系来区分

    /**
     * 商品描述
     */
    @TableField("description")
    private String description;

    /**
     * 商品图片列表（JSON格式存储多个图片URL）
     * 数据库字段为：images (JSON类型)
     */
    @TableField("images")
    private String images;

    /**
     * 商品规格
     * 如：11朵、19朵、大号、中号、小号等
     */
    @TableField("specification")
    private String specification;

    /**
     * 当前售价
     */
    @TableField("price")
    private BigDecimal price;

    /**
     * 原价（用于显示折扣）
     */
    @TableField("original_price")
    private BigDecimal originalPrice;

    /**
     * 商品状态：0-下架，1-上架
     * 数据库字段为：status
     */
    @TableField("status")
    private Integer status;

    /**
     * 是否推荐：0-不推荐，1-推荐
     * 数据库字段为：featured
     */
    @TableField("featured")
    private Integer featured;

    /**
     * 花语说明
     * 数据库字段为：flower_language
     */
    @TableField("flower_language")
    private String flowerLanguage;

    /**
     * 养护指南
     * 数据库字段为：care_guide
     */
    @TableField("care_guide")
    private String careGuide;

    
    
    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 逻辑删除标记：0-未删除，1-已删除
     */
    @TableLogic
    @TableField("deleted")
    private Integer deleted;

    /**
     * 花材分类名称（临时存储，用于显示）
     */
    @TableField(exist = false)
    private String categoryName;

    /**
     * 库存数量
     */
    @TableField("stock_quantity")
    private Integer stockQuantity;

    /**
     * 低库存预警阈值
     */
    @TableField("low_stock_threshold")
    private Integer lowStockThreshold;

    /**
     * 判断是否有折扣
     */
    public boolean hasDiscount() {
        if (originalPrice == null || price == null) {
            return false;
        }
        return price.compareTo(originalPrice) < 0;
    }

    /**
     * 判断是否上架
     */
    public boolean isOnline() {
        return Integer.valueOf(1).equals(this.status);
    }

    /**
     * 判断是否推荐
     */
    public boolean isFeaturedProduct() {
        return Integer.valueOf(1).equals(this.featured);
    }

    /**
     * 判断是否库存不足
     */
    public boolean isLowStock() {
        if (stockQuantity == null || lowStockThreshold == null) {
            return false;
        }
        return stockQuantity > 0 && stockQuantity <= lowStockThreshold;
    }

    /**
     * 判断是否缺货
     */
    public boolean isOutOfStock() {
        return stockQuantity != null && stockQuantity <= 0;
    }

    /**
     * 判断库存充足
     */
    public boolean hasSufficientStock() {
        return stockQuantity != null && stockQuantity > lowStockThreshold;
    }

    /**
     * 获取库存状态文本
     */
    public String getStockStatusText() {
        if (isOutOfStock()) {
            return "缺货";
        } else if (isLowStock()) {
            return "库存不足";
        } else {
            return "库存充足";
        }
    }

    /**
     * 设置库存数量
     */
    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
        // 自动更新库存状态
        updateStockStatus();
    }

    /**
     * 设置低库存预警阈值
     */
    public void setLowStockThreshold(Integer lowStockThreshold) {
        this.lowStockThreshold = lowStockThreshold;
        // 自动更新库存状态
        updateStockStatus();
    }

    /**
     * 更新库存状态（内部方法）
     */
    private void updateStockStatus() {
        if (stockQuantity != null && lowStockThreshold != null) {
            // 可以在这里添加状态更新逻辑
        }
    }

    /**
     * 扣减库存
     */
    public void reduceStock(Integer quantity) {
        if (quantity != null && quantity > 0 && stockQuantity != null) {
            this.stockQuantity = Math.max(0, this.stockQuantity - quantity);
            updateStockStatus();
        }
    }

    /**
     * 增加库存
     */
    public void addStock(Integer quantity) {
        if (quantity != null && quantity > 0 && stockQuantity != null) {
            this.stockQuantity = stockQuantity + quantity;
            updateStockStatus();
        }
    }
}