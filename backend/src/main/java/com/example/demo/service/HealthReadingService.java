package com.example.demo.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.DailySummaryDto;
import com.example.demo.dto.ReadingRequestDto;
import com.example.demo.dto.ReadingResponseDto;
import com.example.demo.entity.BiometricProfile;
import com.example.demo.entity.HealthMetric;
import com.example.demo.entity.PractitionerGrant;
import com.example.demo.entity.HealthReading.ReadingStatus;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.repository.BiometricProfileRepository;
import com.example.demo.repository.HealthReadingRepository;
import com.example.demo.repository.PractitionerGrantRepository;

@Service
public class HealthReadingService {
    
    @Autowired
    private HealthReadingRepository readingRepo;
    private BiometricProfileRepository profileRepo;
    private PractitionerGrantRepository grantRepo;

    @Transactional
    public List<ReadingResponseDto> getReadingsByUser(Long userId) {

        BiometricProfile profile = profileRepo
                .findByUserAccountId(userId)
                .orElseThrow(() ->
                        new BusinessValidationException("Profile not found"));

        return getReadingsByProfileId(profile.getId());
    }

    @Transactional
    public List<ReadingResponseDto> getReadingsByProfileId(Long profileId) {

        return readingRepo
                .findByProfileIdOrderByRecordedAtDesc(profileId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional
    public List<ReadingResponseDto> getReadingsForPractitioner(
            Long practitionerId,
            Long patientProfileId) {

        PractitionerGrant grant = grantRepo
                .findByPractitionerAccountIdAndPatientProfileId(
                        practitionerId,
                        patientProfileId)
                .orElseThrow(() ->
                        new BusinessValidationException(
                                "No active care grant found"));

        if (grant.getStatus() !=PractitionerGrant.ACTIVE) {
            throw new BusinessValidationException(
                    "Care grant is not ACTIVE");
        }

        return getReadingsByProfileId(patientProfileId);
    }

    @Transactional(rollbackOn = Exception.class)
    public ReadingResponseDto logReading(
            Long userId,
            ReadingRequestDto dto) {

        BiometricProfile profile = profileRepo
                .findByUserAccountId(userId)
                .orElseThrow(() ->
                        new BusinessValidationException(
                                "Profile not found"));

        HealthMetric metric = metricRepository
                .findById(dto.getMetricId())
                .orElseThrow(() ->
                        new BusinessValidationException(
                                "Metric not found"));

        ReadingStatus status =
                determineReadingStatus(metric, dto.getNumericValue());

        Reading reading = new Reading();
        reading.setProfile(profile);
        reading.setMetric(metric);
        reading.setNumericValue(dto.getNumericValue());
        reading.setRecordedAt(dto.getRecordedAt());
        reading.setStatus(status);

        Reading saved = readingRepository.save(reading);

        goalService.evaluateGoalsAgainstNewReading(saved);

        return mapToDto(saved);
    }

    @Transactional
    public ReadingResponseDto updateReading(
            Long userId,
            Long readingId,
            ReadingRequestDto dto) {

        Reading reading = readingRepository
                .findById(readingId)
                .orElseThrow(() ->
                        new BusinessValidationException(
                                "Reading not found"));

        validateOwnership(userId, reading);

        reading.setNumericValue(dto.getNumericValue());
        reading.setRecordedAt(dto.getRecordedAt());

        ReadingStatus status =
                determineReadingStatus(
                        reading.getMetric(),
                        dto.getNumericValue());

        reading.setStatus(status);

        Reading updated = readingRepository.save(reading);

        return mapToDto(updated);
    }

    @Transactional
    public void deleteReading(
            Long userId,
            Long readingId) {

        Reading reading = readingRepository
                .findById(readingId)
                .orElseThrow(() ->
                        new BusinessValidationException(
                                "Reading not found"));

        validateOwnership(userId, reading);

        readingRepository.delete(reading);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<ReadingResponseDto> getTrends(Long userId) {
        return getReadingsByUser(userId);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<DailySummaryDto> getDailySummary(Long userId) {

        BiometricProfile profile = profileRepository
                .findByUserAccountId(userId)
                .orElseThrow(() ->
                        new BusinessValidationException(
                                "Profile not found"));

        List<Reading> readings =
                readingRepository.findByProfileIdOrderByRecordedAtDesc(
                        profile.getId());

        Map<LocalDate, Double> groupedData =
                readings.stream()
                        .filter(r ->
                                "Heart Rate".equalsIgnoreCase(
                                        r.getMetric().getName()))
                        .collect(Collectors.groupingBy(
                                r -> r.getRecordedAt().toLocalDate(),
                                TreeMap::new,
                                Collectors.averagingDouble(
                                        Reading::getNumericValue)));

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("MMM dd");

        return groupedData.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .limit(7)
                .map(entry ->
                        new DailySummaryDto(
                                entry.getKey().format(formatter),
                                entry.getValue()))
                .toList();
    }

    private void validateOwnership(
            Long userId,
            Reading reading) {

        if (!reading.getProfile()
                .getUserAccount()
                .getId()
                .equals(userId)) {

            throw new BusinessValidationException(
                    "Unauthorized action");
        }
    }

    private ReadingStatus determineReadingStatus(
            HealthMetric metric,
            Double value) {

        ReadingStatus status = ReadingStatus.NORMAL;

        if ("Heart Rate".equalsIgnoreCase(metric.getName())) {

            if (value > 300) {
                throw new BusinessValidationException(
                        "Heart rate cannot exceed 300");
            }

            if (value < 40 || value > 120) {
                status = ReadingStatus.OUT_OF_BOUNDS;
            }
        }

        return status;
    }

    private ReadingResponseDto mapToDto(Reading reading) {

        ReadingResponseDto dto = new ReadingResponseDto();

        dto.setId(reading.getId());
        dto.setProfileId(reading.getProfile().getId());
        dto.setMetricId(reading.getMetric().getId());
        dto.setMetricName(reading.getMetric().getName());
        dto.setNumericValue(reading.getNumericValue());
        dto.setRecordedAt(reading.getRecordedAt());
        dto.setStatus(reading.getStatus());

        return dto;
    }



}
