package com.evdealer.controller;

import com.evdealer.dto.*;
import com.evdealer.entity.*;
import com.evdealer.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    
    // ==================== CUSTOMER ACTIONS ====================
    
    @PostMapping("/customers")
    @Operation(summary = "Đăng ký khách hàng", description = "Khách hàng có thể đăng ký thông tin mà không cần đăng nhập")
    public ResponseEntity<Customer> createCustomer(@RequestBody CustomerRequest request) {
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
    
    @PostMapping("/quotations")
    @Operation(summary = "Tạo báo giá", description = "Khách hàng có thể tạo báo giá mà không cần đăng nhập")
    public ResponseEntity<Quotation> createQuotation(@RequestBody QuotationRequest request) {
        try {
            Quotation createdQuotation = quotationService.createQuotationFromRequest(request);
            return ResponseEntity.ok(createdQuotation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/orders")
    @Operation(summary = "Tạo đơn hàng", description = "Khách hàng có thể tạo đơn hàng mà không cần đăng nhập")
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest request) {
        try {
            Order createdOrder = orderService.createOrderFromRequest(request);
            return ResponseEntity.ok(createdOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/feedbacks")
    @Operation(summary = "Gửi phản hồi", description = "Khách hàng có thể gửi phản hồi mà không cần đăng nhập")
    public ResponseEntity<CustomerFeedback> createFeedback(@RequestBody CustomerFeedbackRequest request) {
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
    
    @PostMapping("/appointments")
    @Operation(summary = "Đặt lịch hẹn", description = "Khách hàng có thể đặt lịch hẹn mà không cần đăng nhập")
    public ResponseEntity<Appointment> createAppointment(@RequestBody AppointmentRequest request) {
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
}
