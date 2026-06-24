package com.example.demo.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name="health_goal")
public class HealthGoal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @ManyToOne
    private BiometricProfile profile;
    @ManyToOne
    private HealthMetric metric;
    @Column(nullable = false)
    private double targetValue;
    @Column(nullable = false)
    private double currentValue=0.0;
    @Column(nullable = false)
    private LocalDate targetDate;
    @Enumerated(EnumType.STRING)
    private GoalStatus status;
}
