package com.example.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name="biometric_profile")
public class BiometricProfile {
    private long id;
    private UserAccount userAccount;
    
}
