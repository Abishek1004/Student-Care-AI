-- ============================================================
--  Student Mental Health Analyzer — Reference Schema
--  (Spring Boot with ddl-auto=update will create this
--   automatically. Use this file for manual setup or review.)
-- ============================================================

CREATE DATABASE IF NOT EXISTS mental_health_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE mental_health_db;

-- ─── users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id                 BIGINT        NOT NULL AUTO_INCREMENT,
    name               VARCHAR(100)  NOT NULL,
    email              VARCHAR(150)  NOT NULL UNIQUE,

    -- OTP fields (cleared after use)
    otp                VARCHAR(6)    NULL,
    otp_expiry         DATETIME      NULL,

    -- Password fields
    -- password_hash      : BCrypt one-way hash  (for login verification)
    -- password_encrypted : AES-256 ciphertext   (for forgot-password email recovery)
    -- password_set       : flag — true once user has set a password
    password_hash      VARCHAR(255)  NULL,
    password_encrypted TEXT          NULL,
    password_set       TINYINT(1)    NOT NULL DEFAULT 0,

    created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── test_results ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS test_results (
    id                    BIGINT        NOT NULL AUTO_INCREMENT,
    user_id               BIGINT        NOT NULL,

    -- Demographics
    age                   INT           NOT NULL,
    gender                VARCHAR(20)   NULL,

    -- Lifestyle
    sleep_hours           DOUBLE        NOT NULL DEFAULT 0,
    screen_time_hours     DOUBLE        NOT NULL DEFAULT 0,
    social_media_hours    DOUBLE        NOT NULL DEFAULT 0,
    gaming_hours          DOUBLE        NOT NULL DEFAULT 0,
    study_hours_per_day   DOUBLE        NOT NULL DEFAULT 0,
    play_time_hours_per_day DOUBLE      NOT NULL DEFAULT 0,
    exercise_per_week     INT           NOT NULL DEFAULT 0,

    -- Mental-health indicators (1–10)
    academic_stress       INT           NOT NULL DEFAULT 0,
    social_support        INT           NOT NULL DEFAULT 0,
    concentration_problem INT           NOT NULL DEFAULT 0,
    feels_lonely          INT           NOT NULL DEFAULT 0,
    feels_hopeless        INT           NOT NULL DEFAULT 0,
    overthinking          INT           NOT NULL DEFAULT 0,
    time_waste            INT           NOT NULL DEFAULT 0,
    distraction_level     INT           NOT NULL DEFAULT 0,

    -- Boolean flags
    drug_usage            TINYINT(1)    NOT NULL DEFAULT 0,
    food_addiction        TINYINT(1)    NOT NULL DEFAULT 0,
    hypertension          TINYINT(1)    NOT NULL DEFAULT 0,

    -- ML output
    risk_level            VARCHAR(20)   NOT NULL DEFAULT 'Low',
    score                 INT           NOT NULL DEFAULT 0,

    created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_test_results_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_test_results_user_id (user_id),
    INDEX idx_test_results_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
