package com.flower.shop.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.flower.shop.dto.CreateOrderRequest;
import com.flower.shop.entity.Order;
import com.flower.shop.entity.OrderItem;
import com.flower.shop.entity.Product;
import com.flower.shop.enums.OrderStatus;
import com.flower.shop.exception.BusinessException;
import com.flower.shop.mapper.OrderItemMapper;
import com.flower.shop.mapper.OrderMapper;
import com.flower.shop.service.OrderService;
import com.flower.shop.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> implements OrderService {

    private final OrderItemMapper orderItemMapper;
    private final ProductService productService;
    private final OrderMapper orderMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Order createOrder(CreateOrderRequest request) {
        // 1. 创建订单对象
        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setCustomerName(request.getRecipientName());
        order.setCustomerPhone(request.getRecipientPhone());

        // 尝试绑定登录用户
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getDetails() instanceof Long) {
                order.setUserId((Long) auth.getDetails());
            }
        } catch (Exception e) {
            // 忽略获取用户信息的异常，不影响游客下单
            log.warn("绑定用户下单失败: {}", e.getMessage());
        }

        // 2. 设置配送信息
        if (request.getDeliveryDate() != null && request.getDeliveryTime() != null) {
            LocalDateTime deliveryDateTime = LocalDateTime.of(request.getDeliveryDate(), request.getDeliveryTime());
            order.setDeliveryTime(deliveryDateTime);
        }

        // 3. 设置贺卡信息
        order.setCardContent(request.getCardContent());
        order.setCardSender(request.getCardSender());

        // 4. 设置订单备注（收货地址）
        order.setNotes(request.getRecipientAddress());

        // 5. 设置支付方式
        if (request.getPaymentMethod() != null) {
            order.setPaymentMethod(request.getPaymentMethod());
        } else {
            order.setPaymentMethod("ON_DELIVERY"); // 默认使用到付
        }

        // 6. 计算订单金额
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CreateOrderRequest.OrderItemDTO itemDTO : request.getItems()) {
            BigDecimal itemTotal = itemDTO.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        order.setTotalAmount(totalAmount);
        order.setDeliveryFee(BigDecimal.ZERO); // 暂时免运费
        order.setFinalAmount(totalAmount);

        // 7. 设置订单状态
        // 对于到付订单，直接进入准备状态；对于在线支付订单，需要等待支付
        if ("ON_DELIVERY".equals(request.getPaymentMethod())) {
            order.setStatus(OrderStatus.PREPARING); // 准备中
            order.setPaymentStatus("PENDING"); // 待支付（配送时付款）
        } else {
            order.setStatus(OrderStatus.PENDING); // 待支付
            order.setPaymentStatus("PENDING"); // 待支付
        }

        // 8. 保存订单
        this.save(order);

        // 9. 保存订单项
        for (CreateOrderRequest.OrderItemDTO itemDTO : request.getItems()) {
            Product product = productService.getById(itemDTO.getProductId());
            if (product == null) {
                throw new BusinessException("商品不存在: " + itemDTO.getProductId());
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

    @Override
    public IPage<Order> getOrdersByPhone(String phone, String status, Integer page, Integer size) {
        Page<Order> pageInfo = new Page<>(page, size);
        return orderMapper.selectOrdersByCustomerPhone(pageInfo, phone, status);
    }

    @Override
    public IPage<Order> getOrdersByUserId(Long userId, String status, Integer page, Integer size) {
        Page<Order> pageInfo = new Page<>(page, size);
        return orderMapper.selectOrdersByUserIdPage(pageInfo, userId, status);
    }

    @Override
    public IPage<Order> searchOrders(String keyword, String status, String startDate, String endDate,
                                      Integer page, Integer size, String sortBy, String sortOrder) {
        Page<Order> pageInfo = new Page<>(page, size);
        return orderMapper.searchOrders(pageInfo, keyword, status, startDate, endDate, sortBy, sortOrder);
    }

    @Override
    public Order getOrderDetail(Long orderId) {
        if (orderId == null) {
            return null;
        }
        return orderMapper.selectOrderDetail(orderId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Order confirmOrder(Long orderId) {
        Order order = this.getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (!OrderStatus.PENDING.equals(order.getStatus())) {
            throw new BusinessException("只有待确认状态的订单才能确认");
        }

        order.setStatus(OrderStatus.PREPARING);
        this.updateById(order);
        return order;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Order startDelivery(Long orderId) {
        Order order = this.getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (!OrderStatus.PREPARING.equals(order.getStatus())) {
            throw new BusinessException("只有准备中状态的订单才能开始配送");
        }

        order.setStatus(OrderStatus.DELIVERING);
        this.updateById(order);
        return order;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Order completeOrder(Long orderId) {
        Order order = this.getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (!OrderStatus.DELIVERING.equals(order.getStatus())) {
            throw new BusinessException("只有配送中状态的订单才能完成配送");
        }

        order.setStatus(OrderStatus.COMPLETED);
        order.setPaymentStatus("PAID");
        this.updateById(order);
        return order;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Order cancelOrder(Long orderId, String reason) {
        Order order = this.getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (OrderStatus.COMPLETED.equals(order.getStatus()) || OrderStatus.CANCELLED.equals(order.getStatus())) {
            throw new BusinessException("已完成或已取消的订单不能取消");
        }

        // 恢复库存
        List<OrderItem> items = orderItemMapper.selectList(
            new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<OrderItem>()
                .eq("order_id", orderId)
        );

        for (OrderItem item : items) {
            Product product = productService.getById(item.getProductId());
            if (product != null && product.getStockQuantity() != null) {
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productService.updateById(product);
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        if (reason != null && !reason.trim().isEmpty()) {
            order.setNotes((order.getNotes() != null ? order.getNotes() + "\n" : "") + "取消原因: " + reason);
        }
        this.updateById(order);
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