package com.example.demo.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.AuthRequestDto;
import com.example.demo.dto.AuthResponseDto;
import com.example.demo.dto.RegisterDto;

import com.example.demo.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(

            @RequestBody RegisterDto dto) {

        return ResponseEntity.ok(

                authService.register(dto)

        );

    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(

            @RequestBody AuthRequestDto dto) {

        return ResponseEntity.ok(

                authService.login(dto)

        );

    }

}