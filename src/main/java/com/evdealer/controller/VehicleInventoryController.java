package com.evdealer.controller;

import com.evdealer.entity.VehicleInventory;
import com.evdealer.service.VehicleInventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicle-inventory")
@CrossOrigin(origins = "*")
@Tag(name = "Vehicle Inventory Management", description = "APIs for managing vehicle inventory")
public class VehicleInventoryController {
    
    @Autowired
    private VehicleInventoryService vehicleInventoryService;
    
    @GetMapping
    @Operation(summary = "Get all vehicle inventory", description = "Retrieve a list of all vehicle inventory")
    public ResponseEntity<List<VehicleInventory>> getAllVehicleInventory() {
        List<VehicleInventory> inventory = vehicleInventoryService.getAllVehicleInventory();
        return ResponseEntity.ok(inventory);
    }
    
    @GetMapping("/{inventoryId}")
    @Operation(summary = "Get vehicle inventory by ID", description = "Retrieve a specific vehicle inventory by its ID")
    public ResponseEntity<VehicleInventory> getInventoryById(@PathVariable @Parameter(description = "Inventory ID") UUID inventoryId) {
        return vehicleInventoryService.getInventoryById(inventoryId)
                .map(inventory -> ResponseEntity.ok(inventory))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/vin/{vin}")
    @Operation(summary = "Get vehicle inventory by VIN", description = "Retrieve a specific vehicle inventory by its VIN")
    public ResponseEntity<VehicleInventory> getInventoryByVin(@PathVariable String vin) {
        return vehicleInventoryService.getInventoryByVin(vin)
                .map(inventory -> ResponseEntity.ok(inventory))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get inventory by status", description = "Retrieve vehicle inventory filtered by status")
    public ResponseEntity<List<VehicleInventory>> getInventoryByStatus(@PathVariable String status) {
        List<VehicleInventory> inventory = vehicleInventoryService.getInventoryByStatus(status);
        return ResponseEntity.ok(inventory);
    }
    
    @GetMapping("/variant/{variantId}")
    @Operation(summary = "Get inventory by variant", description = "Retrieve vehicle inventory for a specific variant")
    public ResponseEntity<List<VehicleInventory>> getInventoryByVariant(@PathVariable Integer variantId) {
        List<VehicleInventory> inventory = vehicleInventoryService.getInventoryByVariant(variantId);
        return ResponseEntity.ok(inventory);
    }
    
    @GetMapping("/color/{colorId}")
    @Operation(summary = "Get inventory by color", description = "Retrieve vehicle inventory for a specific color")
    public ResponseEntity<List<VehicleInventory>> getInventoryByColor(@PathVariable Integer colorId) {
        List<VehicleInventory> inventory = vehicleInventoryService.getInventoryByColor(colorId);
        return ResponseEntity.ok(inventory);
    }
    
    @GetMapping("/warehouse/{warehouseId}")
    @Operation(summary = "Get inventory by warehouse", description = "Retrieve vehicle inventory for a specific warehouse")
    public ResponseEntity<List<VehicleInventory>> getInventoryByWarehouse(@PathVariable UUID warehouseId) {
        List<VehicleInventory> inventory = vehicleInventoryService.getInventoryByWarehouse(warehouseId);
        return ResponseEntity.ok(inventory);
    }
    
    @GetMapping("/warehouse-location/{location}")
    @Operation(summary = "Get inventory by warehouse location", description = "Retrieve vehicle inventory for a specific warehouse location")
    public ResponseEntity<List<VehicleInventory>> getInventoryByWarehouseLocation(@PathVariable String location) {
        List<VehicleInventory> inventory = vehicleInventoryService.getInventoryByWarehouseLocation(location);
        return ResponseEntity.ok(inventory);
    }
    
    @GetMapping("/price-range")
    @Operation(summary = "Get inventory by price range", description = "Retrieve vehicle inventory within a price range")
    public ResponseEntity<List<VehicleInventory>> getInventoryByPriceRange(
            @RequestParam @Parameter(description = "Minimum price") BigDecimal minPrice,
            @RequestParam @Parameter(description = "Maximum price") BigDecimal maxPrice) {
        List<VehicleInventory> inventory = vehicleInventoryService.getInventoryByPriceRange(minPrice, maxPrice);
        return ResponseEntity.ok(inventory);
    }
    
    @GetMapping("/manufacturing-date-range")
    @Operation(summary = "Get inventory by manufacturing date range", description = "Retrieve vehicle inventory within a manufacturing date range")
    public ResponseEntity<List<VehicleInventory>> getInventoryByManufacturingDateRange(
            @RequestParam @Parameter(description = "Start date") LocalDate startDate,
            @RequestParam @Parameter(description = "End date") LocalDate endDate) {
        List<VehicleInventory> inventory = vehicleInventoryService.getInventoryByManufacturingDateRange(startDate, endDate);
        return ResponseEntity.ok(inventory);
    }
    
    @GetMapping("/arrival-date-range")
    @Operation(summary = "Get inventory by arrival date range", description = "Retrieve vehicle inventory within an arrival date range")
    public ResponseEntity<List<VehicleInventory>> getInventoryByArrivalDateRange(
            @RequestParam @Parameter(description = "Start date") LocalDate startDate,
            @RequestParam @Parameter(description = "End date") LocalDate endDate) {
        List<VehicleInventory> inventory = vehicleInventoryService.getInventoryByArrivalDateRange(startDate, endDate);
        return ResponseEntity.ok(inventory);
    }
    
    @GetMapping("/search/vin")
    @Operation(summary = "Search inventory by VIN", description = "Search vehicle inventory by VIN")
    public ResponseEntity<List<VehicleInventory>> searchByVin(@RequestParam String vin) {
        List<VehicleInventory> inventory = vehicleInventoryService.searchByVin(vin);
        return ResponseEntity.ok(inventory);
    }
    
    @GetMapping("/search/chassis")
    @Operation(summary = "Search inventory by chassis number", description = "Search vehicle inventory by chassis number")
    public ResponseEntity<List<VehicleInventory>> searchByChassisNumber(@RequestParam String chassisNumber) {
        List<VehicleInventory> inventory = vehicleInventoryService.searchByChassisNumber(chassisNumber);
        return ResponseEntity.ok(inventory);
    }
    
    @PostMapping
    @Operation(summary = "Create vehicle inventory", description = "Create a new vehicle inventory record")
    public ResponseEntity<VehicleInventory> createVehicleInventory(@RequestBody VehicleInventory vehicleInventory) {
        try {
            VehicleInventory createdInventory = vehicleInventoryService.createVehicleInventory(vehicleInventory);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdInventory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{inventoryId}")
    @Operation(summary = "Update vehicle inventory", description = "Update an existing vehicle inventory record")
    public ResponseEntity<VehicleInventory> updateVehicleInventory(
            @PathVariable UUID inventoryId, 
            @RequestBody VehicleInventory vehicleInventoryDetails) {
        try {
            VehicleInventory updatedInventory = vehicleInventoryService.updateVehicleInventory(inventoryId, vehicleInventoryDetails);
            return ResponseEntity.ok(updatedInventory);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{inventoryId}/status")
    @Operation(summary = "Update inventory status", description = "Update the status of a vehicle inventory record")
    public ResponseEntity<VehicleInventory> updateInventoryStatus(
            @PathVariable UUID inventoryId, 
            @RequestParam String status) {
        try {
            VehicleInventory updatedInventory = vehicleInventoryService.updateInventoryStatus(inventoryId, status);
            return ResponseEntity.ok(updatedInventory);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{inventoryId}")
    @Operation(summary = "Delete vehicle inventory", description = "Delete a vehicle inventory record")
    public ResponseEntity<Void> deleteVehicleInventory(@PathVariable UUID inventoryId) {
        try {
            vehicleInventoryService.deleteVehicleInventory(inventoryId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
