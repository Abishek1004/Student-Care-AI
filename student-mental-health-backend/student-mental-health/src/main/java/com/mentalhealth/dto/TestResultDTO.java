package com.mentalhealth.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TestResultDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;

    // Demographics
    private int age;
    private String gender;

    // Lifestyle
    private double sleepHours;
    private double screenTimeHours;
    private double socialMediaHours;
    private double gamingHours;
    private double studyHoursPerDay;
    private double playTimeHoursPerDay;
    private int exercisePerWeek;

    // Mental-health indicators
    private int academicStress;
    private int socialSupport;
    private int concentrationProblem;
    private int feelsLonely;
    private int feelsHopeless;
    private int overthinking;
    private int timeWaste;
    private int distractionLevel;

    // Booleans
    private boolean drugUsage;
    private boolean foodAddiction;
    private boolean hypertension;

    // ML output
    private String riskLevel;
    private int score;
    private LocalDateTime createdAt;

    // Generated suggestions (not stored in DB; computed on read)
    private List<String> suggestions;
}
