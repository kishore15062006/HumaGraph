package com.example.demo.dto;

import java.time.LocalDateTime;

import com.example.demo.entity.HealthReading;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ReadingRequestDto {
    private Long metricId;
    private double numericValue;
    private LocalDateTime recordedAt;
    private HealthReading.ReadingSource source;
}
