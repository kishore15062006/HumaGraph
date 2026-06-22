package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class UserAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY )
    private long id;
    @Column(unique = true,nullable = false)
    private String email;
    private String passwordHash;
    // private Role userRole;
    // @Column()
    // private boolean isActive;
}
