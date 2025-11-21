package com.evdealer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Login request data")
public class LoginRequest {
    
    @NotBlank(message = "Username is required")
    @Schema(description = "Username or email", example = "admin", required = true)
    private String username;
    
    @NotBlank(message = "Password is required")
    @Schema(description = "User password", example = "admin123", required = true)
    private String password;
    
    public LoginRequest() {}
    
    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
}
