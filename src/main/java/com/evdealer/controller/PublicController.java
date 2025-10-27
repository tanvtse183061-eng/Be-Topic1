package com.evdealer.controller;

import com.evdealer.dto.VehicleComparisonRequest;
import com.evdealer.dto.VehicleComparisonResponse;
import com.evdealer.entity.VehicleBrand;
import com.evdealer.entity.VehicleModel;
import com.evdealer.entity.VehicleVariant;
import com.evdealer.entity.VehicleColor;
import com.evdealer.entity.VehicleInventory;
import com.evdealer.entity.Promotion;
import com.evdealer.service.VehicleService;
import com.evdealer.service.VehicleInventoryService;
import com.evdealer.service.PromotionService;
import com.evdealer.service.QuotationService;
import com.evdealer.service.OrderService;
import com.evdealer.service.CustomerService;
import com.evdealer.service.CustomerFeedbackService;
import com.evdealer.service.AppointmentService;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
@Tag(name = "Public Access", description = "APIs công khai cho khách hàng không cần đăng nhập")
public class PublicController {
    
    @Autowired
    private VehicleService vehicleService;
    
    @Autowired
    private VehicleInventoryService vehicleInventoryService;
    
    @Autowired
    private PromotionService promotionService;
    
    @Autowired
    private QuotationService quotationService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private CustomerService customerService;
    
    @Autowired
    private CustomerFeedbackService customerFeedbackService;
    
    @Autowired
    private AppointmentService appointmentService;
    
    @Autowired
    private VehicleComparisonService vehicleComparisonService;
    
    // ==================== VEHICLE CATALOG ====================
    
    @GetMapping("/vehicle-brands")
    @Operation(summary = "Xem danh sách thương hiệu", description = "Khách hàng có thể xem tất cả thương hiệu xe")
    public ResponseEntity<List<VehicleBrand>> getAllVehicleBrands() {
        List<VehicleBrand> brands = vehicleService.getAllBrands();
        return ResponseEntity.ok(brands);
    }
    
