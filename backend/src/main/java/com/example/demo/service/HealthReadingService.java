package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.ReadingResponseDto;
import com.example.demo.repository.HealthReadingRepository;

@Service
public class HealthReadingService {
    
    @Autowired
    private HealthReadingRepository healthReadingRepo;

    public List<ReadingResponseDto> getReadings() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getReadings'");
    }

    public ReadingResponseDto addReadings(ReadingResponseDto readingResponse) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'addReadings'");
    }



}
