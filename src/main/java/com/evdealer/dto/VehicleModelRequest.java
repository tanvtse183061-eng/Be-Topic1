package com.evdealer.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Vehicle model request DTO for model management")
public class VehicleModelRequest {
    
    @Schema(description = "Brand ID", example = "1", required = true)
    private Integer brandId;
    
    @Schema(description = "Model name", example = "Model 3", required = true)
    private String modelName;
    
    @Schema(description = "Model year", example = "2024")
    private Integer modelYear;
    
    @Schema(description = "Vehicle type", example = "sedan", allowableValues = {"sedan", "suv", "hatchback", "coupe", "truck"})
    private String vehicleType;
    
    @Schema(description = "Body style", example = "4-door sedan")
    private String bodyStyle;
    
    @Schema(description = "Seating capacity", example = "5")
    private Integer seatingCapacity;
    
    @Schema(description = "Description", example = "Electric sedan with autopilot")
    private String description;
    
    @Schema(description = "Image URL", example = "https://example.com/model3.jpg")
    private String imageUrl;
    
    @Schema(description = "Is active", example = "true")
    private Boolean isActive;
    
    @Schema(description = "Notes", example = "Best selling model")
    private String notes;
    
    // Constructors
    public VehicleModelRequest() {}
    
    public VehicleModelRequest(Integer brandId, String modelName, Integer modelYear) {
        this.brandId = brandId;
        this.modelName = modelName;
        this.modelYear = modelYear;
    }
    
    // Getters and Setters
    public Integer getBrandId() {
        return brandId;
    }
    
    public void setBrandId(Integer brandId) {
        this.brandId = brandId;
    }
    
    public String getModelName() {
        return modelName;
    }
    
    public void setModelName(String modelName) {
        this.modelName = modelName;
    }
    
    public Integer getModelYear() {
        return modelYear;
    }
    
    public void setModelYear(Integer modelYear) {
        this.modelYear = modelYear;
    }
    
    public String getVehicleType() {
        return vehicleType;
    }
    
    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }
    
    public String getBodyStyle() {
        return bodyStyle;
    }
    
    public void setBodyStyle(String bodyStyle) {
        this.bodyStyle = bodyStyle;
    }
    
    public Integer getSeatingCapacity() {
        return seatingCapacity;
    }
    
    public void setSeatingCapacity(Integer seatingCapacity) {
        this.seatingCapacity = seatingCapacity;
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
