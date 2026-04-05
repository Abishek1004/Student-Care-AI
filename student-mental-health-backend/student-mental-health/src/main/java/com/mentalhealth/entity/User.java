package com.mentalhealth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Represents an application user.
 *
 * Auth strategy (dual-mode):
 *  1. OTP login  — user requests a 6-digit OTP via email, submits it, gets access.
 *  2. Password login — user sets a password during/after OTP verification.
 *                      The raw password is BCrypt-hashed (one-way) before storage.
 *                      An AES-256 encrypted copy is also kept so the plaintext can
 *                      be recovered if the user forgets it (sent to email on request).
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    // ─── OTP fields ──────────────────────────────────────────────────────────
    /** 6-digit OTP (stored as plain text, cleared after use) */
    private String otp;

    /** OTP expires after 5 minutes */
    private LocalDateTime otpExpiry;

    // ─── Password fields ─────────────────────────────────────────────────────
    /**
     * BCrypt hash of the user's password (one-way, for login verification).
     * Null until the user sets a password.
     */
    @Column(name = "password_hash")
    private String passwordHash;

    /**
     * AES-256 encrypted copy of the original plaintext password.
     * Used ONLY to send the password back to the user's email if they forget it.
     * Never exposed in any API response.
     */
    @Column(name = "password_encrypted")
    private String passwordEncrypted;

    /** True once the user has set a password via OTP verification */
    @Column(nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    @Builder.Default
    private boolean passwordSet = false;

    // ─── Timestamps ───────────────────────────────────────────────────────────
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
