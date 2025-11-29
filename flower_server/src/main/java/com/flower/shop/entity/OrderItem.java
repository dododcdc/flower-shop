package com.flower.shop.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单项实体类
 *
 * 设计说明：
 * - 订单中每个商品的详细信息
 * - 记录下单时的商品快照信息
 * - 支持价格快照防止价格变动影响
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("order_items")
public class OrderItem {

    /**
     * 订单项ID - 主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 订单ID - 外键关联orders表
     */
    @TableField("order_id")
    private Long orderId;

    /**
     * 商品ID - 外键关联products表
     */
    @TableField("product_id")
    private Long productId;

    /**
     * 商品快照名称（下单时商品的名称）
     */
    @TableField("product_name")
    private String productSnapshotName;

    
    /**
     * 商品单价（下单时的价格，防止价格变动）
     */
    @TableField("product_price")
    private BigDecimal unitPrice;

    /**
     * 购买数量
     */
    @TableField("quantity")
    private Integer quantity;

    /**
     * 小计金额（单价 × 数量）
     */
    @TableField("total_price")
    private BigDecimal subtotal;

    
    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    
    /**
     * 商品名称（临时存储，用于显示）
     */
    @TableField(exist = false)
    private String productName;

    /**
     * 商品图片（临时存储，用于显示）
     */
    @TableField(exist = false)
    private String productImage;

    /**
     * 商品规格（临时存储，用于显示）
     */
    @TableField(exist = false)
    private String productSpecification;

    /**
     * 花材分类名称（临时存储，用于显示）
     */
    @TableField(exist = false)
    private String categoryName;

    /**
     * 包装分类名称（临时存储，用于显示）
     */
    @TableField(exist = false)
    private String packagingName;

    /**
     * 计算小计金额
     */
    public void calculateSubtotal() {
        if (unitPrice != null && quantity != null && quantity > 0) {
            this.subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }

    /**
     * 获取小计金额
     */
    public BigDecimal getSubtotalAmount() {
        if (subtotal != null) {
            return subtotal;
        }
        calculateSubtotal();
        return subtotal;
    }

    /**
     * 获取总金额文本
     */
    public String getSubtotalText() {
        BigDecimal amount = getSubtotalAmount();
        if (amount == null) {
            return "¥0.00";
        }
        return "¥" + amount.setScale(2, BigDecimal.ROUND_HALF_UP).toString();
    }

    /**
     * 获取单价文本
     */
    public String getUnitPriceText() {
        if (unitPrice == null) {
            return "¥0.00";
        }
        return "¥" + unitPrice.setScale(2, BigDecimal.ROUND_HALF_UP).toString();
    }

    /**
     * 获取数量描述
     */
    public String getQuantityDescription() {
        if (quantity == null || quantity <= 1) {
            return "";
        }
        return "x" + quantity;
    }
}