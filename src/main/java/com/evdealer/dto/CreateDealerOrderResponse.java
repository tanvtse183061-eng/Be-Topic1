package com.evdealer.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(description = "Response sau khi tạo đơn hàng đại lý thành công")
public class CreateDealerOrderResponse {
    
    @Schema(description = "Trạng thái thành công", example = "true")
    private boolean success;
    
    @Schema(description = "Thông báo", example = "Dealer order created successfully")
    private String message;
    
    @Schema(description = "Thông tin đơn hàng")
    private DealerOrderInfo dealerOrder;
    
    @Schema(description = "Tổng số lượng xe")
    private Integer totalQuantity;
    
    @Schema(description = "Tổng số tiền")
    private BigDecimal totalAmount;
    
    @Schema(description = "Danh sách xe trong đơn hàng")
    private List<DealerOrderItemInfo> items;
    
    // Constructors
    public CreateDealerOrderResponse() {}
    
    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public DealerOrderInfo getDealerOrder() { return dealerOrder; }
    public void setDealerOrder(DealerOrderInfo dealerOrder) { this.dealerOrder = dealerOrder; }
    
    public Integer getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(Integer totalQuantity) { this.totalQuantity = totalQuantity; }
    
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    
    public List<DealerOrderItemInfo> getItems() { return items; }
    public void setItems(List<DealerOrderItemInfo> items) { this.items = items; }
    
    @Schema(description = "Thông tin đơn hàng đại lý")
    public static class DealerOrderInfo {
        
        @Schema(description = "ID đơn hàng")
        private UUID dealerOrderId;
        
        @Schema(description = "Số đơn hàng")
        private String dealerOrderNumber;
        
        @Schema(description = "Thông tin đại lý")
        private DealerInfo dealer;
        
        @Schema(description = "Thông tin nhân viên EVM")
        private EvmStaffInfo evmStaff;
        
        @Schema(description = "Ngày đặt hàng")
        private LocalDate orderDate;
        
        @Schema(description = "Ngày giao hàng dự kiến")
        private LocalDate expectedDeliveryDate;
        
        @Schema(description = "Trạng thái đơn hàng")
        private String status;
        
        @Schema(description = "Độ ưu tiên")
        private String priority;
        
        @Schema(description = "Loại đơn hàng")
        private String orderType;
        
        @Schema(description = "Trạng thái duyệt")
        private String approvalStatus;
        
        @Schema(description = "Lý do từ chối")
        private String rejectionReason;
        
        @Schema(description = "Ngày tạo")
        private LocalDateTime createdAt;
        
        // Getters and Setters
        public UUID getDealerOrderId() { return dealerOrderId; }
        public void setDealerOrderId(UUID dealerOrderId) { this.dealerOrderId = dealerOrderId; }
        
        public String getDealerOrderNumber() { return dealerOrderNumber; }
        public void setDealerOrderNumber(String dealerOrderNumber) { this.dealerOrderNumber = dealerOrderNumber; }
        
        public DealerInfo getDealer() { return dealer; }
        public void setDealer(DealerInfo dealer) { this.dealer = dealer; }
        
        public EvmStaffInfo getEvmStaff() { return evmStaff; }
        public void setEvmStaff(EvmStaffInfo evmStaff) { this.evmStaff = evmStaff; }
        
        public LocalDate getOrderDate() { return orderDate; }
        public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }
        
        public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
        public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        
        public String getOrderType() { return orderType; }
        public void setOrderType(String orderType) { this.orderType = orderType; }
        
        public String getApprovalStatus() { return approvalStatus; }
        public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
        
        public String getRejectionReason() { return rejectionReason; }
        public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
    
    @Schema(description = "Thông tin đại lý")
    public static class DealerInfo {
        
        @Schema(description = "ID đại lý")
        private UUID dealerId;
        
        @Schema(description = "Tên đại lý")
        private String dealerName;
        
        @Schema(description = "Mã đại lý")
        private String dealerCode;
        
        @Schema(description = "Địa chỉ")
        private String address;
        
        @Schema(description = "Số điện thoại")
        private String phone;
        
        @Schema(description = "Email")
        private String email;
        
        // Getters and Setters
        public UUID getDealerId() { return dealerId; }
        public void setDealerId(UUID dealerId) { this.dealerId = dealerId; }
        
        public String getDealerName() { return dealerName; }
        public void setDealerName(String dealerName) { this.dealerName = dealerName; }
        
        public String getDealerCode() { return dealerCode; }
        public void setDealerCode(String dealerCode) { this.dealerCode = dealerCode; }
        
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
    
    @Schema(description = "Thông tin nhân viên EVM")
    public static class EvmStaffInfo {
        
        @Schema(description = "ID nhân viên")
        private UUID userId;
        
        @Schema(description = "Tên nhân viên")
        private String fullName;
        
        @Schema(description = "Email")
        private String email;
        
        @Schema(description = "Số điện thoại")
        private String phone;
        
        // Getters and Setters
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }
    
    @Schema(description = "Thông tin xe trong đơn hàng")
    public static class DealerOrderItemInfo {
        
        @Schema(description = "ID item")
        private UUID itemId;
        
        @Schema(description = "Thông tin phiên bản xe")
        private VariantInfo variant;
        
        @Schema(description = "Thông tin màu xe")
        private ColorInfo color;
        
        @Schema(description = "Số lượng")
        private Integer quantity;
        
