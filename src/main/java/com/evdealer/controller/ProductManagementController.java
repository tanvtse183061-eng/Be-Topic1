package com.evdealer.controller;

import com.evdealer.entity.VehicleBrand;
import com.evdealer.entity.VehicleModel;
import com.evdealer.entity.VehicleVariant;
import com.evdealer.entity.VehicleColor;
import com.evdealer.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
@Tag(name = "Vehicle Product Management", description = "APIs for managing electric vehicle products, brands, models, variants and colors")
public class ProductManagementController {

    @Autowired
    private VehicleService vehicleService;

    // ========== VEHICLE BRAND MANAGEMENT ==========

    @GetMapping("/brands")
    @Operation(summary = "Get all vehicle brands", description = "Retrieve a list of all vehicle brands")
    public ResponseEntity<List<VehicleBrand>> getAllBrands() {
        List<VehicleBrand> brands = vehicleService.getAllBrands();
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/brands/{brandId}")
    @Operation(summary = "Get brand by ID", description = "Retrieve a specific vehicle brand by its ID")
    public ResponseEntity<VehicleBrand> getBrandById(@PathVariable @Parameter(description = "Brand ID") Integer brandId) {
        return vehicleService.getBrandById(brandId)
                .map(brand -> ResponseEntity.ok(brand))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/brands")
    @Operation(summary = "Create vehicle brand", description = "Create a new vehicle brand")
    public ResponseEntity<VehicleBrand> createBrand(@RequestBody VehicleBrand brand) {
        try {
            VehicleBrand createdBrand = vehicleService.createBrand(brand);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBrand);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/brands/{brandId}")
    @Operation(summary = "Update vehicle brand", description = "Update an existing vehicle brand")
    public ResponseEntity<VehicleBrand> updateBrand(@PathVariable Integer brandId, @RequestBody VehicleBrand brandDetails) {
        try {
            VehicleBrand updatedBrand = vehicleService.updateBrand(brandId, brandDetails);
            return ResponseEntity.ok(updatedBrand);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/brands/{brandId}")
    @Operation(summary = "Delete vehicle brand", description = "Delete a vehicle brand")
    public ResponseEntity<Void> deleteBrand(@PathVariable Integer brandId) {
        try {
            vehicleService.deleteBrand(brandId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== VEHICLE MODEL MANAGEMENT ==========

    @GetMapping("/models")
    @Operation(summary = "Get all vehicle models", description = "Retrieve a list of all vehicle models")
    public ResponseEntity<List<VehicleModel>> getAllModels() {
        List<VehicleModel> models = vehicleService.getAllModels();
        return ResponseEntity.ok(models);
    }

    @GetMapping("/models/brand/{brandId}")
    @Operation(summary = "Get models by brand", description = "Retrieve all models for a specific brand")
    public ResponseEntity<List<VehicleModel>> getModelsByBrand(@PathVariable Integer brandId) {
        List<VehicleModel> models = vehicleService.getModelsByBrand(brandId);
        return ResponseEntity.ok(models);
    }

    @GetMapping("/models/{modelId}")
    @Operation(summary = "Get model by ID", description = "Retrieve a specific vehicle model by its ID")
    public ResponseEntity<VehicleModel> getModelById(@PathVariable @Parameter(description = "Model ID") Integer modelId) {
        return vehicleService.getModelById(modelId)
                .map(model -> ResponseEntity.ok(model))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/models")
    @Operation(summary = "Create vehicle model", description = "Create a new vehicle model")
    public ResponseEntity<VehicleModel> createModel(@RequestBody VehicleModel model) {
        try {
            VehicleModel createdModel = vehicleService.createModel(model);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdModel);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/models/{modelId}")
    @Operation(summary = "Update vehicle model", description = "Update an existing vehicle model")
    public ResponseEntity<VehicleModel> updateModel(@PathVariable Integer modelId, @RequestBody VehicleModel modelDetails) {
        try {
            VehicleModel updatedModel = vehicleService.updateModel(modelId, modelDetails);
            return ResponseEntity.ok(updatedModel);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/models/{modelId}")
    @Operation(summary = "Delete vehicle model", description = "Delete a vehicle model")
    public ResponseEntity<Void> deleteModel(@PathVariable Integer modelId) {
        try {
            vehicleService.deleteModel(modelId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== VEHICLE VARIANT MANAGEMENT ==========

    @GetMapping("/variants")
    @Operation(summary = "Get all vehicle variants", description = "Retrieve a list of all vehicle variants")
    public ResponseEntity<List<VehicleVariant>> getAllVariants() {
        List<VehicleVariant> variants = vehicleService.getAllVariants();
        return ResponseEntity.ok(variants);
    }

    @GetMapping("/variants/model/{modelId}")
    @Operation(summary = "Get variants by model", description = "Retrieve all variants for a specific model")
    public ResponseEntity<List<VehicleVariant>> getVariantsByModel(@PathVariable Integer modelId) {
        List<VehicleVariant> variants = vehicleService.getVariantsByModel(modelId);
        return ResponseEntity.ok(variants);
    }

    @GetMapping("/variants/{variantId}")
    @Operation(summary = "Get variant by ID", description = "Retrieve a specific vehicle variant by its ID")
    public ResponseEntity<VehicleVariant> getVariantById(@PathVariable @Parameter(description = "Variant ID") Integer variantId) {
        return vehicleService.getVariantById(variantId)
                .map(variant -> ResponseEntity.ok(variant))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/variants")
    @Operation(summary = "Create vehicle variant", description = "Create a new vehicle variant")
    public ResponseEntity<VehicleVariant> createVariant(@RequestBody VehicleVariant variant) {
        try {
            VehicleVariant createdVariant = vehicleService.createVariant(variant);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVariant);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/variants/{variantId}")
    @Operation(summary = "Update vehicle variant", description = "Update an existing vehicle variant")
    public ResponseEntity<VehicleVariant> updateVariant(@PathVariable Integer variantId, @RequestBody VehicleVariant variantDetails) {
        try {
            VehicleVariant updatedVariant = vehicleService.updateVariant(variantId, variantDetails);
            return ResponseEntity.ok(updatedVariant);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/variants/{variantId}")
    @Operation(summary = "Delete vehicle variant", description = "Delete a vehicle variant")
    public ResponseEntity<Void> deleteVariant(@PathVariable Integer variantId) {
        try {
            vehicleService.deleteVariant(variantId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== VEHICLE COLOR MANAGEMENT ==========

    @GetMapping("/colors")
    @Operation(summary = "Get all vehicle colors", description = "Retrieve a list of all vehicle colors")
    public ResponseEntity<List<VehicleColor>> getAllColors() {
        List<VehicleColor> colors = vehicleService.getAllColors();
        return ResponseEntity.ok(colors);
    }

    @GetMapping("/colors/{colorId}")
    @Operation(summary = "Get color by ID", description = "Retrieve a specific vehicle color by its ID")
    public ResponseEntity<VehicleColor> getColorById(@PathVariable @Parameter(description = "Color ID") Integer colorId) {
        return vehicleService.getColorById(colorId)
                .map(color -> ResponseEntity.ok(color))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/colors")
    @Operation(summary = "Create vehicle color", description = "Create a new vehicle color")
    public ResponseEntity<VehicleColor> createColor(@RequestBody VehicleColor color) {
        try {
            VehicleColor createdColor = vehicleService.createColor(color);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdColor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/colors/{colorId}")
    @Operation(summary = "Update vehicle color", description = "Update an existing vehicle color")
    public ResponseEntity<VehicleColor> updateColor(@PathVariable Integer colorId, @RequestBody VehicleColor colorDetails) {
        try {
            VehicleColor updatedColor = vehicleService.updateColor(colorId, colorDetails);
            return ResponseEntity.ok(updatedColor);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/colors/{colorId}")
    @Operation(summary = "Delete vehicle color", description = "Delete a vehicle color")
    public ResponseEntity<Void> deleteColor(@PathVariable Integer colorId) {
        try {
            vehicleService.deleteColor(colorId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== PRODUCT SEARCH AND FILTERING ==========

    @GetMapping("/search")
    @Operation(summary = "Search products", description = "Search for products by various criteria")
    public ResponseEntity<List<VehicleVariant>> searchProducts(
            @RequestParam(required = false) String brandName,
            @RequestParam(required = false) String modelName,
            @RequestParam(required = false) String vehicleType,
            @RequestParam(required = false) Integer minRange,
            @RequestParam(required = false) Integer maxRange,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice) {
        
        List<VehicleVariant> variants = vehicleService.getVariantsByPriceRange(
                new java.math.BigDecimal(minPrice != null ? minPrice : 0), 
                new java.math.BigDecimal(maxPrice != null ? maxPrice : 999999999));
        return ResponseEntity.ok(variants);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active products", description = "Retrieve all active vehicle variants")
    public ResponseEntity<List<VehicleVariant>> getActiveProducts() {
        List<VehicleVariant> activeVariants = vehicleService.getActiveVariants();
        return ResponseEntity.ok(activeVariants);
    }
}
