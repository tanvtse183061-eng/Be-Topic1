package com.evdealer.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Vehicle variant request DTO for variant management")
public class VehicleVariantRequest {
    
    @Schema(description = "Model ID", example = "1", required = true)
    private Integer modelId;
    
    @Schema(description = "Variant name", example = "Long Range", required = true)
    private String variantName;
    
    @Schema(description = "Base price", example = "1200000000", required = true)
    private BigDecimal basePrice;
    
    @Schema(description = "Engine type", example = "electric")
    private String engineType;
    
    @Schema(description = "Power output (kW)", example = "283")
    private Integer powerOutput;
    
    @Schema(description = "Torque (Nm)", example = "440")
    private Integer torque;
    
    @Schema(description = "Acceleration 0-100 km/h (seconds)", example = "4.4")
    private BigDecimal acceleration;
    
    @Schema(description = "Top speed (km/h)", example = "225")
    private Integer topSpeed;
    
    @Schema(description = "Range (km)", example = "560")
    private Integer range;
    
    @Schema(description = "Battery capacity (kWh)", example = "75")
    private Integer batteryCapacity;
    
    @Schema(description = "Charging time (hours)", example = "8")
    private BigDecimal chargingTime;
    
    @Schema(description = "Weight (kg)", example = "1847")
    private Integer weight;
    
    @Schema(description = "Length (mm)", example = "4694")
    private Integer length;
    
    @Schema(description = "Width (mm)", example = "1850")
    private Integer width;
    
    @Schema(description = "Height (mm)", example = "1443")
    private Integer height;
    
    @Schema(description = "Wheelbase (mm)", example = "2875")
    private Integer wheelbase;
    
    @Schema(description = "Description", example = "Long range variant with extended battery")
    private String description;
    
    @Schema(description = "Is active", example = "true")
    private Boolean isActive;
    
    @Schema(description = "Notes", example = "Most popular variant")
    private String notes;
    
    // Constructors
    public VehicleVariantRequest() {}
    
    public VehicleVariantRequest(Integer modelId, String variantName, BigDecimal basePrice) {
        this.modelId = modelId;
        this.variantName = variantName;
        this.basePrice = basePrice;
    }
    
    // Getters and Setters
    public Integer getModelId() {
        return modelId;
    }
    
    public void setModelId(Integer modelId) {
        this.modelId = modelId;
    }
    
    public String getVariantName() {
        return variantName;
    }
    
    public void setVariantName(String variantName) {
        this.variantName = variantName;
    }
    
    public BigDecimal getBasePrice() {
        return basePrice;
    }
    
    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }
    
    public String getEngineType() {
        return engineType;
    }
    
    public void setEngineType(String engineType) {
        this.engineType = engineType;
    }
    
    public Integer getPowerOutput() {
        return powerOutput;
    }
    
    public void setPowerOutput(Integer powerOutput) {
        this.powerOutput = powerOutput;
    }
    
    public Integer getTorque() {
        return torque;
    }
    
    public void setTorque(Integer torque) {
        this.torque = torque;
    }
    
    public BigDecimal getAcceleration() {
        return acceleration;
    }
    
    public void setAcceleration(BigDecimal acceleration) {
        this.acceleration = acceleration;
    }
    
    public Integer getTopSpeed() {
        return topSpeed;
    }
    
    public void setTopSpeed(Integer topSpeed) {
        this.topSpeed = topSpeed;
    }
    
    public Integer getRange() {
        return range;
    }
    
    public void setRange(Integer range) {
        this.range = range;
    }
    
    public Integer getBatteryCapacity() {
        return batteryCapacity;
    }
    
    public void setBatteryCapacity(Integer batteryCapacity) {
        this.batteryCapacity = batteryCapacity;
    }
    
    public BigDecimal getChargingTime() {
        return chargingTime;
    }
    
    public void setChargingTime(BigDecimal chargingTime) {
        this.chargingTime = chargingTime;
    }
    
    public Integer getWeight() {
        return weight;
    }
    
    public void setWeight(Integer weight) {
        this.weight = weight;
    }
    
    public Integer getLength() {
        return length;
    }
    
    public void setLength(Integer length) {
        this.length = length;
    }
    
    public Integer getWidth() {
        return width;
    }
    
    public void setWidth(Integer width) {
        this.width = width;
    }
    
    public Integer getHeight() {
        return height;
    }
    
    public void setHeight(Integer height) {
        this.height = height;
    }
    
    public Integer getWheelbase() {
        return wheelbase;
    }
    
    public void setWheelbase(Integer wheelbase) {
        this.wheelbase = wheelbase;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
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
