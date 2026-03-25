package com.mvecommerce.repository;

import com.mvecommerce.entity.SupportConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportConversationRepository extends JpaRepository<SupportConversation, Long> {
    @Query("SELECT sc FROM SupportConversation sc WHERE sc.user.id = :userId ORDER BY sc.updatedAt DESC")
    List<SupportConversation> findByUserIdOrderByUpdatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT sc FROM SupportConversation sc ORDER BY sc.updatedAt DESC")
    List<SupportConversation> findAllOrderByUpdatedAtDesc();

    @Query("SELECT sc FROM SupportConversation sc WHERE sc.status = com.mvecommerce.entity.SupportConversation$Status.OPEN ORDER BY sc.createdAt ASC")
    List<SupportConversation> findOpenConversations();
}
