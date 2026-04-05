package com.mentalhealth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Stores the result of each mental-health assessment a student takes.
 */
@Entity
@Table(name = "test_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ─── Relationship ────────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ─── Demographics ────────────────────────────────────────────────────────
    private int age;

    @Column(length = 20)
    private String gender;

    // ─── Lifestyle inputs ────────────────────────────────────────────────────
    private double sleepHours;
    private double screenTimeHours;
    private double socialMediaHours;
    private double gamingHours;
    private double studyHoursPerDay;
    private double playTimeHoursPerDay;
    private int exercisePerWeek;          // days per week

    // ─── Mental-health indicators (scale 1–10 unless boolean) ───────────────
    private int academicStress;           // 1–10
    private int socialSupport;            // 1–10
    private int concentrationProblem;     // 1–10
    private int feelsLonely;              // 1–10
    private int feelsHopeless;            // 1–10
    private int overthinking;             // 1–10
    private int timeWaste;                // 1–10
    private int distractionLevel;         // 1–10

    // ─── Boolean flags ───────────────────────────────────────────────────────
    private boolean drugUsage;
    private boolean foodAddiction;
    private boolean hypertension;

    // ─── ML output ───────────────────────────────────────────────────────────
    @Column(length = 20)
    private String riskLevel;             // "Low" | "Medium" | "High"

    private int score;                    // 0–100

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
