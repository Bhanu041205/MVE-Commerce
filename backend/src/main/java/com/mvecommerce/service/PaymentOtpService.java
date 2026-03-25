package com.mvecommerce.service;

import com.mvecommerce.entity.PaymentOtp;
import com.mvecommerce.exception.BadRequestException;
import com.mvecommerce.exception.UnauthorizedException;
import com.mvecommerce.repository.PaymentOtpRepository;
import com.mvecommerce.security.SecurityUtil;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@AllArgsConstructor
@Transactional
@Slf4j
public class PaymentOtpService {

    private final PaymentOtpRepository paymentOtpRepository;
    private final SecurityUtil securityUtil;
    private final SmsService smsService;

    private static final int OTP_VALIDITY_MINUTES = 5;
    private static final int OTP_LENGTH = 6;

    /**
     * Generate and send OTP to mobile number for payment verification
     */
    public String sendPaymentOtp(String mobileNumber, String paymentMethod) {
        Long userId = getCurrentUserIdOrThrow();
        String normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);
        String normalizedMobileNumber = normalizeMobileNumber(mobileNumber);

        // Validate mobile number
        if (normalizedMobileNumber == null || !normalizedMobileNumber.matches("\\d{10}")) {
            throw new BadRequestException("Invalid mobile number format. Please enter a 10-digit number.");
        }

        // Invalidate previous pending OTPs for same user/mobile/method so only latest OTP is active.
        List<PaymentOtp> pendingOtps = paymentOtpRepository
            .findByUserIdAndMobileNumberAndPaymentMethodAndVerifiedFalse(userId, normalizedMobileNumber, normalizedPaymentMethod);
        pendingOtps.forEach(previousOtp -> previousOtp.setVerified(true));
        if (!pendingOtps.isEmpty()) {
            paymentOtpRepository.saveAll(pendingOtps);
        }

        // Generate OTP
        String otp = generateOtp();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES);

        // Save OTP to database
        PaymentOtp paymentOtp = PaymentOtp.builder()
            .userId(userId)
                .mobileNumber(normalizedMobileNumber)
                .otp(otp)
                .paymentMethod(normalizedPaymentMethod)
                .expiryTime(expiryTime)
                .verified(false)
                .build();

        paymentOtpRepository.save(paymentOtp);

        // Send SMS (with fallback to console logging for demo)
        try {
            smsService.sendSms(normalizedMobileNumber, buildOtpMessage(otp));
            log.info("OTP sent successfully to {}", maskMobileNumber(normalizedMobileNumber));
            log.info("PAYMENT_OTP_DEBUG -> {} (User: {}, Method: {})", otp, userId, normalizedPaymentMethod);
        } catch (Exception e) {
            log.warn("SMS service failed, OTP saved but not sent: {}", e.getMessage());
            // In production, you might want to throw here or retry
            // For now, we'll allow demo mode where OTP is only in DB
        }

        return otp;
    }

    /**
     * Verify OTP for payment
     */
    public boolean verifyPaymentOtp(String mobileNumber, String paymentMethod, String inputOtp) {
        Long userId = getCurrentUserIdOrThrow();
        String normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);
        String normalizedMobileNumber = normalizeMobileNumber(mobileNumber);

        log.debug("Attempting OTP verification: user={}, mobile={}, method={}, otp={}", 
            userId, maskMobileNumber(normalizedMobileNumber), normalizedPaymentMethod, inputOtp);

        PaymentOtp paymentOtp = paymentOtpRepository
            .findTopByUserIdAndMobileNumberAndPaymentMethodAndVerifiedFalseOrderByCreatedAtDesc(
                userId, normalizedMobileNumber, normalizedPaymentMethod)
                .orElseThrow(() -> {
                    log.warn("OTP not found for user {} with mobile {} and method {}", userId, maskMobileNumber(normalizedMobileNumber), normalizedPaymentMethod);
                    return new BadRequestException("No active OTP found for this payment method. Please request a new OTP.");
                });

        if (paymentOtp.isExpired()) {
            log.warn("OTP expired for user {}", userId);
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        if (!paymentOtp.isValid(inputOtp)) {
            log.warn("Invalid OTP attempt for user {}", userId);
            throw new BadRequestException("Invalid OTP. Please enter the correct OTP.");
        }

        // Mark as verified
        paymentOtp.setVerified(true);
        paymentOtpRepository.save(paymentOtp);

        log.info("Payment OTP verified successfully for user {} with method {}", userId, normalizedPaymentMethod);
        return true;
    }

    /**
     * Check if OTP is verified for a given mobile and payment method
     */
    public boolean isOtpVerified(String mobileNumber, String paymentMethod) {
        Long userId = getCurrentUserIdOrThrow();
        String normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);
        String normalizedMobileNumber = normalizeMobileNumber(mobileNumber);

        return paymentOtpRepository
            .findTopByUserIdAndMobileNumberAndPaymentMethodOrderByCreatedAtDesc(
                userId, normalizedMobileNumber, normalizedPaymentMethod)
                .map(otp -> otp.getVerified() && !otp.isExpired())
                .orElse(false);
    }

    /**
     * Normalize mobile number by removing spaces, dashes, and other non-digit characters
     */
    private String normalizeMobileNumber(String mobileNumber) {
        if (mobileNumber == null) {
            return null;
        }
        // Remove all non-digit characters
        return mobileNumber.replaceAll("\\D", "");
    }

    /**
     * Generate a random OTP
     */
    private String generateOtp() {
        Random random = new Random();
        int min = (int) Math.pow(10, OTP_LENGTH - 1);
        int maxExclusive = (int) Math.pow(10, OTP_LENGTH);
        int otp = min + random.nextInt(maxExclusive - min);
        return String.valueOf(otp);
    }

    private Long getCurrentUserIdOrThrow() {
        Long userId = securityUtil.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        return userId;
    }

    private String normalizePaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
            throw new BadRequestException("Payment method is required");
        }
        return paymentMethod.trim().toUpperCase();
    }

    /**
     * Build OTP message for SMS
     */
    private String buildOtpMessage(String otp) {
        return "Your MVE Commerce payment verification OTP is: " + otp + ". Valid for 5 minutes. Do not share this OTP with anyone.";
    }

    /**
     * Mask mobile number for logging
     */
    private String maskMobileNumber(String mobileNumber) {
        if (mobileNumber == null || mobileNumber.length() < 4) {
            return "***";
        }
        return "****" + mobileNumber.substring(mobileNumber.length() - 4);
    }
}
