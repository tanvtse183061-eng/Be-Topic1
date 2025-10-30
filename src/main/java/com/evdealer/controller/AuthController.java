package com.evdealer.controller;

import com.evdealer.dto.LoginRequest;
import com.evdealer.dto.LoginResponse;
import com.evdealer.dto.RegistrationRequest;
import com.evdealer.entity.User;
import com.evdealer.service.UserService;
import com.evdealer.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Tag(name = "Authentication", description = "APIs xác thực và phân quyền người dùng")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @PostMapping("/login")
    @Transactional
    @Operation(summary = "Đăng nhập người dùng", description = "Xác thực và trả về token JWT")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Đăng nhập thành công",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = LoginResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "401", 
            description = "Thông tin đăng nhập không hợp lệ hoặc tài khoản bị vô hiệu hóa",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Invalid username or password\"}")
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Dữ liệu yêu cầu không hợp lệ",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Invalid request data\"}")
            )
        ),
        @ApiResponse(
            responseCode = "500", 
            description = "Lỗi máy chủ nội bộ",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Login failed: [chi tiết lỗi]\"}")
            )
        )
    })
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Find user by username or email
            Optional<User> userOpt = userService.getUserByUsername(loginRequest.getUsername());
            if (userOpt.isEmpty()) {
                userOpt = userService.getUserByEmail(loginRequest.getUsername());
            }
            
            if (userOpt.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid username or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            User user = userOpt.get();
            
            // Check if user is active
            if (!user.getIsActive()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Account is deactivated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            // Verify password
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid username or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            // Generate JWT token
            String role = user.getUserType() != null ? user.getUserType().toString() : "USER";
            String token = jwtUtil.generateToken(user.getUsername(), role, user.getUserId().toString());
            
            // Create login response
            LoginResponse response = new LoginResponse();
            response.setAccessToken(token);
            response.setExpiresIn(jwtUtil.getExpirationTime());
            response.setUserId(user.getUserId().toString());
            response.setUsername(user.getUsername());
            response.setRole(role);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/register")
    @Transactional
    @Operation(summary = "Đăng ký tài khoản", description = "Tạo tài khoản người dùng mới")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201", 
            description = "Đăng ký tài khoản thành công",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(example = "{\"userId\": \"uuid\", \"username\": \"string\", \"email\": \"string\", \"firstName\": \"string\", \"lastName\": \"string\", \"phone\": \"string\", \"address\": \"string\", \"isActive\": true, \"message\": \"User registered successfully\"}")
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Dữ liệu không hợp lệ hoặc tên đăng nhập/email đã tồn tại",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Username already exists\"}")
            )
        ),
        @ApiResponse(
            responseCode = "500", 
            description = "Lỗi máy chủ nội bộ",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Registration failed: [chi tiết lỗi]\"}")
            )
        )
    })
    public ResponseEntity<?> register(@Valid @RequestBody RegistrationRequest registrationRequest) {
        try {
            // Check if username already exists
            if (userService.getUserByUsername(registrationRequest.getUsername()).isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Username already exists");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Check if email already exists
            if (userService.getUserByEmail(registrationRequest.getEmail()).isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email already exists");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Create new user
            User newUser = new User();
            newUser.setUserId(java.util.UUID.randomUUID());
            newUser.setUsername(registrationRequest.getUsername());
            newUser.setEmail(registrationRequest.getEmail());
            newUser.setPasswordHash(registrationRequest.getPassword()); // Will be hashed in UserService
            newUser.setFirstName(registrationRequest.getFirstName());
            newUser.setLastName(registrationRequest.getLastName());
            newUser.setPhone(registrationRequest.getPhone());
            newUser.setAddress(registrationRequest.getAddress());
            newUser.setIsActive(true);
            
            // Save user (password will be hashed in UserService.createUser)
            User createdUser = userService.createUser(newUser);
            
            // Create a response map without password hash for security
            Map<String, Object> response = new HashMap<>();
            response.put("userId", createdUser.getUserId());
            response.put("username", createdUser.getUsername());
            response.put("email", createdUser.getEmail());
            response.put("firstName", createdUser.getFirstName());
            response.put("lastName", createdUser.getLastName());
            response.put("phone", createdUser.getPhone());
            response.put("address", createdUser.getAddress());
            response.put("isActive", createdUser.getIsActive());
            response.put("message", "User registered successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/validate")
    @Operation(summary = "Xác thực token", description = "Kiểm tra tính hợp lệ của token JWT")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token is valid"),
        @ApiResponse(responseCode = "401", description = "Token is invalid or expired")
    })
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            String token = authHeader.substring(7);
            
            if (jwtUtil.validateToken(token)) {
                Map<String, Object> response = new HashMap<>();
                response.put("valid", true);
                response.put("username", jwtUtil.extractUsername(token));
                response.put("role", jwtUtil.getRoleFromToken(token));
                response.put("userId", jwtUtil.getUserIdFromToken(token));
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Token validation failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất", description = "Đăng xuất người dùng")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logout successful")
    })
    public ResponseEntity<?> logout() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout successful");
        return ResponseEntity.ok(response);
    }
}
