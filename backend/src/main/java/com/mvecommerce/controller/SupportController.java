package com.mvecommerce.controller;

import com.mvecommerce.dto.AddSupportMessageRequest;
import com.mvecommerce.dto.CreateSupportConversationRequest;
import com.mvecommerce.dto.SupportConversationDTO;
import com.mvecommerce.dto.SupportMessageDTO;
import com.mvecommerce.service.SupportService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/support")
@AllArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://localhost:5174"})
public class SupportController {

    private final SupportService supportService;

    // Customer endpoints
    @PostMapping("/conversations")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<SupportConversationDTO> createConversation(
            @RequestBody CreateSupportConversationRequest request) {
        SupportConversationDTO conversation = supportService.createConversation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(conversation);
    }

    @GetMapping("/conversations")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<SupportConversationDTO>> getUserConversations() {
        List<SupportConversationDTO> conversations = supportService.getUserConversations();
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/conversations/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<SupportConversationDTO> getConversation(@PathVariable Long id) {
        SupportConversationDTO conversation = supportService.getConversation(id);
        return ResponseEntity.ok(conversation);
    }

    @PostMapping("/conversations/{id}/messages")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<SupportMessageDTO> addMessage(
            @PathVariable Long id,
            @RequestBody AddSupportMessageRequest request) {
        SupportMessageDTO message = supportService.addMessage(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    @PatchMapping("/conversations/{id}/close")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<SupportConversationDTO> closeConversation(@PathVariable Long id) {
        SupportConversationDTO conversation = supportService.closeConversation(id);
        return ResponseEntity.ok(conversation);
    }

    // Admin endpoints
    @GetMapping("/admin/conversations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SupportConversationDTO>> getAllConversations() {
        List<SupportConversationDTO> conversations = supportService.getAllConversations();
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/admin/conversations/open")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SupportConversationDTO>> getOpenConversations() {
        List<SupportConversationDTO> conversations = supportService.getOpenConversations();
        return ResponseEntity.ok(conversations);
    }

    @PatchMapping("/admin/conversations/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SupportConversationDTO> resolveConversation(@PathVariable Long id) {
        SupportConversationDTO conversation = supportService.resolveConversation(id);
        return ResponseEntity.ok(conversation);
    }

    @PostMapping("/admin/conversations/{id}/reply")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SupportMessageDTO> adminReply(
            @PathVariable Long id,
            @RequestBody AddSupportMessageRequest request) {
        SupportMessageDTO message = supportService.adminReply(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }
}
