package com.evdealer.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Vehicle color request DTO for color management")
public class VehicleColorRequest {
    
    @Schema(description = "Color name", example = "Pearl White Multi-Coat", required = true)
    private String colorName;
    
    @Schema(description = "Color code", example = "#FFFFFF")
    private String colorCode;
    
    @Schema(description = "Color type", example = "standard", allowableValues = {"standard", "premium", "special"})
    private String colorType;
    
    @Schema(description = "Price adjustment", example = "0")
    private BigDecimal priceAdjustment;
    
    @Schema(description = "Description", example = "Premium white color with multi-coat finish")
    private String description;
    
    @Schema(description = "Image URL", example = "https://example.com/white-color.jpg")
    private String imageUrl;
    
    @Schema(description = "Is available", example = "true")
    private Boolean isAvailable;
    
    @Schema(description = "Notes", example = "Most popular color choice")
    private String notes;
    
    // Constructors
    public VehicleColorRequest() {}
    
    public VehicleColorRequest(String colorName, String colorCode) {
        this.colorName = colorName;
        this.colorCode = colorCode;
    }
    
    // Getters and Setters
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
    
    public String getColorType() {
        return colorType;
    }
    
    public void setColorType(String colorType) {
        this.colorType = colorType;
    }
    
    public BigDecimal getPriceAdjustment() {
        return priceAdjustment;
    }
    
    public void setPriceAdjustment(BigDecimal priceAdjustment) {
        this.priceAdjustment = priceAdjustment;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public Boolean getIsAvailable() {
        return isAvailable;
    }
    
    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}
