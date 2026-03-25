package com.mvecommerce.service;

import com.mvecommerce.dto.AddSupportMessageRequest;
import com.mvecommerce.dto.CreateSupportConversationRequest;
import com.mvecommerce.dto.SupportConversationDTO;
import com.mvecommerce.dto.SupportMessageDTO;
import com.mvecommerce.entity.SupportConversation;
import com.mvecommerce.entity.SupportMessage;
import com.mvecommerce.entity.User;
import com.mvecommerce.exception.BadRequestException;
import com.mvecommerce.exception.ResourceNotFoundException;
import com.mvecommerce.repository.SupportConversationRepository;
import com.mvecommerce.repository.SupportMessageRepository;
import com.mvecommerce.repository.UserRepository;
import com.mvecommerce.security.SecurityUtil;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
@Transactional
public class SupportService {

    private final SupportConversationRepository conversationRepository;
    private final SupportMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;

    public SupportConversationDTO createConversation(CreateSupportConversationRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!StringUtils.hasText(request.getSubject())) {
            throw new BadRequestException("Subject is required");
        }

        SupportConversation conversation = SupportConversation.builder()
                .user(user)
                .subject(request.getSubject().trim())
                .status(SupportConversation.Status.OPEN)
                .build();

        SupportConversation saved = conversationRepository.save(conversation);
        return SupportConversationDTO.fromEntity(saved);
    }

    public SupportMessageDTO addMessage(Long conversationId, AddSupportMessageRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SupportConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        // Verify user owns this conversation
        if (!conversation.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to this conversation");
        }

        if (!StringUtils.hasText(request.getMessage())) {
            throw new BadRequestException("Message cannot be empty");
        }

        SupportMessage message = SupportMessage.builder()
                .conversation(conversation)
                .senderType(SupportMessage.SenderType.CUSTOMER)
                .sender(user)
                .message(request.getMessage().trim())
                .build();

        SupportMessage saved = messageRepository.save(message);
        
        // Update conversation updatedAt
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return SupportMessageDTO.fromEntity(saved);
    }

    public SupportConversationDTO getConversation(Long conversationId) {
        Long userId = securityUtil.getCurrentUserId();
        
        SupportConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        // Verify user owns this conversation
        if (!conversation.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to this conversation");
        }

        return SupportConversationDTO.fromEntityWithMessages(conversation);
    }

    public List<SupportConversationDTO> getUserConversations() {
        Long userId = securityUtil.getCurrentUserId();
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(SupportConversationDTO::fromEntity)
                .toList();
    }

    public SupportConversationDTO closeConversation(Long conversationId) {
        Long userId = securityUtil.getCurrentUserId();
        
        SupportConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        // Verify user owns this conversation
        if (!conversation.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to this conversation");
        }

        conversation.setStatus(SupportConversation.Status.CLOSED);
        conversation.setUpdatedAt(LocalDateTime.now());
        SupportConversation updated = conversationRepository.save(conversation);

        return SupportConversationDTO.fromEntity(updated);
    }

    public List<SupportConversationDTO> getAllConversations() {
        // Admin only
        return conversationRepository.findAllOrderByUpdatedAtDesc()
                .stream()
                .map(SupportConversationDTO::fromEntity)
                .toList();
    }

    public List<SupportConversationDTO> getOpenConversations() {
        // Admin only
        return conversationRepository.findOpenConversations()
                .stream()
                .map(SupportConversationDTO::fromEntity)
                .toList();
    }

    public SupportConversationDTO resolveConversation(Long conversationId) {
        // Admin only
        SupportConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        conversation.setStatus(SupportConversation.Status.RESOLVED);
        conversation.setUpdatedAt(LocalDateTime.now());
        SupportConversation updated = conversationRepository.save(conversation);

        return SupportConversationDTO.fromEntity(updated);
    }

    public SupportMessageDTO adminReply(Long conversationId, AddSupportMessageRequest request) {
        Long adminId = securityUtil.getCurrentUserId();
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        SupportConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!StringUtils.hasText(request.getMessage())) {
            throw new BadRequestException("Message cannot be empty");
        }

        // Change status to IN_PROGRESS if still OPEN
        if (conversation.getStatus() == SupportConversation.Status.OPEN) {
            conversation.setStatus(SupportConversation.Status.IN_PROGRESS);
        }

        SupportMessage message = SupportMessage.builder()
                .conversation(conversation)
                .senderType(SupportMessage.SenderType.ADMIN)
                .sender(admin)
                .message(request.getMessage().trim())
                .build();

        SupportMessage saved = messageRepository.save(message);
        
        // Update conversation updatedAt
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return SupportMessageDTO.fromEntity(saved);
    }
}
