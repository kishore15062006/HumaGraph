package com.example.demo.service;

import java.time.LocalDate;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import com.example.demo.config.JwtService;
import com.example.demo.dto.AuthRequestDto;
import com.example.demo.dto.AuthResponseDto;
import com.example.demo.dto.RegisterDto;

import com.example.demo.entity.BiometricProfile;
import com.example.demo.entity.UserAccount;

import com.example.demo.repository.BiometricProfileRepository;
import com.example.demo.repository.UserAccountRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserAccountRepository userRepository;

    private final BiometricProfileRepository biometricRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    private final JwtService jwtService;

    public AuthResponseDto register(RegisterDto request) {

        if (userRepository.existsByEmail(request.getEmail())) {

            throw new RuntimeException("Email already exists");

        }

        UserAccount user = UserAccount.builder()

                .email(request.getEmail())

                .password(
                        passwordEncoder.encode(request.getPassword()))

                .role(UserAccount.UserRRole.USER)

                .build();

        userRepository.save(user);

        BiometricProfile profile = new BiometricProfile();

        profile.setUser(user);

        profile.setFullName(request.getFullName());

        profile.setDateOfBirth(request.getDateOfBirth());

        biometricRepository.save(profile);

        String token = jwtService.generateToken(user);

        return new AuthResponseDto(
                token,
                user.getEmail(),
                user.getRole().name()
        );

    }

    public AuthResponseDto login(AuthRequestDto request) {

        authenticationManager.authenticate(

                new UsernamePasswordAuthenticationToken(

                        request.getEmail(),

                        request.getPassword()

                )

        );

        UserAccount user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow();

        String token = jwtService.generateToken(user);

        return new AuthResponseDto(

                token,

                user.getEmail(),

                user.getRole().name()

        );

    }

}