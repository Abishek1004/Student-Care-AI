package com.mentalhealth.controller;

import com.mentalhealth.dto.ApiResponse;
import com.mentalhealth.dto.PredictRequest;
import com.mentalhealth.dto.PredictResponse;
import com.mentalhealth.service.PredictionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Mental-health prediction endpoint.
 *
 * POST /api/predict → run the assessment and return risk level + suggestions
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;

    /**
     * Analyse student inputs, predict risk level, persist result, return suggestions.
     *
     * Example request body:
     * {
     *   "userId": 1,
     *   "age": 20, "gender": "Male",
     *   "sleepHours": 5, "screenTimeHours": 9,
     *   "socialMediaHours": 4, "gamingHours": 2,
     *   "studyHoursPerDay": 6, "playTimeHoursPerDay": 1,
     *   "exercisePerWeek": 1,
     *   "academicStress": 8, "socialSupport": 3,
     *   "concentrationProblem": 7, "feelsLonely": 6,
     *   "feelsHopeless": 5, "overthinking": 8,
     *   "timeWaste": 6, "distractionLevel": 7,
     *   "drugUsage": false, "foodAddiction": false, "hypertension": false
     * }
     */
    @PostMapping("/predict")
    public ResponseEntity<ApiResponse<PredictResponse>> predict(
            @Valid @RequestBody PredictRequest request) {

        PredictResponse response = predictionService.predict(request);
        return ResponseEntity.ok(ApiResponse.ok("Prediction completed", response));
    }
}
