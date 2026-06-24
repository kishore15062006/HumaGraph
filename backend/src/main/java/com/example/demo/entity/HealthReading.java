package com.example.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name ="health_reading")
public class HealthReading {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
}
