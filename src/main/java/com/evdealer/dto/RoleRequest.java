package com.evdealer.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Role request DTO for role management")
public class RoleRequest {
    
    @Schema(description = "Role name", example = "ADMIN", required = true)
    private String roleName;
    
    @Schema(description = "Role description", example = "Administrator role with full access")
    private String description;
    
    @Schema(description = "Role permissions as JSON string (optional - will be auto-generated based on role name)", example = "{\"users\":[\"read\",\"write\",\"delete\"],\"roles\":[\"read\",\"write\"]}")
    private String permissions;
    
    // Constructors
    public RoleRequest() {}
    
    public RoleRequest(String roleName, String description, String permissions) {
        this.roleName = roleName;
        this.description = description;
        this.permissions = permissions;
    }
    
    // Getters and Setters
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
}
