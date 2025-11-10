package com.evdealer.controller.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_brands")
public class VehicleBrand {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "brand_id")
    private Integer brandId;
    
    @Column(name = "brand_name", nullable = false, unique = true, length = 100)
    private String brandName;
    
    @Column(name = "country", length = 100)
    private String country;
    
    @Column(name = "founded_year")
    private Integer foundedYear;
    
    @Column(name = "brand_logo_url", length = 500)
    private String brandLogoUrl;
    
    @Column(name = "brand_logo_path", length = 500)
    private String brandLogoPath;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Constructors
    public VehicleBrand() {}
    
    public VehicleBrand(String brandName, String country, Integer foundedYear) {
        this.brandName = brandName;
        this.country = country;
        this.foundedYear = foundedYear;
    }
    
    // Getters and Setters
    public Integer getBrandId() {
        return brandId;
    }
    
    public void setBrandId(Integer brandId) {
        this.brandId = brandId;
    }
    
    public String getBrandName() {
        return brandName;
    }
    
    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }
    
    public String getCountry() {
        return country;
    }
    
    public void setCountry(String country) {
        this.country = country;
    }
    
    public Integer getFoundedYear() {
        return foundedYear;
    }
    
    public void setFoundedYear(Integer foundedYear) {
        this.foundedYear = foundedYear;
    }
    
    public String getBrandLogoUrl() {
        return brandLogoUrl;
    }
    
    public void setBrandLogoUrl(String brandLogoUrl) {
        this.brandLogoUrl = brandLogoUrl;
    }
    
    public String getBrandLogoPath() {
        return brandLogoPath;
    }
    
    public void setBrandLogoPath(String brandLogoPath) {
        this.brandLogoPath = brandLogoPath;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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
        VehicleBrand that = (VehicleBrand) o;
        return java.util.Objects.equals(brandId, that.brandId);
    }

    @Override
    public int hashCode() {
        return brandId != null ? brandId.hashCode() : 0;
    }
}

