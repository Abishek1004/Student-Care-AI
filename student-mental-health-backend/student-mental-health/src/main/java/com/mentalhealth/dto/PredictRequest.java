package com.mentalhealth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PredictRequest {

    @NotNull(message = "userId is required")
    private Long userId;

    // ─── Demographics ─────────────────────────────────────
    private int age;
    private String gender;

    // ─── Lifestyle ────────────────────────────────────────
    private double sleepHours;
    private double screenTimeHours;
    private double socialMediaHours;
    private double gamingHours;
    private double studyHoursPerDay;
    private double playTimeHoursPerDay;
    private int exercisePerWeek;

    // ─── Mental-health indicators (scale 1–10) ────────────
    private int academicStress;
    private int socialSupport;
    private int concentrationProblem;
    private int feelsLonely;
    private int feelsHopeless;
    private int overthinking;
    private int timeWaste;
    private int distractionLevel;

    // ─── Boolean flags ────────────────────────────────────
    private boolean drugUsage;
    private boolean foodAddiction;
    private boolean hypertension;
}
