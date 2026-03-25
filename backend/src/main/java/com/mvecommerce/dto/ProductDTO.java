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
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String imageUrl;
    private String images;
    private BigDecimal discount;
    private Long categoryId;
    private String categoryName;
    private Boolean isActive;
    private BigDecimal rating;
    private Integer reviewCount;
    private Integer bookingCount;
}