    @GetMapping("/vehicle-brands/{brandId}")
    @Operation(summary = "Xem chi tiết thương hiệu", description = "Khách hàng có thể xem chi tiết thương hiệu xe")
    public ResponseEntity<VehicleBrand> getVehicleBrandById(@PathVariable Integer brandId) {
        return vehicleService.getBrandById(brandId)
                .map(brand -> ResponseEntity.ok(brand))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/vehicle-models")
    @Operation(summary = "Xem danh sách mẫu xe", description = "Khách hàng có thể xem tất cả mẫu xe")
    public ResponseEntity<List<VehicleModel>> getAllVehicleModels() {
        List<VehicleModel> models = vehicleService.getAllModels();
        return ResponseEntity.ok(models);
    }
    
    @GetMapping("/vehicle-models/{modelId}")
    @Operation(summary = "Xem chi tiết mẫu xe", description = "Khách hàng có thể xem chi tiết mẫu xe")
    public ResponseEntity<VehicleModel> getVehicleModelById(@PathVariable Integer modelId) {
        return vehicleService.getModelById(modelId)
                .map(model -> ResponseEntity.ok(model))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/vehicle-variants")
    @Operation(summary = "Xem danh sách phiên bản xe", description = "Khách hàng có thể xem tất cả phiên bản xe")
    public ResponseEntity<List<VehicleVariant>> getAllVehicleVariants() {
        List<VehicleVariant> variants = vehicleService.getAllVariants();
        return ResponseEntity.ok(variants);
    }
    
    @GetMapping("/vehicle-variants/{variantId}")
    @Operation(summary = "Xem chi tiết phiên bản xe", description = "Khách hàng có thể xem chi tiết phiên bản xe")
    public ResponseEntity<VehicleVariant> getVehicleVariantById(@PathVariable Integer variantId) {
        return vehicleService.getVariantById(variantId)
                .map(variant -> ResponseEntity.ok(variant))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/vehicle-colors")
    @Operation(summary = "Xem danh sách màu xe", description = "Khách hàng có thể xem tất cả màu xe")
    public ResponseEntity<List<VehicleColor>> getAllVehicleColors() {
        List<VehicleColor> colors = vehicleService.getAllColors();
        return ResponseEntity.ok(colors);
    }
    
    @GetMapping("/vehicle-colors/{colorId}")
    @Operation(summary = "Xem chi tiết màu xe", description = "Khách hàng có thể xem chi tiết màu xe")
    public ResponseEntity<VehicleColor> getVehicleColorById(@PathVariable Integer colorId) {
        return vehicleService.getColorById(colorId)
                .map(color -> ResponseEntity.ok(color))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/vehicle-inventory")
    @Operation(summary = "Xem kho xe", description = "Khách hàng có thể xem xe có sẵn trong kho")
    public ResponseEntity<List<VehicleInventory>> getAllInventory() {
        List<VehicleInventory> inventory = vehicleInventoryService.getAllVehicleInventory();
        return ResponseEntity.ok(inventory);
    }
    
    @GetMapping("/vehicle-inventory/{inventoryId}")
    @Operation(summary = "Xem chi tiết xe trong kho", description = "Khách hàng có thể xem chi tiết xe trong kho")
    public ResponseEntity<VehicleInventory> getInventoryById(@PathVariable UUID inventoryId) {
        return vehicleInventoryService.getInventoryById(inventoryId)
                .map(inventory -> ResponseEntity.ok(inventory))
                .orElse(ResponseEntity.notFound().build());
    }
    
    // ==================== PROMOTIONS ====================
    
    @GetMapping("/promotions")
    @Operation(summary = "Xem khuyến mãi", description = "Khách hàng có thể xem tất cả khuyến mãi đang hoạt động")
    public ResponseEntity<List<Promotion>> getActivePromotions() {
        List<Promotion> promotions = promotionService.getPromotionsByStatus("active");
        return ResponseEntity.ok(promotions);
    }
    
    @GetMapping("/promotions/{promotionId}")
    @Operation(summary = "Xem chi tiết khuyến mãi", description = "Khách hàng có thể xem chi tiết khuyến mãi")
    public ResponseEntity<Promotion> getPromotionById(@PathVariable UUID promotionId) {
        return promotionService.getPromotionById(promotionId)
                .map(promotion -> ResponseEntity.ok(promotion))
                .orElse(ResponseEntity.notFound().build());
    }
    
    // ==================== CUSTOMER ACTIONS (READ-ONLY) ====================
    // Note: All CRUD operations have been moved to authenticated endpoints
    // This controller now only provides read-only access for customers
    
    // ==================== SEARCH & FILTER ====================
    
    @GetMapping("/vehicle-inventory/status/{status}")
    @Operation(summary = "Xem xe theo trạng thái", description = "Khách hàng có thể xem xe theo trạng thái (available, sold, reserved)")
    public ResponseEntity<List<VehicleInventory>> getInventoryByStatus(@PathVariable String status) {
        List<VehicleInventory> inventory = vehicleInventoryService.getInventoryByStatus(status);
        return ResponseEntity.ok(inventory);
    }
    
    @GetMapping("/vehicle-models/brand/{brandId}")
    @Operation(summary = "Xem mẫu xe theo thương hiệu", description = "Khách hàng có thể xem mẫu xe theo thương hiệu")
    public ResponseEntity<List<VehicleModel>> getModelsByBrand(@PathVariable Integer brandId) {
        List<VehicleModel> models = vehicleService.getModelsByBrand(brandId);
        return ResponseEntity.ok(models);
    }
    
    // ==================== VEHICLE COMPARISON ====================
    
    @PostMapping("/vehicle-compare")
    @Operation(summary = "So sánh xe", description = "Khách hàng có thể so sánh nhiều xe theo các tiêu chí khác nhau")
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
    
    @GetMapping("/vehicle-compare/quick")
    @Operation(summary = "So sánh nhanh xe", description = "Khách hàng có thể so sánh nhanh các xe theo danh sách ID")
    public ResponseEntity<?> quickCompareVehicles(
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
    
    @GetMapping("/vehicle-compare/available")
    @Operation(summary = "Xe có thể so sánh", description = "Khách hàng có thể xem danh sách xe có thể so sánh")
    public ResponseEntity<List<VehicleVariant>> getAvailableVehiclesForComparison() {
        try {
            List<VehicleVariant> variants = vehicleComparisonService.getAvailableVariantsForComparison();
            return ResponseEntity.ok(variants);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/vehicle-compare/{variantId1}/vs/{variantId2}")
    @Operation(summary = "So sánh 2 xe", description = "Khách hàng có thể so sánh trực tiếp 2 xe cụ thể")
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
    
    @GetMapping("/vehicle-compare/criteria")
    @Operation(summary = "Tiêu chí so sánh", description = "Khách hàng có thể xem danh sách các tiêu chí so sánh có sẵn")
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
