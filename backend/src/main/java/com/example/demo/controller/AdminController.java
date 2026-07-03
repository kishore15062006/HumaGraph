package com.example.demo.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.AdminUserDto;
import com.example.demo.entity.HealthMetric;
import com.example.demo.entity.UserAccount;
import com.example.demo.repository.HealthMetricRepository;
import com.example.demo.repository.UserAccountRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final UserAccountRepository userRepository;
    private final HealthMetricRepository metricRepository;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {

        List<AdminUserDto> users = userRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(
            @PathVariable Long id) {

        UserAccount user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        user.setActive(!user.isActive());

        userRepository.save(user);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> getAllMetrics() {

        return ResponseEntity.ok(
                metricRepository.findAll());
    }

    @PutMapping("/metrics/{id}")
    public ResponseEntity<?> updateMetric(
            @PathVariable Long id,
            @RequestBody HealthMetric metric) {

        HealthMetric existing = metricRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Metric not found"));

        existing.setName(metric.getName());
        existing.setUnit(metric.getUnit());
        existing.setCategory(metric.getCategory());

        HealthMetric saved = metricRepository.save(existing);

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/metrics/{id}")
    public ResponseEntity<?> deleteMetric(
            @PathVariable Long id) {

        metricRepository.deleteById(id);

        return ResponseEntity.ok().build();
    }

    private AdminUserDto mapToDto(UserAccount user) {

        AdminUserDto dto = new AdminUserDto();

        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setActive(user.isActive());
        dto.setCreatedAt(user.getCreatedAt());

        return dto;
    }

}