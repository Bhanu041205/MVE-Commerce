package com.mvecommerce.dto;

import com.mvecommerce.entity.SupportConversation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportConversationDTO {
    private Long id;
    private Long userId;
    private String subject;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<SupportMessageDTO> messages;
    private Integer messageCount;

    public static SupportConversationDTO fromEntity(SupportConversation conversation) {
        return SupportConversationDTO.builder()
                .id(conversation.getId())
                .userId(conversation.getUser().getId())
                .subject(conversation.getSubject())
                .status(conversation.getStatus().name())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .messageCount(conversation.getMessages() != null ? conversation.getMessages().size() : 0)
                .build();
    }

    public static SupportConversationDTO fromEntityWithMessages(SupportConversation conversation) {
        SupportConversationDTO dto = fromEntity(conversation);
        if (conversation.getMessages() != null) {
            dto.setMessages(conversation.getMessages().stream()
                    .map(SupportMessageDTO::fromEntity)
                    .toList());
        }
        return dto;
    }
}
