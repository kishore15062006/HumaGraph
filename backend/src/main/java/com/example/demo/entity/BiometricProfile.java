package com.example.demo.entity;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name="biometric_profile")
public class BiometricProfile {
    private long id;
    private UserAccount userAccount;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodType
}
