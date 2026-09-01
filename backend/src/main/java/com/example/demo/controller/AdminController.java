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

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.example.demo.entity.HealthReading;
import com.example.demo.entity.HealthGoal;
import com.example.demo.entity.PractitionerGrant;
import com.example.demo.repository.HealthReadingRepository;
import com.example.demo.repository.HealthGoalRepository;
import com.example.demo.repository.PractitionerGrantRepository;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final UserAccountRepository userRepository;
    private final HealthMetricRepository metricRepository;
    private final HealthReadingRepository readingRepository;
    private final HealthGoalRepository goalRepository;
    private final PractitionerGrantRepository grantRepository;

    public AdminController(
            UserAccountRepository userRepository,
            HealthMetricRepository metricRepository,
            HealthReadingRepository readingRepository,
            HealthGoalRepository goalRepository,
            PractitionerGrantRepository grantRepository) {
        this.userRepository = userRepository;
        this.metricRepository = metricRepository;
        this.readingRepository = readingRepository;
        this.goalRepository = goalRepository;
        this.grantRepository = grantRepository;
    }

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

        if (user.getRole() == UserAccount.UserRole.ADMIN) {
            return ResponseEntity.badRequest().body("Administrator accounts cannot be deactivated");
        }

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

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(
            @RequestParam(name = "days", defaultValue = "7") int days) {
        Map<String, Object> analytics = new HashMap<>();

        int numDays = Math.max(1, Math.min(days, 90));

        // 1. Users (100% dynamic from database)
        List<UserAccount> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();
        long activeUsers = allUsers.stream().filter(UserAccount::isActive).count();
        long individualCount = allUsers.stream().filter(u -> u.getRole() == UserAccount.UserRole.INDIVIDUAL).count();
        long practitionerCount = allUsers.stream().filter(u -> u.getRole() == UserAccount.UserRole.PRACTITIONER).count();
        long adminCount = allUsers.stream().filter(u -> u.getRole() == UserAccount.UserRole.ADMIN).count();

        Map<String, Object> userStats = new HashMap<>();
        userStats.put("totalUsers", totalUsers);
        userStats.put("activeUsers", activeUsers);
        userStats.put("deactivatedUsers", totalUsers - activeUsers);
        userStats.put("individualCount", individualCount);
        userStats.put("practitionerCount", practitionerCount);
        userStats.put("adminCount", adminCount);

        List<Map<String, Object>> roleDistribution = List.of(
            Map.of("name", "Patients", "value", individualCount, "color", "#3b82f6"),
            Map.of("name", "Practitioners", "value", practitionerCount, "color", "#10b981"),
            Map.of("name", "Administrators", "value", adminCount, "color", "#8b5cf6")
        );
        userStats.put("roleDistribution", roleDistribution);
        analytics.put("userStats", userStats);

        // 2. Metrics & Readings (100% dynamic from database)
        List<HealthMetric> allMetrics = metricRepository.findAll();
        List<HealthReading> allReadings = readingRepository.findAll();
        long totalReadings = allReadings.size();
        long outOfBoundsCount = allReadings.stream().filter(r -> r.getStatus() == HealthReading.ReadingStatus.OUT_OF_BOUNDS).count();
        long normalCount = totalReadings - outOfBoundsCount;

        Map<String, Object> readingStats = new HashMap<>();
        readingStats.put("totalReadings", totalReadings);
        readingStats.put("normalReadings", normalCount);
        readingStats.put("outOfBoundsReadings", outOfBoundsCount);
        readingStats.put("totalMetrics", allMetrics.size());

        // Category breakdown (include all standard categories)
        List<Map<String, Object>> categoryDistribution = new ArrayList<>();
        for (HealthMetric.MetricCategory cat : HealthMetric.MetricCategory.values()) {
            long count = allReadings.stream()
                .filter(r -> r.getMetric() != null && r.getMetric().getCategory() == cat)
                .count();
            Map<String, Object> item = new HashMap<>();
            item.put("category", cat.name());
            item.put("count", count);
            categoryDistribution.add(item);
        }
        readingStats.put("categoryDistribution", categoryDistribution);

        // Metric readings breakdown (include all registered metrics)
        List<Map<String, Object>> metricDistribution = new ArrayList<>();
        for (HealthMetric m : allMetrics) {
            long count = allReadings.stream()
                .filter(r -> r.getMetric() != null && r.getMetric().getId() == m.getId())
                .count();
            Map<String, Object> item = new HashMap<>();
            item.put("name", m.getName());
            item.put("count", count);
            item.put("unit", m.getUnit());
            item.put("category", m.getCategory() != null ? m.getCategory().name() : "");
            metricDistribution.add(item);
        }
        readingStats.put("metricDistribution", metricDistribution);

        // Dynamic Timeline for selected timeframe
        LocalDate today = LocalDate.now();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd");
        List<Map<String, Object>> timeline = new ArrayList<>();
        for (int i = numDays - 1; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            long normalOnDay = allReadings.stream()
                .filter(r -> r.getRecordedAt() != null && r.getRecordedAt().toLocalDate().equals(day))
                .filter(r -> r.getStatus() == HealthReading.ReadingStatus.NORMAL)
                .count();
            long alertOnDay = allReadings.stream()
                .filter(r -> r.getRecordedAt() != null && r.getRecordedAt().toLocalDate().equals(day))
                .filter(r -> r.getStatus() == HealthReading.ReadingStatus.OUT_OF_BOUNDS)
                .count();

            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("date", day.format(fmt));
            dayMap.put("normal", normalOnDay);
            dayMap.put("outOfBounds", alertOnDay);
            dayMap.put("total", normalOnDay + alertOnDay);
            timeline.add(dayMap);
        }
        readingStats.put("timeline", timeline);
        readingStats.put("timeframeDays", numDays);
        analytics.put("readingStats", readingStats);

        // 3. Practitioner Grants (100% dynamic from database)
        List<PractitionerGrant> allGrants = grantRepository.findAll();
        long activeGrants = allGrants.stream().filter(g -> g.getStatus() == PractitionerGrant.GrantStatus.ACTIVE).count();
        long requestedGrants = allGrants.stream().filter(g -> g.getStatus() == PractitionerGrant.GrantStatus.REQUESTED).count();
        long revokedGrants = allGrants.stream().filter(g -> g.getStatus() == PractitionerGrant.GrantStatus.REVOKED).count();

        Map<String, Object> grantStats = new HashMap<>();
        grantStats.put("totalGrants", allGrants.size());
        grantStats.put("activeGrants", activeGrants);
        grantStats.put("requestedGrants", requestedGrants);
        grantStats.put("revokedGrants", revokedGrants);
        grantStats.put("grantsDistribution", List.of(
            Map.of("name", "Active", "value", activeGrants, "color", "#10b981"),
            Map.of("name", "Requested", "value", requestedGrants, "color", "#f59e0b"),
            Map.of("name", "Revoked", "value", revokedGrants, "color", "#ef4444")
        ));
        analytics.put("grantStats", grantStats);

        // 4. Health Goals (100% dynamic from database)
        List<HealthGoal> allGoals = goalRepository.findAll();
        long achievedGoals = allGoals.stream().filter(g -> g.getStatus() == HealthGoal.GoalStatus.ACHIEVED).count();
        long inProgressGoals = allGoals.stream().filter(g -> g.getStatus() == HealthGoal.GoalStatus.IN_PROGRESS).count();
        long failedGoals = allGoals.stream().filter(g -> g.getStatus() == HealthGoal.GoalStatus.FAILED).count();

        Map<String, Object> goalStats = new HashMap<>();
        goalStats.put("totalGoals", allGoals.size());
        goalStats.put("achievedGoals", achievedGoals);
        goalStats.put("inProgressGoals", inProgressGoals);
        goalStats.put("failedGoals", failedGoals);
        goalStats.put("achievementRate", allGoals.isEmpty() ? 0 : Math.round(((double) achievedGoals / allGoals.size()) * 100));
        goalStats.put("goalsDistribution", List.of(
            Map.of("name", "Achieved", "value", achievedGoals, "color", "#10b981"),
            Map.of("name", "In Progress", "value", inProgressGoals, "color", "#3b82f6"),
            Map.of("name", "Failed", "value", failedGoals, "color", "#ef4444")
        ));
        analytics.put("goalStats", goalStats);

        // 5. Recent Out-of-Bounds Alerts (Live Database Telemetry)
        List<Map<String, Object>> recentAlerts = allReadings.stream()
            .filter(r -> r.getStatus() == HealthReading.ReadingStatus.OUT_OF_BOUNDS)
            .sorted((a, b) -> {
                if (a.getRecordedAt() == null && b.getRecordedAt() == null) return 0;
                if (a.getRecordedAt() == null) return 1;
                if (b.getRecordedAt() == null) return -1;
                return b.getRecordedAt().compareTo(a.getRecordedAt());
            })
            .limit(8)
            .map(r -> {
                Map<String, Object> alert = new HashMap<>();
                alert.put("id", r.getId());
                alert.put("numericValue", r.getNumericValue());
                alert.put("status", r.getStatus() != null ? r.getStatus().name() : "OUT_OF_BOUNDS");
                alert.put("source", r.getSource() != null ? r.getSource().name() : "MANUAL");
                alert.put("recordedAt", r.getRecordedAt() != null ? r.getRecordedAt().toString() : "");
                if (r.getMetric() != null) {
                    alert.put("metricName", r.getMetric().getName());
                    alert.put("metricUnit", r.getMetric().getUnit());
                    alert.put("category", r.getMetric().getCategory() != null ? r.getMetric().getCategory().name() : "");
                }
                if (r.getProfile() != null) {
                    alert.put("patientName", r.getProfile().getFullName() != null ? r.getProfile().getFullName() : "Anonymous Patient");
                    if (r.getProfile().getUserAccount() != null) {
                        alert.put("patientEmail", r.getProfile().getUserAccount().getEmail());
                    }
                }
                return alert;
            })
            .collect(Collectors.toList());
        analytics.put("recentAlerts", recentAlerts);

        return ResponseEntity.ok(analytics);
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