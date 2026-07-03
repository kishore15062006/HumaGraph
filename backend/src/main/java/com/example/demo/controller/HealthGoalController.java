package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.GoalRequestDto;
import com.example.demo.dto.GoalResponseDto;
import com.example.demo.dto.GoalSummaryDto;
import com.example.demo.entity.UserAccount;
import com.example.demo.service.HealthGoalService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class HealthGoalController {

    private final HealthGoalService goalService;

    @GetMapping
    public ResponseEntity<?> getGoals(
            @AuthenticationPrincipal UserAccount user) {

        List<GoalResponseDto> goals =
                goalService.getGoalsByUser(user.getId());

        return ResponseEntity.ok(goals);
    }

    @PostMapping
    public ResponseEntity<?> createGoal(
            @AuthenticationPrincipal UserAccount user,
            @RequestBody GoalRequestDto dto) {

        GoalResponseDto response =
                goalService.createGoal(user.getId(), dto);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/progress")
    public ResponseEntity<?> getGoalProgress(
            @AuthenticationPrincipal UserAccount user) {

        GoalSummaryDto summary =
                goalService.getGoalSummary(user.getId());

        return ResponseEntity.ok(summary);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGoal(
            @AuthenticationPrincipal UserAccount user,
            @PathVariable Long id,
            @RequestBody GoalRequestDto dto) {

        GoalResponseDto response =
                goalService.updateGoal(user.getId(), id, dto);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(
            @AuthenticationPrincipal UserAccount user,
            @PathVariable Long id) {

        goalService.deleteGoal(user.getId(), id);

        return ResponseEntity.ok().build();
    }

}