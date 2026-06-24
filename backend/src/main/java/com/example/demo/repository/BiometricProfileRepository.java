package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.BiometricProfile;

@
public interface BiometricProfileRepository extends JpaRepository<BiometricProfile,Long>{

    
}
