package com.evdealer.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_roles")
public class UserRole {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Integer roleId;
    
    @Column(name = "role_name", nullable = false, unique = true, length = 50)
    private String roleName;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "permissions", nullable = false, length = 4000)
    private String permissions = "{}";
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Constructors
    public UserRole() {}
    
    public UserRole(String roleName, String description, String permissions) {
        this.roleName = roleName;
        this.description = description;
        this.permissions = permissions;
    }
    
    // Getters and Setters
    public Integer getRoleId() {
        return roleId;
    }
    
    public void setRoleId(Integer roleId) {
        this.roleId = roleId;
    }
    
    public String getRoleName() {
        return roleName;
    }
    
    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getPermissions() {
        return permissions;
    }
    
    public void setPermissions(String permissions) {
        this.permissions = permissions;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserRole that = (UserRole) o;
        return java.util.Objects.equals(roleId, that.roleId);
    }

    @Override
    public int hashCode() {
        return roleId != null ? roleId.hashCode() : 0;
    }
}

