package com.mvecommerce.controller;

import com.mvecommerce.dto.OrderDTO;
import com.mvecommerce.dto.OrderEventDTO;
import com.mvecommerce.dto.CancelOrderRequest;
import com.mvecommerce.dto.CreateOrderRequest;
import com.mvecommerce.dto.UpdateDeliveryRequest;
import com.mvecommerce.service.OrderService;
import com.mvecommerce.service.OrderEventService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@AllArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://localhost:5174"})
public class OrderController {

    private final OrderService orderService;
    private final OrderEventService orderEventService;

    // Customer endpoints
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> createOrder(@RequestBody CreateOrderRequest request) {
        OrderDTO order = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Page<OrderDTO>> getUserOrders(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<OrderDTO> orders = orderService.getUserOrders(pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        OrderDTO order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/{id}/timeline")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderEventDTO>> getOrderTimeline(@PathVariable Long id) {
        List<OrderEventDTO> timeline = orderEventService.getOrderTimeline(id);
        return ResponseEntity.ok(timeline);
    }

    @GetMapping("/order-number/{orderNumber}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> getOrderByOrderNumber(@PathVariable String orderNumber) {
        OrderDTO order = orderService.getOrderByOrderNumber(orderNumber);
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long id,
                                            @RequestBody(required = false) CancelOrderRequest request) {
        String cancellationStage = request != null ? request.getCancellationStage() : null;
        String reason = request != null ? request.getReason() : null;
        orderService.cancelOrder(id, cancellationStage, reason);
        return ResponseEntity.noContent().build();
    }

    // Admin endpoints
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderDTO>> getAllOrders(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<OrderDTO> orders = orderService.getAllOrders(pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getOrderStats() {
        Map<String, Object> stats = orderService.getOrderStats();
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        OrderDTO order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/admin/delivery")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> updateDeliveryDetails(@PathVariable Long id,
                                                          @RequestBody UpdateDeliveryRequest request) {
        OrderDTO order = orderService.updateDeliveryDetails(
                id,
                request.getStatus(),
                request.getPaymentMethod(),
                request.getPaymentStatus(),
                request.getTransportMode(),
                request.getTransportProvider(),
                request.getTransportTrackingId(),
                request.getTransportContactNumber(),
                request.getTransportDetails()
        );
        return ResponseEntity.ok(order);
    }
}
