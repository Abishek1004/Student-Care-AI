package com.mentalhealth.service;

import com.mentalhealth.dto.PredictRequest;
import com.mentalhealth.dto.PredictResponse;
import com.mentalhealth.entity.TestResult;
import com.mentalhealth.entity.User;
import com.mentalhealth.repository.TestResultRepository;
import com.mentalhealth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PredictionService {

    private final UserRepository userRepository;
    private final TestResultRepository testResultRepository;
    private final SuggestionService suggestionService;

    @Value("${app.ml.model-url:}")
    private String mlModelUrl;

    // ─── Main predict method ──────────────────────────────────────────────────

    @Transactional
    public PredictResponse predict(PredictRequest req) {

        // 1. Validate user exists
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + req.getUserId()));

        // 2. Get risk level & score (real ML or mock)
        Map<String, Object> mlResult = callMlModel(req);
        String riskLevel = (String) mlResult.get("riskLevel");
        int score = (int) mlResult.get("score");

        // 3. Generate suggestions
        List<String> suggestions = suggestionService.getSuggestions(
                riskLevel,
                req.getAcademicStress(),
                req.getSleepHours(),
                req.getScreenTimeHours(),
                req.getExercisePerWeek(),
                req.getFeelsLonely(),
                req.getOverthinking()
        );

        // 4. Persist result
        TestResult result = mapToEntity(req, user, riskLevel, score);
        TestResult saved = testResultRepository.save(result);

        log.info("Prediction saved | userId={} riskLevel={} score={}", user.getId(), riskLevel, score);

        return new PredictResponse(riskLevel, score, suggestions, saved.getId());
    }

    // ─── ML integration ───────────────────────────────────────────────────────

    /**
     * Calls the external Python/FastAPI ML model if a URL is configured,
     * otherwise falls back to the built-in scoring algorithm.
     */
    private Map<String, Object> callMlModel(PredictRequest req) {
        if (mlModelUrl != null && !mlModelUrl.isBlank()) {
            try {
                return callExternalMlModel(req);
            } catch (Exception ex) {
                log.warn("ML model unavailable ({}). Falling back to built-in scorer.", ex.getMessage());
            }
        }
        return builtInScorer(req);
    }

    /**
     * HTTP call to an external ML service.
     * Expected response: { "risk_level": "High", "score": 78 }
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> callExternalMlModel(PredictRequest req) {
        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> payload = new HashMap<>();
        payload.put("age", req.getAge());
        payload.put("gender", req.getGender());
        payload.put("sleep_hours", req.getSleepHours());
        payload.put("screen_time_hours", req.getScreenTimeHours());
        payload.put("social_media_hours", req.getSocialMediaHours());
        payload.put("gaming_hours", req.getGamingHours());
        payload.put("study_hours_per_day", req.getStudyHoursPerDay());
        payload.put("play_time_hours_per_day", req.getPlayTimeHoursPerDay());
        payload.put("exercise_per_week", req.getExercisePerWeek());
        payload.put("academic_stress", req.getAcademicStress());
        payload.put("social_support", req.getSocialSupport());
        payload.put("concentration_problem", req.getConcentrationProblem());
        payload.put("feels_lonely", req.getFeelsLonely());
        payload.put("feels_hopeless", req.getFeelsHopeless());
        payload.put("overthinking", req.getOverthinking());
        payload.put("time_waste", req.getTimeWaste());
        payload.put("distraction_level", req.getDistractionLevel());
        payload.put("drug_usage", req.isDrugUsage());
        payload.put("food_addiction", req.isFoodAddiction());
        payload.put("hypertension", req.isHypertension());

        Map<String, Object> response = restTemplate.postForObject(mlModelUrl, payload, Map.class);

        if (response == null) throw new RuntimeException("Empty response from ML model");

        String riskLevel = normalizeRiskLevel((String) response.get("risk_level"));
        int score = ((Number) response.get("score")).intValue();

        return Map.of("riskLevel", riskLevel, "score", score);
    }

    // ─── Built-in scoring algorithm (mock / fallback) ─────────────────────────

    /**
     * Weighted scoring algorithm used when no external ML model is available.
     *
     * Each factor contributes a weighted penalty to the base score (100 = worst health).
     * Final score is clamped 0–100 and risk level is derived from thresholds.
     *
     * Weight rationale:
     *   - Academic stress, hopelessness, overthinking  → highest impact
     *   - Sleep deficit, drug/hypertension flags       → high impact
     *   - Screen time excess, loneliness               → medium impact
     *   - Exercise deficit                             → moderate impact
     */
    private Map<String, Object> builtInScorer(PredictRequest req) {
        double score = 0;

        // ── Stress & emotional state (max ~40 pts) ──
        score += req.getAcademicStress()    * 2.0;   // 0–20
        score += req.getFeelsHopeless()     * 2.0;   // 0–20
        score += req.getOverthinking()      * 1.5;   // 0–15
        score += req.getConcentrationProblem() * 1.0; // 0–10
        score += req.getFeelsLonely()       * 1.0;   // 0–10
        score += req.getTimeWaste()         * 0.5;   // 0–5
        score += req.getDistractionLevel()  * 0.5;   // 0–5

        // ── Sleep deficit penalty ──
        if (req.getSleepHours() < 6) score += 10;
        else if (req.getSleepHours() < 7) score += 5;

        // ── Excessive screen/social media time ──
        if (req.getScreenTimeHours() > 8)      score += 8;
        else if (req.getScreenTimeHours() > 6) score += 4;

        if (req.getSocialMediaHours() > 4)     score += 5;
        if (req.getGamingHours() > 4)          score += 4;

        // ── Social support (protective factor — subtract) ──
        score -= req.getSocialSupport() * 1.0;       // 0–10

        // ── Exercise (protective) ──
        if (req.getExercisePerWeek() >= 4) score -= 8;
        else if (req.getExercisePerWeek() >= 2) score -= 4;

        // ── Boolean risk flags ──
        if (req.isDrugUsage())      score += 15;
        if (req.isFoodAddiction())  score += 5;
        if (req.isHypertension())   score += 8;

        // Clamp to 0–100
        int finalScore = (int) Math.min(100, Math.max(0, score));

        String riskLevel;
        if (finalScore >= 60)      riskLevel = "High";
        else if (finalScore >= 35) riskLevel = "Medium";
        else                       riskLevel = "Low";

        log.debug("Built-in scorer → score={} riskLevel={}", finalScore, riskLevel);
        return Map.of("riskLevel", riskLevel, "score", finalScore);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String normalizeRiskLevel(String raw) {
        if (raw == null) return "Low";
        return switch (raw.toLowerCase()) {
            case "high"   -> "High";
            case "medium" -> "Medium";
            default       -> "Low";
        };
    }

    private TestResult mapToEntity(PredictRequest req, User user,
                                   String riskLevel, int score) {
        return TestResult.builder()
                .user(user)
                .age(req.getAge())
                .gender(req.getGender())
                .sleepHours(req.getSleepHours())
                .screenTimeHours(req.getScreenTimeHours())
                .socialMediaHours(req.getSocialMediaHours())
                .gamingHours(req.getGamingHours())
                .studyHoursPerDay(req.getStudyHoursPerDay())
                .playTimeHoursPerDay(req.getPlayTimeHoursPerDay())
                .exercisePerWeek(req.getExercisePerWeek())
                .academicStress(req.getAcademicStress())
                .socialSupport(req.getSocialSupport())
                .concentrationProblem(req.getConcentrationProblem())
                .feelsLonely(req.getFeelsLonely())
                .feelsHopeless(req.getFeelsHopeless())
                .overthinking(req.getOverthinking())
                .timeWaste(req.getTimeWaste())
                .distractionLevel(req.getDistractionLevel())
                .drugUsage(req.isDrugUsage())
                .foodAddiction(req.isFoodAddiction())
                .hypertension(req.isHypertension())
                .riskLevel(riskLevel)
                .score(score)
                .build();
    }
}
