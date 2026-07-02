package com.example.demo.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.DailySummaryDto;
import com.example.demo.dto.ReadingRequestDto;
import com.example.demo.dto.ReadingResponseDto;
import com.example.demo.entity.BiometricProfile;
import com.example.demo.entity.HealthMetric;
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
    private final HealthMetricRepository metricRepository;
    private final PractitionerGrantRepository grantRepository;
    private final HealthGoalService goalService;

    public HealthReadingService(
            HealthReadingRepository readingRepository,
            BiometricProfileRepository profileRepository,
            HealthMetricRepository metricRepository,
            PractitionerGrantRepository grantRepository,
            HealthGoalService goalService) {

        this.readingRepository = readingRepository;
        this.profileRepository = profileRepository;
        this.metricRepository = metricRepository;
        this.grantRepository = grantRepository;
        this.goalService = goalService;
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


}