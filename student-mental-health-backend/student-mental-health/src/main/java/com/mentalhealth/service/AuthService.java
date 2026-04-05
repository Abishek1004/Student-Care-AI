package com.mentalhealth.service;

import com.mentalhealth.dto.*;
import com.mentalhealth.entity.User;
import com.mentalhealth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

/**
 * Handles all authentication flows:
 *
 *  1. REGISTER  (POST /auth/register)
 *     - Accepts name, email, password
 *     - BCrypt-hashes the password, AES-256-encrypts it, saves both
 *     - Generates OTP and emails it for email verification
 *
 *  2. VERIFY OTP  (POST /auth/verify-otp)
 *     - Validates OTP + expiry
 *     - Marks account as verified / active
 *     - Returns user info on success
 *
 *  3. OTP-ONLY LOGIN  (POST /auth/send-otp  →  POST /auth/verify-otp)
 *     - Existing users can still log in with just OTP (no password required)
 *
 *  4. PASSWORD LOGIN  (POST /auth/login)
 *     - Email + password login using BCrypt.matches()
 *
 *  5. CHANGE PASSWORD  (POST /auth/change-password)
 *     - Verifies current password, then stores new BCrypt hash + new AES cipher
 *
 *  6. FORGOT PASSWORD  (POST /auth/forgot-password)
 *     - Decrypts the stored AES ciphertext and emails the original password back
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository  userRepository;
    private final MailService     mailService;
    private final PasswordEncoder passwordEncoder;   // BCrypt (strength 12)
    private final EncryptionService encryptionService; // AES-256

    @Value("${app.otp.expiry-minutes:5}")
    private int otpExpiryMinutes;

    private final SecureRandom secureRandom = new SecureRandom();

    // ═══════════════════════════════════════════════════════════════════════════
    //  1. REGISTER  — new user, sets a password, receives OTP to verify email
    // ═══════════════════════════════════════════════════════════════════════════

    @Transactional
    public String register(RegisterRequest request) {
        String email = normalise(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException(
                "An account with this email already exists. Please log in.");
        }

        // ── Hash + encrypt the password ──────────────────────────────────────
        String bcryptHash      = passwordEncoder.encode(request.getPassword());
        String aesEncrypted    = encryptionService.encrypt(request.getPassword());

        // ── Persist user ─────────────────────────────────────────────────────
        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .passwordHash(bcryptHash)
                .passwordEncrypted(aesEncrypted)
                .passwordSet(true)
                .build();
        userRepository.save(user);

        // ── Send verification OTP ─────────────────────────────────────────────
        issueOtp(user);
        log.info("New user registered: {} — OTP sent for email verification", email);

        return "Registration successful! An OTP has been sent to " + email
               + ". Please verify your email to activate your account.";
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  2 & 3. SEND OTP — for both new registrations and OTP-only logins
    // ═══════════════════════════════════════════════════════════════════════════

    @Transactional
    public String sendOtp(SendOtpRequest request) {
        String email = normalise(request.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    // Auto-register without password if a name is supplied
                    if (request.getName() == null || request.getName().isBlank()) {
                        throw new RuntimeException(
                            "No account found. Please register first or provide your name.");
                    }
                    User newUser = User.builder()
                            .name(request.getName().trim())
                            .email(email)
                            .passwordSet(false)
                            .build();
                    return userRepository.save(newUser);
                });

        issueOtp(user);
        log.info("OTP sent to {} (expires in {} min)", email, otpExpiryMinutes);
        return "OTP sent successfully to " + email;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  VERIFY OTP — activates account / completes OTP login
    // ═══════════════════════════════════════════════════════════════════════════

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        String email = normalise(request.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException(
                    "No account found for email: " + email));

        validateOtp(user, request.getOtp());

        // Clear OTP — one-time use
        clearOtp(user);
        userRepository.save(user);

        log.info("OTP verified for {}", email);
        return buildAuthResponse(user, "OTP verified successfully! Welcome, " + user.getName());
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  4. PASSWORD LOGIN
    // ═══════════════════════════════════════════════════════════════════════════

    public AuthResponse login(LoginRequest request) {
        String email = normalise(request.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException(
                    "Invalid email or password."));          // don't reveal which field

        if (!user.isPasswordSet() || user.getPasswordHash() == null) {
            throw new RuntimeException(
                "No password set for this account. Please log in with OTP.");
        }

        // BCrypt comparison — constant-time, safe against timing attacks
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password.");
        }

        log.info("User {} logged in with password", email);
        return buildAuthResponse(user, "Login successful! Welcome back, " + user.getName());
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  5. CHANGE PASSWORD
    // ═══════════════════════════════════════════════════════════════════════════

    @Transactional
    public String changePassword(ChangePasswordRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found."));

        // Verify current password
        if (!user.isPasswordSet() || user.getPasswordHash() == null) {
            throw new RuntimeException(
                "No password set yet. Please set a password first via OTP verification.");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect.");
        }

        // Store new password (BCrypt hash + AES encrypted copy)
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordEncrypted(encryptionService.encrypt(request.getNewPassword()));
        userRepository.save(user);

        // Notify user by email
        mailService.sendPasswordChangedEmail(user.getEmail(), user.getName());

        log.info("Password changed for user {}", user.getEmail());
        return "Password changed successfully.";
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  6. FORGOT PASSWORD — decrypt stored AES cipher, email it back
    // ═══════════════════════════════════════════════════════════════════════════

    public String forgotPassword(String email) {
        String normalised = normalise(email);

        User user = userRepository.findByEmail(normalised)
                .orElseThrow(() -> new RuntimeException(
                    "No account found for email: " + normalised));

        if (!user.isPasswordSet() || user.getPasswordEncrypted() == null) {
            throw new RuntimeException(
                "No password set for this account. Please log in with OTP.");
        }

        // Decrypt the stored AES ciphertext to recover the original password
        String originalPassword = encryptionService.decrypt(user.getPasswordEncrypted());

        // Email it to the registered address
        mailService.sendForgotPasswordEmail(normalised, user.getName(), originalPassword);

        log.info("Forgot-password email sent to {}", normalised);
        return "Your password has been sent to your registered email address.";
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  Private helpers
    // ═══════════════════════════════════════════════════════════════════════════

    /** Generates a 6-digit OTP, saves it with expiry, and emails it. */
    private void issueOtp(User user) {
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        userRepository.save(user);
        mailService.sendOtpEmail(user.getEmail(), otp, user.getName());
    }

    /** Validates OTP value and expiry, throws descriptive errors on failure. */
    private void validateOtp(User user, String submittedOtp) {
        if (user.getOtp() == null || user.getOtpExpiry() == null) {
            throw new RuntimeException(
                "No OTP was requested for this account. Please request a new OTP.");
        }
        if (LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            clearOtp(user);
            userRepository.save(user);
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }
        if (!user.getOtp().equals(submittedOtp.trim())) {
            throw new RuntimeException("Invalid OTP. Please try again.");
        }
    }

    private void clearOtp(User user) {
        user.setOtp(null);
        user.setOtpExpiry(null);
    }

    private AuthResponse buildAuthResponse(User user, String message) {
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), message);
    }

    private String normalise(String email) {
        return email.toLowerCase().trim();
    }
}

