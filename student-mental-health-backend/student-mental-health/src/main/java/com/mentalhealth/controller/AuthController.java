package com.mentalhealth.controller;

import com.mentalhealth.dto.*;
import com.mentalhealth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication endpoints.
 *
 *  POST /auth/register          → new user signup with password + OTP email verification
 *  POST /auth/send-otp          → request OTP (for OTP-only login or re-verification)
 *  POST /auth/verify-otp        → submit OTP to verify email / complete OTP login
 *  POST /auth/login             → email + password login
 *  POST /auth/change-password   → change password (requires current password)
 *  POST /auth/forgot-password   → recover password via email (AES decrypt + send)
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ─── 1. Register ─────────────────────────────────────────────────────────

    /**
     * Register a new user with name, email, and password.
     * An OTP is sent to the email for verification.
     *
     * Body: { "name": "Riya Sharma", "email": "riya@example.com", "password": "MyPass@123" }
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(
            @Valid @RequestBody RegisterRequest request) {

        String message = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok(message, null));
    }

    // ─── 2. Send OTP (for OTP-only login) ────────────────────────────────────

    /**
     * Request an OTP for email-only login (no password required).
     *
     * Body: { "email": "riya@example.com" }
     *   or for new users: { "email": "riya@example.com", "name": "Riya" }
     */
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<String>> sendOtp(
            @Valid @RequestBody SendOtpRequest request) {

        String message = authService.sendOtp(request);
        return ResponseEntity.ok(ApiResponse.ok(message, null));
    }

    // ─── 3. Verify OTP ───────────────────────────────────────────────────────

    /**
     * Submit the OTP received by email.
     * Activates the account (after registration) or completes OTP-only login.
     *
     * Body: { "email": "riya@example.com", "otp": "483921" }
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        AuthResponse auth = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.ok("OTP verified successfully", auth));
    }

    // ─── 4. Password login ───────────────────────────────────────────────────

    /**
     * Standard email + password login.
     *
     * Body: { "email": "riya@example.com", "password": "MyPass@123" }
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse auth = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", auth));
    }

    // ─── 5. Change password ──────────────────────────────────────────────────

    /**
     * Change the current password (user must know their existing password).
     *
     * Body: { "userId": 1, "currentPassword": "OldPass@123", "newPassword": "NewPass@456" }
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {

        String message = authService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.ok(message, null));
    }

    // ─── 6. Forgot password ──────────────────────────────────────────────────

    /**
     * Sends the user's original password to their registered email address.
     * Works because an AES-256 encrypted copy is stored alongside the BCrypt hash.
     *
     * Query param: ?email=riya@example.com
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @RequestParam String email) {

        String message = authService.forgotPassword(email);
        return ResponseEntity.ok(ApiResponse.ok(message, null));
    }
}

