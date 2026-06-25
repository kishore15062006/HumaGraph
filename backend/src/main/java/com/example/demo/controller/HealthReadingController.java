package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.HealthReadingService;

@RestController
public class HealthReadingController {
    
    @Autowired
    private HealthReadingService healthReadingService;

    @GetMapping("/")

}
