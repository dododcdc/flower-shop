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
     * 关联的用户ID
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 订单号（唯一，格式如：FH20251122001）
     */
    @TableField("order_no")
    private String orderNo;

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
     * PENDING - 待支付
     * PAID - 已支付（待确认）
     * PREPARING - 准备中
     * DELIVERING - 配送中
     * COMPLETED - 已完成
     * CANCELLED - 已取消
     */
    @TableField("status")
    private String status;

    /**
     * 支付方式: ALIPAY, WECHAT, ON_DELIVERY
     */
    @TableField("payment_method")
    private String paymentMethod;

    /**
     * 支付状态: PENDING, PAID, REFUNDED
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
     * 贺卡内容
     */
    @TableField("card_content")
    private String cardContent;

    /**
     * 贺卡署名
     */
    @TableField("card_sender")
    private String cardSender;

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
        if (status == null)
            return "未知";
        switch (status) {
            case "PENDING":
                return "待支付";
            case "PAID":
                return "已支付";
            case "PREPARING":
                return "准备中";
            case "DELIVERING":
                return "配送中";
            case "COMPLETED":
                return "已完成";
            case "CANCELLED":
                return "已取消";
            default:
                return "未知";
        }
    }

    /**
     * 支付方式文本
     */
    public String getPaymentMethodText() {
        if (paymentMethod == null)
            return "未选择";
        switch (paymentMethod) {
            case "ALIPAY":
                return "支付宝";
            case "WECHAT":
                return "微信支付";
            case "ON_DELIVERY":
                return "到付";
            default:
                return paymentMethod;
        }
    }

    /**
     * 支付状态文本
     */
    public String getPaymentStatusText() {
        if (paymentStatus == null)
            return "未支付";
        switch (paymentStatus) {
            case "PENDING":
                return "待支付";
            case "PAID":
                return "已支付";
            case "REFUNDED":
                return "已退款";
            default:
                return paymentStatus;
        }
    }

    /**
     * 判断是否已支付
     */
    public boolean isPaid() {
        return "PAID".equals(this.paymentStatus);
    }

    /**
     * 判断是否已完成
     */
    public boolean isCompleted() {
        return "COMPLETED".equals(this.status);
    }

    /**
     * 判断是否已取消
     */
    public boolean isCancelled() {
        return "CANCELLED".equals(this.status);
    }

    /**
     * 判断是否可以取消
     */
    public boolean canCancel() {
        return status != null &&
                ("PENDING".equals(status) || "PAID".equals(status) || "PREPARING".equals(status)) &&
                !isCancelled();
    }

    /**
     * 判断是否可以确认
     */
    public boolean canConfirm() {
        return "PAID".equals(this.status) && isPaid();
    }

    /**
     * 判断是否可以开始配送
     */
    public boolean canShip() {
        return "PREPARING".equals(this.status);
    }

    /**
     * 判断是否可以完成
     */
    public boolean canComplete() {
        return "DELIVERING".equals(this.status);
    }
}