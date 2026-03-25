package com.mvecommerce.repository;

import com.mvecommerce.entity.SupportMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportMessageRepository extends JpaRepository<SupportMessage, Long> {
    @Query("SELECT sm FROM SupportMessage sm WHERE sm.conversation.id = :conversationId ORDER BY sm.createdAt ASC")
    List<SupportMessage> findByConversationIdOrderByCreatedAtAsc(@Param("conversationId") Long conversationId);
}
