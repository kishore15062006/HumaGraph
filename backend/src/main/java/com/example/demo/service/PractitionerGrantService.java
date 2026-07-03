package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.GrantRequestDto;
import com.example.demo.dto.GrantResponseDto;
import com.example.demo.entity.BiometricProfile;
import com.example.demo.entity.PractitionerGrant;
import com.example.demo.entity.UserAccount;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.BiometricProfileRepository;
import com.example.demo.repository.PractitionerGrantRepository;
import com.example.demo.repository.UserAccountRepository;

@Service
public class PractitionerGrantService {

    private final PractitionerGrantRepository grantRepository;
    private final UserAccountRepository userRepository;
    private final BiometricProfileRepository profileRepository;

    public PractitionerGrantService(
            PractitionerGrantRepository grantRepository,
            UserAccountRepository userRepository,
            BiometricProfileRepository profileRepository) {

        this.grantRepository = grantRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    private GrantResponseDto mapToDto(PractitionerGrant grant) {

        GrantResponseDto dto = new GrantResponseDto();

        dto.setId(grant.getId());

        dto.setPractitionerId(
                grant.getPractitionerAccount().getId());

        dto.setPatientProfileId(
                grant.getPatientProfile().getId());

        dto.setPractitionerEmail(
                grant.getPractitionerAccount().getEmail());

        dto.setPatientName(
                grant.getPatientProfile().getFullName());

        dto.setStatus(
                grant.getStatus().name());

        dto.setGrantedAt(
                grant.getGrantedAt());

        dto.setClinicalNote(
                grant.getClinicalNote());

        return dto;
    }

    @Transactional(rollbackFor = Exception.class)
    public GrantResponseDto requestAccess(
            Long practitionerId,
            GrantRequestDto dto) {

        UserAccount practitioner = userRepository
                .findById(practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Practitioner not found"));

        UserAccount patient = userRepository
                .findByEmail(dto.getPatientEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient not found"));

        BiometricProfile profile = profileRepository
                .findByUserAccountId(patient.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient profile not found"));

        Optional<PractitionerGrant> existing = grantRepository
                .findByPractitionerAccountIdAndPatientProfileId(
                        practitionerId,
                        profile.getId());

        if (existing.isPresent()) {

            PractitionerGrant grant = existing.get();

            if (grant.getStatus() != PractitionerGrant.GrantStatus.REVOKED) {

                throw new BusinessValidationException(
                        "Grant already requested or active");
            }

            grantRepository.delete(grant);
            grantRepository.flush();
        }

        PractitionerGrant grant = new PractitionerGrant();

        grant.setPractitionerAccount(practitioner);

        grant.setPatientProfile(profile);

        grant.setStatus(
                PractitionerGrant.GrantStatus.REQUESTED);

        grant.setGrantedAt(null);

        grant.setClinicalNote(null);

        grant = grantRepository.save(grant);

        return mapToDto(grant);
    }

    @Transactional(rollbackFor = Exception.class)
    public GrantResponseDto updateGrantStatus(
            Long patientUserId,
            Long grantId,
            String newStatus) {

        PractitionerGrant grant = grantRepository
                .findById(grantId)
                .orElseThrow(() -> new ResourceNotFoundException("Grant not found"));

        BiometricProfile patientProfile = profileRepository
                .findByUserAccountId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        if (grant.getPatientProfile().getId() != patientProfile.getId()) {
            throw new BusinessValidationException("Unauthorized action");
        }

        PractitionerGrant.GrantStatus status = PractitionerGrant.GrantStatus.valueOf(newStatus.toUpperCase());

        grant.setStatus(status);

        if (status == PractitionerGrant.GrantStatus.ACTIVE) {
            grant.setGrantedAt(LocalDateTime.now());
        }

        grant = grantRepository.save(grant);

        return mapToDto(grant);
    }

    @Transactional(rollbackFor = Exception.class)
    public GrantResponseDto updateClinicalNote(
            Long practitionerId,
            Long grantId,
            String note) {

        PractitionerGrant grant = grantRepository
                .findById(grantId)
                .orElseThrow(() -> new ResourceNotFoundException("Grant not found"));

        if (grant.getPractitionerAccount().getId() != practitionerId) {
            throw new BusinessValidationException("Unauthorized action");
        }

        grant.setClinicalNote(note);

        grant = grantRepository.save(grant);

        return mapToDto(grant);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteGrant(Long userId,
            Long grantId) {

        PractitionerGrant grant = grantRepository
                .findById(grantId)
                .orElseThrow(() -> new ResourceNotFoundException("Grant not found"));

        grantRepository.delete(grant);
    }

    @Transactional(readOnly = true)
public List<GrantResponseDto> getGrants(Long userId,
                                        String role) {

    List<PractitionerGrant> grants;

    if ("PRACTITIONER".equalsIgnoreCase(role)) {

        grants = grantRepository
                .findByPractitionerAccountId(userId);

    } else {

        BiometricProfile profile = profileRepository
                .findByUserAccountId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Profile not found"));

        grants = grantRepository
                .findByPatientProfileId(profile.getId());
    }

    return grants.stream()
            .map(this::mapToDto)
            .toList();
}

@Transactional(readOnly = true)
public Page<GrantResponseDto> getGrants(
        Long userId,
        String role,
        Pageable pageable) {

    Page<PractitionerGrant> grants;

    if ("PRACTITIONER".equalsIgnoreCase(role)) {

        grants = grantRepository
                .findByPractitionerAccountId(
                        userId,
                        pageable);

    } else {

        BiometricProfile profile = profileRepository
                .findByUserAccountId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Profile not found"));

        grants = grantRepository
                .findByPatientProfileId(
                        profile.getId(),
                        pageable);
    }

    return grants.map(this::mapToDto);
}

}