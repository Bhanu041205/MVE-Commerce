package com.mvecommerce.repository;

import com.mvecommerce.entity.PaymentOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentOtpRepository extends JpaRepository<PaymentOtp, Long> {
    List<PaymentOtp> findByUserIdAndMobileNumberAndPaymentMethodAndVerifiedFalse(
            Long userId, String mobileNumber, String paymentMethod);

    Optional<PaymentOtp> findTopByUserIdAndMobileNumberAndPaymentMethodAndVerifiedFalseOrderByCreatedAtDesc(
            Long userId, String mobileNumber, String paymentMethod);

    Optional<PaymentOtp> findTopByUserIdAndMobileNumberAndPaymentMethodOrderByCreatedAtDesc(
            Long userId, String mobileNumber, String paymentMethod);

    @Query("DELETE FROM PaymentOtp po WHERE po.expiryTime < :now")
    void deleteExpiredOtps(@Param("now") LocalDateTime now);
}
