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
@RequestMapping("/api/sample-data")
@CrossOrigin(origins = "*")
@Tag(name = "Sample Data Management", description = "APIs for creating sample data in the database")
public class SampleDataController {

    @Autowired
    private VehicleService vehicleService;
    
    @Autowired
    private VehicleInventoryService vehicleInventoryService;
    
    @Autowired
    private WarehouseService warehouseService;

    @PostMapping("/create-all")
    @Operation(summary = "Create all sample data", description = "Create comprehensive sample data for the entire system")
    public ResponseEntity<String> createAllSampleData() {
        try {
            StringBuilder result = new StringBuilder();
            
            // 1. Create Vehicle Models
            result.append(createVehicleModels()).append("\n");
            
            // 2. Create Vehicle Variants
            result.append(createVehicleVariants()).append("\n");
            
            // 3. Create Vehicle Inventory
            result.append(createVehicleInventory()).append("\n");
            
            return ResponseEntity.ok("All sample data created successfully:\n" + result.toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating sample data: " + e.getMessage());
        }
    }
    
    private String createVehicleModels() {
        try {
            // Get existing brands
            List<VehicleBrand> brands = vehicleService.getAllBrands();
            if (brands.isEmpty()) {
                return "❌ No brands found. Please ensure brands exist first.";
            }
            
            VehicleBrand tesla = brands.stream()
                .filter(b -> "Tesla".equals(b.getBrandName()))
                .findFirst()
                .orElse(brands.get(0));
            
            VehicleBrand byd = brands.stream()
                .filter(b -> "BYD".equals(b.getBrandName()))
                .findFirst()
                .orElse(brands.get(0));
            
            VehicleBrand vinfast = brands.stream()
                .filter(b -> "VinFast".equals(b.getBrandName()))
                .findFirst()
                .orElse(brands.get(0));
            
            // Create Tesla models
            VehicleModel model3 = new VehicleModel();
            model3.setBrand(tesla);
            model3.setModelName("Model 3");
            model3.setModelYear(2024);
            model3.setVehicleType("Sedan");
            model3.setDescription("Tesla Model 3 - Electric sedan with advanced autopilot");
            model3.setIsActive(true);
            vehicleService.createModel(model3);
            
            VehicleModel modelY = new VehicleModel();
            modelY.setBrand(tesla);
            modelY.setModelName("Model Y");
            modelY.setModelYear(2024);
            modelY.setVehicleType("SUV");
            modelY.setDescription("Tesla Model Y - Electric SUV with spacious interior");
            modelY.setIsActive(true);
            vehicleService.createModel(modelY);
            
            VehicleModel modelS = new VehicleModel();
            modelS.setBrand(tesla);
            modelS.setModelName("Model S");
            modelS.setModelYear(2024);
            modelS.setVehicleType("Sedan");
            modelS.setDescription("Tesla Model S - Luxury electric sedan");
            modelS.setIsActive(true);
            vehicleService.createModel(modelS);
            
            // Create BYD models
            VehicleModel atto3 = new VehicleModel();
            atto3.setBrand(byd);
            atto3.setModelName("Atto 3");
            atto3.setModelYear(2024);
            atto3.setVehicleType("SUV");
            atto3.setDescription("BYD Atto 3 - Electric SUV with Blade Battery technology");
            atto3.setIsActive(true);
            vehicleService.createModel(atto3);
            
            VehicleModel dolphin = new VehicleModel();
            dolphin.setBrand(byd);
            dolphin.setModelName("Dolphin");
            dolphin.setModelYear(2024);
            dolphin.setVehicleType("Hatchback");
            dolphin.setDescription("BYD Dolphin - Compact electric hatchback");
            dolphin.setIsActive(true);
            vehicleService.createModel(dolphin);
            
            // Create VinFast models
            VehicleModel vf8 = new VehicleModel();
            vf8.setBrand(vinfast);
            vf8.setModelName("VF8");
            vf8.setModelYear(2024);
            vf8.setVehicleType("SUV");
            vf8.setDescription("VinFast VF8 - Electric SUV with premium features");
            vf8.setIsActive(true);
            vehicleService.createModel(vf8);
            
            VehicleModel vf9 = new VehicleModel();
            vf9.setBrand(vinfast);
            vf9.setModelName("VF9");
            vf9.setModelYear(2024);
            vf9.setVehicleType("SUV");
            vf9.setDescription("VinFast VF9 - Large electric SUV with 7 seats");
            vf9.setIsActive(true);
            vehicleService.createModel(vf9);
            
            return "✅ Created 7 vehicle models successfully";
        } catch (Exception e) {
            return "❌ Error creating models: " + e.getMessage();
        }
    }
    
    private String createVehicleVariants() {
        try {
            // Get existing models
            List<VehicleModel> models = vehicleService.getAllModels();
            if (models.isEmpty()) {
                return "❌ No models found. Please create models first.";
            }
            
            VehicleModel model3 = models.stream()
                .filter(m -> "Model 3".equals(m.getModelName()))
                .findFirst()
                .orElse(models.get(0));
            
            VehicleModel modelY = models.stream()
                .filter(m -> "Model Y".equals(m.getModelName()))
                .findFirst()
                .orElse(models.get(0));
            
            VehicleModel atto3 = models.stream()
                .filter(m -> "Atto 3".equals(m.getModelName()))
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
            
            VehicleVariant model3Performance = new VehicleVariant();
            model3Performance.setModel(model3);
            model3Performance.setVariantName("Performance");
            model3Performance.setPriceBase(new BigDecimal("1800000000"));
            model3Performance.setRangeKm(567);
            model3Performance.setBatteryCapacity(new BigDecimal("75"));
            model3Performance.setChargingTimeFast(10);
            model3Performance.setAcceleration0100(new BigDecimal("3.1"));
            model3Performance.setTopSpeed(261);
            model3Performance.setIsActive(true);
            vehicleService.createVariant(model3Performance);
            
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
            
            VehicleVariant modelYLongRange = new VehicleVariant();
            modelYLongRange.setModel(modelY);
            modelYLongRange.setVariantName("Long Range");
            modelYLongRange.setPriceBase(new BigDecimal("1700000000"));
            modelYLongRange.setRangeKm(533);
            modelYLongRange.setBatteryCapacity(new BigDecimal("75"));
            modelYLongRange.setChargingTimeFast(10);
            modelYLongRange.setAcceleration0100(new BigDecimal("4.8"));
            modelYLongRange.setTopSpeed(217);
            modelYLongRange.setIsActive(true);
            vehicleService.createVariant(modelYLongRange);
            
            // Create Atto 3 variants
            VehicleVariant atto3Standard = new VehicleVariant();
            atto3Standard.setModel(atto3);
            atto3Standard.setVariantName("Standard");
            atto3Standard.setPriceBase(new BigDecimal("800000000"));
            atto3Standard.setRangeKm(480);
            atto3Standard.setBatteryCapacity(new BigDecimal("60"));
            atto3Standard.setChargingTimeFast(8);
            atto3Standard.setAcceleration0100(new BigDecimal("7.3"));
            atto3Standard.setTopSpeed(160);
            atto3Standard.setIsActive(true);
            vehicleService.createVariant(atto3Standard);
            
            VehicleVariant atto3Premium = new VehicleVariant();
            atto3Premium.setModel(atto3);
            atto3Premium.setVariantName("Premium");
            atto3Premium.setPriceBase(new BigDecimal("950000000"));
            atto3Premium.setRangeKm(480);
            atto3Premium.setBatteryCapacity(new BigDecimal("60"));
            atto3Premium.setChargingTimeFast(8);
            atto3Premium.setAcceleration0100(new BigDecimal("7.3"));
            atto3Premium.setTopSpeed(160);
            atto3Premium.setIsActive(true);
            vehicleService.createVariant(atto3Premium);
            
            return "✅ Created 7 vehicle variants successfully";
        } catch (Exception e) {
            return "❌ Error creating variants: " + e.getMessage();
        }
    }
    
    private String createVehicleInventory() {
        try {
            // Get existing variants, warehouses, and colors
            List<VehicleVariant> variants = vehicleService.getAllVariants();
            List<Warehouse> warehouses = warehouseService.getAllWarehouses();
            List<VehicleColor> colors = vehicleService.getAllColors();
            
            if (variants.isEmpty() || warehouses.isEmpty() || colors.isEmpty()) {
                return "❌ Missing required data. Please ensure variants, warehouses, and colors exist.";
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
            
            // Create sample inventory for different variants
            for (int i = 0; i < Math.min(variants.size(), 5); i++) {
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
                
                vehicleInventoryService.createInventory(inventory);
            }
            
            return "✅ Created 5 vehicle inventory items successfully";
        } catch (Exception e) {
            return "❌ Error creating inventory: " + e.getMessage();
        }
    }
    
    @PostMapping("/models")
    @Operation(summary = "Create sample vehicle models", description = "Create sample vehicle models only")
    public ResponseEntity<String> createModels() {
        return ResponseEntity.ok(createVehicleModels());
    }
    
    @PostMapping("/variants")
    @Operation(summary = "Create sample vehicle variants", description = "Create sample vehicle variants only")
    public ResponseEntity<String> createVariants() {
        return ResponseEntity.ok(createVehicleVariants());
    }
    
    @PostMapping("/inventory")
    @Operation(summary = "Create sample vehicle inventory", description = "Create sample vehicle inventory only")
    public ResponseEntity<String> createInventory() {
        return ResponseEntity.ok(createVehicleInventory());
    }
}


