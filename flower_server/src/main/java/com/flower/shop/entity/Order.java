package com.flower.shop.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.flower.shop.enums.OrderStatus;
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
     * 配送费
     */
    @TableField("delivery_fee")
    private BigDecimal deliveryFee;

    /**
     * 配送开始时间
     */
    @TableField("delivery_start_time")
    private LocalDateTime deliveryStartTime;

    /**
     * 配送结束时间
     */
    @TableField("delivery_end_time")
    private LocalDateTime deliveryEndTime;

    /**
     * 订单状态：
     * PENDING - 待确认（新订单）
     * PREPARING - 准备中（已确认，正在准备商品）
     * DELIVERING - 配送中（已发货，正在配送）
     * COMPLETED - 已完成（订单完成）
     * CANCELLED - 已取消（订单取消）
     */
    @TableField("status")
    private OrderStatus status;

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
     * 贺卡风格
     */
    @TableField("card_style")
    private String cardStyle;

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
     * 配送地址（临时存储，用于显示）
     */
    @TableField(exist = false)
    private String addressText;

    /**
     * 订单项数量（临时存储，用于显示）
     */
    @TableField(exist = false)
    private Integer itemCount;

    /**
     * 订单状态文本
     */
    public String getStatusText() {
        if (status == null)
            return "未知";
        return status.getDescription();
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
        return OrderStatus.COMPLETED.equals(this.status);
    }

    /**
     * 判断是否已取消
     */
    public boolean isCancelled() {
        return OrderStatus.CANCELLED.equals(this.status);
    }

    /**
     * 判断是否可以取消
     */
    public boolean canCancel() {
        return status != null &&
                (OrderStatus.PENDING.equals(status) || OrderStatus.PREPARING.equals(status)) &&
                !isCancelled();
    }

    /**
     * 判断是否可以确认
     */
    public boolean canConfirm() {
        return OrderStatus.PENDING.equals(status);
    }

    /**
     * 判断是否可以开始配送
     */
    public boolean canShip() {
        return OrderStatus.PREPARING.equals(this.status);
    }

    /**
     * 判断是否可以完成
     */
    public boolean canComplete() {
        return OrderStatus.DELIVERING.equals(this.status);
    }
}