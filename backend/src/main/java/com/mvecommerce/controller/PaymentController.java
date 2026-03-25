package com.mvecommerce.controller;

import com.mvecommerce.dto.PaymentOtpResponse;
import com.mvecommerce.dto.SendPaymentOtpRequest;
import com.mvecommerce.dto.VerifyPaymentOtpRequest;
import com.mvecommerce.service.PaymentOtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class PaymentController {

    private final PaymentOtpService paymentOtpService;

        @Value("${app.payment.expose-debug-otp:true}")
        private boolean exposeDebugOtp;

    /**
     * Send OTP to mobile number for payment verification
     * POST /payment/send-otp
     */
    @PostMapping("/send-otp")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentOtpResponse> sendPaymentOtp(
            @RequestBody SendPaymentOtpRequest request) {
        String otp = paymentOtpService.sendPaymentOtp(request.getMobileNumber(), request.getPaymentMethod());
        PaymentOtpResponse response = PaymentOtpResponse.builder()
                .message("OTP sent successfully to your registered mobile number")
                .verified(false)
                .debugOtp(exposeDebugOtp ? otp : null)
                .build();
        return ResponseEntity.ok(response);
    }

    /**
     * Verify OTP for payment
     * POST /payment/verify-otp
     */
    @PostMapping("/verify-otp")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentOtpResponse> verifyPaymentOtp(
            @RequestBody VerifyPaymentOtpRequest request) {
        paymentOtpService.verifyPaymentOtp(
                request.getMobileNumber(),
                request.getPaymentMethod(),
                request.getOtp()
        );
        PaymentOtpResponse response = PaymentOtpResponse.builder()
                .message("OTP verified successfully")
                .verified(true)
                .build();
        return ResponseEntity.ok(response);
    }

    /**
     * Check if OTP is verified for a given mobile and payment method
     * GET /payment/verify-status
     */
    @GetMapping("/verify-status")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentOtpResponse> checkVerificationStatus(
            @RequestParam String mobileNumber,
            @RequestParam String paymentMethod) {
        boolean verified = paymentOtpService.isOtpVerified(mobileNumber, paymentMethod);
        PaymentOtpResponse response = PaymentOtpResponse.builder()
                .message(verified ? "OTP verified" : "OTP not verified")
                .verified(verified)
                .build();
        return ResponseEntity.ok(response);
    }
}
