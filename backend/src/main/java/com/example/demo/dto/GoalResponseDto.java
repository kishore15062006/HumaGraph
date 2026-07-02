package com.example.demo.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class GoalResponseDto {
    Long id
String metricName
Double targetValue
    Double currentValue;
LocalDate targetDate;
String status;
}
