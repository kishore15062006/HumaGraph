package com.example.demo.service;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.config.JwtService;
import com.example.demo.dto.AuthRequestDto;
import com.example.demo.dto.AuthResponseDto;
import com.example.demo.dto.RegisterDto;
import com.example.demo.dto.UserResponseDto;
import com.example.demo.entity.BiometricProfile;
import com.example.demo.entity.UserAccount;
import com.example.demo.repository.BiometricProfileRepository;
import com.example.demo.repository.UserAccountRepository;

@Service
public class AuthService {

        private final UserAccountRepository userAccountRepository;
        private final BiometricProfileRepository biometricProfileRepository;
        private final PasswordEncoder passwordEncoder;
        private final AuthenticationManager authenticationManager;
        private final JwtService jwtService;

        public AuthService(
                        UserAccountRepository userAccountRepository,
                        BiometricProfileRepository biometricProfileRepository,
                        PasswordEncoder passwordEncoder,
                        AuthenticationManager authenticationManager,
                        JwtService jwtService) {

                this.userAccountRepository = userAccountRepository;
                this.biometricProfileRepository = biometricProfileRepository;
                this.passwordEncoder = passwordEncoder;
                this.authenticationManager = authenticationManager;
                this.jwtService = jwtService;
        }

        public AuthResponseDto register(RegisterDto dto) {

                if (userAccountRepository.existsByEmail(dto.getEmail())) {
                        throw new RuntimeException("Email already exists");
                }

                UserAccount user = new UserAccount();

                user.setEmail(dto.getEmail());

                user.setPasswordHash(
                                passwordEncoder.encode(dto.getPassword()));

                user.setRole(UserAccount.UserRole.INDIVIDUAL);

                user.setActive(true);

                user.setCreatedAt(LocalDateTime.now());

                user = userAccountRepository.save(user);

                BiometricProfile profile = new BiometricProfile();

                profile.setUserAccount(user);
                profile.setFullName(dto.getFullName());
                profile.setDateOfBirth(dto.getDateOfBirth());
                profile.setGender(dto.getGender());
                profile.setBloodType(dto.getBloodType());

                biometricProfileRepository.save(profile);

                String token = jwtService.generateToken(user);

                UserResponseDto userDto = new UserResponseDto(
                                user.getId(),
                                user.getEmail(),
                                profile.getFullName(),
                                user.getRole().name());

                return new AuthResponseDto(
                                token,
                                userDto);
        }

        public AuthResponseDto login(AuthRequestDto dto) {

                authenticationManager.authenticate(

                                new UsernamePasswordAuthenticationToken(
                                                dto.getEmail(),
                                                dto.getPassword()));

                UserAccount user = userAccountRepository
                                .findByEmail(dto.getEmail())
                                .orElseThrow(() -> new RuntimeException(
                                                "Invalid email or password"));

                BiometricProfile profile = biometricProfileRepository
                                .findByUserAccountId(user.getId())
                                .orElse(null);

                String fullName = profile != null
                                ? profile.getFullName()
                                : null;

                String token = jwtService.generateToken(user);

                UserResponseDto userDto = new UserResponseDto(
                                user.getId(),
                                user.getEmail(),
                                fullName,
                                user.getRole().name());

                return new AuthResponseDto(
                                token,
                                userDto);
        }

}