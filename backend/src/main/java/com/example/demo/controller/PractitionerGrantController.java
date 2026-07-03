package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.GrantRequestDto;
import com.example.demo.dto.GrantResponseDto;
import com.example.demo.dto.GrantStatusUpdateDto;
import com.example.demo.entity.UserAccount;
import com.example.demo.service.PractitionerGrantService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/grants")
@RequiredArgsConstructor
public class PractitionerGrantController {

    private final PractitionerGrantService grantService;

    @GetMapping
    public ResponseEntity<?> getGrants(
            @AuthenticationPrincipal UserAccount user) {

        List<GrantResponseDto> grants =
                grantService.getGrants(
                        user.getId(),
                        user.getRole().name());

        return ResponseEntity.ok(grants);
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestAccess(
            @AuthenticationPrincipal UserAccount user,
            @RequestBody GrantRequestDto dto) {

        GrantResponseDto response =
                grantService.requestAccess(
                        user.getId(),
                        dto);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveGrant(
            @AuthenticationPrincipal UserAccount user,
            @PathVariable Long id,
            @RequestBody GrantStatusUpdateDto dto) {

        GrantResponseDto response =
                grantService.updateGrantStatus(
                        user.getId(),
                        id,
                        dto.getStatus());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/note")
    public ResponseEntity<?> updateNote(
            @AuthenticationPrincipal UserAccount user,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        GrantResponseDto response =
                grantService.updateClinicalNote(
                        user.getId(),
                        id,
                        body.get("note"));

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGrant(
            @AuthenticationPrincipal UserAccount user,
            @PathVariable Long id) {

        grantService.deleteGrant(
                user.getId(),
                id);

        return ResponseEntity.ok().build();
    }

}