package com.evdealer.controller;

import com.evdealer.dto.*;
import com.evdealer.entity.*;
import com.evdealer.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/")
@CrossOrigin(origins = "*")
@Tag(name = "Home - Main Page", description = "Trang chính cho khách hàng - không cần đăng nhập")
public class HomeController {
    
    @Autowired
    private VehicleService vehicleService;
    
    @Autowired
    private VehicleInventoryService vehicleInventoryService;
    
    @Autowired
    private PromotionService promotionService;
    
    // Removed unused injected services after DTO refactor to avoid warnings
    
    // ==================== HOME PAGE ENDPOINTS ====================
    
    @GetMapping
    @Operation(summary = "Trang chủ", description = "Thông tin tổng quan cho trang chủ")
    public ResponseEntity<Map<String, Object>> getHomePage() {
        Map<String, Object> homeData = new HashMap<>();
        
        // Featured vehicles (available inventory)
        List<VehicleInventory> featuredVehicles = vehicleInventoryService.getInventoryByStatus("available");
        homeData.put("featuredVehicles", featuredVehicles.stream().map(this::toInventoryDTO).toList());
        
        // Active promotions
        List<Promotion> activePromotions = promotionService.getPromotionsByStatus("active");
        homeData.put("activePromotions", activePromotions.stream().map(this::toPromotionDTO).toList());
        
        // Statistics
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVehicles", featuredVehicles.size());
        stats.put("activePromotions", activePromotions.size());
        homeData.put("statistics", stats);
        
        return ResponseEntity.ok(homeData);
    }
    
    @GetMapping("/catalog")
    @Operation(summary = "Danh mục xe", description = "Xem tất cả xe có sẵn")
    public ResponseEntity<Map<String, Object>> getVehicleCatalog() {
        Map<String, Object> catalog = new HashMap<>();
        
        // Vehicle brands
        List<VehicleBrand> brands = vehicleService.getAllBrands();
        catalog.put("brands", brands.stream().map(this::toBrandDTO).toList());
        
        // Vehicle models
        List<VehicleModel> models = vehicleService.getAllModels();
        catalog.put("models", models.stream().map(this::toModelDTO).toList());
        
        // Vehicle variants
        List<VehicleVariant> variants = vehicleService.getAllVariants();
        catalog.put("variants", variants.stream().map(this::toVariantDTO).toList());
        
        // Vehicle colors
        List<VehicleColor> colors = vehicleService.getAllColors();
        catalog.put("colors", colors.stream().map(this::toColorDTO).toList());
        
        // Available inventory
        List<VehicleInventory> inventory = vehicleInventoryService.getInventoryByStatus("available");
        catalog.put("availableInventory", inventory.stream().map(this::toInventoryDTO).toList());
        
        return ResponseEntity.ok(catalog);
    }
    
    @GetMapping("/promotions")
    @Operation(summary = "Khuyến mãi", description = "Xem tất cả khuyến mãi đang hoạt động")
    public ResponseEntity<List<PromotionDTO>> getPromotions() {
        List<Promotion> promotions = promotionService.getPromotionsByStatus("active");
        return ResponseEntity.ok(promotions.stream().map(this::toPromotionDTO).toList());
    }
    
    // ==================== CUSTOMER ACTIONS (READ-ONLY) ====================
    // Note: All CRUD operations have been moved to authenticated endpoints
    // This controller now only provides read-only access for customers
    
    // ==================== SEARCH & FILTER ====================
    
    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm", description = "Tìm kiếm xe theo tiêu chí")
    public ResponseEntity<Map<String, Object>> searchVehicles(
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String variant,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        
        Map<String, Object> searchResults = new HashMap<>();
        
        // Get all available inventory
        List<VehicleInventory> allInventory = vehicleInventoryService.getInventoryByStatus("available");
        searchResults.put("results", allInventory.stream().map(this::toInventoryDTO).toList());
        searchResults.put("totalCount", allInventory.size());
        
        return ResponseEntity.ok(searchResults);
    }
    
    @GetMapping("/inventory/available")
    @Operation(summary = "Xe có sẵn", description = "Xem tất cả xe có sẵn để mua")
    public ResponseEntity<List<VehicleInventoryDTO>> getAvailableVehicles() {
        List<VehicleInventory> availableVehicles = vehicleInventoryService.getInventoryByStatus("available");
        return ResponseEntity.ok(availableVehicles.stream().map(this::toInventoryDTO).toList());
    }
    
