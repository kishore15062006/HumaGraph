package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.BiometricProfile;
import com.example.demo.entity.HealthReading;
import com.example.demo.entity.PractitionerGrant;

@Repository
public interface HealthReadingRepository extends JpaRepository<HealthReading,Long>{
    List<HealthReading> findByProfileIdAndMetricIdOrderByRecordedAtDesc(Long profileId,Long metricId);
    List<HealthReading> findByProfileIdAndStatus(Long profileId,HealthReading.ReadingStatus status);
    List<HealthReading> findByProfileIdOrderByRecordedAtDesc(Long profileId);
    Optional<PractitionerGrant> findByPractitionerAccountIdAndPatientProfileId(
        Long practitionerId,
        Long patientProfileId);

    Optional<BiometricProfile> findByUserAccountId(Long userId);
}
