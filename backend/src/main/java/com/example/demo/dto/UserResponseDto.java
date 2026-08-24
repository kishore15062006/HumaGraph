package com.example.demo.dto;

public class UserResponseDto {

    private long id;
    private String email;
    private String fullName;
    private String role;

    public UserResponseDto() {
    }

    public UserResponseDto(
            long id,
            String email,
            String fullName,
            String role) {

        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}