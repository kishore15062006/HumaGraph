package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.HealthReading;

@Repository
public interface HealthReadingRepositoy extends JpaRepository<HealthReading,Long>{
    List<HealthReading,Long> findByProfileAndMetricIdOrderByRecordedAtDesc(Long profileId,Long metri)
}
