package com.example.demo.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name="practitioner_grant")
public class PractitionerGrant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @ManyToOne
    @JoinColumn(name = "practitioner_account_id")
    private UserAccount practitionerAccount;
    @ManyToOne
    private BiometricProfile patientProfile;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GrantStatus status;
    private LocalDateTime grantedAt;
    @Column(length = 1000)
    private String clinicalNote;
}
