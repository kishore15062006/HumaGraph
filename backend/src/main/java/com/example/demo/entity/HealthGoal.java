package com.example.demo.entity;

import java.time.LocalDate;

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
@Table(name="health_goal")
public class HealthGoal {

    

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private BiometricProfile profile;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private HealthMetric metric;
    @Column(nullable = false)
    private double targetValue;
    @Column(nullable = false)
    private double currentValue=0.0;
    @Column(nullable = false)
    private LocalDate targetDate;
    @Enumerated(EnumType.STRING)
    private GoalStatus status;

    public HealthGoal(long id, BiometricProfile profile, HealthMetric metric, double targetValue, double currentValue,
            LocalDate targetDate, GoalStatus status) {
        this.id = id;
        this.profile = profile;
        this.metric = metric;
        this.targetValue = targetValue;
        this.currentValue = currentValue;
        this.targetDate = targetDate;
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

    public double getTargetValue() {
        return targetValue;
    }

    public void setTargetValue(double targetValue) {
        this.targetValue = targetValue;
    }

    public double getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(double currentValue) {
        this.currentValue = currentValue;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public GoalStatus getStatus() {
        return status;
    }

    public void setStatus(GoalStatus status) {
        this.status = status;
    }
    
}
