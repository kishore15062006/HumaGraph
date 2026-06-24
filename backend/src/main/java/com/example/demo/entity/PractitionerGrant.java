package com.example.demo.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name="practitioner_grant")
public class PractitionerGrant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @ManyToOne
    private UserAccount practitionerAccount;
    @ManyToOne
    private BiometricProfile patientProfile;
    private GrantStatus status;
    private LocalDateTime grantedAt;
    @Column(length = 1000)
    private String clinicalNote;
}
