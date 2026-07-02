package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.dto.ReadingResponseDto;
import com.example.demo.entity.HealthReading;

@Repository
public interface HealthReadingRepository extends JpaRepository<HealthReading,Long>{
    List<HealthReading> findByProfileIdAndMetricIdOrderByRecordedAtDesc(Long profileId,Long metricId);
    List<HealthReading> findByProfileIdAndStatus(Long profileId,HealthReading.ReadingStatus status);
    List<HealthReading> findByProfileIdOrderByRecordedAtDesc(Long profileId);
    List<ReadingResponseDto> findByUserAccountId(Long userId);
    List<ReadingResponseDto> getReadingsForPractitioner(Long practitionerId, Long patientProfileId);
    
}
