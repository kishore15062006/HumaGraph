package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.ReadingResponseDto;
import com.example.demo.entity.BiometricProfile;

import com.example.demo.entity.HealthReading;
import com.example.demo.entity.PractitionerGrant;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.repository.BiometricProfileRepository;
import com.example.demo.repository.HealthMetricRepository;
import com.example.demo.repository.HealthReadingRepository;
import com.example.demo.repository.PractitionerGrantRepository;

@Service
public class HealthReadingService {

    private final HealthReadingRepository readingRepository;
    private final BiometricProfileRepository profileRepository;
    
    private final PractitionerGrantRepository grantRepository;
    

    public HealthReadingService(
            HealthReadingRepository readingRepository,
            BiometricProfileRepository profileRepository,
            HealthMetricRepository metricRepository,
            PractitionerGrantRepository grantRepository,
            HealthGoalService goalService) {

        this.readingRepository = readingRepository;
        this.profileRepository = profileRepository;
        this.grantRepository = grantRepository;
    }

    @Transactional(readOnly = true)
    public List<ReadingResponseDto> getReadingsByUser(Long userId) {

        BiometricProfile profile = profileRepository
                .findByUserAccountId(userId)
                .orElseThrow(() -> new BusinessValidationException("Profile not found"));

        return getReadingsByProfileId(profile.getId());

    }

    @Transactional(readOnly = true)
    public List<ReadingResponseDto> getReadingsForPractitioner(
            Long practitionerId,
            Long patientProfileId) {

        PractitionerGrant grant = grantRepository
                .findByPractitionerAccountIdAndPatientProfileId(
                        practitionerId,
                        patientProfileId)
                .orElseThrow(() -> new BusinessValidationException(
                        "Access denied"));

        if (grant.getStatus() != PractitionerGrant.GrantStatus.ACTIVE) {

            throw new BusinessValidationException(
                    "Grant is not ACTIVE");

        }

        return getReadingsByProfileId(patientProfileId);
    }

    @Transactional(readOnly = true)
    public List<ReadingResponseDto> getReadingsByProfileId(Long profileId) {

        return readingRepository
                .findByProfileIdOrderByRecordedAtDesc(profileId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

    }

    private ReadingResponseDto mapToDto(
            HealthReading reading) {

        ReadingResponseDto dto = new ReadingResponseDto();

        dto.setId(reading.getId());

        dto.setMetricName(
                reading.getMetric().getName());

        dto.setUnit(
                reading.getMetric().getUnit());

        dto.setNumericValue(
                reading.getNumericValue());

        dto.setRecordedAt(
                reading.getRecordedAt());

        dto.setStatus(
                reading.getStatus().name());

        dto.setSource(
                reading.getSource().name());

        return dto;

    }

}