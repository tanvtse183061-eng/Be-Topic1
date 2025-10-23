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

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
@Tag(name = "Vehicle Inventory Management", description = "APIs for managing electric vehicle inventory and distribution")
public class InventoryManagementController {

    @Autowired
    private VehicleInventoryService vehicleInventoryService;

    @GetMapping
    @Operation(summary = "Get all inventory", description = "Retrieve a list of all vehicle inventory")
    public ResponseEntity<List<VehicleInventory>> getAllVehicleInventory() {
        List<VehicleInventory> inventory = vehicleInventoryService.getAllVehicleInventory();
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/available")
    @Operation(summary = "Get available inventory", description = "Retrieve all available vehicles in inventory")
    public ResponseEntity<List<VehicleInventory>> getAvailableInventory() {
        List<VehicleInventory> inventory = vehicleInventoryService.getInventoryByStatus("available");
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get inventory by status", description = "Retrieve inventory by status")
    public ResponseEntity<List<VehicleInventory>> getInventoryByStatus(@PathVariable String status) {
        List<VehicleInventory> inventory = vehicleInventoryService.getInventoryByStatus(status);
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/warehouse/{warehouseId}")
    @Operation(summary = "Get inventory by warehouse", description = "Retrieve inventory for a specific warehouse")
    public ResponseEntity<List<VehicleInventory>> getInventoryByWarehouse(@PathVariable UUID warehouseId) {
        List<VehicleInventory> inventory = vehicleInventoryService.getInventoryByWarehouse(warehouseId);
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/variant/{variantId}")
    @Operation(summary = "Get inventory by variant", description = "Retrieve inventory for a specific vehicle variant")
    public ResponseEntity<List<VehicleInventory>> getInventoryByVariant(@PathVariable Integer variantId) {
        List<VehicleInventory> inventory = vehicleInventoryService.getInventoryByVariant(variantId);
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/color/{colorId}")
    @Operation(summary = "Get inventory by color", description = "Retrieve inventory for a specific color")
    public ResponseEntity<List<VehicleInventory>> getInventoryByColor(@PathVariable Integer colorId) {
        List<VehicleInventory> inventory = vehicleInventoryService.getInventoryByColor(colorId);
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get inventory by date range", description = "Retrieve inventory within a date range")
    public ResponseEntity<List<VehicleInventory>> getInventoryByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        List<VehicleInventory> inventory = vehicleInventoryService.getInventoryByArrivalDateRange(startDate, endDate);
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/{inventoryId}")
    @Operation(summary = "Get inventory by ID", description = "Retrieve a specific inventory item by its ID")
    public ResponseEntity<VehicleInventory> getInventoryById(@PathVariable @Parameter(description = "Inventory ID") UUID inventoryId) {
        return vehicleInventoryService.getInventoryById(inventoryId)
                .map(inventory -> ResponseEntity.ok(inventory))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/vin/{vin}")
    @Operation(summary = "Get inventory by VIN", description = "Retrieve inventory by VIN number")
    public ResponseEntity<VehicleInventory> getInventoryByVin(@PathVariable String vin) {
        return vehicleInventoryService.getInventoryByVin(vin)
                .map(inventory -> ResponseEntity.ok(inventory))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create inventory", description = "Create a new inventory item")
    public ResponseEntity<VehicleInventory> createVehicleInventory(@RequestBody VehicleInventory inventory) {
        try {
            VehicleInventory createdInventory = vehicleInventoryService.createVehicleInventory(inventory);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdInventory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{inventoryId}")
    @Operation(summary = "Update inventory", description = "Update an existing inventory item")
    public ResponseEntity<VehicleInventory> updateVehicleInventory(
            @PathVariable UUID inventoryId, 
            @RequestBody VehicleInventory inventoryDetails) {
        try {
            VehicleInventory updatedInventory = vehicleInventoryService.updateVehicleInventory(inventoryId, inventoryDetails);
            return ResponseEntity.ok(updatedInventory);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{inventoryId}/status")
    @Operation(summary = "Update inventory status", description = "Update the status of an inventory item")
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

    @PutMapping("/{inventoryId}/mark-sold")
    @Operation(summary = "Mark as sold", description = "Mark an inventory item as sold")
    public ResponseEntity<VehicleInventory> markAsSold(@PathVariable UUID inventoryId) {
        try {
            VehicleInventory soldInventory = vehicleInventoryService.updateInventoryStatus(inventoryId, "sold");
            return ResponseEntity.ok(soldInventory);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{inventoryId}/mark-reserved")
    @Operation(summary = "Mark as reserved", description = "Mark an inventory item as reserved")
    public ResponseEntity<VehicleInventory> markAsReserved(@PathVariable UUID inventoryId) {
        try {
            VehicleInventory reservedInventory = vehicleInventoryService.updateInventoryStatus(inventoryId, "reserved");
            return ResponseEntity.ok(reservedInventory);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{inventoryId}")
    @Operation(summary = "Delete inventory", description = "Delete an inventory item")
    public ResponseEntity<Void> deleteVehicleInventory(@PathVariable UUID inventoryId) {
        try {
            vehicleInventoryService.deleteVehicleInventory(inventoryId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    @Operation(summary = "Search inventory", description = "Search for inventory by VIN, chassis number, or other criteria")
    public ResponseEntity<List<VehicleInventory>> searchInventory(@RequestParam String keyword) {
        List<VehicleInventory> inventory = vehicleInventoryService.searchByVin(keyword);
        return ResponseEntity.ok(inventory);
    }
}
