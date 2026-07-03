package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.PractitionerGrant;

public interface PractitionerGrantRepository extends JpaRepository<PractitionerGrant, Long> {

    List<PractitionerGrant> findByPractitionerAccountId(Long practitionerId);

    List<PractitionerGrant> findByPatientProfileId(Long profileId);

    Optional<PractitionerGrant> findByPractitionerAccountIdAndPatientProfileId(Long practitionerId,Long profileId);

    Page<PractitionerGrant> findByPractitionerAccountId(Long practitionerId,Pageable pageable);

    Page<PractitionerGrant> findByPatientProfileId(Long profileId,Pageable pageable);
}