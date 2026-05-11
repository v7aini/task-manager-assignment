package com.example.taskmanager.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String username;
    private String email;
    private String password;
    private String role; // ADMIN or MEMBER
}
