package com.evdealer.controller;

import com.evdealer.dto.*;
import com.evdealer.entity.*;
import com.evdealer.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/")
@CrossOrigin(origins = "*")
@Tag(name = "Home - Main Page", description = "Trang chính cho khách hàng - không cần đăng nhập")
public class HomeController {
    
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
    
    // ==================== HOME PAGE ENDPOINTS ====================
    
    @GetMapping
    @Operation(summary = "Trang chủ", description = "Thông tin tổng quan cho trang chủ")
    public ResponseEntity<Map<String, Object>> getHomePage() {
        Map<String, Object> homeData = new HashMap<>();
        
        // Featured vehicles (available inventory)
        List<VehicleInventory> featuredVehicles = vehicleInventoryService.getInventoryByStatus("available");
        homeData.put("featuredVehicles", featuredVehicles);
        
        // Active promotions
        List<Promotion> activePromotions = promotionService.getPromotionsByStatus("active");
        homeData.put("activePromotions", activePromotions);
        
        // Statistics
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVehicles", featuredVehicles.size());
        stats.put("activePromotions", activePromotions.size());
        homeData.put("statistics", stats);
        
        return ResponseEntity.ok(homeData);
    }
    
    @GetMapping("/catalog")
    @Operation(summary = "Danh mục xe", description = "Xem tất cả xe có sẵn")
    public ResponseEntity<Map<String, Object>> getVehicleCatalog() {
        Map<String, Object> catalog = new HashMap<>();
        
        // Vehicle brands
        List<VehicleBrand> brands = vehicleService.getAllBrands();
        catalog.put("brands", brands);
        
        // Vehicle models
        List<VehicleModel> models = vehicleService.getAllModels();
        catalog.put("models", models);
        
        // Vehicle variants
        List<VehicleVariant> variants = vehicleService.getAllVariants();
        catalog.put("variants", variants);
        
        // Vehicle colors
        List<VehicleColor> colors = vehicleService.getAllColors();
        catalog.put("colors", colors);
        
        // Available inventory
        List<VehicleInventory> inventory = vehicleInventoryService.getInventoryByStatus("available");
        catalog.put("availableInventory", inventory);
        
        return ResponseEntity.ok(catalog);
    }
    
    @GetMapping("/promotions")
    @Operation(summary = "Khuyến mãi", description = "Xem tất cả khuyến mãi đang hoạt động")
    public ResponseEntity<List<Promotion>> getPromotions() {
        List<Promotion> promotions = promotionService.getPromotionsByStatus("active");
        return ResponseEntity.ok(promotions);
    }
    
    // ==================== CUSTOMER ACTIONS ====================
    
