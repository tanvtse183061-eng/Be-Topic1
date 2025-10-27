package com.evdealer.controller;

import com.evdealer.dto.CreateVehicleFromExistingRequest;
import com.evdealer.dto.CreateVehicleResponse;
import com.evdealer.entity.VehicleBrand;
import com.evdealer.entity.VehicleModel;
import com.evdealer.entity.VehicleColor;
import com.evdealer.entity.Warehouse;
import com.evdealer.repository.VehicleBrandRepository;
import com.evdealer.repository.VehicleModelRepository;
import com.evdealer.repository.VehicleColorRepository;
import com.evdealer.repository.WarehouseRepository;
import com.evdealer.service.VehicleCreationFromExistingService;
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
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
@Tag(name = "Vehicle Creation From Existing", description = "APIs tạo xe mới dựa trên dữ liệu có sẵn")
public class VehicleCreationFromExistingController {
    
    @Autowired
    private VehicleCreationFromExistingService vehicleCreationService;
    
    @Autowired
    private VehicleBrandRepository vehicleBrandRepository;
    
    @Autowired
    private VehicleModelRepository vehicleModelRepository;
    
    @Autowired
    private VehicleColorRepository vehicleColorRepository;
    
    @Autowired
    private WarehouseRepository warehouseRepository;
    
