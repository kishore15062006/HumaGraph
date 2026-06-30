package com.example.demo.config;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.example.demo.repository.UserAccountRepository;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserAccountRepository repository;

    @Bean
    public UserDetailsService userDetailsService() {

        return username -> repository.findByEmail(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

    }

}