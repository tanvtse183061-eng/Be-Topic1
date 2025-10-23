package com.evdealer.controller;

import com.evdealer.entity.User;
import com.evdealer.entity.UserRole;
import com.evdealer.repository.UserRepository;
import com.evdealer.repository.UserRoleRepository;
import com.evdealer.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
@Tag(name = "Test Controller", description = "APIs để test và tạo dữ liệu mẫu")
public class TestController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserRoleRepository userRoleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/create-admin")
    @Operation(summary = "Tạo tài khoản admin", description = "Tạo tài khoản admin mặc định")
    public Map<String, String> createAdmin() {
        Map<String, String> response = new HashMap<>();
        
        try {
            // Delete existing admin user first
            userRepository.findByUsername("admin").ifPresent(user -> userRepository.delete(user));
            
            // Create new admin user
            User admin = new User();
            admin.setUserId(UUID.randomUUID());
            admin.setUsername("admin");
            admin.setEmail("admin@evdealer.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setPhone("0123456789");
            admin.setAddress("System Address");
            // Don't set role for now to avoid issues
            admin.setIsActive(true);
            
            userRepository.save(admin);
            response.put("status", "success");
            response.put("message", "Admin user created successfully");
            response.put("username", "admin");
            response.put("password", "admin123");
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to create admin user: " + e.getMessage());
        }
        
        return response;
    }
    
    @PostMapping("/create-role")
    @Operation(summary = "Tạo vai trò mới", description = "Tạo vai trò người dùng mới")
    public Map<String, String> createRole(@RequestParam String roleName) {
        Map<String, String> response = new HashMap<>();
        
        try {
            if (!userRoleRepository.existsByRoleName(roleName)) {
                UserRole role = new UserRole();
                role.setRoleName(roleName);
                role.setDescription("Default " + roleName + " role");
                // Don't set permissions field to avoid jsonb issue
                userRoleRepository.save(role);
                response.put("status", "success");
                response.put("message", "Role " + roleName + " created successfully");
            } else {
                response.put("status", "info");
                response.put("message", "Role " + roleName + " already exists");
            }
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to create role: " + e.getMessage());
        }
        
        return response;
    }
    
    @PostMapping("/create-manager")
    @Operation(summary = "Tạo tài khoản manager", description = "Tạo tài khoản manager với vai trò admin")
    public Map<String, String> createManager() {
        Map<String, String> response = new HashMap<>();
        
        try {
            // Try to find existing admin role first (since MANAGER doesn't exist)
            UserRole adminRole = userRoleRepository.findByRoleName("admin").orElse(null);
            
            if (adminRole == null) {
                response.put("status", "error");
                response.put("message", "admin role not found in database.");
                return response;
            }
            
            // Create manager user if not exists
            if (!userRepository.existsByUsername("manager")) {
                User manager = new User();
                manager.setUserId(UUID.randomUUID());
                manager.setUsername("manager");
                manager.setEmail("manager@evdealer.com");
                manager.setPasswordHash(passwordEncoder.encode("manager123"));
                manager.setFirstName("Manager");
                manager.setLastName("User");
                manager.setPhone("0987654321");
                manager.setAddress("Manager Address");
                manager.setRole(adminRole);
                manager.setIsActive(true);
                
                userRepository.save(manager);
                response.put("status", "success");
                response.put("message", "Manager user created successfully with admin role");
                response.put("username", "manager");
                response.put("password", "manager123");
                response.put("role", "admin");
            } else {
                response.put("status", "info");
                response.put("message", "Manager user already exists");
                response.put("username", "manager");
                response.put("password", "manager123");
                response.put("role", "admin");
            }
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to create manager user: " + e.getMessage());
        }
        
        return response;
    }
    
    @PostMapping("/test-password")
    public Map<String, String> testPassword(@RequestParam String username, @RequestParam String password) {
        Map<String, String> response = new HashMap<>();
        
        try {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user == null) {
                response.put("status", "error");
                response.put("message", "User not found");
                return response;
            }
            
            boolean matches = passwordEncoder.matches(password, user.getPasswordHash());
            response.put("status", "success");
            response.put("passwordMatches", String.valueOf(matches));
            response.put("storedHash", user.getPasswordHash());
            response.put("inputPassword", password);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        
        return response;
    }
    
    @GetMapping("/users")
    @Operation(summary = "Lấy danh sách người dùng", description = "Lấy tất cả người dùng trong hệ thống")
    public Map<String, Object> getUsers() {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("status", "success");
            response.put("users", userRepository.findAll());
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        return response;
    }
    
    @GetMapping("/roles")
    @Operation(summary = "Lấy danh sách vai trò", description = "Lấy tất cả vai trò trong hệ thống")
    public Map<String, Object> getRoles() {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("status", "success");
            response.put("roles", userRoleRepository.findAll());
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        return response;
    }
    
    @PostMapping("/test-login")
    @Transactional
    public Map<String, Object> testLogin(@RequestParam String username, @RequestParam String password) {
        Map<String, Object> response = new HashMap<>();
        try {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user == null) {
                response.put("status", "error");
                response.put("message", "User not found");
                return response;
            }
            
            boolean passwordMatch = passwordEncoder.matches(password, user.getPasswordHash());
            if (!passwordMatch) {
                response.put("status", "error");
                response.put("message", "Invalid password");
                return response;
            }
            
            response.put("status", "success");
            response.put("message", "Login successful");
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("role", user.getRole() != null ? user.getRole().getRoleName() : "No role");
            response.put("isActive", user.getIsActive());
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        return response;
    }
    
    @PostMapping("/test-jwt")
    @Transactional
    public Map<String, Object> testJwt(@RequestParam String username, @RequestParam String password) {
        Map<String, Object> response = new HashMap<>();
        try {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user == null) {
                response.put("status", "error");
                response.put("message", "User not found");
                return response;
            }
            
            boolean passwordMatch = passwordEncoder.matches(password, user.getPasswordHash());
            if (!passwordMatch) {
                response.put("status", "error");
                response.put("message", "Invalid password");
                return response;
            }
            
            // Test JWT generation
            String role = user.getRole() != null ? user.getRole().getRoleName() : "USER";
            String token = jwtUtil.generateToken(user.getUsername(), role, user.getUserId().toString());
            
            response.put("status", "success");
            response.put("message", "JWT generation successful");
            response.put("token", token);
            response.put("username", user.getUsername());
            response.put("role", role);
            response.put("userId", user.getUserId().toString());
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        return response;
    }
    
    @PostMapping("/generate-hash")
    public Map<String, String> generateHash(@RequestParam String password) {
        Map<String, String> response = new HashMap<>();
        try {
            String hash = passwordEncoder.encode(password);
            response.put("status", "success");
            response.put("password", password);
            response.put("hash", hash);
            response.put("message", "Hash generated successfully");
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        return response;
    }
    
    @PostMapping("/update-user-password")
    public Map<String, String> updateUserPassword(@RequestParam String username, @RequestParam String newPassword) {
        Map<String, String> response = new HashMap<>();
        try {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user == null) {
                response.put("status", "error");
                response.put("message", "User not found");
                return response;
            }
            
            String newHash = passwordEncoder.encode(newPassword);
            user.setPasswordHash(newHash);
            userRepository.save(user);
            
            response.put("status", "success");
            response.put("message", "Password updated successfully");
            response.put("username", username);
            response.put("newPassword", newPassword);
            response.put("newHash", newHash);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        return response;
    }
}
