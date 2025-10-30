package com.evdealer.controller;

import com.evdealer.dto.UserRequest;
import com.evdealer.dto.UserUpdateRequest;
import com.evdealer.dto.RoleRequest;
import com.evdealer.entity.User;
import com.evdealer.entity.UserRole;
import com.evdealer.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@Tag(name = "User Management", description = "APIs quản lý người dùng và vai trò")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // User endpoints
    @GetMapping
    @Operation(summary = "Lấy danh sách người dùng", description = "Lấy tất cả người dùng trong hệ thống")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        // Remove password hash from all users for security
        users.forEach(user -> user.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/active")
    @Operation(summary = "Lấy người dùng đang hoạt động", description = "Lấy danh sách người dùng đang hoạt động")
    public ResponseEntity<List<User>> getActiveUsers() {
        List<User> users = userService.getActiveUsers();
        // Remove password hash from all users for security
        users.forEach(user -> user.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/{userId}")
    @Operation(summary = "Lấy người dùng theo ID", description = "Lấy thông tin người dùng theo ID")
    public ResponseEntity<User> getUserById(@PathVariable @Parameter(description = "User ID") UUID userId) {
        return userService.getUserById(userId)
                .map(user -> {
                    // Remove password hash for security
                    user.setPasswordHash(null);
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/username/{username}")
    @Operation(summary = "Lấy người dùng theo tên đăng nhập", description = "Lấy thông tin người dùng theo tên đăng nhập")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        return userService.getUserByUsername(username)
                .map(user -> {
                    // Remove password hash for security
                    user.setPasswordHash(null);
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/email/{email}")
    @Operation(summary = "Lấy người dùng theo email", description = "Lấy thông tin người dùng theo email")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email)
                .map(user -> {
                    // Remove password hash for security
                    user.setPasswordHash(null);
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/role/{roleName}")
    @Operation(summary = "Lấy người dùng theo vai trò", description = "Lấy danh sách người dùng theo vai trò")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String roleName) {
        List<User> users = userService.getUsersByRole(roleName);
        // Remove password hash from all users for security
        users.forEach(user -> user.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/dealer/{dealerId}")
    @Operation(summary = "Lấy người dùng theo đại lý", description = "Lấy danh sách người dùng thuộc một đại lý cụ thể")
    public ResponseEntity<List<User>> getUsersByDealer(@PathVariable UUID dealerId) {
        List<User> users = userService.getUsersByDealer(dealerId);
        // Remove password hash from all users for security
        users.forEach(user -> user.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/role-string/{roleString}")
    @Operation(summary = "Lấy người dùng theo role string", description = "Lấy danh sách người dùng theo role string (DEALER_STAFF, DEALER_MANAGER, EVM_STAFF, ADMIN)")
    public ResponseEntity<List<User>> getUsersByRoleString(@PathVariable String roleString) {
        List<User> users = userService.getUsersByRoleString(roleString);
        // Remove password hash from all users for security
        users.forEach(user -> user.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/dealer-staff")
    @Operation(summary = "Lấy nhân viên đại lý", description = "Lấy danh sách tất cả nhân viên đại lý")
    public ResponseEntity<List<User>> getDealerStaff() {
        List<User> users = userService.getUsersByRoleString("DEALER_STAFF");
        // Remove password hash from all users for security
        users.forEach(user -> user.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/dealer-managers")
    @Operation(summary = "Lấy quản lý đại lý", description = "Lấy danh sách tất cả quản lý đại lý")
    public ResponseEntity<List<User>> getDealerManagers() {
        List<User> users = userService.getUsersByRoleString("DEALER_MANAGER");
        // Remove password hash from all users for security
        users.forEach(user -> user.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/evm-staff")
    @Operation(summary = "Lấy nhân viên EVM", description = "Lấy danh sách tất cả nhân viên EVM")
    public ResponseEntity<List<User>> getEvmStaff() {
        List<User> users = userService.getUsersByRoleString("EVM_STAFF");
        // Remove password hash from all users for security
        users.forEach(user -> user.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/admins")
    @Operation(summary = "Lấy quản trị viên", description = "Lấy danh sách tất cả quản trị viên")
    public ResponseEntity<List<User>> getAdmins() {
        List<User> users = userService.getUsersByRoleString("ADMIN");
        // Remove password hash from all users for security
        users.forEach(user -> user.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm người dùng", description = "Tìm kiếm người dùng theo tên")
    public ResponseEntity<List<User>> searchUsersByName(@RequestParam String name) {
        List<User> users = userService.searchUsersByName(name);
        // Remove password hash from all users for security
        users.forEach(user -> user.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }
    
    @PostMapping
    @Operation(summary = "Tạo người dùng mới", description = "Tạo người dùng mới")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            User createdUser = userService.createUser(user);
            // Remove password hash from response for security
            createdUser.setPasswordHash(null);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/dto")
    @Operation(summary = "Tạo người dùng mới từ DTO", description = "Tạo người dùng mới từ UserRequest DTO")
    public ResponseEntity<?> createUserFromRequest(@RequestBody UserRequest request) {
        try {
            User createdUser = userService.createUserFromRequest(request);
            // Remove password hash from response for security
            createdUser.setPasswordHash(null);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User creation failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PutMapping("/{userId}")
    @Operation(summary = "Cập nhật người dùng", description = "Cập nhật thông tin người dùng")
    public ResponseEntity<?> updateUser(@PathVariable UUID userId, @RequestBody UserUpdateRequest userUpdateRequest) {
        try {
            // Log incoming data for debugging
            System.out.println("=== UPDATE USER DEBUG ===");
            System.out.println("User ID: " + userId);
            System.out.println("Username: " + userUpdateRequest.getUsername());
            System.out.println("Email: " + userUpdateRequest.getEmail());
            System.out.println("User Type: " + userUpdateRequest.getUserType());
            System.out.println("Status: " + userUpdateRequest.getStatus());
            System.out.println("Is Active: " + userUpdateRequest.getIsActive());
            System.out.println("=========================");
            
            User updatedUser = userService.updateUser(userId, userUpdateRequest);
            // Remove password hash from response for security
            updatedUser.setPasswordHash(null);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            System.err.println("Error updating user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error updating user: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error updating user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{userId}")
    @Operation(summary = "Xóa người dùng", description = "Xóa người dùng")
    public ResponseEntity<?> deleteUser(@PathVariable UUID userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User deletion failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PutMapping("/{userId}/deactivate")
    @Operation(summary = "Vô hiệu hóa người dùng", description = "Vô hiệu hóa người dùng")
    public ResponseEntity<Void> deactivateUser(@PathVariable UUID userId) {
        try {
            userService.deactivateUser(userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // User Role endpoints
    @GetMapping("/roles")
    @Operation(summary = "Lấy danh sách vai trò", description = "Lấy tất cả vai trò")
    public ResponseEntity<List<UserRole>> getAllRoles() {
        List<UserRole> roles = userService.getAllRoles();
        return ResponseEntity.ok(roles);
    }
    
    @GetMapping("/roles/{roleId}")
    @Operation(summary = "Lấy vai trò theo ID", description = "Lấy thông tin vai trò theo ID")
    public ResponseEntity<UserRole> getRoleById(@PathVariable Integer roleId) {
        return userService.getRoleById(roleId)
                .map(role -> ResponseEntity.ok(role))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/roles/name/{roleName}")
    @Operation(summary = "Lấy vai trò theo tên", description = "Lấy thông tin vai trò theo tên")
    public ResponseEntity<UserRole> getRoleByName(@PathVariable String roleName) {
        return userService.getRoleByName(roleName)
                .map(role -> ResponseEntity.ok(role))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/roles")
    @Operation(summary = "Tạo vai trò mới", description = "Tạo vai trò mới (permissions sẽ được tự động tạo dựa trên role name)")
    public ResponseEntity<?> createRole(@RequestBody RoleRequest roleRequest) {
        try {
            UserRole role = new UserRole();
            role.setRoleName(roleRequest.getRoleName());
            role.setDescription(roleRequest.getDescription());
            // Permissions sẽ được tự động tạo trong service
            
            UserRole createdRole = userService.createRole(role);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRole);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error creating role: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error: " + e.getMessage());
        }
    }
    
    @PutMapping("/roles/{roleId}")
    @Operation(summary = "Cập nhật vai trò", description = "Cập nhật thông tin vai trò (permissions sẽ được tự động cập nhật dựa trên role name)")
    public ResponseEntity<?> updateRole(@PathVariable Integer roleId, @RequestBody RoleRequest roleRequest) {
        try {
            // Log incoming data for debugging
            System.out.println("=== ROLE UPDATE CONTROLLER DEBUG ===");
            System.out.println("Role ID: " + roleId);
            System.out.println("Role Name: " + roleRequest.getRoleName());
            System.out.println("Description: " + roleRequest.getDescription());
            System.out.println("=====================================");
            
            UserRole roleDetails = new UserRole();
            roleDetails.setRoleName(roleRequest.getRoleName());
            roleDetails.setDescription(roleRequest.getDescription());
            // Permissions sẽ được tự động tạo trong service dựa trên role name
            
            UserRole updatedRole = userService.updateRole(roleId, roleDetails);
            return ResponseEntity.ok(updatedRole);
        } catch (RuntimeException e) {
            System.err.println("Error updating role: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error updating role: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error updating role: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/roles/{roleId}")
    @Operation(summary = "Xóa vai trò", description = "Xóa vai trò")
    public ResponseEntity<?> deleteRole(@PathVariable Integer roleId) {
        try {
            userService.deleteRole(roleId);
            return ResponseEntity.ok().body("Role deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error deleting role: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal server error: " + e.getMessage());
        }
    }
    
    @GetMapping("/roles/test/{roleId}")
    @Operation(summary = "Test role update", description = "Test role update functionality")
    public ResponseEntity<?> testRoleUpdate(@PathVariable Integer roleId) {
        try {
            // Test getting role first
            Optional<UserRole> roleOpt = userService.getRoleById(roleId);
            if (!roleOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            UserRole role = roleOpt.get();
            System.out.println("=== TEST ROLE DEBUG ===");
            System.out.println("Role ID: " + role.getRoleId());
            System.out.println("Role Name: " + role.getRoleName());
            System.out.println("Description: " + role.getDescription());
            System.out.println("Permissions: " + role.getPermissions());
            System.out.println("======================");
            
            return ResponseEntity.ok(role);
        } catch (Exception e) {
            System.err.println("Error testing role: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error testing role: " + e.getMessage());
        }
    }
    
    // Password Management endpoints
    @PostMapping("/{userId}/reset-password")
    @Operation(summary = "Đặt lại mật khẩu người dùng", description = "Quản trị viên có thể đặt lại mật khẩu cho người dùng")
    public ResponseEntity<?> resetUserPassword(
            @PathVariable @Parameter(description = "User ID") UUID userId,
            @RequestParam(required = false) String newPassword) {
        try {
            String result = userService.resetUserPassword(userId, newPassword);
            return ResponseEntity.ok().body(java.util.Map.of("message", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/username/{username}/reset-password")
    @Operation(summary = "Đặt lại mật khẩu theo tên đăng nhập", description = "Quản trị viên có thể đặt lại mật khẩu theo tên đăng nhập")
    public ResponseEntity<?> resetUserPasswordByUsername(
            @PathVariable @Parameter(description = "Username") String username,
            @RequestParam(required = false) String newPassword) {
        try {
            String result = userService.resetUserPasswordByUsername(username, newPassword);
            return ResponseEntity.ok().body(java.util.Map.of("message", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/email/{email}/reset-password")
    @Operation(summary = "Đặt lại mật khẩu theo email", description = "Quản trị viên có thể đặt lại mật khẩu theo email")
    public ResponseEntity<?> resetUserPasswordByEmail(
            @PathVariable @Parameter(description = "Email") String email,
            @RequestParam(required = false) String newPassword) {
        try {
            String result = userService.resetUserPasswordByEmail(email, newPassword);
            return ResponseEntity.ok().body(java.util.Map.of("message", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/bulk-reset-password")
    @Operation(summary = "Đặt lại mật khẩu hàng loạt", description = "Quản trị viên có thể đặt lại mật khẩu cho nhiều người dùng")
    public ResponseEntity<?> bulkResetPasswords(@RequestBody java.util.List<UUID> userIds) {
        try {
            java.util.Map<String, Object> result = userService.bulkResetPasswords(userIds);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}

