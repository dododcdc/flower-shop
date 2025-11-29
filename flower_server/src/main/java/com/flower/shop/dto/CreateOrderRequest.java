package com.flower.shop.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class CreateOrderRequest {
    // 收货信息
    private String recipientName;
    private String recipientPhone;
    private String recipientAddress;

    // 配送时间
    private LocalDate deliveryDate;
    private LocalTime deliveryTime;

    // 贺卡信息
    private String cardContent;
    private String cardSender;

    // 支付方式
    private String paymentMethod;

    // 订单项
    private List<OrderItemDTO> items;

    @Data
    public static class OrderItemDTO {
        private Long productId;
        private Integer quantity;
        private BigDecimal price;
    }
}