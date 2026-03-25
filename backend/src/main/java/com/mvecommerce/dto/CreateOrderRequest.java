package com.mvecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    private Long shippingAddressId;
    private List<OrderItemData> items;
    private String notes;
    private String paymentMethod;
    private String paymentDetails;
    private String transportMode;
    private String transportDetails;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemData {
        private Long productId;
        private Integer quantity;
        private BigDecimal priceAtPurchase;
    }
}
