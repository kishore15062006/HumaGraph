package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.example.demo.repository.UserAccountRepository;

@Configuration
public class ApplicationConfig {

    private final UserAccountRepository repository;

    public ApplicationConfig(UserAccountRepository repository) {

        this.repository = repository;

    }

    @Bean
    UserDetailsService userDetailsService() {

        return username -> repository.findByEmail(username)

                .orElseThrow(() ->

                        new UsernameNotFoundException("User not found"));

    }

}