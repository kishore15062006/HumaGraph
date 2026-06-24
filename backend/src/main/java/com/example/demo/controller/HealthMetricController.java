package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.HealthMetricService;

@RestController
public class HealthMetricController {
    
    @Autowired
    private HealthMetricService healthMetricService;

    @GetMapping("/get")
    public 

}
