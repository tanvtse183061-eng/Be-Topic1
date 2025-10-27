package com.evdealer.service;

import com.evdealer.dto.CreateVehicleFromExistingRequest;
import com.evdealer.dto.CreateVehicleResponse;
import com.evdealer.entity.*;
import com.evdealer.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class VehicleCreationFromExistingService {
    
    @Autowired
    private VehicleBrandRepository vehicleBrandRepository;
    
    @Autowired
    private VehicleModelRepository vehicleModelRepository;
    
    @Autowired
    private VehicleVariantRepository vehicleVariantRepository;
    
    @Autowired
    private VehicleColorRepository vehicleColorRepository;
    
    @Autowired
    private VehicleInventoryRepository vehicleInventoryRepository;
    
    @Autowired
    private WarehouseRepository warehouseRepository;
    
    @Autowired
    private FileUploadService fileUploadService;
    
    @Autowired
    private ImageUpdateService imageUpdateService;
    
    public CreateVehicleResponse createVehicleFromExisting(CreateVehicleFromExistingRequest request) throws IOException {
        CreateVehicleResponse response = new CreateVehicleResponse();
        
        try {
            // 1. Lấy thương hiệu có sẵn
            VehicleBrand brand = vehicleBrandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found with ID: " + request.getBrandId()));
            
            // 2. Lấy mẫu xe có sẵn
            VehicleModel model = vehicleModelRepository.findById(request.getModelId())
                .orElseThrow(() -> new RuntimeException("Model not found with ID: " + request.getModelId()));
            
            // 3. Lấy màu xe có sẵn
            VehicleColor color = vehicleColorRepository.findById(request.getColorId())
                .orElseThrow(() -> new RuntimeException("Color not found with ID: " + request.getColorId()));
            
            // 4. Lấy kho có sẵn
            Warehouse warehouse = warehouseRepository.findById(UUID.fromString(request.getWarehouseId()))
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + request.getWarehouseId()));
            
            // 5. Tạo phiên bản xe mới
            VehicleVariant variant = createNewVariant(request, model);
            
            // 6. Tạo xe trong kho mới
            VehicleInventory inventory = createNewInventory(request, variant, color, warehouse);
            
            // 7. Upload và xử lý hình ảnh
            CreateVehicleResponse.ImageUploadResult imageResult = uploadVehicleImages(request, inventory);
            
            // 8. Tạo response
            response.setSuccess(true);
            response.setMessage("Vehicle created successfully from existing data");
            response.setBrand(createBrandInfo(brand));
            response.setModel(createModelInfo(model));
            response.setVariant(createVariantInfo(variant));
            response.setColor(createColorInfo(color));
            response.setInventory(createInventoryInfo(inventory));
            response.setImageUploads(imageResult);
            
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Failed to create vehicle: " + e.getMessage());
            throw e;
        }
        
        return response;
    }
    
    private VehicleVariant createNewVariant(CreateVehicleFromExistingRequest request, VehicleModel model) throws IOException {
        VehicleVariant variant = new VehicleVariant();
        variant.setVariantName(request.getVariantName());
        variant.setPriceBase(request.getPriceBase());
        variant.setBatteryCapacity(request.getBatteryCapacity() != null ? new BigDecimal(request.getBatteryCapacity()) : null);
        variant.setRangeKm(request.getRangeKm());
        variant.setPowerKw(request.getPowerKw() != null ? new BigDecimal(request.getPowerKw()) : null);
        variant.setAcceleration0100(request.getAcceleration0100() != null ? new BigDecimal(request.getAcceleration0100()) : null);
        variant.setTopSpeed(request.getTopSpeed());
        variant.setChargingTimeFast(request.getChargingTimeFast());
        variant.setChargingTimeSlow(request.getChargingTimeSlow());
        variant.setModel(model);
        variant.setIsActive(true);
        
        VehicleVariant savedVariant = vehicleVariantRepository.save(variant);
        
        // Upload hình ảnh phiên bản nếu có
        if (request.getVariantImage() != null && !request.getVariantImage().isEmpty()) {
            updateVariantImage(savedVariant, request.getVariantImage());
        }
        
        return savedVariant;
    }
    
    private VehicleInventory createNewInventory(CreateVehicleFromExistingRequest request, VehicleVariant variant, VehicleColor color, Warehouse warehouse) {
        VehicleInventory inventory = new VehicleInventory();
        inventory.setVin(request.getVin());
        inventory.setChassisNumber(request.getChassisNumber());
        inventory.setSellingPrice(request.getSellingPrice() != null ? request.getSellingPrice() : variant.getPriceBase());
        inventory.setStatus(request.getStatus() != null ? request.getStatus() : "AVAILABLE");
        inventory.setVariant(variant);
        inventory.setColor(color);
        inventory.setWarehouse(warehouse);
        inventory.setWarehouseLocation(request.getWarehouseLocation());
        
        return vehicleInventoryRepository.save(inventory);
    }
    
    private CreateVehicleResponse.ImageUploadResult uploadVehicleImages(CreateVehicleFromExistingRequest request, VehicleInventory inventory) throws IOException {
        CreateVehicleResponse.ImageUploadResult result = new CreateVehicleResponse.ImageUploadResult();
        List<String> mainImageUrls = new ArrayList<>();
        List<String> interiorImageUrls = new ArrayList<>();
        List<String> exteriorImageUrls = new ArrayList<>();
        
        // Upload main images
        if (request.getMainImages() != null && !request.getMainImages().isEmpty()) {
            for (MultipartFile file : request.getMainImages()) {
                if (file != null && !file.isEmpty()) {
                    FileUploadService.FileUploadResult uploadResult = fileUploadService.uploadImage(file, "inventory/main");
                    mainImageUrls.add(uploadResult.getUrl());
                }
            }
        }
        
        // Upload interior images
        if (request.getInteriorImages() != null && !request.getInteriorImages().isEmpty()) {
            for (MultipartFile file : request.getInteriorImages()) {
                if (file != null && !file.isEmpty()) {
                    FileUploadService.FileUploadResult uploadResult = fileUploadService.uploadImage(file, "inventory/interior");
                    interiorImageUrls.add(uploadResult.getUrl());
                }
            }
        }
        
        // Upload exterior images
        if (request.getExteriorImages() != null && !request.getExteriorImages().isEmpty()) {
            for (MultipartFile file : request.getExteriorImages()) {
                if (file != null && !file.isEmpty()) {
                    FileUploadService.FileUploadResult uploadResult = fileUploadService.uploadImage(file, "inventory/exterior");
                    exteriorImageUrls.add(uploadResult.getUrl());
                }
            }
        }
        
        // Update inventory with image URLs
        if (!mainImageUrls.isEmpty() || !interiorImageUrls.isEmpty() || !exteriorImageUrls.isEmpty()) {
            updateInventoryImages(inventory, mainImageUrls, interiorImageUrls, exteriorImageUrls);
        }
        
        result.setMainImageUrls(mainImageUrls);
        result.setInteriorImageUrls(interiorImageUrls);
        result.setExteriorImageUrls(exteriorImageUrls);
        result.setTotalImagesUploaded(mainImageUrls.size() + interiorImageUrls.size() + exteriorImageUrls.size());
        
        return result;
    }
    
    private void updateVariantImage(VehicleVariant variant, MultipartFile imageFile) throws IOException {
        FileUploadService.FileUploadResult result = fileUploadService.uploadImage(imageFile, "variants");
        imageUpdateService.updateVariantImage(variant.getVariantId(), result.getUrl(), result.getUrl());
    }
    
    private void updateInventoryImages(VehicleInventory inventory, List<String> mainUrls, List<String> interiorUrls, List<String> exteriorUrls) {
        // Convert lists to JSON strings and update inventory
        String mainImagesJson = convertUrlsToJson(mainUrls);
        String interiorImagesJson = convertUrlsToJson(interiorUrls);
        String exteriorImagesJson = convertUrlsToJson(exteriorUrls);
        
        inventory.setVehicleImages(mainImagesJson);
        inventory.setInteriorImages(interiorImagesJson);
        inventory.setExteriorImages(exteriorImagesJson);
        
        vehicleInventoryRepository.save(inventory);
    }
    
    private String convertUrlsToJson(List<String> urls) {
        if (urls == null || urls.isEmpty()) {
            return "[]";
        }
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < urls.size(); i++) {
            json.append("\"").append(urls.get(i)).append("\"");
            if (i < urls.size() - 1) {
                json.append(",");
            }
        }
        json.append("]");
        return json.toString();
    }
    
    // Helper methods for creating response objects
    private CreateVehicleResponse.BrandInfo createBrandInfo(VehicleBrand brand) {
        CreateVehicleResponse.BrandInfo info = new CreateVehicleResponse.BrandInfo();
        info.setBrandId(brand.getBrandId());
        info.setBrandName(brand.getBrandName());
        info.setCountry(brand.getCountry());
        info.setLogoUrl(brand.getBrandLogoUrl());
        return info;
    }
    
    private CreateVehicleResponse.ModelInfo createModelInfo(VehicleModel model) {
        CreateVehicleResponse.ModelInfo info = new CreateVehicleResponse.ModelInfo();
        info.setModelId(model.getModelId());
        info.setModelName(model.getModelName());
        info.setVehicleType(model.getVehicleType());
        info.setModelYear(model.getModelYear());
        info.setImageUrl(model.getModelImageUrl());
        return info;
    }
    
    private CreateVehicleResponse.VariantInfo createVariantInfo(VehicleVariant variant) {
        CreateVehicleResponse.VariantInfo info = new CreateVehicleResponse.VariantInfo();
        info.setVariantId(variant.getVariantId());
        info.setVariantName(variant.getVariantName());
        info.setPriceBase(variant.getPriceBase());
        info.setBatteryCapacity(variant.getBatteryCapacity() != null ? variant.getBatteryCapacity().intValue() : null);
        info.setRangeKm(variant.getRangeKm());
        info.setPowerKw(variant.getPowerKw() != null ? variant.getPowerKw().intValue() : null);
        info.setImageUrl(variant.getVariantImageUrl());
        return info;
    }
    
    private CreateVehicleResponse.ColorInfo createColorInfo(VehicleColor color) {
        CreateVehicleResponse.ColorInfo info = new CreateVehicleResponse.ColorInfo();
        info.setColorId(color.getColorId());
        info.setColorName(color.getColorName());
        info.setColorCode(color.getColorCode());
        info.setSwatchUrl(color.getColorSwatchUrl());
        return info;
    }
    
    private CreateVehicleResponse.InventoryInfo createInventoryInfo(VehicleInventory inventory) {
        CreateVehicleResponse.InventoryInfo info = new CreateVehicleResponse.InventoryInfo();
        info.setInventoryId(inventory.getInventoryId().toString());
        info.setVin(inventory.getVin());
        info.setChassisNumber(inventory.getChassisNumber());
        info.setSellingPrice(inventory.getSellingPrice());
        info.setStatus(inventory.getStatus());
        info.setWarehouseLocation(inventory.getWarehouseLocation());
        return info;
    }
}