        @Schema(description = "Giá đơn vị")
        private BigDecimal unitPrice;
        
        @Schema(description = "Tổng giá")
        private BigDecimal totalPrice;
        
        @Schema(description = "Phần trăm giảm giá")
        private BigDecimal discountPercentage;
        
        @Schema(description = "Số tiền giảm giá")
        private BigDecimal discountAmount;
        
        @Schema(description = "Giá cuối cùng")
        private BigDecimal finalPrice;
        
        @Schema(description = "Trạng thái")
        private String status;
        
        @Schema(description = "Ghi chú")
        private String notes;
        
        // Getters and Setters
        public UUID getItemId() { return itemId; }
        public void setItemId(UUID itemId) { this.itemId = itemId; }
        
        public VariantInfo getVariant() { return variant; }
        public void setVariant(VariantInfo variant) { this.variant = variant; }
        
        public ColorInfo getColor() { return color; }
        public void setColor(ColorInfo color) { this.color = color; }
        
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        
        public BigDecimal getTotalPrice() { return totalPrice; }
        public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
        
        public BigDecimal getDiscountPercentage() { return discountPercentage; }
        public void setDiscountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; }
        
        public BigDecimal getDiscountAmount() { return discountAmount; }
        public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
        
        public BigDecimal getFinalPrice() { return finalPrice; }
        public void setFinalPrice(BigDecimal finalPrice) { this.finalPrice = finalPrice; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
    
    @Schema(description = "Thông tin phiên bản xe")
    public static class VariantInfo {
        
        @Schema(description = "ID phiên bản")
        private Integer variantId;
        
        @Schema(description = "Tên phiên bản")
        private String variantName;
        
        @Schema(description = "Giá cơ bản")
        private BigDecimal priceBase;
        
        @Schema(description = "Dung lượng pin")
        private BigDecimal batteryCapacity;
        
        @Schema(description = "Tầm hoạt động")
        private Integer rangeKm;
        
        @Schema(description = "Công suất")
        private BigDecimal powerKw;
        
        @Schema(description = "Thông tin mẫu xe")
        private ModelInfo model;
        
        // Getters and Setters
        public Integer getVariantId() { return variantId; }
        public void setVariantId(Integer variantId) { this.variantId = variantId; }
        
        public String getVariantName() { return variantName; }
        public void setVariantName(String variantName) { this.variantName = variantName; }
        
        public BigDecimal getPriceBase() { return priceBase; }
        public void setPriceBase(BigDecimal priceBase) { this.priceBase = priceBase; }
        
        public BigDecimal getBatteryCapacity() { return batteryCapacity; }
        public void setBatteryCapacity(BigDecimal batteryCapacity) { this.batteryCapacity = batteryCapacity; }
        
        public Integer getRangeKm() { return rangeKm; }
        public void setRangeKm(Integer rangeKm) { this.rangeKm = rangeKm; }
        
        public BigDecimal getPowerKw() { return powerKw; }
        public void setPowerKw(BigDecimal powerKw) { this.powerKw = powerKw; }
        
        public ModelInfo getModel() { return model; }
        public void setModel(ModelInfo model) { this.model = model; }
    }
    
    @Schema(description = "Thông tin mẫu xe")
    public static class ModelInfo {
        
        @Schema(description = "ID mẫu xe")
        private Integer modelId;
        
        @Schema(description = "Tên mẫu xe")
        private String modelName;
        
        @Schema(description = "Loại xe")
        private String vehicleType;
        
        @Schema(description = "Năm sản xuất")
        private Integer modelYear;
        
        @Schema(description = "Thông tin thương hiệu")
        private BrandInfo brand;
        
        // Getters and Setters
        public Integer getModelId() { return modelId; }
        public void setModelId(Integer modelId) { this.modelId = modelId; }
        
        public String getModelName() { return modelName; }
        public void setModelName(String modelName) { this.modelName = modelName; }
        
        public String getVehicleType() { return vehicleType; }
        public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
        
        public Integer getModelYear() { return modelYear; }
        public void setModelYear(Integer modelYear) { this.modelYear = modelYear; }
        
        public BrandInfo getBrand() { return brand; }
        public void setBrand(BrandInfo brand) { this.brand = brand; }
    }
    
    @Schema(description = "Thông tin thương hiệu")
    public static class BrandInfo {
        
        @Schema(description = "ID thương hiệu")
        private Integer brandId;
        
        @Schema(description = "Tên thương hiệu")
        private String brandName;
        
        @Schema(description = "Quốc gia")
        private String country;
        
        // Getters and Setters
        public Integer getBrandId() { return brandId; }
        public void setBrandId(Integer brandId) { this.brandId = brandId; }
        
        public String getBrandName() { return brandName; }
        public void setBrandName(String brandName) { this.brandName = brandName; }
        
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
    }
    
    @Schema(description = "Thông tin màu xe")
    public static class ColorInfo {
        
        @Schema(description = "ID màu")
        private Integer colorId;
        
        @Schema(description = "Tên màu")
        private String colorName;
        
        @Schema(description = "Mã màu")
        private String colorCode;
        
        // Getters and Setters
        public Integer getColorId() { return colorId; }
        public void setColorId(Integer colorId) { this.colorId = colorId; }
        
        public String getColorName() { return colorName; }
        public void setColorName(String colorName) { this.colorName = colorName; }
        
        public String getColorCode() { return colorCode; }
        public void setColorCode(String colorCode) { this.colorCode = colorCode; }
    }
}
