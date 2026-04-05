package com.mentalhealth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Used by POST /auth/verify-otp
 *
 * After registration, the user submits their OTP to verify email.
 * If a password was provided during registration it was already stored;
 * the OTP just activates the account.
 *
 * For passwordless OTP-only logins, password fields may be omitted.
 */
@Data
public class VerifyOtpWithPasswordRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "OTP is required")
    private String otp;
}
