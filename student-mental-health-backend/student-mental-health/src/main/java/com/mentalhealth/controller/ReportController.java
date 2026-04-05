package com.mentalhealth.controller;

import com.mentalhealth.dto.ApiResponse;
import com.mentalhealth.dto.TestResultDTO;
import com.mentalhealth.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Exposes test history and detailed reports.
 *
 * GET /api/history/{userId}  → all past tests for a user (newest first)
 * GET /api/report/{id}       → full detail for one test result
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * Returns the complete test history for a user, sorted newest → oldest.
     *
     * GET /api/history/1
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<ApiResponse<List<TestResultDTO>>> getHistory(
            @PathVariable Long userId) {

        List<TestResultDTO> history = reportService.getHistory(userId);
        String msg = history.isEmpty()
                ? "No test results found for this user"
                : "Found " + history.size() + " test result(s)";

        return ResponseEntity.ok(ApiResponse.ok(msg, history));
    }

    /**
     * Returns the full detail report for a single test result.
     *
     * GET /api/report/5
     */
    @GetMapping("/report/{id}")
    public ResponseEntity<ApiResponse<TestResultDTO>> getReport(
            @PathVariable Long id) {

        TestResultDTO report = reportService.getReport(id);
        return ResponseEntity.ok(ApiResponse.ok("Report fetched successfully", report));
    }
}
