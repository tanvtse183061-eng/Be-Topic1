package com.evdealer.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicle_colors")
public class VehicleColor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "color_id")
    private Integer colorId;
    
    @Column(name = "color_name", nullable = false, length = 100)
    private String colorName;
    
    @Column(name = "color_code", length = 20)
    private String colorCode;
    
    @Column(name = "color_swatch_url", length = 500)
    private String colorSwatchUrl;
    
    @Column(name = "color_swatch_path", length = 500)
    private String colorSwatchPath;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    // Constructors
    public VehicleColor() {}
    
    public VehicleColor(String colorName, String colorCode) {
        this.colorName = colorName;
        this.colorCode = colorCode;
    }
    
    // Getters and Setters
    public Integer getColorId() {
        return colorId;
    }
    
    public void setColorId(Integer colorId) {
        this.colorId = colorId;
    }
    
    public String getColorName() {
        return colorName;
    }
    
    public void setColorName(String colorName) {
        this.colorName = colorName;
    }
    
    public String getColorCode() {
        return colorCode;
    }
    
    public void setColorCode(String colorCode) {
        this.colorCode = colorCode;
    }
    
    public String getColorSwatchUrl() {
        return colorSwatchUrl;
    }
    
    public void setColorSwatchUrl(String colorSwatchUrl) {
        this.colorSwatchUrl = colorSwatchUrl;
    }
    
    public String getColorSwatchPath() {
        return colorSwatchPath;
    }
    
    public void setColorSwatchPath(String colorSwatchPath) {
        this.colorSwatchPath = colorSwatchPath;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}

