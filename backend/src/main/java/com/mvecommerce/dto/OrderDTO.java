package com.mvecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    private Long id;
    private String orderNumber;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal shippingAmount;
    private String notes;
    private String userName;
    private String userEmail;
    private LocalDateTime createdAt;
    private LocalDateTime estimatedDeliveryDate;
    private LocalDateTime deliveredAt;
    private AddressDTO shippingAddress;
    private List<OrderItemDTO> items;
}
