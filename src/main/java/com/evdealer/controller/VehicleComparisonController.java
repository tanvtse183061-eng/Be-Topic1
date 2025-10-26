package com.evdealer.controller;

import com.evdealer.dto.VehicleComparisonRequest;
import com.evdealer.dto.VehicleComparisonResponse;
import com.evdealer.entity.VehicleVariant;
import com.evdealer.service.VehicleComparisonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
@Tag(name = "Vehicle Comparison", description = "APIs so sánh xe")
public class VehicleComparisonController {
    
    @Autowired
    private VehicleComparisonService vehicleComparisonService;
    
    @PostMapping("/compare")
    @Operation(summary = "So sánh xe", description = "So sánh nhiều xe theo các tiêu chí khác nhau")
    public ResponseEntity<?> compareVehicles(@RequestBody VehicleComparisonRequest request) {
        try {
            VehicleComparisonResponse response = vehicleComparisonService.compareVehicles(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Vehicle comparison failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/compare/quick")
    @Operation(summary = "So sánh nhanh", description = "So sánh nhanh các xe theo danh sách ID")
    public ResponseEntity<?> quickCompare(
            @RequestParam List<Integer> variantIds) {
        try {
            VehicleComparisonResponse response = vehicleComparisonService.quickCompare(variantIds);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Quick comparison failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/compare/available")
    @Operation(summary = "Xe có thể so sánh", description = "Lấy danh sách xe có thể so sánh")
    public ResponseEntity<List<VehicleVariant>> getAvailableVariantsForComparison() {
        try {
            List<VehicleVariant> variants = vehicleComparisonService.getAvailableVariantsForComparison();
            return ResponseEntity.ok(variants);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/compare/{variantId1}/vs/{variantId2}")
    @Operation(summary = "So sánh 2 xe", description = "So sánh trực tiếp 2 xe cụ thể")
    public ResponseEntity<?> compareTwoVehicles(
            @PathVariable Integer variantId1,
            @PathVariable Integer variantId2) {
        try {
            VehicleComparisonResponse response = vehicleComparisonService.quickCompare(
                    List.of(variantId1, variantId2));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Two-vehicle comparison failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/compare/criteria")
    @Operation(summary = "Tiêu chí so sánh", description = "Lấy danh sách các tiêu chí so sánh có sẵn")
    public ResponseEntity<Map<String, Object>> getComparisonCriteria() {
        Map<String, Object> criteria = new HashMap<>();
        criteria.put("availableCriteria", List.of(
                "price", "range", "power", "acceleration", "topSpeed", 
                "batteryCapacity", "chargingTime", "availability"
        ));
        criteria.put("maxVehicles", 5);
        criteria.put("defaultCriteria", List.of("price", "range", "power", "acceleration"));
        return ResponseEntity.ok(criteria);
    }
}
