package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.PractitionerGrant;

@Repository
public interface PractitionerGrantRepository extends JpaRepository<PractitionerGrant,Long>{
    List<PractitionerGrant> findByPractitionerAccountId(Long practitionerId);
    List<PractitionerGrant> findByPatientProfileId(Long profileId);
    Optional<PractitionerGrant> findByPractitionerAccountIdAndPatientProfileId(Long practitionerId,Long profileId);
    

}
