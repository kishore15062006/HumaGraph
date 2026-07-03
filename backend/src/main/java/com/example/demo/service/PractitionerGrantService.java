package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.GrantRequestDto;
import com.example.demo.dto.GrantResponseDto;
import com.example.demo.entity.BiometricProfile;
import com.example.demo.entity.PractitionerGrant;
import com.example.demo.entity.UserAccount;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.BiometricProfileRepository;
import com.example.demo.repository.PractitionerGrantRepository;
import com.example.demo.repository.UserAccountRepository;

@Service
public class PractitionerGrantService {

    private final PractitionerGrantRepository grantRepository;
    private final UserAccountRepository userRepository;
    private final BiometricProfileRepository profileRepository;

    public PractitionerGrantService(
            PractitionerGrantRepository grantRepository,
            UserAccountRepository userRepository,
            BiometricProfileRepository profileRepository) {

        this.grantRepository = grantRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }
}