package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.dto.GoalResponseDto;
import com.example.demo.entity.HealthGoal;

@Repository
public interface HealthGoalRepository extends JpaRepository<HealthGoal,Long> {
    // List<HealthGoal> findByProfileIdAndStatus(Long profileId,HealthGoal.GoalStatus status);
    // List<HealthGoal> findByProfileId(Long profileId);
    // List<HealthGoal> findByProfileIdAndMetricIdAndStatus(Long profileId,Long metricId,HealthGoal.GoalStatus status);
    // List<GoalResponseDto> getGoalsByUser(long id);
}
