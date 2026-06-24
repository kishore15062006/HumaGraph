package com.example.demo.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name ="health_reading")
public class HealthReading {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id",nullable = false)
    private BiometricProfile profile;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "metric_id",nullable = false)
    private HealthMetric metric;
    @Column(nullable = false)
    private LocalDateTime recordedAt;
    @Column(nullable = false)
    private double numericValue;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReadingSource source;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReadingStatus status;
    
}
