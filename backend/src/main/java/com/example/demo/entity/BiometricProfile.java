package com.example.demo.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name="biometric_profile")
public class BiometricProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @JoinColumn(name="user_account_id")
    private UserAccount userAccount;
    @Column(nullable = false)
    private String fullName;
    @Column(nullable = false)
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodType;
}
