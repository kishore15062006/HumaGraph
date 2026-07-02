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

    public enum ReadingSource {
        MANUAL,
        DEVICE
    }

    public enum ReadingStatus {
        NORMAL,
        OUT_OF_BOUNDS
    }

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

    public HealthReading(){}

    public HealthReading(long id, BiometricProfile profile, HealthMetric metric, LocalDateTime recordedAt,
            double numericValue, ReadingSource source, ReadingStatus status) {
        this.id = id;
        this.profile = profile;
        this.metric = metric;
        this.recordedAt = recordedAt;
        this.numericValue = numericValue;
        this.source = source;
        this.status = status;
    }
    public BiometricProfile getProfile() {
        return profile;
    }
    public void setProfile(BiometricProfile profile) {
        this.profile = profile;
    }
    public HealthMetric getMetric() {
        return metric;
    }
    public void setMetric(HealthMetric metric) {
        this.metric = metric;
    }
    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }
    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
    public double getNumericValue() {
        return numericValue;
    }
    public void setNumericValue(double numericValue) {
        this.numericValue = numericValue;
    }
    public ReadingSource getSource() {
        return source;
    }
    public void setSource(ReadingSource source) {
        this.source = source;
    }
    public ReadingStatus getStatus() {
        return status;
    }
    public void setStatus(ReadingStatus status) {
        this.status = status;
    }

    public long getId() {
        return id;
    }
    
}
