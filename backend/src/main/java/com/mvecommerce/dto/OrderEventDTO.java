package com.mvecommerce.dto;

import com.mvecommerce.entity.OrderEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderEventDTO {
    private Long id;
    private String eventType;
    private String displayName;
    private String status;
    private String details;
    private LocalDateTime createdAt;

    public static OrderEventDTO fromEntity(OrderEvent event) {
        return OrderEventDTO.builder()
                .id(event.getId())
                .eventType(event.getEventType().name())
                .displayName(event.getEventType().getDisplayName())
                .status(event.getStatus().name())
                .details(event.getDetails())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
