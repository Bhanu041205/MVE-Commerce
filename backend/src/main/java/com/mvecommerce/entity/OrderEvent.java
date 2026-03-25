package com.mvecommerce.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_events", indexes = {
    @Index(name = "idx_order_event_order_id", columnList = "order_id"),
    @Index(name = "idx_order_event_timestamp", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Order.OrderStatus status;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Builder.Default
    @Column(nullable = false, name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum EventType {
        ORDER_CREATED("Order Created"),
        PAYMENT_CONFIRMED("Payment Confirmed"),
        PAYMENT_PENDING("Payment Pending"),
        PAYMENT_FAILED("Payment Failed"),
        PAYMENT_REFUNDING("Refund Initiated"),
        PAYMENT_REFUNDED("Refund Completed"),
        ORDER_CONFIRMED("Order Confirmed"),
        PACKING("Packing Items"),
        PACKED("Packed"),
        SHIPPED("Shipped"),
        OUT_FOR_DELIVERY("Out for Delivery"),
        DELIVERED("Delivered"),
        CANCELLED("Order Cancelled"),
        CANCELLATION_REJECTED("Cancellation Rejected");

        private final String displayName;

        EventType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