    @GetMapping("/inventory/{inventoryId}")
    @Operation(summary = "Chi tiết xe", description = "Xem chi tiết xe trong kho")
    public ResponseEntity<VehicleInventoryDTO> getVehicleDetails(@PathVariable UUID inventoryId) {
        return vehicleInventoryService.getInventoryById(inventoryId)
                .map(inventory -> ResponseEntity.ok(toInventoryDTO(inventory)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    // ==================== BRAND & MODEL ENDPOINTS ====================
    
    @GetMapping("/brands")
    @Operation(summary = "Thương hiệu", description = "Xem tất cả thương hiệu xe")
    public ResponseEntity<List<VehicleBrandDTO>> getBrands() {
        List<VehicleBrand> brands = vehicleService.getAllBrands();
        return ResponseEntity.ok(brands.stream().map(this::toBrandDTO).toList());
    }
    
    @GetMapping("/brands/{brandId}")
    @Operation(summary = "Chi tiết thương hiệu", description = "Xem chi tiết thương hiệu")
    public ResponseEntity<VehicleBrandDTO> getBrandDetails(@PathVariable Integer brandId) {
        return vehicleService.getBrandById(brandId)
                .map(brand -> ResponseEntity.ok(toBrandDTO(brand)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/models")
    @Operation(summary = "Mẫu xe", description = "Xem tất cả mẫu xe")
    public ResponseEntity<List<VehicleModelDTO>> getModels() {
        List<VehicleModel> models = vehicleService.getAllModels();
        return ResponseEntity.ok(models.stream().map(this::toModelDTO).toList());
    }
    
    @GetMapping("/models/{modelId}")
    @Operation(summary = "Chi tiết mẫu xe", description = "Xem chi tiết mẫu xe")
    public ResponseEntity<VehicleModelDTO> getModelDetails(@PathVariable Integer modelId) {
        return vehicleService.getModelById(modelId)
                .map(model -> ResponseEntity.ok(toModelDTO(model)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/variants")
    @Operation(summary = "Phiên bản xe", description = "Xem tất cả phiên bản xe")
    public ResponseEntity<List<VehicleVariantDTO>> getVariants() {
        List<VehicleVariant> variants = vehicleService.getAllVariants();
        return ResponseEntity.ok(variants.stream().map(this::toVariantDTO).toList());
    }
    
    @GetMapping("/variants/{variantId}")
    @Operation(summary = "Chi tiết phiên bản xe", description = "Xem chi tiết phiên bản xe")
    public ResponseEntity<VehicleVariantDTO> getVariantDetails(@PathVariable Integer variantId) {
        return vehicleService.getVariantById(variantId)
                .map(variant -> ResponseEntity.ok(toVariantDTO(variant)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/colors")
    @Operation(summary = "Màu xe", description = "Xem tất cả màu xe")
    public ResponseEntity<List<VehicleColorDTO>> getColors() {
        List<VehicleColor> colors = vehicleService.getAllColors();
        return ResponseEntity.ok(colors.stream().map(this::toColorDTO).toList());
    }
    
    @GetMapping("/colors/{colorId}")
    @Operation(summary = "Chi tiết màu xe", description = "Xem chi tiết màu xe")
    public ResponseEntity<VehicleColorDTO> getColorDetails(@PathVariable Integer colorId) {
        return vehicleService.getColorById(colorId)
                .map(color -> ResponseEntity.ok(toColorDTO(color)))
                .orElse(ResponseEntity.notFound().build());
    }

    private VehicleBrandDTO toBrandDTO(VehicleBrand b) {
        VehicleBrandDTO dto = new VehicleBrandDTO();
        dto.setBrandId(b.getBrandId());
        dto.setBrandName(b.getBrandName());
        dto.setCountry(b.getCountry());
        dto.setFoundedYear(b.getFoundedYear());
        return dto;
    }

    private VehicleModelDTO toModelDTO(VehicleModel m) {
        VehicleModelDTO dto = new VehicleModelDTO();
        dto.setModelId(m.getModelId());
        dto.setBrandId(m.getBrand() != null ? m.getBrand().getBrandId() : null);
        dto.setModelName(m.getModelName());
        dto.setModelYear(m.getModelYear());
        dto.setVehicleType(m.getVehicleType());
        return dto;
    }

    private VehicleVariantDTO toVariantDTO(VehicleVariant v) {
        VehicleVariantDTO dto = new VehicleVariantDTO();
        dto.setVariantId(v.getVariantId());
        dto.setModelId(v.getModel() != null ? v.getModel().getModelId() : null);
        dto.setVariantName(v.getVariantName());
        dto.setPriceBase(v.getPriceBase());
        dto.setRangeKm(v.getRangeKm());
        return dto;
    }

    private VehicleColorDTO toColorDTO(VehicleColor c) {
        VehicleColorDTO dto = new VehicleColorDTO();
        dto.setColorId(c.getColorId());
        dto.setColorName(c.getColorName());
        dto.setColorCode(c.getColorCode());
        return dto;
    }

    private VehicleInventoryDTO toInventoryDTO(VehicleInventory inv) {
        VehicleInventoryDTO dto = new VehicleInventoryDTO();
        dto.setInventoryId(inv.getInventoryId());
        dto.setVariantId(inv.getVariant() != null ? inv.getVariant().getVariantId() : null);
        dto.setColorId(inv.getColor() != null ? inv.getColor().getColorId() : null);
        dto.setWarehouseId(inv.getWarehouse() != null ? inv.getWarehouse().getWarehouseId() : null);
        dto.setStatus(inv.getStatus());
        dto.setVin(inv.getVin());
        dto.setArrivalDate(inv.getArrivalDate());
        dto.setSellingPrice(inv.getSellingPrice());
        return dto;
    }

    private PromotionDTO toPromotionDTO(Promotion p) {
        PromotionDTO dto = new PromotionDTO();
        dto.setPromotionId(p.getPromotionId());
        dto.setVariantId(p.getVariant() != null ? p.getVariant().getVariantId() : null);
        dto.setTitle(p.getTitle());
        dto.setDiscountPercent(p.getDiscountPercent());
        dto.setDiscountAmount(p.getDiscountAmount());
        dto.setStartDate(p.getStartDate());
        dto.setEndDate(p.getEndDate());
        return dto;
    }
}