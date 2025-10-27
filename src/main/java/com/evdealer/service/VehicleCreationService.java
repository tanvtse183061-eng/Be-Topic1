package com.evdealer.service;

import com.evdealer.dto.CreateVehicleRequest;
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
public class VehicleCreationService {
    
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
    private FileUploadService fileUploadService;
    
    @Autowired
    private ImageUpdateService imageUpdateService;
    
    public CreateVehicleResponse createCompleteVehicle(CreateVehicleRequest request) throws IOException {
        CreateVehicleResponse response = new CreateVehicleResponse();
        
        try {
            // 1. Tạo hoặc lấy thương hiệu
            VehicleBrand brand = createOrGetBrand(request);
            response.setBrand(createBrandInfo(brand));
            
            // 2. Tạo mẫu xe
            VehicleModel model = createModel(request, brand);
            response.setModel(createModelInfo(model));
            
            // 3. Tạo phiên bản xe
            VehicleVariant variant = createVariant(request, model);
            response.setVariant(createVariantInfo(variant));
            
            // 4. Tạo màu xe
            VehicleColor color = createOrGetColor(request);
            response.setColor(createColorInfo(color));
            
            // 5. Tạo xe trong kho
            VehicleInventory inventory = createInventory(request, variant, color);
            response.setInventory(createInventoryInfo(inventory));
            
            // 6. Upload và xử lý hình ảnh
            CreateVehicleResponse.ImageUploadResult imageResult = uploadAllImages(request, brand, model, variant, color, inventory);
            response.setImageUploads(imageResult);
            
            response.setSuccess(true);
            response.setMessage("Vehicle created successfully with all components and images");
            
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Failed to create vehicle: " + e.getMessage());
            throw e;
        }
        
        return response;
    }
    
    private VehicleBrand createOrGetBrand(CreateVehicleRequest request) throws IOException {
        // Kiểm tra xem thương hiệu đã tồn tại chưa
        VehicleBrand existingBrand = vehicleBrandRepository.findByBrandName(request.getBrandName()).orElse(null);
        
        if (existingBrand != null) {
            // Cập nhật logo nếu có
            if (request.getBrandLogo() != null && !request.getBrandLogo().isEmpty()) {
                updateBrandLogo(existingBrand, request.getBrandLogo());
            }
            return existingBrand;
        }
        
        // Tạo thương hiệu mới
        VehicleBrand brand = new VehicleBrand();
        brand.setBrandName(request.getBrandName());
        brand.setCountry(request.getBrandCountry() != null ? request.getBrandCountry() : "Unknown");
        brand.setIsActive(true);
        
        VehicleBrand savedBrand = vehicleBrandRepository.save(brand);
        
        // Upload logo nếu có
        if (request.getBrandLogo() != null && !request.getBrandLogo().isEmpty()) {
            updateBrandLogo(savedBrand, request.getBrandLogo());
        }
        
        return savedBrand;
    }
    
    private VehicleModel createModel(CreateVehicleRequest request, VehicleBrand brand) throws IOException {
        VehicleModel model = new VehicleModel();
        model.setModelName(request.getModelName());
        model.setVehicleType(request.getVehicleType() != null ? request.getVehicleType() : "Unknown");
        model.setModelYear(request.getModelYear() != null ? request.getModelYear() : 2024);
        model.setDescription(request.getModelDescription());
        model.setBrand(brand);
        model.setIsActive(true);
        
        VehicleModel savedModel = vehicleModelRepository.save(model);
        
        // Upload hình ảnh mẫu xe nếu có
        if (request.getModelImage() != null && !request.getModelImage().isEmpty()) {
            updateModelImage(savedModel, request.getModelImage());
        }
        
        return savedModel;
    }
    
    private VehicleVariant createVariant(CreateVehicleRequest request, VehicleModel model) throws IOException {
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
    
    private VehicleColor createOrGetColor(CreateVehicleRequest request) throws IOException {
        // Kiểm tra xem màu đã tồn tại chưa
        VehicleColor existingColor = vehicleColorRepository.findByColorName(request.getColorName()).orElse(null);
        
        if (existingColor != null) {
            // Cập nhật mẫu màu nếu có
            if (request.getColorSwatch() != null && !request.getColorSwatch().isEmpty()) {
                updateColorSwatch(existingColor, request.getColorSwatch());
            }
            return existingColor;
        }
        
        // Tạo màu mới
        VehicleColor color = new VehicleColor();
        color.setColorName(request.getColorName());
        color.setColorCode(request.getColorCode() != null ? request.getColorCode() : "#000000");
        color.setIsActive(true);
        
        VehicleColor savedColor = vehicleColorRepository.save(color);
        
        // Upload mẫu màu nếu có
        if (request.getColorSwatch() != null && !request.getColorSwatch().isEmpty()) {
            updateColorSwatch(savedColor, request.getColorSwatch());
        }
        
        return savedColor;
    }
    
    private VehicleInventory createInventory(CreateVehicleRequest request, VehicleVariant variant, VehicleColor color) {
        VehicleInventory inventory = new VehicleInventory();
        inventory.setVin(request.getVin());
        inventory.setChassisNumber(request.getChassisNumber());
        inventory.setSellingPrice(request.getSellingPrice() != null ? request.getSellingPrice() : variant.getPriceBase());
        inventory.setStatus(request.getStatus() != null ? request.getStatus() : "AVAILABLE");
        inventory.setVariant(variant);
        inventory.setColor(color);
        
        // Set warehouse if provided
        if (request.getWarehouseId() != null && !request.getWarehouseId().trim().isEmpty()) {
            try {
                UUID.fromString(request.getWarehouseId());
                // Note: You'll need to inject WarehouseRepository if you want to validate warehouse exists
                // For now, we'll just validate UUID format
            } catch (IllegalArgumentException e) {
                // Invalid UUID format, skip warehouse assignment
            }
        }
        
        inventory.setWarehouseLocation(request.getWarehouseLocation());
        
        return vehicleInventoryRepository.save(inventory);
    }
    
    private CreateVehicleResponse.ImageUploadResult uploadAllImages(
            CreateVehicleRequest request, 
            VehicleBrand brand, 
            VehicleModel model, 
            VehicleVariant variant, 
            VehicleColor color, 
            VehicleInventory inventory) throws IOException {
        
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
    
    // Helper methods for updating images
    private void updateBrandLogo(VehicleBrand brand, MultipartFile logoFile) throws IOException {
        FileUploadService.FileUploadResult result = fileUploadService.uploadImage(logoFile, "brands");
        // Update brand logo directly in entity
        brand.setBrandLogoUrl(result.getUrl());
        vehicleBrandRepository.save(brand);
    }
    
    private void updateModelImage(VehicleModel model, MultipartFile imageFile) throws IOException {
        FileUploadService.FileUploadResult result = fileUploadService.uploadImage(imageFile, "models");
        imageUpdateService.updateModelImage(model.getModelId(), result.getUrl(), result.getUrl());
    }
    
    private void updateVariantImage(VehicleVariant variant, MultipartFile imageFile) throws IOException {
        FileUploadService.FileUploadResult result = fileUploadService.uploadImage(imageFile, "variants");
        imageUpdateService.updateVariantImage(variant.getVariantId(), result.getUrl(), result.getUrl());
    }
    
    private void updateColorSwatch(VehicleColor color, MultipartFile swatchFile) throws IOException {
        FileUploadService.FileUploadResult result = fileUploadService.uploadImage(swatchFile, "colors");
        imageUpdateService.updateColorSwatch(color.getColorId(), result.getUrl(), result.getUrl());
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
