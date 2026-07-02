package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.ReadingResponseDto;
import com.example.demo.entity.BiometricProfile;
import java.time.LocalDate;
import java.util.TreeMap;

import com.example.demo.dto.DailySummaryDto;
import com.example.demo.dto.ReadingRequestDto;
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
    private final HealthGoalService goalService;
    private final PractitionerGrantRepository grantRepository;

    public HealthReadingService(
            HealthReadingRepository readingRepository,
            BiometricProfileRepository profileRepository,
            HealthMetricRepository metricRepository,
            PractitionerGrantRepository grantRepository,
            HealthGoalService goalService) {
        this.goalService = goalService;
        this.metricRepository = metricRepository;
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

    @Transactional(rollbackFor = Exception.class)
    public ReadingResponseDto logReading(Long userId,
            ReadingRequestDto dto) {

        BiometricProfile profile = profileRepository
                .findByUserAccountId(userId)
                .orElseThrow(() -> new BusinessValidationException("Profile not found"));

        HealthMetric metric = metricRepository
                .findById(dto.getMetricId())
                .orElseThrow(() -> new BusinessValidationException("Metric not found"));

        HealthReading reading = new HealthReading();

        reading.setProfile(profile);
        reading.setMetric(metric);
        reading.setNumericValue(dto.getNumericValue());
        reading.setRecordedAt(dto.getRecordedAt());
        reading.setSource(dto.getSource());

        HealthReading.ReadingStatus status = HealthReading.ReadingStatus.NORMAL;

        if ("Heart Rate".equalsIgnoreCase(metric.getName())) {

            if (dto.getNumericValue() > 300) {
                throw new BusinessValidationException(
                        "Heart Rate cannot exceed 300 bpm");
            }

            if (dto.getNumericValue() < 40 ||
                    dto.getNumericValue() > 120) {

                status = HealthReading.ReadingStatus.OUT_OF_BOUNDS;
            }
        }

        reading.setStatus(status);

        reading = readingRepository.save(reading);

        goalService.evaluateGoalsAgainstNewReading(
                profile.getId(),
                metric.getId(),
                reading.getNumericValue());

        return mapToDto(reading);
    }

    @Transactional(rollbackFor = Exception.class)
    public ReadingResponseDto updateReading(Long userId,
            Long readingId,
            ReadingRequestDto dto) {

        HealthReading reading = readingRepository.findById(readingId)
                .orElseThrow(() -> new BusinessValidationException("Reading not found"));

        if (reading.getProfile().getUserAccount().getId() != userId) {
            throw new BusinessValidationException("Unauthorized action");
        }

        reading.setNumericValue(dto.getNumericValue());
        reading.setRecordedAt(dto.getRecordedAt());
        reading.setSource(dto.getSource());

        HealthReading.ReadingStatus status = HealthReading.ReadingStatus.NORMAL;

        if ("Heart Rate".equalsIgnoreCase(reading.getMetric().getName())) {

            if (dto.getNumericValue() > 300) {
                throw new BusinessValidationException(
                        "Heart Rate cannot exceed 300 bpm");
            }

            if (dto.getNumericValue() < 40 ||
                    dto.getNumericValue() > 120) {

                status = HealthReading.ReadingStatus.OUT_OF_BOUNDS;
            }
        }

        reading.setStatus(status);

        reading = readingRepository.save(reading);

        goalService.evaluateGoalsAgainstNewReading(
                reading.getProfile().getId(),
                reading.getMetric().getId(),
                reading.getNumericValue());

        return mapToDto(reading);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteReading(Long userId,
            Long readingId) {

        HealthReading reading = readingRepository.findById(readingId)
                .orElseThrow(() -> new BusinessValidationException("Reading not found"));

        if (reading.getProfile().getUserAccount().getId() != userId) {
            throw new BusinessValidationException("Unauthorized action");
        }

        readingRepository.delete(reading);
    }

}