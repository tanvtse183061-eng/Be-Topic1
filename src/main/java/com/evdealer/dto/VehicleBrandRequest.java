package com.evdealer.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Vehicle brand request DTO for brand management")
public class VehicleBrandRequest {
    
    @Schema(description = "Brand name", example = "Tesla", required = true)
    private String brandName;
    
    @Schema(description = "Brand description", example = "Electric vehicle manufacturer")
    private String description;
    
    @Schema(description = "Country of origin", example = "USA")
    private String country;
    
    @Schema(description = "Founded year", example = "2003")
    private Integer foundedYear;
    
    @Schema(description = "Website", example = "https://www.tesla.com")
    private String website;
    
    @Schema(description = "Logo URL", example = "https://example.com/tesla-logo.png")
    private String logoUrl;
    
    @Schema(description = "Is active", example = "true")
    private Boolean isActive;
    
    @Schema(description = "Notes", example = "Leading EV manufacturer")
    private String notes;
    
    // Constructors
    public VehicleBrandRequest() {}
    
    public VehicleBrandRequest(String brandName, String description) {
        this.brandName = brandName;
        this.description = description;
    }
    
    // Getters and Setters
    public String getBrandName() {
        return brandName;
    }
    
    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
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
    
    public String getWebsite() {
        return website;
    }
    
    public void setWebsite(String website) {
        this.website = website;
    }
    
    public String getLogoUrl() {
        return logoUrl;
    }
    
    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}
