package com.flower.shop.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单实体类
 *
 * 设计说明：
 * - 支持游客下单（用户ID可为空）
 * - 订单状态完整跟踪
 * - 配送信息管理
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("orders")
public class Order {

    /**
     * 订单ID - 主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 订单号（唯一，格式如：FH20251122001）
     */
    @TableField("order_no")
    private String orderNo;

    /**
     * 用户ID（游客下单时为空，注册用户下单时填写）
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 客户姓名
     */
    @TableField("customer_name")
    private String customerName;

    /**
     * 客户手机号
     */
    @TableField("customer_phone")
    private String customerPhone;

    /**
     * 配送距离（公里）
     */
    @TableField(exist = false)
    private Double deliveryDistance;

    /**
     * 配送费
     */
    @TableField("delivery_fee")
    private BigDecimal deliveryFee;

    /**
     * 期望配送时间
     */
    @TableField("delivery_time")
    private LocalDateTime deliveryTime;

    /**
     * 订单状态：
     * 0-待支付
     * 1-已支付（待确认）
     * 2-已确认（准备中）
     * 3-配送中
     * 4-已完成
     * 5-已取消
     */
    @TableField("status")
    private Integer status;

    /**
     * 支付方式
     */
    @TableField("payment_method")
    private String paymentMethod;

    /**
     * 支付状态
     */
    @TableField("payment_status")
    private String paymentStatus;

    /**
     * 订单总金额
     */
    @TableField("total_amount")
    private BigDecimal totalAmount;

    /**
     * 最终金额（总金额 + 配送费）
     */
    @TableField("final_amount")
    private BigDecimal finalAmount;

    /**
     * 订单备注
     */
    @TableField("notes")
    private String notes;

    
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
     * 订单项列表（临时存储，用于显示）
     */
    @TableField(exist = false)
    private java.util.List<OrderItem> orderItems;

    /**
     * 订单状态文本
     */
    public String getStatusText() {
        if (status == null) return "未知";
        switch (status) {
            case 0: return "待支付";
            case 1: return "待确认";
            case 2: return "准备中";
            case 3: return "配送中";
            case 4: return "已完成";
            case 5: return "已取消";
            default: return "未知";
        }
    }

    /**
     * 支付方式文本
     */
    public String getPaymentMethodText() {
        return paymentMethod != null ? paymentMethod : "未选择";
    }

    /**
     * 支付状态文本
     */
    public String getPaymentStatusText() {
        return paymentStatus != null ? paymentStatus : "未支付";
    }

    /**
     * 判断是否为游客订单
     */
    public boolean isGuestOrder() {
        return this.userId == null;
    }

    /**
     * 判断是否已支付
     */
    public boolean isPaid() {
        return Integer.valueOf(1).equals(this.paymentStatus);
    }

    /**
     * 判断是否已完成
     */
    public boolean isCompleted() {
        return Integer.valueOf(4).equals(this.status);
    }

    /**
     * 判断是否已取消
     */
    public boolean isCancelled() {
        return Integer.valueOf(5).equals(this.status);
    }

    /**
     * 判断是否可以取消
     */
    public boolean canCancel() {
        return status != null && status < 3 && !isCancelled();
    }

    /**
     * 判断是否可以确认
     */
    public boolean canConfirm() {
        return Integer.valueOf(1).equals(this.status) && isPaid();
    }

    /**
     * 判断是否可以开始配送
     */
    public boolean canShip() {
        return Integer.valueOf(2).equals(this.status);
    }

    /**
     * 判断是否可以完成
     */
    public boolean canComplete() {
        return Integer.valueOf(3).equals(this.status);
    }
}