package com.example.demo.controller;

import java.nio.file.attribute.UserPrincipal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.DailySummaryDto;
import com.example.demo.dto.ReadingRequestDto;
import com.example.demo.dto.ReadingResponseDto;
import com.example.demo.service.HealthReadingService;

@RestController
@RequestMapping("/api/readings")
public class HealthReadingController {

        @Autowired
        private HealthReadingService readingService;

        @GetMapping
        public ResponseEntity<List<ReadingResponseDto>> getMyReadings() {

                List<ReadingResponseDto> readings = readingService.getReadingsByUser(user.getId());

                return ResponseEntity.ok(readings);
        }

        @PostMapping
        public ResponseEntity<ReadingResponseDto> createReading(
                        @AuthenticationPrincipal UserPrincipal user,
                        @RequestBody ReadingRequestDto requestDto) {

                ReadingResponseDto response = readingService.createReading(user.getId(), requestDto);

                return ResponseEntity.ok(response);
        }

        @GetMapping("/summary")
        public ResponseEntity<List<DailySummaryDto>> getWeeklySummary(
                        @AuthenticationPrincipal UserPrincipal user) {

                List<DailySummaryDto> summary = readingService.getSevenDayHeartRateSummary(user.getId());

                return ResponseEntity.ok(summary);
        }

        @GetMapping("/patient/{profileId}")
        public ResponseEntity<List<ReadingResponseDto>> getPatientReadings(
                        @AuthenticationPrincipal UserPrincipal user,
                        @PathVariable Long profileId) {

                List<ReadingResponseDto> readings = readingService.getPatientReadings(user.getId(), profileId);

                return ResponseEntity.ok(readings);
        }

        @PutMapping("/{id}")
        public ResponseEntity<ReadingResponseDto> updateReading(
                        @AuthenticationPrincipal UserPrincipal user,
                        @PathVariable Long id,
                        @RequestBody ReadingRequestDto requestDto) {

                ReadingResponseDto updated = readingService.updateReading(user.getId(), id, requestDto);

                return ResponseEntity.ok(updated);
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteReading(
                        @AuthenticationPrincipal UserPrincipal user,
                        @PathVariable Long id) {

                readingService.deleteReading(user.getId(), id);

                return ResponseEntity.ok().build();
        }

}
