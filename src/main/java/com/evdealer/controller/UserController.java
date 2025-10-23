package com.evdealer.controller;

import com.evdealer.dto.UserRequest;
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

import java.util.List;
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
    public ResponseEntity<User> createUserFromRequest(@RequestBody UserRequest request) {
        try {
            User createdUser = userService.createUserFromRequest(request);
            // Remove password hash from response for security
            createdUser.setPasswordHash(null);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{userId}")
    @Operation(summary = "Cập nhật người dùng", description = "Cập nhật thông tin người dùng")
    public ResponseEntity<User> updateUser(@PathVariable UUID userId, @RequestBody User userDetails) {
        try {
            User updatedUser = userService.updateUser(userId, userDetails);
            // Remove password hash from response for security
            updatedUser.setPasswordHash(null);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{userId}")
    @Operation(summary = "Xóa người dùng", description = "Xóa người dùng")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
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
    @Operation(summary = "Tạo vai trò mới", description = "Tạo vai trò mới")
    public ResponseEntity<UserRole> createRole(@RequestBody UserRole role) {
        try {
            UserRole createdRole = userService.createRole(role);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRole);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
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

