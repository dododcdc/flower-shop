package com.flower.shop.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.flower.shop.dto.CreateOrderRequest;
import com.flower.shop.entity.Order;
import com.flower.shop.entity.OrderItem;
import com.flower.shop.entity.Product;
import com.flower.shop.mapper.OrderItemMapper;
import com.flower.shop.mapper.OrderMapper;
import com.flower.shop.service.OrderService;
import com.flower.shop.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> implements OrderService {

    private final OrderItemMapper orderItemMapper;
    private final ProductService productService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Order createOrder(CreateOrderRequest request) {
        // 1. 创建订单对象
        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setCustomerName(request.getRecipientName());
        order.setCustomerPhone(request.getRecipientPhone());

        // 2. 设置配送信息
        if (request.getDeliveryDate() != null && request.getDeliveryTime() != null) {
            LocalDateTime deliveryDateTime = LocalDateTime.of(
                    request.getDeliveryDate(),
                    request.getDeliveryTime());
            order.setDeliveryTime(deliveryDateTime);
        }

        // 3. 设置贺卡信息
        order.setCardContent(request.getCardContent());
        order.setCardSender(request.getCardSender());

        // 4. 设置订单备注（收货地址）
        order.setNotes(request.getRecipientAddress());

        // 5. 计算订单金额
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CreateOrderRequest.OrderItemDTO itemDTO : request.getItems()) {
            BigDecimal itemTotal = itemDTO.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        order.setTotalAmount(totalAmount);
        order.setDeliveryFee(BigDecimal.ZERO); // 暂时免运费
        order.setFinalAmount(totalAmount);

        // 6. 设置订单状态
        order.setStatus("PENDING"); // 待支付
        order.setPaymentStatus("PENDING"); // 待支付

        // 7. 保存订单
        this.save(order);

        // 8. 保存订单项
        for (CreateOrderRequest.OrderItemDTO itemDTO : request.getItems()) {
            Product product = productService.getById(itemDTO.getProductId());
            if (product == null) {
                throw new RuntimeException("商品不存在: " + itemDTO.getProductId());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(order.getId());
            orderItem.setProductId(product.getId());
            orderItem.setProductSnapshotName(product.getName());
            orderItem.setUnitPrice(itemDTO.getPrice());
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.calculateSubtotal();

            orderItemMapper.insert(orderItem);
        }

        return order;
    }

    /**
     * 生成订单号
     * 格式: FH + yyyyMMddHHmmss + 3位随机数
     */
    private String generateOrderNo() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int random = (int) (Math.random() * 900) + 100;
        return "FH" + timestamp + random;
    }
}
