package com.mvecommerce.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * SMS Service for sending OTPs and notifications
 * Currently logs to console, can be extended to integrate with providers like Twilio, AWS SNS, etc.
 */
@Service
@Slf4j
public class SmsService {

    /**
     * Send SMS to a mobile number
     * In production, integrate with actual SMS providers (Twilio, AWS SNS, etc.)
     */
    public void sendSms(String mobileNumber, String message) {
        try {
            // For now, log to console
            // In production, use Twilio, AWS SNS, or other SMS providers
            log.info("SMS to {}: {}", mobileNumber, message);

            // TODO: Integrate with actual SMS provider
            // Example (with Twilio):
            // Twilio.init(ACCOUNT_SID, AUTH_TOKEN);
            // Message.creator(new PhoneNumber("+1234567890"), new PhoneNumber(mobileNumber), message)
            //     .create();

            // For demonstration, we'll just log
            System.out.println("=== SMS SENT (DEMO) ===");
            System.out.println("To: " + mobileNumber);
            System.out.println("Message: " + message);
            System.out.println("========================");
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", mobileNumber, e.getMessage());
            throw new RuntimeException("SMS sending failed: " + e.getMessage());
        }
    }
}
