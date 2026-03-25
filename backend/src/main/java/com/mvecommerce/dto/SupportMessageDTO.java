package com.mvecommerce.dto;

import com.mvecommerce.entity.SupportMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportMessageDTO {
    private Long id;
    private Long conversationId;
    private String senderType;
    private String senderName;
    private Long senderId;
    private String message;
    private LocalDateTime createdAt;

    public static SupportMessageDTO fromEntity(SupportMessage message) {
        return SupportMessageDTO.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderType(message.getSenderType().name())
                .senderName(message.getSender() != null ? 
                        message.getSender().getFirstName() + " " + message.getSender().getLastName() : 
                        "Support Team")
                .senderId(message.getSender() != null ? message.getSender().getId() : null)
                .message(message.getMessage())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
