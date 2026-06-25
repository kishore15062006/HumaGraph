package com.example.demo.controller;

import java.nio.file.attribute.UserPrincipal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.GoalResponseDto;
import com.example.demo.service.HealthGoalService;

@RestController
@RequestMapping("/api/goals")
public class HealthGoalController {

    @Autowired
    private HealthGoalService goalService;

    // @GetMapping
    // public ResponseEntity<List<GoalResponseDto>> getGoals(@AuthenticationPrincipal UserPrincipal user){

    //     List<GoalResponseDto> goals=goalService.getGoalsByUser(user.getId());

    //     return ResponseEntity.ok(goals);
    // }
    
}
