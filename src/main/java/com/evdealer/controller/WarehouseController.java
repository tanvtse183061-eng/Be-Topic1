package com.evdealer.controller;

import com.evdealer.entity.Warehouse;
import com.evdealer.service.WarehouseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/warehouses")
@CrossOrigin(origins = "*")
@Tag(name = "Warehouse Management", description = "APIs quản lý kho")
public class WarehouseController {
    
    @Autowired
    private WarehouseService warehouseService;
    
    @GetMapping
    @Operation(summary = "Lấy danh sách kho", description = "Lấy tất cả kho")
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {
        List<Warehouse> warehouses = warehouseService.getAllWarehouses();
        return ResponseEntity.ok(warehouses);
    }
    
    @GetMapping("/active")
    @Operation(summary = "Lấy kho đang hoạt động", description = "Lấy kho đang hoạt động")
    public ResponseEntity<List<Warehouse>> getActiveWarehouses() {
        List<Warehouse> warehouses = warehouseService.getActiveWarehouses();
        return ResponseEntity.ok(warehouses);
    }
    
    @GetMapping("/{warehouseId}")
    @Operation(summary = "Lấy kho theo ID", description = "Lấy thông tin kho theo ID")
    public ResponseEntity<Warehouse> getWarehouseById(@PathVariable @Parameter(description = "Warehouse ID") UUID warehouseId) {
        return warehouseService.getWarehouseById(warehouseId)
                .map(warehouse -> ResponseEntity.ok(warehouse))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/code/{warehouseCode}")
    @Operation(summary = "Lấy kho theo mã", description = "Lấy thông tin kho theo mã kho")
    public ResponseEntity<Warehouse> getWarehouseByCode(@PathVariable String warehouseCode) {
        return warehouseService.getWarehouseByCode(warehouseCode)
                .map(warehouse -> ResponseEntity.ok(warehouse))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/city/{city}")
    @Operation(summary = "Lấy kho theo thành phố", description = "Lấy kho theo thành phố")
    public ResponseEntity<List<Warehouse>> getWarehousesByCity(@PathVariable String city) {
        List<Warehouse> warehouses = warehouseService.getWarehousesByCity(city);
        return ResponseEntity.ok(warehouses);
    }
    
    @GetMapping("/province/{province}")
    @Operation(summary = "Lấy kho theo tỉnh", description = "Lấy kho theo tỉnh")
    public ResponseEntity<List<Warehouse>> getWarehousesByProvince(@PathVariable String province) {
        List<Warehouse> warehouses = warehouseService.getWarehousesByProvince(province);
        return ResponseEntity.ok(warehouses);
    }
    
    @PostMapping
    @Operation(summary = "Tạo kho mới", description = "Tạo kho mới")
    public ResponseEntity<Warehouse> createWarehouse(@RequestBody Warehouse warehouse) {
        try {
            Warehouse createdWarehouse = warehouseService.createWarehouse(warehouse);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdWarehouse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{warehouseId}")
    @Operation(summary = "Cập nhật kho", description = "Cập nhật thông tin kho")
    public ResponseEntity<Warehouse> updateWarehouse(
            @PathVariable UUID warehouseId, 
            @RequestBody Warehouse warehouseDetails) {
        try {
            Warehouse updatedWarehouse = warehouseService.updateWarehouse(warehouseId, warehouseDetails);
            return ResponseEntity.ok(updatedWarehouse);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{warehouseId}/activate")
    @Operation(summary = "Kích hoạt kho", description = "Kích hoạt kho")
    public ResponseEntity<Warehouse> activateWarehouse(@PathVariable UUID warehouseId) {
        try {
            Warehouse activatedWarehouse = warehouseService.activateWarehouse(warehouseId);
            return ResponseEntity.ok(activatedWarehouse);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{warehouseId}/deactivate")
    @Operation(summary = "Vô hiệu hóa kho", description = "Vô hiệu hóa kho")
    public ResponseEntity<Warehouse> deactivateWarehouse(@PathVariable UUID warehouseId) {
        try {
            Warehouse deactivatedWarehouse = warehouseService.deactivateWarehouse(warehouseId);
            return ResponseEntity.ok(deactivatedWarehouse);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{warehouseId}")
    @Operation(summary = "Xóa kho", description = "Xóa kho")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable UUID warehouseId) {
        try {
            warehouseService.deleteWarehouse(warehouseId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
