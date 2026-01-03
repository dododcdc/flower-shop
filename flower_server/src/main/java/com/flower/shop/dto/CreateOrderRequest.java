package com.flower.shop.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class CreateOrderRequest {
    // 收货信息
    @NotBlank(message = "收货人姓名不能为空")
    private String recipientName;

    @NotBlank(message = "联系电话不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "请填写正确的手机号码")
    private String recipientPhone;

    @NotBlank(message = "收货地址不能为空")
    private String recipientAddress;

    // 配送时间
    @NotNull(message = "配送日期不能为空")
    private LocalDate deliveryDate;

    @NotNull(message = "配送时间不能为空")
    private LocalTime deliveryTime;

    // 贺卡信息
    private String cardContent;
    private String cardSender;

    // 支付方式
    @NotBlank(message = "支付方式不能为空")
    private String paymentMethod;

    // 订单项
    @NotEmpty(message = "订单项不能为空")
    @Valid
    private List<OrderItemDTO> items;

    @Data
    public static class OrderItemDTO {
        @NotNull(message = "商品ID不能为空")
        private Long productId;

        @NotNull(message = "商品数量不能为空")
        @Min(value = 1, message = "商品数量至少为1")
        private Integer quantity;

        @NotNull(message = "商品价格不能为空")
        @DecimalMin(value = "0.01", message = "商品价格必须大于0")
        private BigDecimal price;
    }
}