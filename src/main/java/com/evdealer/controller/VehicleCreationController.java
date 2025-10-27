package com.evdealer.controller;

import com.evdealer.dto.CreateVehicleRequest;
import com.evdealer.dto.CreateVehicleResponse;
import com.evdealer.service.VehicleCreationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
@Tag(name = "Vehicle Creation", description = "APIs tạo xe mới hoàn chỉnh trong 1 thao tác")
public class VehicleCreationController {
    
    @Autowired
    private VehicleCreationService vehicleCreationService;
    
    @PostMapping(value = "/create-complete", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "Tạo xe mới hoàn chỉnh", 
        description = "Tạo xe mới với đầy đủ thông tin: thương hiệu, mẫu xe, phiên bản, màu sắc, kho xe và hình ảnh trong 1 thao tác"
    )
    public ResponseEntity<?> createCompleteVehicle(
            // ==================== BRAND INFORMATION ====================
            @Parameter(description = "Tên thương hiệu xe", required = true, example = "Tesla")
            @RequestParam("brandName") String brandName,
            
            @Parameter(description = "Quốc gia của thương hiệu", example = "USA")
            @RequestParam(value = "brandCountry", required = false) String brandCountry,
            
            @Parameter(description = "Logo thương hiệu (file upload)")
            @RequestParam(value = "brandLogo", required = false) MultipartFile brandLogo,
            
            // ==================== MODEL INFORMATION ====================
            @Parameter(description = "Tên mẫu xe", required = true, example = "Model 3")
            @RequestParam("modelName") String modelName,
            
            @Parameter(description = "Loại xe", example = "Sedan")
            @RequestParam(value = "vehicleType", required = false) String vehicleType,
            
            @Parameter(description = "Năm sản xuất", example = "2024")
            @RequestParam(value = "modelYear", required = false) Integer modelYear,
            
            @Parameter(description = "Mô tả mẫu xe")
            @RequestParam(value = "modelDescription", required = false) String modelDescription,
            
            @Parameter(description = "Hình ảnh mẫu xe (file upload)")
            @RequestParam(value = "modelImage", required = false) MultipartFile modelImage,
            
            // ==================== VARIANT INFORMATION ====================
            @Parameter(description = "Tên phiên bản xe", required = true, example = "Standard Range Plus")
            @RequestParam("variantName") String variantName,
            
            @Parameter(description = "Giá bán cơ bản", required = true, example = "1500000000")
            @RequestParam("priceBase") String priceBaseStr,
            
            @Parameter(description = "Dung lượng pin (kWh)", example = "75")
            @RequestParam(value = "batteryCapacity", required = false) Integer batteryCapacity,
            
            @Parameter(description = "Tầm hoạt động (km)", example = "468")
            @RequestParam(value = "rangeKm", required = false) Integer rangeKm,
            
            @Parameter(description = "Công suất động cơ (kW)", example = "283")
            @RequestParam(value = "powerKw", required = false) Integer powerKw,
            
            @Parameter(description = "Thời gian tăng tốc 0-100km/h (giây)", example = "5.3")
            @RequestParam(value = "acceleration0100", required = false) Double acceleration0100,
            
            @Parameter(description = "Tốc độ tối đa (km/h)", example = "225")
            @RequestParam(value = "topSpeed", required = false) Integer topSpeed,
            
            @Parameter(description = "Thời gian sạc nhanh (phút)", example = "30")
            @RequestParam(value = "chargingTimeFast", required = false) Integer chargingTimeFast,
            
            @Parameter(description = "Thời gian sạc chậm (giờ)", example = "8")
            @RequestParam(value = "chargingTimeSlow", required = false) Integer chargingTimeSlow,
            
            @Parameter(description = "Mô tả phiên bản")
            @RequestParam(value = "variantDescription", required = false) String variantDescription,
            
            @Parameter(description = "Hình ảnh phiên bản xe (file upload)")
            @RequestParam(value = "variantImage", required = false) MultipartFile variantImage,
            
            // ==================== COLOR INFORMATION ====================
            @Parameter(description = "Tên màu xe", required = true, example = "Pearl White Multi-Coat")
            @RequestParam("colorName") String colorName,
            
            @Parameter(description = "Mã màu", example = "#FFFFFF")
            @RequestParam(value = "colorCode", required = false) String colorCode,
            
            @Parameter(description = "Mẫu màu xe (file upload)")
            @RequestParam(value = "colorSwatch", required = false) MultipartFile colorSwatch,
            
            // ==================== INVENTORY INFORMATION ====================
            @Parameter(description = "Số VIN của xe", required = true, example = "1HGBH41JXMN109186")
            @RequestParam("vin") String vin,
            
            @Parameter(description = "Số khung xe", example = "CHASSIS123456")
            @RequestParam(value = "chassisNumber", required = false) String chassisNumber,
            
            @Parameter(description = "Giá bán thực tế", example = "1550000000")
            @RequestParam(value = "sellingPrice", required = false) String sellingPriceStr,
            
            @Parameter(description = "Trạng thái xe", example = "AVAILABLE")
            @RequestParam(value = "status", required = false) String status,
            
            @Parameter(description = "Ghi chú về xe")
            @RequestParam(value = "notes", required = false) String notes,
            
            // ==================== IMAGES ====================
            @Parameter(description = "Hình ảnh chính của xe (file upload)")
            @RequestParam(value = "mainImages", required = false) MultipartFile[] mainImages,
            
            @Parameter(description = "Hình ảnh nội thất (file upload)")
            @RequestParam(value = "interiorImages", required = false) MultipartFile[] interiorImages,
            
            @Parameter(description = "Hình ảnh ngoại thất (file upload)")
            @RequestParam(value = "exteriorImages", required = false) MultipartFile[] exteriorImages,
            
            // ==================== WAREHOUSE INFORMATION ====================
            @Parameter(description = "ID kho chứa xe")
            @RequestParam(value = "warehouseId", required = false) String warehouseId,
            
            @Parameter(description = "Vị trí trong kho", example = "A-01-15")
            @RequestParam(value = "warehouseLocation", required = false) String warehouseLocation) {
        
        try {
            // Tạo request object từ các parameters
            CreateVehicleRequest request = new CreateVehicleRequest();
            
            // Brand
            request.setBrandName(brandName);
            request.setBrandCountry(brandCountry);
            request.setBrandLogo(brandLogo);
            
            // Model
            request.setModelName(modelName);
            request.setVehicleType(vehicleType);
            request.setModelYear(modelYear);
            request.setModelDescription(modelDescription);
            request.setModelImage(modelImage);
            
            // Variant
            request.setVariantName(variantName);
            try {
                request.setPriceBase(new java.math.BigDecimal(priceBaseStr));
            } catch (NumberFormatException e) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid price format: " + priceBaseStr);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            request.setBatteryCapacity(batteryCapacity);
            request.setRangeKm(rangeKm);
            request.setPowerKw(powerKw);
            request.setAcceleration0100(acceleration0100);
            request.setTopSpeed(topSpeed);
            request.setChargingTimeFast(chargingTimeFast);
            request.setChargingTimeSlow(chargingTimeSlow);
            request.setVariantDescription(variantDescription);
            request.setVariantImage(variantImage);
            
            // Color
            request.setColorName(colorName);
            request.setColorCode(colorCode);
            request.setColorSwatch(colorSwatch);
            
            // Inventory
            request.setVin(vin);
            request.setChassisNumber(chassisNumber);
            if (sellingPriceStr != null && !sellingPriceStr.trim().isEmpty()) {
                try {
                    request.setSellingPrice(new java.math.BigDecimal(sellingPriceStr));
                } catch (NumberFormatException e) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Invalid selling price format: " + sellingPriceStr);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
                }
            }
            request.setStatus(status);
            request.setNotes(notes);
            
            // Images
            if (mainImages != null) {
                request.setMainImages(java.util.Arrays.asList(mainImages));
            }
            if (interiorImages != null) {
                request.setInteriorImages(java.util.Arrays.asList(interiorImages));
            }
            if (exteriorImages != null) {
                request.setExteriorImages(java.util.Arrays.asList(exteriorImages));
            }
            
            // Warehouse
            request.setWarehouseId(warehouseId);
            request.setWarehouseLocation(warehouseLocation);
            
            // Tạo xe
            CreateVehicleResponse response = vehicleCreationService.createCompleteVehicle(request);
            
            if (response.isSuccess()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "File upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Vehicle creation failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/create-complete/fields")
    @Operation(summary = "Lấy danh sách fields cần thiết", description = "Lấy thông tin về các fields cần thiết để tạo xe mới")
    public ResponseEntity<Map<String, Object>> getRequiredFields() {
        Map<String, Object> fields = new HashMap<>();
        
        // Required fields
        Map<String, Object> required = new HashMap<>();
        required.put("brandName", "Tên thương hiệu xe (String)");
        required.put("modelName", "Tên mẫu xe (String)");
        required.put("variantName", "Tên phiên bản xe (String)");
        required.put("priceBase", "Giá bán cơ bản (String - số tiền)");
        required.put("colorName", "Tên màu xe (String)");
        required.put("vin", "Số VIN của xe (String)");
        
        // Optional fields
        Map<String, Object> optional = new HashMap<>();
        optional.put("brandCountry", "Quốc gia thương hiệu (String)");
        optional.put("brandLogo", "Logo thương hiệu (MultipartFile)");
        optional.put("vehicleType", "Loại xe (String)");
        optional.put("modelYear", "Năm sản xuất (Integer)");
        optional.put("modelDescription", "Mô tả mẫu xe (String)");
        optional.put("modelImage", "Hình ảnh mẫu xe (MultipartFile)");
        optional.put("batteryCapacity", "Dung lượng pin kWh (Integer)");
        optional.put("rangeKm", "Tầm hoạt động km (Integer)");
        optional.put("powerKw", "Công suất kW (Integer)");
        optional.put("acceleration0100", "Tăng tốc 0-100km/h giây (Double)");
        optional.put("topSpeed", "Tốc độ tối đa km/h (Integer)");
        optional.put("chargingTimeFast", "Thời gian sạc nhanh phút (Integer)");
        optional.put("chargingTimeSlow", "Thời gian sạc chậm giờ (Integer)");
        optional.put("variantDescription", "Mô tả phiên bản (String)");
        optional.put("variantImage", "Hình ảnh phiên bản (MultipartFile)");
        optional.put("colorCode", "Mã màu hex (String)");
        optional.put("colorSwatch", "Mẫu màu xe (MultipartFile)");
        optional.put("chassisNumber", "Số khung xe (String)");
        optional.put("sellingPrice", "Giá bán thực tế (String - số tiền)");
        optional.put("status", "Trạng thái xe (String: AVAILABLE/SOLD/RESERVED/MAINTENANCE)");
        optional.put("notes", "Ghi chú về xe (String)");
        optional.put("mainImages", "Hình ảnh chính xe (MultipartFile[])");
        optional.put("interiorImages", "Hình ảnh nội thất (MultipartFile[])");
        optional.put("exteriorImages", "Hình ảnh ngoại thất (MultipartFile[])");
        optional.put("warehouseId", "ID kho chứa xe (String - UUID)");
        optional.put("warehouseLocation", "Vị trí trong kho (String)");
        
        // File upload info
        Map<String, Object> fileInfo = new HashMap<>();
        fileInfo.put("maxFileSize", "10MB");
        fileInfo.put("allowedExtensions", "jpg, jpeg, png, gif, webp");
        fileInfo.put("maxImagesPerType", "10");
        
        fields.put("required", required);
        fields.put("optional", optional);
        fields.put("fileUploadInfo", fileInfo);
        fields.put("endpoint", "POST /api/vehicles/create-complete");
        fields.put("contentType", "multipart/form-data");
        
        return ResponseEntity.ok(fields);
    }
}
