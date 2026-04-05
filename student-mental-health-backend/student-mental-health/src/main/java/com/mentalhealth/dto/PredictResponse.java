package com.mentalhealth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PredictResponse {
    private String riskLevel;
    private int score;
    private List<String> suggestions;
    private Long testResultId;
}
