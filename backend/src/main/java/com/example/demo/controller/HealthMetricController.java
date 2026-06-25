package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.HealthMetric;
import com.example.demo.service.HealthMetricService;

@RestController
@RequestMapping("/api/metrics")
public class HealthMetricController {
    
    @Autowired
    private HealthMetricService healthMetricService;
    
    @GetMapping
    public ResponseEntity<List<HealthMetric>> getAllMetrics(){
        List<HealthMetric> metrics=healthMetricService.getAllMetrics();
        return ResponseEntity.ok(metrics);
    }

}
