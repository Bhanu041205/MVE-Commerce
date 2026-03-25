package com.mvecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDeliveryRequest {
    private String status;
    private String paymentMethod;
    private String paymentStatus;
    private String transportMode;
    private String transportProvider;
    private String transportTrackingId;
    private String transportContactNumber;
    private String transportDetails;
}
