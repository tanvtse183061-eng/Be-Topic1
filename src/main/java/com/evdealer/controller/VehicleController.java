package com.evdealer.controller;

import com.evdealer.entity.VehicleBrand;
import com.evdealer.entity.VehicleModel;
import com.evdealer.entity.VehicleVariant;
import com.evdealer.entity.VehicleColor;
import com.evdealer.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
@Tag(name = "Vehicle Management", description = "APIs quản lý xe")
public class VehicleController {
    
    @Autowired
    private VehicleService vehicleService;
    
    // Vehicle Brand endpoints
    @GetMapping("/brands")
    @Operation(summary = "Lấy danh sách thương hiệu", description = "Lấy tất cả thương hiệu xe")
    public ResponseEntity<List<VehicleBrand>> getAllBrands() {
        List<VehicleBrand> brands = vehicleService.getAllBrands();
        return ResponseEntity.ok(brands);
    }
    
    @GetMapping("/brands/active")
    @Operation(summary = "Lấy thương hiệu đang hoạt động", description = "Lấy thương hiệu xe đang hoạt động")
    public ResponseEntity<List<VehicleBrand>> getActiveBrands() {
        List<VehicleBrand> brands = vehicleService.getActiveBrands();
        return ResponseEntity.ok(brands);
    }
    
