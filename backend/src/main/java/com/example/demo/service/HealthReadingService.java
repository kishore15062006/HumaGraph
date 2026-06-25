package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.repository.HealthReadingRepository;

@Service
public class HealthReadingService {
    
    @Autowired
    private HealthReadingRepository healthReadingRepo;

    

}
