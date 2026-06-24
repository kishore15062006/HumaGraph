package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.BiometricProfile;


@Repository
public interface BiometricProfileRepository extends JpaRepository<BiometricProfile,Long>{
    Optional<BiometricProfile> findByUserAccountId(Long userId);
    
}
