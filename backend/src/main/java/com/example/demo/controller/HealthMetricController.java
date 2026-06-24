package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.HealthMetric;
import com.example.demo.service.HealthMetricService;

@RestController
public class HealthMetricController {
    
    @Autowired
    private HealthMetricService healthMetricService;
    


    @GetMapping("/get")
    public List<HealthMetric> getAllMetrics(){
        return healthMetricService.getAllMetrics();
    }

    @PostMapping("/post")
    public HealthMetric addHealthMetric(@RequestBody HealthMetric healthMetric){
        return healthMetricService.addHealthMetric();
    }

}
