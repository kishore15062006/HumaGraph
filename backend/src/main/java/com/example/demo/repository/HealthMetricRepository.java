package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.HealthMetric;

@Repository
public interface HealthMetricRepository extends JpaRepository<HealthMetric,Long>{
    Optional<HealthMetric> findByName(String name);
}
