package com.mentalhealth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Used by POST /auth/change-password
 * Allows a logged-in user to change their password.
 */
@Data
public class ChangePasswordRequest {

    private Long userId;

    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "New password must be at least 8 characters")
    private String newPassword;
}
