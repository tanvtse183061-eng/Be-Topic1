package com.evdealer.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Response sau khi tạo xe mới thành công")
public class CreateVehicleResponse {
    
    @Schema(description = "Trạng thái thành công", example = "true")
    private boolean success;
    
    @Schema(description = "Thông báo", example = "Vehicle created successfully")
    private String message;
    
    // ==================== CREATED ENTITIES ====================
    
    @Schema(description = "Thông tin thương hiệu đã tạo")
    private BrandInfo brand;
    
    @Schema(description = "Thông tin mẫu xe đã tạo")
    private ModelInfo model;
    
    @Schema(description = "Thông tin phiên bản xe đã tạo")
    private VariantInfo variant;
    
    @Schema(description = "Thông tin màu xe đã tạo")
    private ColorInfo color;
    
    @Schema(description = "Thông tin xe trong kho đã tạo")
    private InventoryInfo inventory;
    
    // ==================== UPLOADED IMAGES ====================
    
    @Schema(description = "Kết quả upload hình ảnh")
    private ImageUploadResult imageUploads;
    
    // ==================== INNER CLASSES ====================
    
    @Schema(description = "Thông tin thương hiệu")
    public static class BrandInfo {
        @Schema(description = "ID thương hiệu", example = "1")
        private Integer brandId;
        
        @Schema(description = "Tên thương hiệu", example = "Tesla")
        private String brandName;
        
        @Schema(description = "Quốc gia", example = "USA")
        private String country;
        
        @Schema(description = "Logo URL", example = "/uploads/brands/tesla-logo.jpg")
        private String logoUrl;
        
        // Getters and Setters
        public Integer getBrandId() { return brandId; }
        public void setBrandId(Integer brandId) { this.brandId = brandId; }
        
        public String getBrandName() { return brandName; }
        public void setBrandName(String brandName) { this.brandName = brandName; }
        
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        
        public String getLogoUrl() { return logoUrl; }
        public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    }
    
    @Schema(description = "Thông tin mẫu xe")
    public static class ModelInfo {
        @Schema(description = "ID mẫu xe", example = "1")
        private Integer modelId;
        
        @Schema(description = "Tên mẫu xe", example = "Model 3")
        private String modelName;
        
        @Schema(description = "Loại xe", example = "Sedan")
        private String vehicleType;
        
        @Schema(description = "Năm sản xuất", example = "2024")
        private Integer modelYear;
        
        @Schema(description = "Hình ảnh URL", example = "/uploads/models/model3-main.jpg")
        private String imageUrl;
        
        // Getters and Setters
        public Integer getModelId() { return modelId; }
        public void setModelId(Integer modelId) { this.modelId = modelId; }
        
        public String getModelName() { return modelName; }
        public void setModelName(String modelName) { this.modelName = modelName; }
        
        public String getVehicleType() { return vehicleType; }
        public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
        
        public Integer getModelYear() { return modelYear; }
        public void setModelYear(Integer modelYear) { this.modelYear = modelYear; }
        
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }
    
    @Schema(description = "Thông tin phiên bản xe")
    public static class VariantInfo {
        @Schema(description = "ID phiên bản", example = "1")
        private Integer variantId;
        
        @Schema(description = "Tên phiên bản", example = "Standard Range Plus")
        private String variantName;
        
        @Schema(description = "Giá cơ bản", example = "1500000000")
        private BigDecimal priceBase;
        
        @Schema(description = "Dung lượng pin", example = "75")
        private Integer batteryCapacity;
        
        @Schema(description = "Tầm hoạt động", example = "468")
        private Integer rangeKm;
        
        @Schema(description = "Công suất", example = "283")
        private Integer powerKw;
        
        @Schema(description = "Hình ảnh URL", example = "/uploads/variants/model3-srp.jpg")
        private String imageUrl;
        
        // Getters and Setters
        public Integer getVariantId() { return variantId; }
        public void setVariantId(Integer variantId) { this.variantId = variantId; }
        
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
        
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }
    
    @Schema(description = "Thông tin màu xe")
    public static class ColorInfo {
        @Schema(description = "ID màu", example = "1")
        private Integer colorId;
        
