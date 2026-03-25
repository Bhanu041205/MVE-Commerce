package com.mvecommerce.service;

import com.mvecommerce.dto.OrderEventDTO;
import com.mvecommerce.entity.Order;
import com.mvecommerce.entity.OrderEvent;
import com.mvecommerce.repository.OrderEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderEventService {
    @Autowired
    private OrderEventRepository orderEventRepository;

    public OrderEvent createEvent(Order order, OrderEvent.EventType eventType, Order.OrderStatus status, String details) {
        OrderEvent event = OrderEvent.builder()
                .order(order)
                .eventType(eventType)
                .status(status)
                .details(details)
                .build();
        return orderEventRepository.save(event);
    }

    public OrderEvent createEvent(Order order, OrderEvent.EventType eventType, String details) {
        return createEvent(order, eventType, order.getStatus(), details);
    }

    public List<OrderEventDTO> getOrderTimeline(Long orderId) {
        return orderEventRepository.findByOrderIdOrderByCreatedAtAsc(orderId)
                .stream()
                .map(OrderEventDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public void logOrderCreated(Order order) {
        createEvent(order, OrderEvent.EventType.ORDER_CREATED, 
                "Order " + order.getOrderNumber() + " created successfully");
    }

    public void logPaymentInitiated(Order order) {
        String details = "Payment initiated via " + (order.getPaymentMethod() != null ? 
                order.getPaymentMethod().name() : "Unknown method");
        createEvent(order, OrderEvent.EventType.PAYMENT_PENDING, details);
    }

    public void logPaymentConfirmed(Order order) {
        createEvent(order, OrderEvent.EventType.PAYMENT_CONFIRMED, 
                "Payment confirmed. Order is now confirmed.");
    }

    public void logPaymentFailed(Order order) {
        createEvent(order, OrderEvent.EventType.PAYMENT_FAILED, 
                "Payment failed. Please retry or choose another payment method.");
    }

    public void logOrderConfirmed(Order order) {
        createEvent(order, OrderEvent.EventType.ORDER_CONFIRMED, 
                "Order confirmed and moved to packing queue.");
    }

    public void logPacking(Order order) {
        createEvent(order, OrderEvent.EventType.PACKING, 
                "Warehouse team is processing and packing your items.");
    }

    public void logShipped(Order order) {
        String details = "Shipped via " + (order.getTransportProvider() != null ? 
                order.getTransportProvider() : "Standard courier");
        if (order.getTransportTrackingId() != null) {
            details += ". Tracking ID: " + order.getTransportTrackingId();
        }
        createEvent(order, OrderEvent.EventType.SHIPPED, details);
    }

    public void logOutForDelivery(Order order) {
        createEvent(order, OrderEvent.EventType.OUT_FOR_DELIVERY, 
                "Your package is out for delivery today.");
    }

    public void logDelivered(Order order) {
        createEvent(order, OrderEvent.EventType.DELIVERED, 
                "Order delivered successfully. Thank you for your purchase!");
    }

    public void logCancelled(Order order) {
        String details = "Order cancelled";
        if (order.getCancellationReason() != null) {
            details += ". Reason: " + order.getCancellationReason();
        }
        if (order.getCancellationStage() != null) {
            details += " (" + order.getCancellationStage().name() + ")";
        }
        createEvent(order, OrderEvent.EventType.CANCELLED, details);
    }

    public void logRefundInitiated(Order order) {
        createEvent(order, OrderEvent.EventType.PAYMENT_REFUNDING, 
                "Refund initiated. You will receive funds within 5-7 business days.");
    }

    public void logRefundCompleted(Order order) {
        createEvent(order, OrderEvent.EventType.PAYMENT_REFUNDED, 
                "Refund completed successfully.");
    }

    public void logCancellationRejected(Order order) {
        createEvent(order, OrderEvent.EventType.CANCELLATION_REJECTED, 
                "Cancellation request rejected. Order already shipped.");
    }
}
