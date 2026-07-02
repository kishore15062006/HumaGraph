package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.GoalRequestDto;
import com.example.demo.dto.GoalResponseDto;
import com.example.demo.dto.GoalSummaryDto;
import com.example.demo.entity.BiometricProfile;
import com.example.demo.entity.HealthGoal;
import com.example.demo.entity.HealthMetric;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.BiometricProfileRepository;
import com.example.demo.repository.HealthGoalRepository;
import com.example.demo.repository.HealthMetricRepository;

@Service
public class HealthGoalService {

    private final HealthGoalRepository goalRepository;
    private final BiometricProfileRepository profileRepository;
    private final HealthMetricRepository metricRepository;

    public HealthGoalService(
            HealthGoalRepository goalRepository,
            BiometricProfileRepository profileRepository,
            HealthMetricRepository metricRepository) {

        this.goalRepository = goalRepository;
        this.profileRepository = profileRepository;
        this.metricRepository = metricRepository;
    }

    @Transactional(readOnly = true)
    public List<GoalResponseDto> getGoalsByUser(Long userId) {

        BiometricProfile profile = profileRepository
                .findByUserAccountId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        return goalRepository.findByProfileId(profile.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private GoalResponseDto mapToDto(HealthGoal goal) {

        GoalResponseDto dto = new GoalResponseDto();

        dto.setId(goal.getId());
        dto.setMetricName(goal.getMetric().getName());
        dto.setTargetValue(goal.getTargetValue());
        dto.setCurrentValue(goal.getCurrentValue());
        dto.setTargetDate(goal.getTargetDate());
        dto.setStatus(goal.getStatus().name());

        return dto;
    }

    @Transactional(readOnly = true)
    public GoalSummaryDto getGoalSummary(Long userId) {

        BiometricProfile profile = profileRepository
                .findByUserAccountId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        List<HealthGoal> goals = goalRepository.findByProfileId(profile.getId());

        GoalSummaryDto dto = new GoalSummaryDto();

        if (goals.isEmpty()) {
            dto.setTotalGoals(0);
            dto.setAchievedGoals(0);
            dto.setAverageProgress(0.0);
            return dto;
        }

        int achieved = 0;
        double totalProgress = 0;

        for (HealthGoal goal : goals) {

            if (goal.getStatus() == HealthGoal.GoalStatus.ACHIEVED) {
                achieved++;
            }

            double progress = goal.getCurrentValue() / goal.getTargetValue();

            if (progress > 1.0) {
                progress = 1.0;
            }

            totalProgress += progress;
        }

        dto.setTotalGoals(goals.size());
        dto.setAchievedGoals(achieved);
        dto.setAverageProgress(totalProgress / goals.size());

        return dto;
    }

    @Transactional(rollbackFor = Exception.class)
    public GoalResponseDto createGoal(Long userId,
            GoalRequestDto dto) {

        BiometricProfile profile = profileRepository
                .findByUserAccountId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        HealthMetric metric = metricRepository
                .findById(dto.getMetricId())
                .orElseThrow(() -> new ResourceNotFoundException("Metric not found"));

        HealthGoal goal = new HealthGoal();

        goal.setProfile(profile);
        goal.setMetric(metric);
        goal.setTargetValue(dto.getTargetValue());
        goal.setCurrentValue(0.0);
        goal.setTargetDate(dto.getTargetDate());
        goal.setStatus(HealthGoal.GoalStatus.IN_PROGRESS);

        goal = goalRepository.save(goal);

        return mapToDto(goal);
    }

    @Transactional(rollbackFor = Exception.class)
    public GoalResponseDto updateGoal(Long userId,
            Long goalId,
            GoalRequestDto dto) {

        HealthGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (goal.getProfile().getUserAccount().getId() != userId) {
            throw new BusinessValidationException("Unauthorized action");
        }

        goal.setTargetValue(dto.getTargetValue());
        goal.setTargetDate(dto.getTargetDate());

        goal = goalRepository.save(goal);

        return mapToDto(goal);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteGoal(Long userId,
            Long goalId) {

        HealthGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (goal.getProfile().getUserAccount().getId() != userId) {
            throw new BusinessValidationException("Unauthorized action");
        }

        goalRepository.delete(goal);
    }

    @Transactional(rollbackFor = Exception.class)
    public void evaluateGoalsAgainstNewReading(Long profileId,
            Long metricId,
            Double newValue) {

        List<HealthGoal> goals = goalRepository.findByProfileIdAndMetricIdAndStatus(
                profileId,
                metricId,
                HealthGoal.GoalStatus.IN_PROGRESS);

        for (HealthGoal goal : goals) {

            goal.setCurrentValue(newValue);

            if (newValue >= goal.getTargetValue()) {
                goal.setStatus(HealthGoal.GoalStatus.ACHIEVED);
            }

            goalRepository.save(goal);
        }
    }

}