        @Schema(description = "Tên màu", example = "Pearl White Multi-Coat")
        private String colorName;
        
        @Schema(description = "Mã màu", example = "#FFFFFF")
        private String colorCode;
        
        @Schema(description = "Mẫu màu URL", example = "/uploads/colors/pearl-white.jpg")
        private String swatchUrl;
        
        // Getters and Setters
        public Integer getColorId() { return colorId; }
        public void setColorId(Integer colorId) { this.colorId = colorId; }
        
        public String getColorName() { return colorName; }
        public void setColorName(String colorName) { this.colorName = colorName; }
        
        public String getColorCode() { return colorCode; }
        public void setColorCode(String colorCode) { this.colorCode = colorCode; }
        
        public String getSwatchUrl() { return swatchUrl; }
        public void setSwatchUrl(String swatchUrl) { this.swatchUrl = swatchUrl; }
    }
    
    @Schema(description = "Thông tin xe trong kho")
    public static class InventoryInfo {
        @Schema(description = "ID kho xe", example = "123e4567-e89b-12d3-a456-426614174000")
        private String inventoryId;
        
        @Schema(description = "Số VIN", example = "1HGBH41JXMN109186")
        private String vin;
        
        @Schema(description = "Số khung", example = "CHASSIS123456")
        private String chassisNumber;
        
        @Schema(description = "Giá bán", example = "1550000000")
        private BigDecimal sellingPrice;
        
        @Schema(description = "Trạng thái", example = "AVAILABLE")
        private String status;
        
        @Schema(description = "Vị trí kho", example = "A-01-15")
        private String warehouseLocation;
        
        // Getters and Setters
        public String getInventoryId() { return inventoryId; }
        public void setInventoryId(String inventoryId) { this.inventoryId = inventoryId; }
        
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
    }
    
    @Schema(description = "Kết quả upload hình ảnh")
    public static class ImageUploadResult {
        @Schema(description = "Hình ảnh chính")
        private List<String> mainImageUrls;
        
        @Schema(description = "Hình ảnh nội thất")
        private List<String> interiorImageUrls;
        
        @Schema(description = "Hình ảnh ngoại thất")
        private List<String> exteriorImageUrls;
        
        @Schema(description = "Tổng số hình ảnh đã upload")
        private Integer totalImagesUploaded;
        
        // Getters and Setters
        public List<String> getMainImageUrls() { return mainImageUrls; }
        public void setMainImageUrls(List<String> mainImageUrls) { this.mainImageUrls = mainImageUrls; }
        
        public List<String> getInteriorImageUrls() { return interiorImageUrls; }
        public void setInteriorImageUrls(List<String> interiorImageUrls) { this.interiorImageUrls = interiorImageUrls; }
        
        public List<String> getExteriorImageUrls() { return exteriorImageUrls; }
        public void setExteriorImageUrls(List<String> exteriorImageUrls) { this.exteriorImageUrls = exteriorImageUrls; }
        
        public Integer getTotalImagesUploaded() { return totalImagesUploaded; }
        public void setTotalImagesUploaded(Integer totalImagesUploaded) { this.totalImagesUploaded = totalImagesUploaded; }
    }
    
    // ==================== CONSTRUCTORS ====================
    
    public CreateVehicleResponse() {}
    
    public CreateVehicleResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    // ==================== GETTERS AND SETTERS ====================
    
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public BrandInfo getBrand() { return brand; }
    public void setBrand(BrandInfo brand) { this.brand = brand; }
    
    public ModelInfo getModel() { return model; }
    public void setModel(ModelInfo model) { this.model = model; }
    
    public VariantInfo getVariant() { return variant; }
    public void setVariant(VariantInfo variant) { this.variant = variant; }
    
    public ColorInfo getColor() { return color; }
    public void setColor(ColorInfo color) { this.color = color; }
    
    public InventoryInfo getInventory() { return inventory; }
    public void setInventory(InventoryInfo inventory) { this.inventory = inventory; }
    
    public ImageUploadResult getImageUploads() { return imageUploads; }
    public void setImageUploads(ImageUploadResult imageUploads) { this.imageUploads = imageUploads; }
}
