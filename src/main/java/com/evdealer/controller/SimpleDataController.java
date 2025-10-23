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
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/simple-data")
@CrossOrigin(origins = "*")
@Tag(name = "Simple Data Management", description = "APIs tạo dữ liệu mẫu đơn giản")
public class SimpleDataController {

    @Autowired
    private VehicleService vehicleService;
    
    @Autowired
    private VehicleInventoryService vehicleInventoryService;
    
    @Autowired
    private WarehouseService warehouseService;

    @PostMapping("/create-models")
    @Operation(summary = "Create simple vehicle models", description = "Create vehicle models without specifications field")
    public ResponseEntity<String> createSimpleModels() {
        try {
            // Get existing brands
            List<VehicleBrand> brands = vehicleService.getAllBrands();
            if (brands.isEmpty()) {
                return ResponseEntity.badRequest().body("No brands found. Please ensure brands exist first.");
            }
            
            VehicleBrand tesla = brands.stream()
                .filter(b -> "Tesla".equals(b.getBrandName()))
                .findFirst()
                .orElse(brands.get(0));
            
            VehicleBrand byd = brands.stream()
                .filter(b -> "BYD".equals(b.getBrandName()))
                .findFirst()
                .orElse(brands.get(0));
            
            // Create Tesla Model 3
            VehicleModel model3 = new VehicleModel();
            model3.setBrand(tesla);
            model3.setModelName("Model 3");
            model3.setModelYear(2024);
            model3.setVehicleType("Sedan");
            model3.setDescription("Tesla Model 3 - Electric sedan");
            model3.setIsActive(true);
            // Set specifications as null to avoid JSONB issues
            model3.setSpecifications(null);
            vehicleService.createModel(model3);
            
            // Create Tesla Model Y
            VehicleModel modelY = new VehicleModel();
            modelY.setBrand(tesla);
            modelY.setModelName("Model Y");
            modelY.setModelYear(2024);
            modelY.setVehicleType("SUV");
            modelY.setDescription("Tesla Model Y - Electric SUV");
            modelY.setIsActive(true);
            // Set specifications as null to avoid JSONB issues
            modelY.setSpecifications(null);
            vehicleService.createModel(modelY);
            
            // Create BYD Atto 3
            VehicleModel atto3 = new VehicleModel();
            atto3.setBrand(byd);
            atto3.setModelName("Atto 3");
            atto3.setModelYear(2024);
            atto3.setVehicleType("SUV");
            atto3.setDescription("BYD Atto 3 - Electric SUV");
            atto3.setIsActive(true);
            // Set specifications as null to avoid JSONB issues
            atto3.setSpecifications(null);
            vehicleService.createModel(atto3);
            
            return ResponseEntity.ok("✅ Created 3 vehicle models successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error creating models: " + e.getMessage());
        }
    }
    
    @PostMapping("/create-variants")
    @Operation(summary = "Create simple vehicle variants", description = "Create vehicle variants for existing models")
    public ResponseEntity<String> createSimpleVariants() {
        try {
            // Get existing models
            List<VehicleModel> models = vehicleService.getAllModels();
            if (models.isEmpty()) {
                return ResponseEntity.badRequest().body("No models found. Please create models first.");
            }
            
            VehicleModel model3 = models.stream()
                .filter(m -> "Model 3".equals(m.getModelName()))
                .findFirst()
                .orElse(models.get(0));
            
            VehicleModel modelY = models.stream()
                .filter(m -> "Model Y".equals(m.getModelName()))
                .findFirst()
                .orElse(models.get(0));
            
            // Create Model 3 Standard variant
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
            
            // Create Model 3 Long Range variant
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
            
            // Create Model Y Standard variant
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
            
            return ResponseEntity.ok("✅ Created 3 vehicle variants successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error creating variants: " + e.getMessage());
        }
    }
    
    @PostMapping("/create-inventory")
    @Operation(summary = "Create simple vehicle inventory", description = "Create vehicle inventory for existing variants")
    public ResponseEntity<String> createSimpleInventory() {
        try {
            // Get existing variants, warehouses, and colors
            List<VehicleVariant> variants = vehicleService.getAllVariants();
            List<Warehouse> warehouses = warehouseService.getAllWarehouses();
            List<VehicleColor> colors = vehicleService.getAllColors();
            
            if (variants.isEmpty() || warehouses.isEmpty() || colors.isEmpty()) {
                return ResponseEntity.badRequest().body("Missing required data. Please ensure variants, warehouses, and colors exist.");
            }
            
            Warehouse warehouse = warehouses.get(0);
            VehicleColor whiteColor = colors.stream()
                .filter(c -> "Pearl White".equals(c.getColorName()))
                .findFirst()
                .orElse(colors.get(0));
            
            VehicleColor blackColor = colors.stream()
                .filter(c -> "Deep Black".equals(c.getColorName()))
                .findFirst()
                .orElse(colors.get(0));
            
            // Create sample inventory for first 3 variants
            for (int i = 0; i < Math.min(variants.size(), 3); i++) {
                VehicleVariant variant = variants.get(i);
                VehicleColor color = (i % 2 == 0) ? whiteColor : blackColor;
                
                VehicleInventory inventory = new VehicleInventory();
                inventory.setVin("VIN" + String.format("%012d", i + 1));
                inventory.setChassisNumber("CHASSIS" + String.format("%03d", i + 1));
                inventory.setVariant(variant);
                inventory.setColor(color);
                inventory.setWarehouse(warehouse);
                inventory.setSellingPrice(variant.getPriceBase());
                inventory.setManufacturingDate(LocalDate.now().minusMonths(2));
                inventory.setArrivalDate(LocalDate.now().minusDays(30));
                inventory.setStatus("available");
                // Set JSONB fields as null to avoid JSONB issues
                inventory.setExteriorImages(null);
                inventory.setInteriorImages(null);
                inventory.setVehicleImages(null);
                
                vehicleInventoryService.createInventory(inventory);
            }
            
            return ResponseEntity.ok("✅ Created 3 vehicle inventory items successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error creating inventory: " + e.getMessage());
        }
    }
    
    @PostMapping("/create-all")
    @Operation(summary = "Create all simple sample data", description = "Create all simple sample data step by step")
    public ResponseEntity<String> createAllSimpleData() {
        try {
            StringBuilder result = new StringBuilder();
            
            // 1. Create Models
            ResponseEntity<String> modelsResult = createSimpleModels();
            result.append(modelsResult.getBody()).append("\n");
            
            // 2. Create Variants
            ResponseEntity<String> variantsResult = createSimpleVariants();
            result.append(variantsResult.getBody()).append("\n");
            
            // 3. Create Inventory
            ResponseEntity<String> inventoryResult = createSimpleInventory();
            result.append(inventoryResult.getBody()).append("\n");
            
            return ResponseEntity.ok("All simple sample data created:\n" + result.toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating simple sample data: " + e.getMessage());
        }
    }
}


