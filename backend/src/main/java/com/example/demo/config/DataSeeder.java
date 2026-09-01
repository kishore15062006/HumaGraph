package com.example.demo.config;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.demo.entity.BiometricProfile;
import com.example.demo.entity.HealthMetric;
import com.example.demo.entity.UserAccount;
import com.example.demo.repository.BiometricProfileRepository;
import com.example.demo.repository.HealthMetricRepository;
import com.example.demo.repository.UserAccountRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserAccountRepository userAccountRepository;
    private final BiometricProfileRepository biometricProfileRepository;
    private final HealthMetricRepository healthMetricRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            UserAccountRepository userAccountRepository,
            BiometricProfileRepository biometricProfileRepository,
            HealthMetricRepository healthMetricRepository,
            PasswordEncoder passwordEncoder) {

        this.userAccountRepository = userAccountRepository;
        this.biometricProfileRepository = biometricProfileRepository;
        this.healthMetricRepository = healthMetricRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {

        seedHealthMetrics();

        seedAdmin();

    }

    private void seedHealthMetrics() {

        if (healthMetricRepository.count() == 0) {

            saveMetric(
                    "Heart Rate",
                    "bpm",
                    HealthMetric.MetricCategory.CARDIO);

            saveMetric(
                    "Blood Pressure",
                    "mmHg",
                    HealthMetric.MetricCategory.CARDIO);

            saveMetric(
                    "Blood Glucose",
                    "mg/dL",
                    HealthMetric.MetricCategory.METABOLIC);

            saveMetric(
                    "Weight",
                    "kg",
                    HealthMetric.MetricCategory.FITNESS);

        }

    }

    private void saveMetric(
            String name,
            String unit,
            HealthMetric.MetricCategory category) {

        HealthMetric metric = new HealthMetric();

        metric.setName(name);

        metric.setUnit(unit);

        metric.setCategory(category);

        metric.setSystemStandard(true);

        healthMetricRepository.save(metric);

    }

    private void seedAdmin() {

        if (!userAccountRepository.existsByEmail("admin@humagraph.com")) {

            UserAccount admin = new UserAccount();

            admin.setEmail("admin@humagraph.com");

            admin.setPasswordHash(
                    passwordEncoder.encode("admin123"));

            admin.setRole(UserAccount.UserRole.ADMIN);

            admin.setActive(true);

            admin.setCreatedAt(LocalDateTime.now());

            admin = userAccountRepository.save(admin);

            BiometricProfile profile = new BiometricProfile();

            profile.setUserAccount(admin);

            profile.setFullName("System Administrator");

            profile.setDateOfBirth(
                    LocalDate.of(1980, 1, 1));

            profile.setGender("Male");

            profile.setBloodType("O+");

            biometricProfileRepository.save(profile);

        }

    }

}