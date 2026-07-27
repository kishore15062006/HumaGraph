package com.example.demo.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.HealthGoal;

@Repository
public interface HealthGoalRepository extends JpaRepository<HealthGoal,Long> {
    List<HealthGoal> findByProfileIdAndStatus(Long profileId,HealthGoal.GoalStatus status);
    List<HealthGoal> findByProfileId(Long profileId);
    List<HealthGoal> findByProfileIdAndMetricIdAndStatus(Long profileId,Long metricId,HealthGoal.GoalStatus status);
    Page<HealthGoal> findGoalsByProfileId(Long profileId,Pageable pageable);
}