    @PostMapping("/register")
    @Operation(summary = "Đăng ký khách hàng", description = "Đăng ký thông tin khách hàng mới")
    public ResponseEntity<Customer> registerCustomer(@RequestBody CustomerRequest request) {
        try {
            Customer customer = new Customer();
            customer.setFirstName(request.getFirstName());
            customer.setLastName(request.getLastName());
            customer.setEmail(request.getEmail());
            customer.setPhone(request.getPhone());
            customer.setDateOfBirth(request.getDateOfBirth());
            customer.setAddress(request.getAddress());
            customer.setCity(request.getCity());
            customer.setProvince(request.getProvince());
            customer.setPostalCode(request.getPostalCode());
            customer.setCreditScore(request.getCreditScore());
            customer.setPreferredContactMethod(request.getPreferredContactMethod());
            customer.setNotes(request.getNotes());
            
            Customer createdCustomer = customerService.createCustomer(customer);
            return ResponseEntity.ok(createdCustomer);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/quotation")
    @Operation(summary = "Tạo báo giá", description = "Tạo báo giá cho khách hàng")
    public ResponseEntity<Quotation> createQuotation(@RequestBody QuotationRequest request) {
        try {
            Quotation createdQuotation = quotationService.createQuotationFromRequest(request);
            return ResponseEntity.ok(createdQuotation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/order")
    @Operation(summary = "Đặt hàng", description = "Tạo đơn hàng cho khách hàng")
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest request) {
        try {
            Order createdOrder = orderService.createOrderFromRequest(request);
            return ResponseEntity.ok(createdOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/feedback")
    @Operation(summary = "Gửi phản hồi", description = "Gửi phản hồi từ khách hàng")
    public ResponseEntity<CustomerFeedback> submitFeedback(@RequestBody CustomerFeedbackRequest request) {
        try {
            CustomerFeedback feedback = new CustomerFeedback();
            feedback.setCustomer(customerService.getCustomerById(request.getCustomerId()).orElse(null));
            feedback.setRating(request.getRating());
            feedback.setMessage(request.getComment());
            feedback.setFeedbackType(request.getFeedbackType());
            
            CustomerFeedback createdFeedback = customerFeedbackService.createFeedback(feedback);
            return ResponseEntity.ok(createdFeedback);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/appointment")
    @Operation(summary = "Đặt lịch hẹn", description = "Đặt lịch hẹn với khách hàng")
    public ResponseEntity<Appointment> bookAppointment(@RequestBody AppointmentRequest request) {
        try {
            Appointment appointment = new Appointment();
            appointment.setCustomer(customerService.getCustomerById(request.getCustomerId()).orElse(null));
            appointment.setVariant(vehicleService.getVariantById(request.getVariantId()).orElse(null));
            appointment.setAppointmentType(request.getAppointmentType());
            appointment.setTitle(request.getTitle());
            appointment.setDescription(request.getDescription());
            appointment.setAppointmentDate(request.getAppointmentDate());
            appointment.setDurationMinutes(request.getDurationMinutes());
            appointment.setLocation(request.getLocation());
            appointment.setStatus(request.getStatus() != null ? request.getStatus() : "pending");
            appointment.setNotes(request.getNotes());
            
            Appointment createdAppointment = appointmentService.createAppointment(appointment);
            return ResponseEntity.ok(createdAppointment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // ==================== SEARCH & FILTER ====================
    
    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm", description = "Tìm kiếm xe theo tiêu chí")
    public ResponseEntity<Map<String, Object>> searchVehicles(
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String variant,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        
        Map<String, Object> searchResults = new HashMap<>();
        
        // Get all available inventory
        List<VehicleInventory> allInventory = vehicleInventoryService.getInventoryByStatus("available");
        searchResults.put("results", allInventory);
        searchResults.put("totalCount", allInventory.size());
        
        return ResponseEntity.ok(searchResults);
    }
    
    @GetMapping("/inventory/available")
    @Operation(summary = "Xe có sẵn", description = "Xem tất cả xe có sẵn để mua")
    public ResponseEntity<List<VehicleInventory>> getAvailableVehicles() {
        List<VehicleInventory> availableVehicles = vehicleInventoryService.getInventoryByStatus("available");
        return ResponseEntity.ok(availableVehicles);
    }
    
    @GetMapping("/inventory/{inventoryId}")
    @Operation(summary = "Chi tiết xe", description = "Xem chi tiết xe trong kho")
    public ResponseEntity<VehicleInventory> getVehicleDetails(@PathVariable UUID inventoryId) {
        return vehicleInventoryService.getInventoryById(inventoryId)
                .map(inventory -> ResponseEntity.ok(inventory))
                .orElse(ResponseEntity.notFound().build());
    }
    
    // ==================== BRAND & MODEL ENDPOINTS ====================
    
    @GetMapping("/brands")
    @Operation(summary = "Thương hiệu", description = "Xem tất cả thương hiệu xe")
    public ResponseEntity<List<VehicleBrand>> getBrands() {
        List<VehicleBrand> brands = vehicleService.getAllBrands();
        return ResponseEntity.ok(brands);
    }
    
    @GetMapping("/brands/{brandId}")
    @Operation(summary = "Chi tiết thương hiệu", description = "Xem chi tiết thương hiệu")
    public ResponseEntity<VehicleBrand> getBrandDetails(@PathVariable Integer brandId) {
        return vehicleService.getBrandById(brandId)
                .map(brand -> ResponseEntity.ok(brand))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/models")
    @Operation(summary = "Mẫu xe", description = "Xem tất cả mẫu xe")
    public ResponseEntity<List<VehicleModel>> getModels() {
        List<VehicleModel> models = vehicleService.getAllModels();
        return ResponseEntity.ok(models);
    }
    
    @GetMapping("/models/{modelId}")
    @Operation(summary = "Chi tiết mẫu xe", description = "Xem chi tiết mẫu xe")
    public ResponseEntity<VehicleModel> getModelDetails(@PathVariable Integer modelId) {
        return vehicleService.getModelById(modelId)
                .map(model -> ResponseEntity.ok(model))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/variants")
    @Operation(summary = "Phiên bản xe", description = "Xem tất cả phiên bản xe")
    public ResponseEntity<List<VehicleVariant>> getVariants() {
        List<VehicleVariant> variants = vehicleService.getAllVariants();
        return ResponseEntity.ok(variants);
    }
    
    @GetMapping("/variants/{variantId}")
    @Operation(summary = "Chi tiết phiên bản xe", description = "Xem chi tiết phiên bản xe")
    public ResponseEntity<VehicleVariant> getVariantDetails(@PathVariable Integer variantId) {
        return vehicleService.getVariantById(variantId)
                .map(variant -> ResponseEntity.ok(variant))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/colors")
    @Operation(summary = "Màu xe", description = "Xem tất cả màu xe")
    public ResponseEntity<List<VehicleColor>> getColors() {
        List<VehicleColor> colors = vehicleService.getAllColors();
        return ResponseEntity.ok(colors);
    }
    
    @GetMapping("/colors/{colorId}")
    @Operation(summary = "Chi tiết màu xe", description = "Xem chi tiết màu xe")
    public ResponseEntity<VehicleColor> getColorDetails(@PathVariable Integer colorId) {
        return vehicleService.getColorById(colorId)
                .map(color -> ResponseEntity.ok(color))
                .orElse(ResponseEntity.notFound().build());
    }
}