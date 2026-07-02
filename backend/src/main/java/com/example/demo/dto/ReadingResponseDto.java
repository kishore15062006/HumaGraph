package com.example.demo.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ReadingResponseDto {
    private Long id;
    private String metricName;
    private String unit;
    private double numericValue;
    private LocalDateTime recordedAt;
    private String status;
    private String source;
}
