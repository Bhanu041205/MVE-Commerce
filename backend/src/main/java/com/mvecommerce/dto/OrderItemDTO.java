package com.mvecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDTO {
    private Long id;
    private ProductDTO product;
    private Integer quantity;
    private BigDecimal priceAtPurchase;
    private BigDecimal discountApplied;
}
