package com.evdealer.service;

import com.evdealer.dto.UserRequest;
import com.evdealer.entity.Dealer;
import com.evdealer.entity.User;
import com.evdealer.entity.UserRole;
import com.evdealer.repository.DealerRepository;
import com.evdealer.repository.UserRepository;
import com.evdealer.repository.UserRoleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final DealerRepository dealerRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserService(UserRepository userRepository, 
                      UserRoleRepository userRoleRepository,
                      DealerRepository dealerRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.dealerRepository = dealerRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public List<User> getActiveUsers() {
        return userRepository.findByIsActiveTrue();
    }
    
    public Optional<User> getUserById(UUID userId) {
        return userRepository.findById(userId);
    }
    
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public List<User> getUsersByRole(String roleName) {
        return userRepository.findByRoleName(roleName);
    }
    
    public List<User> getUsersByDealer(UUID dealerId) {
        return userRepository.findByDealerDealerId(dealerId);
    }
    
    public List<User> getUsersByRoleString(String roleString) {
        return userRepository.findByRoleString(roleString);
    }
    
    public List<User> searchUsersByName(String name) {
        return userRepository.findByNameContaining(name);
    }
    
    public User createUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists: " + user.getUsername());
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists: " + user.getEmail());
        }
        
        // Hash password before saving
        if (user.getPasswordHash() != null && !user.getPasswordHash().startsWith("$2a$")) {
            // Only hash if it's not already hashed (doesn't start with BCrypt prefix)
            user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        }
        
        return userRepository.save(user);
    }
    
    public User createUserFromRequest(UserRequest request) {
        // Generate username from email if not provided
        String username = request.getEmail() != null ? 
            request.getEmail().split("@")[0] : 
            (request.getFirstName() + "." + request.getLastName()).toLowerCase();
        
        // Check for duplicate username
        if (userRepository.existsByUsername(username)) {
            username = username + "_" + System.currentTimeMillis();
        }
        
        // Check for duplicate email
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }
        
        // Create new user
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        // Note: User entity doesn't have notes field, so we skip it
        
        // Set dealer if provided
        if (request.getDealerId() != null) {
            Dealer dealer = dealerRepository.findById(request.getDealerId())
                    .orElseThrow(() -> new RuntimeException("Dealer not found with ID: " + request.getDealerId()));
            user.setDealer(dealer);
        }
        
        // Set role
        if (request.getRoleString() != null) {
            UserRole role = userRoleRepository.findByRoleName(request.getRoleString())
                    .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRoleString()));
            user.setRole(role);
        }
        
        return userRepository.save(user);
    }
    
    public User updateUser(UUID userId, User userDetails) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Check for duplicate username (excluding current user)
        if (!user.getUsername().equals(userDetails.getUsername()) && 
            userRepository.existsByUsername(userDetails.getUsername())) {
            throw new RuntimeException("Username already exists: " + userDetails.getUsername());
        }
        
        // Check for duplicate email (excluding current user)
        if (!user.getEmail().equals(userDetails.getEmail()) && 
            userRepository.existsByEmail(userDetails.getEmail())) {
            throw new RuntimeException("Email already exists: " + userDetails.getEmail());
        }
        
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setPhone(userDetails.getPhone());
        user.setAddress(userDetails.getAddress());
        user.setDateOfBirth(userDetails.getDateOfBirth());
        user.setProfileImageUrl(userDetails.getProfileImageUrl());
        user.setProfileImagePath(userDetails.getProfileImagePath());
        user.setRole(userDetails.getRole());
        user.setDealer(userDetails.getDealer());
        user.setRoleString(userDetails.getRoleString());
        user.setIsActive(userDetails.getIsActive());
        
        return userRepository.save(user);
    }
    
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        userRepository.delete(user);
    }
    
    public void deactivateUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setIsActive(false);
        userRepository.save(user);
    }
    
    public List<UserRole> getAllRoles() {
        return userRoleRepository.findAll();
    }
    
    public Optional<UserRole> getRoleById(Integer roleId) {
        return userRoleRepository.findById(roleId);
    }
    
    public Optional<UserRole> getRoleByName(String roleName) {
        return userRoleRepository.findByRoleName(roleName);
    }
    
    public UserRole createRole(UserRole role) {
        if (userRoleRepository.existsByRoleName(role.getRoleName())) {
            throw new RuntimeException("Role already exists: " + role.getRoleName());
        }
        return userRoleRepository.save(role);
    }
    
    // Password Management methods
    public String resetUserPassword(UUID userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        String passwordToSet = (newPassword != null && !newPassword.trim().isEmpty()) 
                ? newPassword 
                : "password123"; // Default password
        
        String hashedPassword = passwordEncoder.encode(passwordToSet);
        user.setPasswordHash(hashedPassword);
        userRepository.save(user);
        
        return "Password reset successfully for user: " + user.getUsername() + 
               (newPassword != null ? " with custom password" : " with default password");
    }
    
    public String resetUserPasswordByUsername(String username, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        
        String passwordToSet = (newPassword != null && !newPassword.trim().isEmpty()) 
                ? newPassword 
                : "password123"; // Default password
        
        String hashedPassword = passwordEncoder.encode(passwordToSet);
        user.setPasswordHash(hashedPassword);
        userRepository.save(user);
        
        return "Password reset successfully for user: " + username + 
               (newPassword != null ? " with custom password" : " with default password");
    }
    
    public String resetUserPasswordByEmail(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        String passwordToSet = (newPassword != null && !newPassword.trim().isEmpty()) 
                ? newPassword 
                : "password123"; // Default password
        
        String hashedPassword = passwordEncoder.encode(passwordToSet);
        user.setPasswordHash(hashedPassword);
        userRepository.save(user);
        
        return "Password reset successfully for user: " + user.getUsername() + 
               " (email: " + email + ")" +
               (newPassword != null ? " with custom password" : " with default password");
    }
    
    public Map<String, Object> bulkResetPasswords(List<UUID> userIds) {
        Map<String, Object> result = new HashMap<>();
        List<String> successList = new ArrayList<>();
        List<String> errorList = new ArrayList<>();
        
        for (UUID userId : userIds) {
            try {
                String message = resetUserPassword(userId, null); // Use default password
                successList.add(message);
            } catch (Exception e) {
                errorList.add("Failed to reset password for user ID " + userId + ": " + e.getMessage());
            }
        }
        
        result.put("totalRequested", userIds.size());
        result.put("successful", successList.size());
        result.put("failed", errorList.size());
        result.put("successList", successList);
        result.put("errorList", errorList);
        
        return result;
    }
}

