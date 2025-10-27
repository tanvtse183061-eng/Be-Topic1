package com.evdealer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Request để tạo xe mới dựa trên dữ liệu có sẵn")
public class CreateVehicleFromExistingRequest {
    
    // ==================== EXISTING DATA SELECTION ====================
    @Schema(description = "ID thương hiệu có sẵn", example = "1", required = true)
    private Integer brandId;
    
    @Schema(description = "ID mẫu xe có sẵn", example = "1", required = true)
    private Integer modelId;
    
    @Schema(description = "ID màu xe có sẵn", example = "1", required = true)
    private Integer colorId;
    
    @Schema(description = "ID kho chứa xe có sẵn", example = "123e4567-e89b-12d3-a456-426614174000", required = true)
    private String warehouseId;
    
    // ==================== NEW VARIANT INFORMATION ====================
    @Schema(description = "Tên phiên bản xe mới", example = "Performance Edition", required = true)
    private String variantName;
    
    @Schema(description = "Giá bán cơ bản", example = "1800000000", required = true)
    private BigDecimal priceBase;
    
    @Schema(description = "Dung lượng pin (kWh)", example = "82")
    private Integer batteryCapacity;
    
    @Schema(description = "Tầm hoạt động (km)", example = "560")
    private Integer rangeKm;
    
    @Schema(description = "Công suất động cơ (kW)", example = "340")
    private Integer powerKw;
    
    @Schema(description = "Thời gian tăng tốc 0-100km/h (giây)", example = "4.2")
    private Double acceleration0100;
    
    @Schema(description = "Tốc độ tối đa (km/h)", example = "261")
    private Integer topSpeed;
    
    @Schema(description = "Thời gian sạc nhanh (phút)", example = "25")
    private Integer chargingTimeFast;
    
    @Schema(description = "Thời gian sạc chậm (giờ)", example = "7")
    private Integer chargingTimeSlow;
    
    @Schema(description = "Hình ảnh phiên bản xe (file upload)")
    private MultipartFile variantImage;
    
    // ==================== NEW INVENTORY INFORMATION ====================
    @Schema(description = "Số VIN của xe", example = "1HGBH41JXMN109186", required = true)
    private String vin;
    
    @Schema(description = "Số khung xe", example = "CHASSIS123456")
    private String chassisNumber;
    
    @Schema(description = "Giá bán thực tế", example = "1850000000")
    private BigDecimal sellingPrice;
    
    @Schema(description = "Trạng thái xe", example = "AVAILABLE", allowableValues = {"AVAILABLE", "SOLD", "RESERVED", "MAINTENANCE"})
    private String status;
    
    @Schema(description = "Vị trí cụ thể trong kho", example = "A-01-15", required = true)
    private String warehouseLocation;
    
    @Schema(description = "Ghi chú về xe")
    private String notes;
    
    // ==================== VEHICLE IMAGES ====================
    @Schema(description = "Hình ảnh chính của xe (file upload)")
    private List<MultipartFile> mainImages;
    
    @Schema(description = "Hình ảnh nội thất (file upload)")
    private List<MultipartFile> interiorImages;
    
    @Schema(description = "Hình ảnh ngoại thất (file upload)")
    private List<MultipartFile> exteriorImages;
    
    // ==================== CONSTRUCTORS ====================
    
    public CreateVehicleFromExistingRequest() {}
    
    // ==================== GETTERS AND SETTERS ====================
    
    // Existing Data Selection
    public Integer getBrandId() { return brandId; }
    public void setBrandId(Integer brandId) { this.brandId = brandId; }
    
    public Integer getModelId() { return modelId; }
    public void setModelId(Integer modelId) { this.modelId = modelId; }
    
    public Integer getColorId() { return colorId; }
    public void setColorId(Integer colorId) { this.colorId = colorId; }
    
    public String getWarehouseId() { return warehouseId; }
    public void setWarehouseId(String warehouseId) { this.warehouseId = warehouseId; }
    
    // New Variant Information
    public String getVariantName() { return variantName; }
    public void setVariantName(String variantName) { this.variantName = variantName; }
    
    public BigDecimal getPriceBase() { return priceBase; }
    public void setPriceBase(BigDecimal priceBase) { this.priceBase = priceBase; }
    
    public Integer getBatteryCapacity() { return batteryCapacity; }
    public void setBatteryCapacity(Integer batteryCapacity) { this.batteryCapacity = batteryCapacity; }
    
    public Integer getRangeKm() { return rangeKm; }
    public void setRangeKm(Integer rangeKm) { this.rangeKm = rangeKm; }
    
    public Integer getPowerKw() { return powerKw; }
    public void setPowerKw(Integer powerKw) { this.powerKw = powerKw; }
    
    public Double getAcceleration0100() { return acceleration0100; }
    public void setAcceleration0100(Double acceleration0100) { this.acceleration0100 = acceleration0100; }
    
    public Integer getTopSpeed() { return topSpeed; }
    public void setTopSpeed(Integer topSpeed) { this.topSpeed = topSpeed; }
    
    public Integer getChargingTimeFast() { return chargingTimeFast; }
    public void setChargingTimeFast(Integer chargingTimeFast) { this.chargingTimeFast = chargingTimeFast; }
    
    public Integer getChargingTimeSlow() { return chargingTimeSlow; }
    public void setChargingTimeSlow(Integer chargingTimeSlow) { this.chargingTimeSlow = chargingTimeSlow; }
    
    public MultipartFile getVariantImage() { return variantImage; }
    public void setVariantImage(MultipartFile variantImage) { this.variantImage = variantImage; }
    
    // New Inventory Information
    public String getVin() { return vin; }
    public void setVin(String vin) { this.vin = vin; }
    
    public String getChassisNumber() { return chassisNumber; }
    public void setChassisNumber(String chassisNumber) { this.chassisNumber = chassisNumber; }
    
    public BigDecimal getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getWarehouseLocation() { return warehouseLocation; }
    public void setWarehouseLocation(String warehouseLocation) { this.warehouseLocation = warehouseLocation; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    // Vehicle Images
    public List<MultipartFile> getMainImages() { return mainImages; }
    public void setMainImages(List<MultipartFile> mainImages) { this.mainImages = mainImages; }
    
    public List<MultipartFile> getInteriorImages() { return interiorImages; }
    public void setInteriorImages(List<MultipartFile> interiorImages) { this.interiorImages = interiorImages; }
    
    public List<MultipartFile> getExteriorImages() { return exteriorImages; }
    public void setExteriorImages(List<MultipartFile> exteriorImages) { this.exteriorImages = exteriorImages; }
}