    @GetMapping("/brands/{brandId}")
    @Operation(summary = "Lấy thương hiệu theo ID", description = "Lấy thông tin thương hiệu theo ID")
    public ResponseEntity<VehicleBrand> getBrandById(@PathVariable Integer brandId) {
        return vehicleService.getBrandById(brandId)
                .map(brand -> ResponseEntity.ok(brand))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/brands/name/{brandName}")
    public ResponseEntity<VehicleBrand> getBrandByName(@PathVariable String brandName) {
        return vehicleService.getBrandByName(brandName)
                .map(brand -> ResponseEntity.ok(brand))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/brands/country/{country}")
    public ResponseEntity<List<VehicleBrand>> getBrandsByCountry(@PathVariable String country) {
        List<VehicleBrand> brands = vehicleService.getBrandsByCountry(country);
        return ResponseEntity.ok(brands);
    }
    
    @GetMapping("/brands/search")
    public ResponseEntity<List<VehicleBrand>> searchBrandsByName(@RequestParam String name) {
        List<VehicleBrand> brands = vehicleService.searchBrandsByName(name);
        return ResponseEntity.ok(brands);
    }
    
    @PostMapping("/brands")
    @Operation(summary = "Tạo thương hiệu mới", description = "Tạo thương hiệu xe mới")
    public ResponseEntity<VehicleBrand> createBrand(@RequestBody VehicleBrand brand) {
        try {
            VehicleBrand createdBrand = vehicleService.createBrand(brand);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBrand);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/brands/{brandId}")
    public ResponseEntity<VehicleBrand> updateBrand(@PathVariable Integer brandId, @RequestBody VehicleBrand brandDetails) {
        try {
            VehicleBrand updatedBrand = vehicleService.updateBrand(brandId, brandDetails);
            return ResponseEntity.ok(updatedBrand);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/brands/{brandId}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Integer brandId) {
        try {
            vehicleService.deleteBrand(brandId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Vehicle Model endpoints
    @GetMapping("/models")
    @Operation(summary = "Lấy danh sách mẫu xe", description = "Lấy tất cả mẫu xe")
    public ResponseEntity<List<VehicleModel>> getAllModels() {
        List<VehicleModel> models = vehicleService.getAllModels();
        return ResponseEntity.ok(models);
    }
    
    @GetMapping("/models/active")
    @Operation(summary = "Lấy mẫu xe đang hoạt động", description = "Lấy mẫu xe đang hoạt động")
    public ResponseEntity<List<VehicleModel>> getActiveModels() {
        List<VehicleModel> models = vehicleService.getActiveModels();
        return ResponseEntity.ok(models);
    }
    
    @GetMapping("/models/{modelId}")
    public ResponseEntity<VehicleModel> getModelById(@PathVariable Integer modelId) {
        return vehicleService.getModelById(modelId)
                .map(model -> ResponseEntity.ok(model))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/models/brand/{brandId}")
    public ResponseEntity<List<VehicleModel>> getModelsByBrand(@PathVariable Integer brandId) {
        List<VehicleModel> models = vehicleService.getModelsByBrand(brandId);
        return ResponseEntity.ok(models);
    }
    
    @GetMapping("/models/brand/{brandId}/active")
    public ResponseEntity<List<VehicleModel>> getActiveModelsByBrand(@PathVariable Integer brandId) {
        List<VehicleModel> models = vehicleService.getActiveModelsByBrand(brandId);
        return ResponseEntity.ok(models);
    }
    
    @GetMapping("/models/search")
    public ResponseEntity<List<VehicleModel>> searchModelsByName(@RequestParam String name) {
        List<VehicleModel> models = vehicleService.searchModelsByName(name);
        return ResponseEntity.ok(models);
    }
    
    @GetMapping("/models/type/{vehicleType}")
    public ResponseEntity<List<VehicleModel>> getModelsByType(@PathVariable String vehicleType) {
        List<VehicleModel> models = vehicleService.getModelsByType(vehicleType);
        return ResponseEntity.ok(models);
    }
    
    @GetMapping("/models/year/{year}")
    public ResponseEntity<List<VehicleModel>> getModelsByYear(@PathVariable Integer year) {
        List<VehicleModel> models = vehicleService.getModelsByYear(year);
        return ResponseEntity.ok(models);
    }
    
    @PostMapping("/models")
    @Operation(summary = "Tạo mẫu xe mới", description = "Tạo mẫu xe mới")
    public ResponseEntity<VehicleModel> createModel(@RequestBody VehicleModel model) {
        VehicleModel createdModel = vehicleService.createModel(model);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdModel);
    }
    
    @PutMapping("/models/{modelId}")
    public ResponseEntity<VehicleModel> updateModel(@PathVariable Integer modelId, @RequestBody VehicleModel modelDetails) {
        try {
            VehicleModel updatedModel = vehicleService.updateModel(modelId, modelDetails);
            return ResponseEntity.ok(updatedModel);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/models/{modelId}")
    public ResponseEntity<Void> deleteModel(@PathVariable Integer modelId) {
        try {
            vehicleService.deleteModel(modelId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Vehicle Variant endpoints
    @GetMapping("/variants")
    @Operation(summary = "Lấy danh sách phiên bản xe", description = "Lấy tất cả phiên bản xe")
    public ResponseEntity<List<VehicleVariant>> getAllVariants() {
        List<VehicleVariant> variants = vehicleService.getAllVariants();
        return ResponseEntity.ok(variants);
    }
    
    @GetMapping("/variants/active")
    @Operation(summary = "Lấy phiên bản xe đang hoạt động", description = "Lấy phiên bản xe đang hoạt động")
    public ResponseEntity<List<VehicleVariant>> getActiveVariants() {
        List<VehicleVariant> variants = vehicleService.getActiveVariants();
        return ResponseEntity.ok(variants);
    }
    
    @GetMapping("/variants/{variantId}")
    public ResponseEntity<VehicleVariant> getVariantById(@PathVariable Integer variantId) {
        return vehicleService.getVariantById(variantId)
                .map(variant -> ResponseEntity.ok(variant))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/variants/model/{modelId}")
    public ResponseEntity<List<VehicleVariant>> getVariantsByModel(@PathVariable Integer modelId) {
        List<VehicleVariant> variants = vehicleService.getVariantsByModel(modelId);
        return ResponseEntity.ok(variants);
    }
    
    @GetMapping("/variants/model/{modelId}/active")
    public ResponseEntity<List<VehicleVariant>> getActiveVariantsByModel(@PathVariable Integer modelId) {
        List<VehicleVariant> variants = vehicleService.getActiveVariantsByModel(modelId);
        return ResponseEntity.ok(variants);
    }
    
    @GetMapping("/variants/search")
    public ResponseEntity<List<VehicleVariant>> searchVariantsByName(@RequestParam String name) {
        List<VehicleVariant> variants = vehicleService.searchVariantsByName(name);
        return ResponseEntity.ok(variants);
    }
    
    @GetMapping("/variants/price-range")
    public ResponseEntity<List<VehicleVariant>> getVariantsByPriceRange(
            @RequestParam BigDecimal minPrice, 
            @RequestParam BigDecimal maxPrice) {
        List<VehicleVariant> variants = vehicleService.getVariantsByPriceRange(minPrice, maxPrice);
        return ResponseEntity.ok(variants);
    }
    
    @GetMapping("/variants/min-range/{minRange}")
    public ResponseEntity<List<VehicleVariant>> getVariantsByMinRange(@PathVariable Integer minRange) {
        List<VehicleVariant> variants = vehicleService.getVariantsByMinRange(minRange);
        return ResponseEntity.ok(variants);
    }
    
    @PostMapping("/variants")
    @Operation(summary = "Tạo phiên bản xe mới", description = "Tạo phiên bản xe mới")
    public ResponseEntity<VehicleVariant> createVariant(@RequestBody VehicleVariant variant) {
        VehicleVariant createdVariant = vehicleService.createVariant(variant);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdVariant);
    }
    
    @PutMapping("/variants/{variantId}")
    public ResponseEntity<VehicleVariant> updateVariant(@PathVariable Integer variantId, @RequestBody VehicleVariant variantDetails) {
        try {
            VehicleVariant updatedVariant = vehicleService.updateVariant(variantId, variantDetails);
            return ResponseEntity.ok(updatedVariant);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/variants/{variantId}")
    public ResponseEntity<Void> deleteVariant(@PathVariable Integer variantId) {
        try {
            vehicleService.deleteVariant(variantId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Vehicle Color endpoints
    @GetMapping("/colors")
    @Operation(summary = "Lấy danh sách màu sắc", description = "Lấy tất cả màu sắc xe")
    public ResponseEntity<List<VehicleColor>> getAllColors() {
        List<VehicleColor> colors = vehicleService.getAllColors();
        return ResponseEntity.ok(colors);
    }
    
    @GetMapping("/colors/active")
    @Operation(summary = "Lấy màu sắc đang hoạt động", description = "Lấy màu sắc xe đang hoạt động")
    public ResponseEntity<List<VehicleColor>> getActiveColors() {
        List<VehicleColor> colors = vehicleService.getActiveColors();
        return ResponseEntity.ok(colors);
    }
    
    @GetMapping("/colors/{colorId}")
    public ResponseEntity<VehicleColor> getColorById(@PathVariable Integer colorId) {
        return vehicleService.getColorById(colorId)
                .map(color -> ResponseEntity.ok(color))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/colors/name/{colorName}")
    public ResponseEntity<VehicleColor> getColorByName(@PathVariable String colorName) {
        return vehicleService.getColorByName(colorName)
                .map(color -> ResponseEntity.ok(color))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/colors/code/{colorCode}")
    public ResponseEntity<VehicleColor> getColorByCode(@PathVariable String colorCode) {
        return vehicleService.getColorByCode(colorCode)
                .map(color -> ResponseEntity.ok(color))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/colors/search")
    public ResponseEntity<List<VehicleColor>> searchColorsByName(@RequestParam String name) {
        List<VehicleColor> colors = vehicleService.searchColorsByName(name);
        return ResponseEntity.ok(colors);
    }
    
    @PostMapping("/colors")
    @Operation(summary = "Tạo màu sắc mới", description = "Tạo màu sắc xe mới")
    public ResponseEntity<VehicleColor> createColor(@RequestBody VehicleColor color) {
        try {
            VehicleColor createdColor = vehicleService.createColor(color);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdColor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/colors/{colorId}")
    public ResponseEntity<VehicleColor> updateColor(@PathVariable Integer colorId, @RequestBody VehicleColor colorDetails) {
        try {
            VehicleColor updatedColor = vehicleService.updateColor(colorId, colorDetails);
            return ResponseEntity.ok(updatedColor);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/colors/{colorId}")
    public ResponseEntity<Void> deleteColor(@PathVariable Integer colorId) {
        try {
            vehicleService.deleteColor(colorId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

