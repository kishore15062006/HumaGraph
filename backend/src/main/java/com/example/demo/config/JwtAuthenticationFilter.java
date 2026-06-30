package com.example.demo.config;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.demo.entity.UserAccount;
import com.example.demo.repository.UserAccountRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    private final UserAccountRepository repository;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   UserAccountRepository repository) {

        this.jwtService = jwtService;
        this.repository = repository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;

        }

        String jwt = authHeader.substring(7);

        String email = jwtService.extractUsername(jwt);

        if (email != null &&
                SecurityContextHolder.getContext()
                        .getAuthentication() == null) {

            UserAccount user =
                    repository.findByEmail(email)
                            .orElse(null);

            if (user != null &&
                    jwtService.isTokenValid(jwt, user)) {

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(

                                user,

                                null,

                                List.of(
                                        new SimpleGrantedAuthority(
                                                "ROLE_" + user.getRole().name()
                                        )
                                )
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

            }

        }

        filterChain.doFilter(request, response);

    }

}