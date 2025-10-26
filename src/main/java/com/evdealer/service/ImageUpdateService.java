package com.evdealer.service;

import com.evdealer.entity.VehicleBrand;
import com.evdealer.entity.VehicleModel;
import com.evdealer.entity.VehicleVariant;
import com.evdealer.entity.VehicleColor;
import com.evdealer.entity.VehicleInventory;
import com.evdealer.repository.VehicleBrandRepository;
import com.evdealer.repository.VehicleModelRepository;
import com.evdealer.repository.VehicleVariantRepository;
import com.evdealer.repository.VehicleColorRepository;
import com.evdealer.repository.VehicleInventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ImageUpdateService {
    
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
    
    public Map<String, Object> updateBrandImage(Integer brandId, String imageUrl, String imagePath) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Optional<VehicleBrand> brandOpt = vehicleBrandRepository.findById(brandId);
            if (brandOpt.isPresent()) {
                VehicleBrand brand = brandOpt.get();
                brand.setBrandLogoUrl(imageUrl);
                brand.setBrandLogoPath(imagePath);
                vehicleBrandRepository.save(brand);
                
                result.put("success", true);
                result.put("message", "Brand logo updated successfully");
                result.put("brandId", brandId);
                result.put("imageUrl", imageUrl);
            } else {
                result.put("success", false);
                result.put("message", "Brand not found with ID: " + brandId);
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Failed to update brand image: " + e.getMessage());
        }
        
        return result;
    }
    
    public Map<String, Object> updateModelImage(Integer modelId, String imageUrl, String imagePath) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Optional<VehicleModel> modelOpt = vehicleModelRepository.findById(modelId);
            if (modelOpt.isPresent()) {
                VehicleModel model = modelOpt.get();
                model.setModelImageUrl(imageUrl);
                model.setModelImagePath(imagePath);
                vehicleModelRepository.save(model);
                
                result.put("success", true);
                result.put("message", "Model image updated successfully");
                result.put("modelId", modelId);
                result.put("imageUrl", imageUrl);
            } else {
                result.put("success", false);
                result.put("message", "Model not found with ID: " + modelId);
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Failed to update model image: " + e.getMessage());
        }
        
        return result;
    }
    
    public Map<String, Object> updateVariantImage(Integer variantId, String imageUrl, String imagePath) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Optional<VehicleVariant> variantOpt = vehicleVariantRepository.findById(variantId);
            if (variantOpt.isPresent()) {
                VehicleVariant variant = variantOpt.get();
                variant.setVariantImageUrl(imageUrl);
                variant.setVariantImagePath(imagePath);
                vehicleVariantRepository.save(variant);
                
                result.put("success", true);
                result.put("message", "Variant image updated successfully");
                result.put("variantId", variantId);
                result.put("imageUrl", imageUrl);
            } else {
                result.put("success", false);
                result.put("message", "Variant not found with ID: " + variantId);
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Failed to update variant image: " + e.getMessage());
        }
        
        return result;
    }
    
    public Map<String, Object> updateColorSwatch(Integer colorId, String imageUrl, String imagePath) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Optional<VehicleColor> colorOpt = vehicleColorRepository.findById(colorId);
            if (colorOpt.isPresent()) {
                VehicleColor color = colorOpt.get();
                color.setColorSwatchUrl(imageUrl);
                color.setColorSwatchPath(imagePath);
                vehicleColorRepository.save(color);
                
                result.put("success", true);
                result.put("message", "Color swatch updated successfully");
                result.put("colorId", colorId);
                result.put("imageUrl", imageUrl);
            } else {
                result.put("success", false);
                result.put("message", "Color not found with ID: " + colorId);
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Failed to update color swatch: " + e.getMessage());
        }
        
        return result;
    }
    
    public Map<String, Object> updateInventoryImages(UUID inventoryId, String imageType, String imagesJson) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Optional<VehicleInventory> inventoryOpt = vehicleInventoryRepository.findById(inventoryId);
            if (inventoryOpt.isPresent()) {
                VehicleInventory inventory = inventoryOpt.get();
                
                switch (imageType.toLowerCase()) {
                    case "main":
                    case "vehicle":
                        inventory.setVehicleImages(imagesJson);
                        break;
                    case "interior":
                        inventory.setInteriorImages(imagesJson);
                        break;
                    case "exterior":
                        inventory.setExteriorImages(imagesJson);
                        break;
                    default:
                        result.put("success", false);
                        result.put("message", "Invalid image type: " + imageType);
                        return result;
                }
                
                vehicleInventoryRepository.save(inventory);
                
                result.put("success", true);
                result.put("message", "Inventory " + imageType + " images updated successfully");
                result.put("inventoryId", inventoryId);
                result.put("imageType", imageType);
            } else {
                result.put("success", false);
                result.put("message", "Inventory not found with ID: " + inventoryId);
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Failed to update inventory images: " + e.getMessage());
        }
        
        return result;
    }
    
    public Map<String, Object> updateInventoryImagesFromUploadResult(UUID inventoryId, String imageType, FileUploadService.FileUploadResult uploadResult) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Convert upload result to JSON format
            String imagesJson = convertUploadResultToJson(uploadResult, imageType);
            
            // Update inventory
            return updateInventoryImages(inventoryId, imageType, imagesJson);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Failed to process upload result: " + e.getMessage());
            return result;
        }
    }
    
    private String convertUploadResultToJson(FileUploadService.FileUploadResult uploadResult, String imageType) {
        Map<String, String> images = new HashMap<>();
        
        if (uploadResult.isMultipleFiles()) {
            // Multiple files
            for (int i = 0; i < uploadResult.getFiles().size(); i++) {
                FileUploadService.FileUploadResult file = uploadResult.getFiles().get(i);
                String key = getImageKey(imageType, i);
                images.put(key, file.getUrl());
            }
        } else {
            // Single file
            images.put("main", uploadResult.getUrl());
        }
        
        // Convert to JSON string
        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, String> entry : images.entrySet()) {
            if (!first) json.append(", ");
            json.append("\"").append(entry.getKey()).append("\": \"").append(entry.getValue()).append("\"");
            first = false;
        }
        json.append("}");
        
        return json.toString();
    }
    
    private String getImageKey(String imageType, int index) {
        switch (imageType.toLowerCase()) {
            case "main":
            case "vehicle":
                String[] vehicleKeys = {"main", "rear", "side", "front", "interior"};
                return vehicleKeys[Math.min(index, vehicleKeys.length - 1)];
            case "interior":
                String[] interiorKeys = {"seats", "console", "dashboard", "steering", "center"};
                return interiorKeys[Math.min(index, interiorKeys.length - 1)];
            case "exterior":
                String[] exteriorKeys = {"front_view", "rear_view", "side_view", "wheel", "detail"};
                return exteriorKeys[Math.min(index, exteriorKeys.length - 1)];
            default:
                return "image_" + (index + 1);
        }
    }
}
