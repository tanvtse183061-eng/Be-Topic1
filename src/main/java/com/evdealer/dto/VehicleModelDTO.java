package com.evdealer.dto;

public class VehicleModelDTO {
    private Integer modelId;
    private Integer brandId;
    private String modelName;
    private Integer modelYear;
    private String vehicleType;
    private String modelImageUrl;
    private String modelImagePath;

    public Integer getModelId() { return modelId; }
    public void setModelId(Integer modelId) { this.modelId = modelId; }
    public Integer getBrandId() { return brandId; }
    public void setBrandId(Integer brandId) { this.brandId = brandId; }
    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }
    public Integer getModelYear() { return modelYear; }
    public void setModelYear(Integer modelYear) { this.modelYear = modelYear; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    public String getModelImageUrl() { return modelImageUrl; }
    public void setModelImageUrl(String modelImageUrl) { this.modelImageUrl = modelImageUrl; }
    public String getModelImagePath() { return modelImagePath; }
    public void setModelImagePath(String modelImagePath) { this.modelImagePath = modelImagePath; }
}


