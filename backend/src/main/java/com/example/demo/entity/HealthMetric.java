package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="health_metric")
public class HealthMetric {

    public enum MetricCategory {
        CARDIO,
        METABOLIC,
        FITNESS,
        SLEEP
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @Column(unique = true,nullable = false)
    private String name;
    @Column(nullable = false)
    private String unit;
    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private MetricCategory category;
    @Column(nullable = false)
    private boolean isSystemStandard=true;
    
    public HealthMetric(long id, String name, String unit, MetricCategory category, boolean isSystemStandard) {
        this.id = id;
        this.name = name;
        this.unit = unit;
        this.category = category;
        this.isSystemStandard = isSystemStandard;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public MetricCategory getCategory() {
        return category;
    }

    public void setCategory(MetricCategory category) {
        this.category = category;
    }

    public boolean isSystemStandard() {
        return isSystemStandard;
    }

    public void setSystemStandard(boolean isSystemStandard) {
        this.isSystemStandard = isSystemStandard;
    }
    
}
