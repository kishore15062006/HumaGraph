package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ReadingResponseDto;
import com.example.demo.service.HealthReadingService;

@RestController
@RequestMapping("/api")
public class HealthReadingController {
    
    @Autowired
    private HealthReadingService healthReadingService;

    @GetMapping("/readings")
    public List<ReadingResponseDto> getReadings(){
        return healthReadingService.getReadings();
    }

    @PostMapping("/readings")
    public ReadingResponseDto addReadings(@RequestBody ReadingResponseDto readingResponse){
        return healthReadingService.addReadings(readingResponse);
    }

}
