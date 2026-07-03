package com.example.demo.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessValidationException.class)
    public ResponseEntity<Map<String, String>> handleBusinessValidation(
            BusinessValidationException ex) {

        Map<String, String> body = new HashMap<>();
        body.put("error", ex.getMessage());

        return new ResponseEntity<>(
                body,
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(
            ResourceNotFoundException ex) {

        Map<String, String> body = new HashMap<>();
        body.put("error", ex.getMessage());

        return new ResponseEntity<>(
                body,
                HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(
            Exception ex) {

        Map<String, String> body = new HashMap<>();

        body.put(
                "error",
                "Internal Server Error: " + ex.getMessage());

        return new ResponseEntity<>(
                body,
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

}