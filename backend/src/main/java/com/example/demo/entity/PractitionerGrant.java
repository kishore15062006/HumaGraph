package com.example.demo.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name="practitioner_grant")
public class PractitionerGrant {

    public enum GrantStatus {
        REQUESTED,
        ACTIVE,
        REVOKED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "practitioner_account_id",nullable = false)
    private UserAccount practitionerAccount;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_profile_id",nullable = false)
    private BiometricProfile patientProfile;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GrantStatus status;
    private LocalDateTime grantedAt;
    @Column(length = 1000)
    private String clinicalNote;
    public PractitionerGrant(long id, UserAccount practitionerAccount, BiometricProfile patientProfile,
            GrantStatus status, LocalDateTime grantedAt, String clinicalNote) {
        this.id = id;
        this.practitionerAccount = practitionerAccount;
        this.patientProfile = patientProfile;
        this.status = status;
        this.grantedAt = grantedAt;
        this.clinicalNote = clinicalNote;
    }
    public UserAccount getPractitionerAccount() {
        return practitionerAccount;
    }
    public void setPractitionerAccount(UserAccount practitionerAccount) {
        this.practitionerAccount = practitionerAccount;
    }
    public BiometricProfile getPatientProfile() {
        return patientProfile;
    }
    public void setPatientProfile(BiometricProfile patientProfile) {
        this.patientProfile = patientProfile;
    }
    public GrantStatus getStatus() {
        return status;
    }
    public void setStatus(GrantStatus status) {
        this.status = status;
    }
    public LocalDateTime getGrantedAt() {
        return grantedAt;
    }
    public void setGrantedAt(LocalDateTime grantedAt) {
        this.grantedAt = grantedAt;
    }
    public String getClinicalNote() {
        return clinicalNote;
    }
    public void setClinicalNote(String clinicalNote) {
        this.clinicalNote = clinicalNote;
    }
    
}
