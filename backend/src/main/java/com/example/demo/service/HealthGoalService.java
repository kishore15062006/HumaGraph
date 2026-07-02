package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.GoalResponseDto;
import com.example.demo.entity.HealthReading;
import com.example.demo.repository.HealthGoalRepository;

@Service
public class HealthGoalService {

    @Autowired
    private HealthGoalRepository goalRepository;

    public List<GoalResponseDto> getGoalsByUser(long id) {
        return goalRepository.getGoalsById(id);
    }

    public void evaluateGoalsAgainstNewReading(HealthReading reading) {
        
    }

}