    @PostMapping(value = "/create-from-existing", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "Tạo xe mới từ dữ liệu có sẵn (Multipart)", 
        description = "Tạo xe mới bằng cách chọn brand/model/color/warehouse có sẵn và chỉ tạo mới variant + inventory + images với file upload"
    )
    public ResponseEntity<?> createVehicleFromExistingMultipart(
            // ==================== EXISTING DATA SELECTION ====================
            @Parameter(description = "ID thương hiệu có sẵn", required = true, example = "1")
            @RequestParam("brandId") Integer brandId,
            
            @Parameter(description = "ID mẫu xe có sẵn", required = true, example = "1")
            @RequestParam("modelId") Integer modelId,
            
            @Parameter(description = "ID màu xe có sẵn", required = true, example = "1")
            @RequestParam("colorId") Integer colorId,
            
            @Parameter(description = "ID kho chứa xe có sẵn", required = true, example = "123e4567-e89b-12d3-a456-426614174000")
            @RequestParam("warehouseId") String warehouseId,
            
            // ==================== NEW VARIANT INFORMATION ====================
            @Parameter(description = "Tên phiên bản xe mới", required = true, example = "Performance Edition")
            @RequestParam("variantName") String variantName,
            
            @Parameter(description = "Giá bán cơ bản", required = true, example = "1800000000")
            @RequestParam("priceBase") String priceBaseStr,
            
            @Parameter(description = "Dung lượng pin (kWh)", example = "82")
            @RequestParam(value = "batteryCapacity", required = false) Integer batteryCapacity,
            
            @Parameter(description = "Tầm hoạt động (km)", example = "560")
            @RequestParam(value = "rangeKm", required = false) Integer rangeKm,
            
            @Parameter(description = "Công suất động cơ (kW)", example = "340")
            @RequestParam(value = "powerKw", required = false) Integer powerKw,
            
            @Parameter(description = "Thời gian tăng tốc 0-100km/h (giây)", example = "4.2")
            @RequestParam(value = "acceleration0100", required = false) Double acceleration0100,
            
            @Parameter(description = "Tốc độ tối đa (km/h)", example = "261")
            @RequestParam(value = "topSpeed", required = false) Integer topSpeed,
            
            @Parameter(description = "Thời gian sạc nhanh (phút)", example = "25")
            @RequestParam(value = "chargingTimeFast", required = false) Integer chargingTimeFast,
            
            @Parameter(description = "Thời gian sạc chậm (giờ)", example = "7")
            @RequestParam(value = "chargingTimeSlow", required = false) Integer chargingTimeSlow,
            
            @Parameter(description = "Hình ảnh phiên bản xe (file upload)")
            @RequestParam(value = "variantImage", required = false) MultipartFile variantImage,
            
            // ==================== NEW INVENTORY INFORMATION ====================
            @Parameter(description = "Số VIN của xe", required = true, example = "1HGBH41JXMN109186")
            @RequestParam("vin") String vin,
            
            @Parameter(description = "Số khung xe", example = "CHASSIS123456")
            @RequestParam(value = "chassisNumber", required = false) String chassisNumber,
            
            @Parameter(description = "Giá bán thực tế", example = "1850000000")
            @RequestParam(value = "sellingPrice", required = false) String sellingPriceStr,
            
            @Parameter(description = "Trạng thái xe", example = "AVAILABLE")
            @RequestParam(value = "status", required = false) String status,
            
            @Parameter(description = "Vị trí cụ thể trong kho", required = true, example = "A-01-15")
            @RequestParam("warehouseLocation") String warehouseLocation,
            
            @Parameter(description = "Ghi chú về xe")
            @RequestParam(value = "notes", required = false) String notes,
            
            // ==================== VEHICLE IMAGES ====================
            @Parameter(description = "Hình ảnh chính của xe (file upload)")
            @RequestParam(value = "mainImages", required = false) MultipartFile[] mainImages,
            
            @Parameter(description = "Hình ảnh nội thất (file upload)")
            @RequestParam(value = "interiorImages", required = false) MultipartFile[] interiorImages,
            
            @Parameter(description = "Hình ảnh ngoại thất (file upload)")
            @RequestParam(value = "exteriorImages", required = false) MultipartFile[] exteriorImages) {
        
        try {
            // Tạo request object từ các parameters
            CreateVehicleFromExistingRequest request = new CreateVehicleFromExistingRequest();
            
            // Existing Data Selection
            request.setBrandId(brandId);
            request.setModelId(modelId);
            request.setColorId(colorId);
            request.setWarehouseId(warehouseId);
            
            // New Variant Information
            request.setVariantName(variantName);
            try {
                request.setPriceBase(new BigDecimal(priceBaseStr));
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
            request.setVariantImage(variantImage);
            
            // New Inventory Information
            request.setVin(vin);
            request.setChassisNumber(chassisNumber);
            if (sellingPriceStr != null && !sellingPriceStr.trim().isEmpty()) {
                try {
                    request.setSellingPrice(new BigDecimal(sellingPriceStr));
                } catch (NumberFormatException e) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Invalid selling price format: " + sellingPriceStr);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
                }
            }
            request.setStatus(status);
            request.setWarehouseLocation(warehouseLocation);
            request.setNotes(notes);
            
            // Images
            if (mainImages != null) {
                request.setMainImages(List.of(mainImages));
            }
            if (interiorImages != null) {
                request.setInteriorImages(List.of(interiorImages));
            }
            if (exteriorImages != null) {
                request.setExteriorImages(List.of(exteriorImages));
            }
            
            // Tạo xe
            CreateVehicleResponse response = vehicleCreationService.createVehicleFromExisting(request);
            
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
    
    // ==================== DATA SELECTION APIs ====================
    
    @GetMapping("/create-from-existing/brands")
    @Operation(summary = "Lấy danh sách thương hiệu có sẵn", description = "Lấy tất cả thương hiệu để chọn khi tạo xe mới")
    public ResponseEntity<List<Map<String, Object>>> getAvailableBrands() {
        List<VehicleBrand> brands = vehicleBrandRepository.findAll();
        List<Map<String, Object>> brandList = brands.stream()
            .map(brand -> {
                Map<String, Object> brandInfo = new HashMap<>();
                brandInfo.put("brandId", brand.getBrandId());
                brandInfo.put("brandName", brand.getBrandName());
                brandInfo.put("country", brand.getCountry());
                brandInfo.put("logoUrl", brand.getBrandLogoUrl());
                brandInfo.put("isActive", brand.getIsActive());
                return brandInfo;
            })
            .toList();
        return ResponseEntity.ok(brandList);
    }
    
    @GetMapping("/create-from-existing/models")
    @Operation(summary = "Lấy danh sách mẫu xe có sẵn", description = "Lấy tất cả mẫu xe để chọn khi tạo xe mới")
    public ResponseEntity<List<Map<String, Object>>> getAvailableModels() {
        List<VehicleModel> models = vehicleModelRepository.findAll();
        List<Map<String, Object>> modelList = models.stream()
            .map(model -> {
                Map<String, Object> modelInfo = new HashMap<>();
                modelInfo.put("modelId", model.getModelId());
                modelInfo.put("modelName", model.getModelName());
                modelInfo.put("vehicleType", model.getVehicleType());
                modelInfo.put("modelYear", model.getModelYear());
                modelInfo.put("imageUrl", model.getModelImageUrl());
                modelInfo.put("brandId", model.getBrand().getBrandId());
                modelInfo.put("brandName", model.getBrand().getBrandName());
                modelInfo.put("isActive", model.getIsActive());
                return modelInfo;
            })
            .toList();
        return ResponseEntity.ok(modelList);
    }
    
    @GetMapping("/create-from-existing/models/brand/{brandId}")
    @Operation(summary = "Lấy mẫu xe theo thương hiệu", description = "Lấy mẫu xe của một thương hiệu cụ thể")
    public ResponseEntity<List<Map<String, Object>>> getModelsByBrand(@PathVariable Integer brandId) {
        List<VehicleModel> models = vehicleModelRepository.findByBrandBrandId(brandId);
        List<Map<String, Object>> modelList = models.stream()
            .map(model -> {
                Map<String, Object> modelInfo = new HashMap<>();
                modelInfo.put("modelId", model.getModelId());
                modelInfo.put("modelName", model.getModelName());
                modelInfo.put("vehicleType", model.getVehicleType());
                modelInfo.put("modelYear", model.getModelYear());
                modelInfo.put("imageUrl", model.getModelImageUrl());
                modelInfo.put("isActive", model.getIsActive());
                return modelInfo;
            })
            .toList();
        return ResponseEntity.ok(modelList);
    }
    
    @GetMapping("/create-from-existing/colors")
    @Operation(summary = "Lấy danh sách màu xe có sẵn", description = "Lấy tất cả màu xe để chọn khi tạo xe mới")
    public ResponseEntity<List<Map<String, Object>>> getAvailableColors() {
        List<VehicleColor> colors = vehicleColorRepository.findAll();
        List<Map<String, Object>> colorList = colors.stream()
            .map(color -> {
                Map<String, Object> colorInfo = new HashMap<>();
                colorInfo.put("colorId", color.getColorId());
                colorInfo.put("colorName", color.getColorName());
                colorInfo.put("colorCode", color.getColorCode());
                colorInfo.put("swatchUrl", color.getColorSwatchUrl());
                colorInfo.put("isActive", color.getIsActive());
                return colorInfo;
            })
            .toList();
        return ResponseEntity.ok(colorList);
    }
    
    @GetMapping("/create-from-existing/warehouses")
    @Operation(summary = "Lấy danh sách kho có sẵn", description = "Lấy tất cả kho để chọn khi tạo xe mới")
    public ResponseEntity<List<Map<String, Object>>> getAvailableWarehouses() {
        List<Warehouse> warehouses = warehouseRepository.findAll();
        List<Map<String, Object>> warehouseList = warehouses.stream()
            .map(warehouse -> {
                Map<String, Object> warehouseInfo = new HashMap<>();
                warehouseInfo.put("warehouseId", warehouse.getWarehouseId());
                warehouseInfo.put("warehouseName", warehouse.getWarehouseName());
                warehouseInfo.put("location", warehouse.getAddress());
                warehouseInfo.put("capacity", warehouse.getCapacity());
                warehouseInfo.put("isActive", warehouse.getIsActive());
                return warehouseInfo;
            })
            .toList();
        return ResponseEntity.ok(warehouseList);
    }
    
    @GetMapping("/create-from-existing/fields")
    @Operation(summary = "Lấy thông tin fields cho API", description = "Lấy thông tin về các fields cần thiết và dữ liệu có sẵn")
    public ResponseEntity<Map<String, Object>> getFieldsInfo() {
        Map<String, Object> info = new HashMap<>();
        
        // Required fields
        Map<String, Object> required = new HashMap<>();
        required.put("brandId", "ID thương hiệu có sẵn (Integer)");
        required.put("modelId", "ID mẫu xe có sẵn (Integer)");
        required.put("colorId", "ID màu xe có sẵn (Integer)");
        required.put("warehouseId", "ID kho chứa xe có sẵn (String - UUID)");
        required.put("variantName", "Tên phiên bản xe mới (String)");
        required.put("priceBase", "Giá bán cơ bản (String - số tiền)");
        required.put("vin", "Số VIN của xe (String)");
        required.put("warehouseLocation", "Vị trí cụ thể trong kho (String)");
        
        // Optional fields
        Map<String, Object> optional = new HashMap<>();
        optional.put("batteryCapacity", "Dung lượng pin kWh (Integer)");
        optional.put("rangeKm", "Tầm hoạt động km (Integer)");
        optional.put("powerKw", "Công suất kW (Integer)");
        optional.put("acceleration0100", "Tăng tốc 0-100km/h giây (Double)");
        optional.put("topSpeed", "Tốc độ tối đa km/h (Integer)");
        optional.put("chargingTimeFast", "Thời gian sạc nhanh phút (Integer)");
        optional.put("chargingTimeSlow", "Thời gian sạc chậm giờ (Integer)");
        optional.put("variantImage", "Hình ảnh phiên bản (MultipartFile)");
        optional.put("chassisNumber", "Số khung xe (String)");
        optional.put("sellingPrice", "Giá bán thực tế (String - số tiền)");
        optional.put("status", "Trạng thái xe (String: AVAILABLE/SOLD/RESERVED/MAINTENANCE)");
        optional.put("notes", "Ghi chú về xe (String)");
        optional.put("mainImages", "Hình ảnh chính xe (MultipartFile[])");
        optional.put("interiorImages", "Hình ảnh nội thất (MultipartFile[])");
        optional.put("exteriorImages", "Hình ảnh ngoại thất (MultipartFile[])");
        
        // Data selection endpoints
        Map<String, Object> dataEndpoints = new HashMap<>();
        dataEndpoints.put("brands", "GET /api/vehicles/create-from-existing/brands");
        dataEndpoints.put("models", "GET /api/vehicles/create-from-existing/models");
        dataEndpoints.put("modelsByBrand", "GET /api/vehicles/create-from-existing/models/brand/{brandId}");
        dataEndpoints.put("colors", "GET /api/vehicles/create-from-existing/colors");
        dataEndpoints.put("warehouses", "GET /api/vehicles/create-from-existing/warehouses");
        
        // File upload info
        Map<String, Object> fileInfo = new HashMap<>();
        fileInfo.put("maxFileSize", "10MB");
        fileInfo.put("allowedExtensions", "jpg, jpeg, png, gif, webp");
        fileInfo.put("maxImagesPerType", "10");
        
        info.put("required", required);
        info.put("optional", optional);
        info.put("dataEndpoints", dataEndpoints);
        info.put("fileUploadInfo", fileInfo);
        info.put("endpoint", "POST /api/vehicles/create-from-existing");
        info.put("contentType", "multipart/form-data");
        
        return ResponseEntity.ok(info);
    }

    // ==================== NEW JSON API FOR FRONTEND ====================
    
    @PostMapping(value = "/create-from-existing-json", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
        summary = "Tạo xe mới từ dữ liệu có sẵn (JSON)", 
        description = "Tạo xe mới bằng cách chọn brand/model/color/warehouse có sẵn và chỉ tạo mới variant + inventory (không có file upload)"
    )
    public ResponseEntity<?> createVehicleFromExistingJson(@RequestBody Map<String, Object> request) {
        try {
            // Extract existing data IDs
            Integer brandId = Integer.valueOf(request.get("existingBrandId").toString());
            Integer modelId = Integer.valueOf(request.get("existingModelId").toString());
            Integer colorId = Integer.valueOf(request.get("existingColorId").toString());
            String warehouseId = request.get("existingWarehouseId").toString();
            
            // Extract variant information
            @SuppressWarnings("unchecked")
            Map<String, Object> variantData = (Map<String, Object>) request.get("variant");
            String variantName = variantData.get("variantName").toString();
            BigDecimal priceBase = new BigDecimal(variantData.get("priceBase").toString());
            
            // Extract inventory information
            @SuppressWarnings("unchecked")
            Map<String, Object> inventoryData = (Map<String, Object>) request.get("inventory");
            String vin = inventoryData.get("vin").toString();
            String warehouseLocation = inventoryData.get("warehouseLocation").toString();
            
            // Create CreateVehicleFromExistingRequest object
            CreateVehicleFromExistingRequest createRequest = new CreateVehicleFromExistingRequest();
            createRequest.setBrandId(brandId);
            createRequest.setModelId(modelId);
            createRequest.setColorId(colorId);
            createRequest.setWarehouseId(warehouseId);
            createRequest.setVariantName(variantName);
            createRequest.setPriceBase(priceBase);
            createRequest.setVin(vin);
            createRequest.setWarehouseLocation(warehouseLocation);
            
            // Set optional variant fields
            if (variantData.containsKey("batteryCapacity")) {
                createRequest.setBatteryCapacity(Integer.valueOf(variantData.get("batteryCapacity").toString()));
            }
            if (variantData.containsKey("rangeKm")) {
                createRequest.setRangeKm(Integer.valueOf(variantData.get("rangeKm").toString()));
            }
            if (variantData.containsKey("powerKw")) {
                createRequest.setPowerKw(Integer.valueOf(variantData.get("powerKw").toString()));
            }
            if (variantData.containsKey("acceleration0100")) {
                createRequest.setAcceleration0100(Double.valueOf(variantData.get("acceleration0100").toString()));
            }
            if (variantData.containsKey("topSpeed")) {
                createRequest.setTopSpeed(Integer.valueOf(variantData.get("topSpeed").toString()));
            }
            if (variantData.containsKey("chargingTimeFast")) {
                createRequest.setChargingTimeFast(Integer.valueOf(variantData.get("chargingTimeFast").toString()));
            }
            if (variantData.containsKey("chargingTimeSlow")) {
                createRequest.setChargingTimeSlow(Integer.valueOf(variantData.get("chargingTimeSlow").toString()));
            }
            
            // Set optional inventory fields
            if (inventoryData.containsKey("chassisNumber")) {
                createRequest.setChassisNumber(inventoryData.get("chassisNumber").toString());
            }
            if (inventoryData.containsKey("status")) {
                createRequest.setStatus(inventoryData.get("status").toString());
            }
            if (inventoryData.containsKey("sellingPrice")) {
                createRequest.setSellingPrice(new BigDecimal(inventoryData.get("sellingPrice").toString()));
            }
            if (inventoryData.containsKey("notes")) {
                createRequest.setNotes(inventoryData.get("notes").toString());
            }
            
            // Create vehicle using service
            CreateVehicleResponse response = vehicleCreationService.createVehicleFromExisting(createRequest);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to create vehicle: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
