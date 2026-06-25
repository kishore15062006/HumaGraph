package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.demo.entity.HealthMetric;
import com.example.demo.repository.HealthMetricRepository;

@Service
public class HealthMetricService {

    @Autowired
    private HealthMetricRepository healthMetricRepo;

    public ResponseEntity<?> getAllMetrics(){
        return healthMetricRepo.findAll();
    }

    public HealthMetric addHealthMetric(HealthMetric healthMetric) {
        return healthMetricRepo.save(healthMetric);
    }
    
}
