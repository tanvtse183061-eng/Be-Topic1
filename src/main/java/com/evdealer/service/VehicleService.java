package com.evdealer.service;

import com.evdealer.entity.VehicleBrand;
import com.evdealer.entity.VehicleModel;
import com.evdealer.entity.VehicleVariant;
import com.evdealer.entity.VehicleColor;
import com.evdealer.repository.VehicleBrandRepository;
import com.evdealer.repository.VehicleModelRepository;
import com.evdealer.repository.VehicleVariantRepository;
import com.evdealer.repository.VehicleColorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class VehicleService {
    
    @Autowired
    private VehicleBrandRepository vehicleBrandRepository;
    
    @Autowired
    private VehicleModelRepository vehicleModelRepository;
    
    @Autowired
    private VehicleVariantRepository vehicleVariantRepository;
    
    @Autowired
    private VehicleColorRepository vehicleColorRepository;
    
    // Vehicle Brand methods
    public List<VehicleBrand> getAllBrands() {
        return vehicleBrandRepository.findAll();
    }
    
    public List<VehicleBrand> getActiveBrands() {
        return vehicleBrandRepository.findByIsActiveTrue();
    }
    
    public Optional<VehicleBrand> getBrandById(Integer brandId) {
        return vehicleBrandRepository.findById(brandId);
    }
    
    public Optional<VehicleBrand> getBrandByName(String brandName) {
        return vehicleBrandRepository.findByBrandName(brandName);
    }
    
    public List<VehicleBrand> getBrandsByCountry(String country) {
        return vehicleBrandRepository.findByCountry(country);
    }
    
    public List<VehicleBrand> searchBrandsByName(String name) {
        return vehicleBrandRepository.findByBrandNameContaining(name);
    }
    
    public VehicleBrand createBrand(VehicleBrand brand) {
        if (vehicleBrandRepository.existsByBrandName(brand.getBrandName())) {
            throw new RuntimeException("Brand already exists: " + brand.getBrandName());
        }
        return vehicleBrandRepository.save(brand);
    }
    
    public VehicleBrand updateBrand(Integer brandId, VehicleBrand brandDetails) {
        VehicleBrand brand = vehicleBrandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + brandId));
        
        if (!brand.getBrandName().equals(brandDetails.getBrandName()) && 
            vehicleBrandRepository.existsByBrandName(brandDetails.getBrandName())) {
            throw new RuntimeException("Brand already exists: " + brandDetails.getBrandName());
        }
        
        brand.setBrandName(brandDetails.getBrandName());
        brand.setCountry(brandDetails.getCountry());
        brand.setFoundedYear(brandDetails.getFoundedYear());
        brand.setBrandLogoUrl(brandDetails.getBrandLogoUrl());
        brand.setBrandLogoPath(brandDetails.getBrandLogoPath());
        brand.setIsActive(brandDetails.getIsActive());
        
        return vehicleBrandRepository.save(brand);
    }
    
    public void deleteBrand(Integer brandId) {
        VehicleBrand brand = vehicleBrandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + brandId));
        vehicleBrandRepository.delete(brand);
    }
    
    // Vehicle Model methods
    public List<VehicleModel> getAllModels() {
        try {
            return vehicleModelRepository.findAll();
        } catch (Exception e) {
            // Return empty list if there's an issue
            return new java.util.ArrayList<>();
        }
    }
    
    public List<VehicleModel> getActiveModels() {
        return vehicleModelRepository.findByIsActiveTrue();
    }
    
    public Optional<VehicleModel> getModelById(Integer modelId) {
        return vehicleModelRepository.findById(modelId);
    }
    
    public List<VehicleModel> getModelsByBrand(Integer brandId) {
        return vehicleModelRepository.findByBrandBrandId(brandId);
    }
    
    public List<VehicleModel> getActiveModelsByBrand(Integer brandId) {
        return vehicleModelRepository.findActiveByBrandId(brandId);
    }
    
    public List<VehicleModel> searchModelsByName(String name) {
        return vehicleModelRepository.findByModelNameContaining(name);
    }
    
    public List<VehicleModel> getModelsByType(String vehicleType) {
        return vehicleModelRepository.findByVehicleType(vehicleType);
    }
    
    public List<VehicleModel> getModelsByYear(Integer year) {
        return vehicleModelRepository.findByModelYear(year);
    }
    
    public VehicleModel createModel(VehicleModel model) {
        return vehicleModelRepository.save(model);
    }
    
    public VehicleModel updateModel(Integer modelId, VehicleModel modelDetails) {
        VehicleModel model = vehicleModelRepository.findById(modelId)
                .orElseThrow(() -> new RuntimeException("Model not found with id: " + modelId));
        
        model.setBrand(modelDetails.getBrand());
        model.setModelName(modelDetails.getModelName());
        model.setModelYear(modelDetails.getModelYear());
        model.setVehicleType(modelDetails.getVehicleType());
        model.setDescription(modelDetails.getDescription());
        model.setSpecifications(modelDetails.getSpecifications());
        model.setModelImageUrl(modelDetails.getModelImageUrl());
        model.setModelImagePath(modelDetails.getModelImagePath());
        model.setIsActive(modelDetails.getIsActive());
        
        return vehicleModelRepository.save(model);
    }
    
    public void deleteModel(Integer modelId) {
        VehicleModel model = vehicleModelRepository.findById(modelId)
                .orElseThrow(() -> new RuntimeException("Model not found with id: " + modelId));
        vehicleModelRepository.delete(model);
    }
    
    // Vehicle Variant methods
    public List<VehicleVariant> getAllVariants() {
        try {
            return vehicleVariantRepository.findAll();
        } catch (Exception e) {
            // Return empty list if there's an issue
            return new java.util.ArrayList<>();
        }
    }
    
    public List<VehicleVariant> getActiveVariants() {
        return vehicleVariantRepository.findByIsActiveTrue();
    }
    
    public Optional<VehicleVariant> getVariantById(Integer variantId) {
        return vehicleVariantRepository.findById(variantId);
    }
    
    public List<VehicleVariant> getVariantsByModel(Integer modelId) {
        return vehicleVariantRepository.findByModelModelId(modelId);
    }
    
    public List<VehicleVariant> getActiveVariantsByModel(Integer modelId) {
        return vehicleVariantRepository.findActiveByModelId(modelId);
    }
    
    public List<VehicleVariant> searchVariantsByName(String name) {
        return vehicleVariantRepository.findByVariantNameContaining(name);
    }
    
    public List<VehicleVariant> getVariantsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return vehicleVariantRepository.findByPriceRange(minPrice, maxPrice);
    }
    
    public List<VehicleVariant> getVariantsByMinRange(Integer minRange) {
        return vehicleVariantRepository.findByMinRange(minRange);
    }
    
    public VehicleVariant createVariant(VehicleVariant variant) {
        return vehicleVariantRepository.save(variant);
    }
    
    public VehicleVariant updateVariant(Integer variantId, VehicleVariant variantDetails) {
        VehicleVariant variant = vehicleVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found with id: " + variantId));
        
        variant.setModel(variantDetails.getModel());
        variant.setVariantName(variantDetails.getVariantName());
        variant.setBatteryCapacity(variantDetails.getBatteryCapacity());
        variant.setRangeKm(variantDetails.getRangeKm());
        variant.setPowerKw(variantDetails.getPowerKw());
        variant.setAcceleration0100(variantDetails.getAcceleration0100());
        variant.setTopSpeed(variantDetails.getTopSpeed());
        variant.setChargingTimeFast(variantDetails.getChargingTimeFast());
        variant.setChargingTimeSlow(variantDetails.getChargingTimeSlow());
        variant.setPriceBase(variantDetails.getPriceBase());
        variant.setVariantImageUrl(variantDetails.getVariantImageUrl());
        variant.setVariantImagePath(variantDetails.getVariantImagePath());
        variant.setIsActive(variantDetails.getIsActive());
        
        return vehicleVariantRepository.save(variant);
    }
    
    public void deleteVariant(Integer variantId) {
        VehicleVariant variant = vehicleVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found with id: " + variantId));
        vehicleVariantRepository.delete(variant);
    }
    
    // Vehicle Color methods
    public List<VehicleColor> getAllColors() {
        return vehicleColorRepository.findAll();
    }
    
    public List<VehicleColor> getActiveColors() {
        return vehicleColorRepository.findByIsActiveTrue();
    }
    
    public Optional<VehicleColor> getColorById(Integer colorId) {
        return vehicleColorRepository.findById(colorId);
    }
    
    public Optional<VehicleColor> getColorByName(String colorName) {
        return vehicleColorRepository.findByColorName(colorName);
    }
    
    public Optional<VehicleColor> getColorByCode(String colorCode) {
        return vehicleColorRepository.findByColorCode(colorCode);
    }
    
    public List<VehicleColor> searchColorsByName(String name) {
        return vehicleColorRepository.findByColorNameContainingIgnoreCase(name);
    }
    
    public VehicleColor createColor(VehicleColor color) {
        if (vehicleColorRepository.existsByColorName(color.getColorName())) {
            throw new RuntimeException("Color already exists: " + color.getColorName());
        }
        return vehicleColorRepository.save(color);
    }
    
    public VehicleColor updateColor(Integer colorId, VehicleColor colorDetails) {
        VehicleColor color = vehicleColorRepository.findById(colorId)
                .orElseThrow(() -> new RuntimeException("Color not found with id: " + colorId));
        
        if (!color.getColorName().equals(colorDetails.getColorName()) && 
            vehicleColorRepository.existsByColorName(colorDetails.getColorName())) {
            throw new RuntimeException("Color already exists: " + colorDetails.getColorName());
        }
        
        color.setColorName(colorDetails.getColorName());
        color.setColorCode(colorDetails.getColorCode());
        color.setColorSwatchUrl(colorDetails.getColorSwatchUrl());
        color.setColorSwatchPath(colorDetails.getColorSwatchPath());
        color.setIsActive(colorDetails.getIsActive());
        
        return vehicleColorRepository.save(color);
    }
    
    public void deleteColor(Integer colorId) {
        VehicleColor color = vehicleColorRepository.findById(colorId)
                .orElseThrow(() -> new RuntimeException("Color not found with id: " + colorId));
        vehicleColorRepository.delete(color);
    }
}

