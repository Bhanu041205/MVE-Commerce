package com.mvecommerce.service;

import com.mvecommerce.entity.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.Nullable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class OrderNoteNotificationService {

    private final JavaMailSender mailSender;
    private final List<String> recipients;
    private final String fromEmail;

    public OrderNoteNotificationService(
            @Nullable JavaMailSender mailSender,
            @Value("${app.order-notes.notify-recipients:}") String recipientsCsv,
            @Value("${app.order-notes.from-email:no-reply@mvecommerce.local}") String fromEmail) {
        this.mailSender = mailSender;
        this.recipients = Arrays.stream(recipientsCsv.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .collect(Collectors.toList());
        this.fromEmail = fromEmail;
    }

    public void notifyOrderNotes(Order order) {
        String notes = order.getNotes();
        if (notes == null || notes.trim().isEmpty()) {
            return;
        }

        if (mailSender == null || recipients.isEmpty()) {
            log.info("Order note recorded for order {} (no email notification configured): {}", order.getOrderNumber(), notes);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(recipients.toArray(new String[0]));
            message.setSubject("Order Note: " + order.getOrderNumber());
            message.setText(buildBody(order, notes));
            mailSender.send(message);
            log.info("Order note notification sent for order {} to {} recipient(s)", order.getOrderNumber(), recipients.size());
        } catch (Exception ex) {
            // Never fail checkout because of email issues.
            log.error("Failed to send order note notification for order {}", order.getOrderNumber(), ex);
        }
    }

    private String buildBody(Order order, String notes) {
        return "A customer added notes to an order.\n\n"
                + "Order Number: " + order.getOrderNumber() + "\n"
                + "Customer: " + order.getUser().getFirstName() + " " + order.getUser().getLastName() + "\n"
                + "Customer Email: " + order.getUser().getEmail() + "\n"
                + "Status: " + order.getStatus() + "\n\n"
                + "Notes:\n" + notes;
    }
}
