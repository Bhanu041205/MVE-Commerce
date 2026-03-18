package com.mvecommerce.service;

import com.mvecommerce.dto.CreateOrderRequest;
import com.mvecommerce.dto.OrderDTO;
import com.mvecommerce.dto.OrderItemDTO;
import com.mvecommerce.entity.*;
import com.mvecommerce.exception.BadRequestException;
import com.mvecommerce.exception.ResourceNotFoundException;
import com.mvecommerce.repository.*;
import com.mvecommerce.security.SecurityUtil;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final SecurityUtil securityUtil;
    private final ModelMapper modelMapper;
    private final OrderNoteNotificationService orderNoteNotificationService;

    public OrderDTO createOrder(CreateOrderRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getShippingAddressId() == null) {
            throw new BadRequestException("Shipping address is required");
        }

        Address shippingAddress = addressRepository.findById(request.getShippingAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (!shippingAddress.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized address access");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        String normalizedNotes = StringUtils.hasText(request.getNotes()) ? request.getNotes().trim() : null;

        Order order = Order.builder()
                .user(user)
                .shippingAddress(shippingAddress)
                .orderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .status(Order.OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .taxAmount(BigDecimal.ZERO)
            .notes(normalizedNotes)
                .estimatedDeliveryDate(LocalDateTime.now().plusDays(3))
                .build();

        Order savedOrder = orderRepository.save(order);

        for (CreateOrderRequest.OrderItemData itemData : request.getItems()) {
            Product product = productRepository.findById(itemData.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            if (!product.getIsActive()) {
                throw new BadRequestException("Product is not available: " + product.getName());
            }

            if (product.getStock() < itemData.getQuantity()) {
                throw new BadRequestException("Insufficient stock for: " + product.getName());
            }

            // Update stock
            product.setStock(product.getStock() - itemData.getQuantity());
            productRepository.save(product);

            // Create order item
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .quantity(itemData.getQuantity())
                    .priceAtPurchase(itemData.getPriceAtPurchase())
                    .discountApplied(product.getDiscount())
                    .build();

            orderItemRepository.save(orderItem);

            // Calculate total
            BigDecimal itemTotal = itemData.getPriceAtPurchase().multiply(BigDecimal.valueOf(itemData.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        // Calculate tax (10%) and shipping (free over $100)
        BigDecimal taxAmount = totalAmount.multiply(new BigDecimal("0.10"));
        BigDecimal shippingAmount = totalAmount.compareTo(new BigDecimal("100")) > 0 ? BigDecimal.ZERO : new BigDecimal("10.00");
        BigDecimal grandTotal = totalAmount.add(taxAmount).add(shippingAmount);

        savedOrder.setTaxAmount(taxAmount);
        savedOrder.setShippingAmount(shippingAmount);
        savedOrder.setTotalAmount(grandTotal);
        savedOrder.setStatus(Order.OrderStatus.CONFIRMED);
        Order finalOrder = orderRepository.save(savedOrder);

        orderNoteNotificationService.notifyOrderNotes(finalOrder);

        // Clear cart
        cartItemRepository.deleteByUserId(userId);

        return convertToDTO(finalOrder);
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO> getUserOrders(Pageable pageable) {
        Long userId = securityUtil.getCurrentUserId();
        return orderRepository.findByUserId(userId, pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Long userId = securityUtil.getCurrentUserId();
        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access");
        }

        return convertToDTO(order);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Long userId = securityUtil.getCurrentUserId();
        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access");
        }

        return convertToDTO(order);
    }

    // Admin only methods
    @Transactional(readOnly = true)
    public Page<OrderDTO> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOrderStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Order> allOrders = orderRepository.findAll();
        
        long totalOrders = allOrders.size();
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() != Order.OrderStatus.CANCELLED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Map<String, Long> statusCounts = new HashMap<>();
        for (Order.OrderStatus status : Order.OrderStatus.values()) {
            long count = allOrders.stream().filter(o -> o.getStatus() == status).count();
            statusCounts.put(status.name(), count);
        }
        
        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        stats.put("statusCounts", statusCounts);
        return stats;
    }

    public OrderDTO updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status);
            order.setStatus(orderStatus);
            
            if (orderStatus == Order.OrderStatus.DELIVERED) {
                order.setDeliveredAt(LocalDateTime.now());
            }
            
            Order updatedOrder = orderRepository.save(order);
            return convertToDTO(updatedOrder);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid order status: " + status);
        }
    }

    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() == Order.OrderStatus.DELIVERED || 
            order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot cancel order with status: " + order.getStatus());
        }

        // Restore stock
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(id);
        for (OrderItem item : orderItems) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = OrderDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .taxAmount(order.getTaxAmount())
                .shippingAmount(order.getShippingAmount())
                .notes(order.getNotes())
                .userName(order.getUser().getFirstName() + " " + order.getUser().getLastName())
                .userEmail(order.getUser().getEmail())
                .createdAt(order.getCreatedAt())
                .estimatedDeliveryDate(order.getEstimatedDeliveryDate())
                .deliveredAt(order.getDeliveredAt())
                .build();

        if (order.getShippingAddress() != null) {
            dto.setShippingAddress(modelMapper.map(order.getShippingAddress(), 
                    com.mvecommerce.dto.AddressDTO.class));
        }

        List<OrderItem> orderItems = orderItemRepository.findByOrderId(order.getId());
        List<OrderItemDTO> itemDTOs = orderItems.stream()
                .map(item -> {
                    OrderItemDTO itemDto = OrderItemDTO.builder()
                            .id(item.getId())
                            .quantity(item.getQuantity())
                            .priceAtPurchase(item.getPriceAtPurchase())
                            .discountApplied(item.getDiscountApplied())
                            .build();
                    itemDto.setProduct(modelMapper.map(item.getProduct(), 
                            com.mvecommerce.dto.ProductDTO.class));
                    return itemDto;
                })
                .collect(Collectors.toList());

        dto.setItems(itemDTOs);
        return dto;
    }
}
