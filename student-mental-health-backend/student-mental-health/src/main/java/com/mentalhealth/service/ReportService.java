package com.mentalhealth.service;

import com.mentalhealth.dto.TestResultDTO;
import com.mentalhealth.entity.TestResult;
import com.mentalhealth.repository.TestResultRepository;
import com.mentalhealth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TestResultRepository testResultRepository;
    private final UserRepository userRepository;
    private final SuggestionService suggestionService;

    // ─── History ─────────────────────────────────────────────────────────────

    /**
     * Returns all test results for a user, newest first.
     */
    public List<TestResultDTO> getHistory(Long userId) {
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        return testResultRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─── Single report ────────────────────────────────────────────────────────

    /**
     * Returns the full details of a single test result.
     */
    public TestResultDTO getReport(Long id) {
        TestResult result = testResultRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test result not found with id: " + id));
        return toDTO(result);
    }

    // ─── Mapping ──────────────────────────────────────────────────────────────

    private TestResultDTO toDTO(TestResult r) {
        TestResultDTO dto = new TestResultDTO();
        dto.setId(r.getId());
        dto.setUserId(r.getUser().getId());
        dto.setUserName(r.getUser().getName());
        dto.setUserEmail(r.getUser().getEmail());

        dto.setAge(r.getAge());
        dto.setGender(r.getGender());
        dto.setSleepHours(r.getSleepHours());
        dto.setScreenTimeHours(r.getScreenTimeHours());
        dto.setSocialMediaHours(r.getSocialMediaHours());
        dto.setGamingHours(r.getGamingHours());
        dto.setStudyHoursPerDay(r.getStudyHoursPerDay());
        dto.setPlayTimeHoursPerDay(r.getPlayTimeHoursPerDay());
        dto.setExercisePerWeek(r.getExercisePerWeek());

        dto.setAcademicStress(r.getAcademicStress());
        dto.setSocialSupport(r.getSocialSupport());
        dto.setConcentrationProblem(r.getConcentrationProblem());
        dto.setFeelsLonely(r.getFeelsLonely());
        dto.setFeelsHopeless(r.getFeelsHopeless());
        dto.setOverthinking(r.getOverthinking());
        dto.setTimeWaste(r.getTimeWaste());
        dto.setDistractionLevel(r.getDistractionLevel());

        dto.setDrugUsage(r.isDrugUsage());
        dto.setFoodAddiction(r.isFoodAddiction());
        dto.setHypertension(r.isHypertension());

        dto.setRiskLevel(r.getRiskLevel());
        dto.setScore(r.getScore());
        dto.setCreatedAt(r.getCreatedAt());

        // Re-generate suggestions dynamically so reports always have them
        dto.setSuggestions(suggestionService.getSuggestions(
                r.getRiskLevel(),
                r.getAcademicStress(),
                r.getSleepHours(),
                r.getScreenTimeHours(),
                r.getExercisePerWeek(),
                r.getFeelsLonely(),
                r.getOverthinking()
        ));

        return dto;
    }
}
