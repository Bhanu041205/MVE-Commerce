package com.mvecommerce.repository;

import com.mvecommerce.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @Query(value = "SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.product_id = :productId AND o.status <> 'CANCELLED'", nativeQuery = true)
    Number getBookedQuantityByProductId(Long productId);

    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.user_id = :userId AND oi.product_id = :productId AND o.status = 'DELIVERED'", nativeQuery = true)
    boolean hasDeliveredPurchase(Long userId, Long productId);
}
