package com.example.demo.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.HealthReading;

@Repository
public interface HealthReadingRepositoy extends JpaRepository<HealthReading,Long>{
    List<HealthReading> findByProfileAndMetricIdOrderByRecordedAtDesc(Long profileId,Long metricId);
    List<HealthReading> findByProfileAndStatus(Long profileId,ReadingStatus status);
}
