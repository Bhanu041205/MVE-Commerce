package com.mvecommerce.repository;

import com.mvecommerce.entity.OrderEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderEventRepository extends JpaRepository<OrderEvent, Long> {
    @Query("SELECT oe FROM OrderEvent oe WHERE oe.order.id = :orderId ORDER BY oe.createdAt ASC")
    List<OrderEvent> findByOrderIdOrderByCreatedAtAsc(@Param("orderId") Long orderId);

    @Query("SELECT oe FROM OrderEvent oe WHERE oe.order.id = :orderId ORDER BY oe.createdAt DESC")
    List<OrderEvent> findByOrderIdOrderByCreatedAtDesc(@Param("orderId") Long orderId);
}
