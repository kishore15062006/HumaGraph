package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.HealthGoalService;

@RestController
@RequestMapping("/api/goals")
public class HealthGoalController {

    @Autowired
    private final HealthGoalService goalService

    
}
