package com.evdealer.controller;

import com.evdealer.entity.VehicleBrand;
import com.evdealer.entity.VehicleModel;
import com.evdealer.entity.VehicleVariant;
import com.evdealer.entity.VehicleColor;
import com.evdealer.entity.VehicleInventory;
import com.evdealer.entity.Warehouse;
import com.evdealer.service.VehicleService;
import com.evdealer.service.VehicleInventoryService;
import com.evdealer.service.WarehouseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/seed")
@CrossOrigin(origins = "*")
@Tag(name = "Data Seeder", description = "APIs tạo dữ liệu mẫu cho hệ thống")
public class DataSeederController {

    @Autowired
    private VehicleService vehicleService;
    
    @Autowired
    private VehicleInventoryService vehicleInventoryService;
    
    @Autowired
    private WarehouseService warehouseService;

    @PostMapping("/models")
    @Operation(summary = "Tạo mẫu xe", description = "Tạo dữ liệu mẫu cho các mẫu xe")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Tạo mẫu xe thành công",
            content = @Content(
                mediaType = "text/plain",
                schema = @Schema(example = "Sample models created successfully")
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Lỗi khi tạo mẫu xe - không tìm thấy thương hiệu hoặc lỗi hệ thống",
            content = @Content(
                mediaType = "text/plain",
                schema = @Schema(example = "No brands found. Please seed brands first.")
            )
        )
    })
    public ResponseEntity<String> seedModels() {
        try {
            // Get existing brands
            List<VehicleBrand> brands = vehicleService.getAllBrands();
            if (brands.isEmpty()) {
                return ResponseEntity.badRequest().body("No brands found. Please seed brands first.");
            }
            
            VehicleBrand tesla = brands.stream()
                .filter(b -> "Tesla".equals(b.getBrandName()))
                .findFirst()
                .orElse(brands.get(0));
            
            VehicleBrand byd = brands.stream()
                .filter(b -> "BYD".equals(b.getBrandName()))
                .findFirst()
                .orElse(brands.get(0));
            
            // Create Tesla models
            VehicleModel model3 = new VehicleModel();
            model3.setBrand(tesla);
            model3.setModelName("Model 3");
            model3.setModelYear(2024);
            model3.setVehicleType("Sedan");
            model3.setDescription("Tesla Model 3 - Electric sedan");
            // model3.setSpecifications("{\"range\": \"358 km\", \"acceleration\": \"4.4s\", \"topSpeed\": \"225 km/h\"}");
            model3.setIsActive(true);
            vehicleService.createModel(model3);
            
            VehicleModel modelY = new VehicleModel();
            modelY.setBrand(tesla);
            modelY.setModelName("Model Y");
            modelY.setModelYear(2024);
            modelY.setVehicleType("SUV");
            modelY.setDescription("Tesla Model Y - Electric SUV");
            // modelY.setSpecifications("{\"range\": \"455 km\", \"acceleration\": \"5.0s\", \"topSpeed\": \"217 km/h\"}");
            modelY.setIsActive(true);
            vehicleService.createModel(modelY);
            
            // Create BYD models
            VehicleModel atto3 = new VehicleModel();
            atto3.setBrand(byd);
            atto3.setModelName("Atto 3");
            atto3.setModelYear(2024);
            atto3.setVehicleType("SUV");
            atto3.setDescription("BYD Atto 3 - Electric SUV");
            // atto3.setSpecifications("{\"range\": \"480 km\", \"acceleration\": \"7.3s\", \"topSpeed\": \"160 km/h\"}");
            atto3.setIsActive(true);
            vehicleService.createModel(atto3);
            
            return ResponseEntity.ok("Sample models created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating models: " + e.getMessage());
        }
    }
    
    @PostMapping("/variants")
    @Operation(summary = "Tạo phiên bản xe", description = "Tạo dữ liệu mẫu cho các phiên bản xe")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Tạo phiên bản xe thành công",
            content = @Content(
                mediaType = "text/plain",
                schema = @Schema(example = "Sample variants created successfully")
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Lỗi khi tạo phiên bản xe - không tìm thấy mẫu xe hoặc lỗi hệ thống",
            content = @Content(
                mediaType = "text/plain",
                schema = @Schema(example = "No models found. Please seed models first.")
            )
        )
    })
    public ResponseEntity<String> seedVariants() {
        try {
            // Get existing models
            List<VehicleModel> models = vehicleService.getAllModels();
            if (models.isEmpty()) {
                return ResponseEntity.badRequest().body("No models found. Please seed models first.");
            }
            
            VehicleModel model3 = models.stream()
                .filter(m -> "Model 3".equals(m.getModelName()))
                .findFirst()
                .orElse(models.get(0));
            
            VehicleModel modelY = models.stream()
                .filter(m -> "Model Y".equals(m.getModelName()))
                .findFirst()
                .orElse(models.get(0));
            
            // Create Model 3 variants
            VehicleVariant model3Standard = new VehicleVariant();
            model3Standard.setModel(model3);
            model3Standard.setVariantName("Standard Range");
            model3Standard.setPriceBase(new BigDecimal("1200000000"));
            model3Standard.setRangeKm(358);
            model3Standard.setBatteryCapacity(new BigDecimal("60"));
            model3Standard.setChargingTimeFast(8);
            model3Standard.setAcceleration0100(new BigDecimal("5.6"));
            model3Standard.setTopSpeed(225);
            model3Standard.setIsActive(true);
            vehicleService.createVariant(model3Standard);
            
            VehicleVariant model3LongRange = new VehicleVariant();
            model3LongRange.setModel(model3);
            model3LongRange.setVariantName("Long Range");
            model3LongRange.setPriceBase(new BigDecimal("1500000000"));
            model3LongRange.setRangeKm(602);
            model3LongRange.setBatteryCapacity(new BigDecimal("75"));
            model3LongRange.setChargingTimeFast(10);
            model3LongRange.setAcceleration0100(new BigDecimal("4.4"));
            model3LongRange.setTopSpeed(233);
            model3LongRange.setIsActive(true);
            vehicleService.createVariant(model3LongRange);
            
            // Create Model Y variants
            VehicleVariant modelYStandard = new VehicleVariant();
            modelYStandard.setModel(modelY);
            modelYStandard.setVariantName("Standard Range");
            modelYStandard.setPriceBase(new BigDecimal("1400000000"));
            modelYStandard.setRangeKm(455);
            modelYStandard.setBatteryCapacity(new BigDecimal("60"));
            modelYStandard.setChargingTimeFast(8);
            modelYStandard.setAcceleration0100(new BigDecimal("5.0"));
            modelYStandard.setTopSpeed(217);
            modelYStandard.setIsActive(true);
            vehicleService.createVariant(modelYStandard);
            
            return ResponseEntity.ok("Sample variants created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating variants: " + e.getMessage());
        }
    }
    
    @PostMapping("/inventory")
    @Operation(summary = "Tạo kho xe", description = "Tạo dữ liệu mẫu cho kho xe")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Tạo kho xe thành công",
            content = @Content(
                mediaType = "text/plain",
                schema = @Schema(example = "Sample inventory created successfully")
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Lỗi khi tạo kho xe - thiếu dữ liệu cần thiết hoặc lỗi hệ thống",
            content = @Content(
                mediaType = "text/plain",
                schema = @Schema(example = "Missing required data. Please seed variants, warehouses, and colors first.")
            )
        )
    })
    public ResponseEntity<String> seedInventory() {
        try {
            // Get existing variants and warehouses
            List<VehicleVariant> variants = vehicleService.getAllVariants();
            List<Warehouse> warehouses = warehouseService.getAllWarehouses();
            List<VehicleColor> colors = vehicleService.getAllColors();
            
            if (variants.isEmpty() || warehouses.isEmpty() || colors.isEmpty()) {
                return ResponseEntity.badRequest().body("Missing required data. Please seed variants, warehouses, and colors first.");
            }
            
            VehicleVariant variant = variants.get(0);
            Warehouse warehouse = warehouses.get(0);
            VehicleColor color = colors.get(0);
            
            // Create sample inventory
            VehicleInventory inventory = new VehicleInventory();
            inventory.setVin("1HGBH41JXMN109186");
            inventory.setChassisNumber("CHASSIS001");
            inventory.setVariant(variant);
            inventory.setColor(color);
            inventory.setWarehouse(warehouse);
            inventory.setSellingPrice(variant.getPriceBase());
            inventory.setManufacturingDate(LocalDate.now().minusMonths(2));
            inventory.setArrivalDate(LocalDate.now().minusDays(30));
            inventory.setStatus("available");
            
            vehicleInventoryService.createInventory(inventory);
            
            return ResponseEntity.ok("Sample inventory created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating inventory: " + e.getMessage());
        }
    }
    
    @PostMapping("/all")
    @Operation(summary = "Tạo tất cả dữ liệu mẫu", description = "Tạo toàn bộ dữ liệu mẫu")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Tạo tất cả dữ liệu mẫu thành công",
            content = @Content(
                mediaType = "text/plain",
                schema = @Schema(example = "All sample data created successfully")
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Lỗi khi tạo dữ liệu mẫu - thiếu dữ liệu cần thiết hoặc lỗi hệ thống",
            content = @Content(
                mediaType = "text/plain",
                schema = @Schema(example = "Error creating sample data: [chi tiết lỗi]")
            )
        )
    })
    public ResponseEntity<String> seedAll() {
        try {
            // Seed models
            ResponseEntity<String> modelsResult = seedModels();
            if (modelsResult.getStatusCode().isError()) {
                return modelsResult;
            }
            
            // Seed variants
            ResponseEntity<String> variantsResult = seedVariants();
            if (variantsResult.getStatusCode().isError()) {
                return variantsResult;
            }
            
            // Seed inventory
            ResponseEntity<String> inventoryResult = seedInventory();
            if (inventoryResult.getStatusCode().isError()) {
                return inventoryResult;
            }
            
            return ResponseEntity.ok("All sample data created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating sample data: " + e.getMessage());
        }
    }
}
