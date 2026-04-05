package com.mentalhealth.repository;

import com.mentalhealth.entity.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestResultRepository extends JpaRepository<TestResult, Long> {

    /** Return all tests for a user, newest first */
    List<TestResult> findByUserIdOrderByCreatedAtDesc(Long userId);
}
