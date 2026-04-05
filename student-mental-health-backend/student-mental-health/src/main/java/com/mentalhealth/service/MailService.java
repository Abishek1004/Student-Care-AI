package com.mentalhealth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // ─── OTP email ────────────────────────────────────────────────────────────

    public void sendOtpEmail(String toEmail, String otp, String userName) {
        send(toEmail,
             "🧠 Student Mental Health Analyzer — Your OTP",
             buildOtpBody(userName, otp));
        log.info("OTP email sent to {}", toEmail);
    }

    // ─── Password-changed notification ───────────────────────────────────────

    public void sendPasswordChangedEmail(String toEmail, String userName) {
        send(toEmail,
             "🔐 Your password has been changed",
             buildPasswordChangedBody(userName));
        log.info("Password-changed email sent to {}", toEmail);
    }

    // ─── Forgot-password recovery ─────────────────────────────────────────────

    /**
     * Sends the user's original password (decrypted from AES store) to their email.
     * This is only possible because we keep an encrypted copy for recovery purposes.
     */
    public void sendForgotPasswordEmail(String toEmail, String userName, String password) {
        send(toEmail,
             "🔑 Your password recovery — Student Mental Health Analyzer",
             buildForgotPasswordBody(userName, password));
        log.info("Forgot-password recovery email sent to {}", toEmail);
    }

    // ─── Shared sender ────────────────────────────────────────────────────────

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
        } catch (Exception ex) {
            log.error("Failed to send email to {}: {}", to, ex.getMessage());
            throw new RuntimeException("Could not send email. Please try again later.");
        }
    }

    // ─── Email body builders ──────────────────────────────────────────────────

    private String buildOtpBody(String name, String otp) {
        return """
                Hi %s,

                Your One-Time Password (OTP) for the Student Mental Health Analyzer is:

                ╔══════════════╗
                ║   %s   ║
                ╚══════════════╝

                This OTP is valid for 5 minutes. Do NOT share it with anyone.

                If you did not request this, please ignore this email.

                — Student Mental Health Analyzer Team
                """.formatted(name, otp);
    }

    private String buildPasswordChangedBody(String name) {
        return """
                Hi %s,

                Your password for the Student Mental Health Analyzer has been changed successfully.

                If you did NOT make this change, please contact support immediately
                or use "Forgot Password" to reset it.

                — Student Mental Health Analyzer Team
                """.formatted(name);
    }

    private String buildForgotPasswordBody(String name, String password) {
        return """
                Hi %s,

                You requested your password for the Student Mental Health Analyzer.

                Your current password is:

                ╔══════════════════════════════════╗
                ║  %s
                ╚══════════════════════════════════╝

                For your security, please log in and change your password immediately.

                If you did not request this, please contact support right away.

                — Student Mental Health Analyzer Team
                """.formatted(name, password);
    }
}

