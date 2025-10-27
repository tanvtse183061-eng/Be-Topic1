package com.evdealer.controller;

import com.evdealer.entity.User;
import com.evdealer.entity.VehicleDelivery;
import com.evdealer.entity.DealerOrder;
import com.evdealer.entity.DealerOrderItem;
import com.evdealer.entity.Dealer;
import com.evdealer.service.VehicleDeliveryService;
import com.evdealer.service.DealerOrderService;
import com.evdealer.service.DealerOrderItemService;
import com.evdealer.service.DealerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicle-deliveries")
@CrossOrigin(origins = "*")
@Tag(name = "Vehicle Delivery Management", description = "APIs quản lý giao xe cho đại lý")
public class VehicleDeliveryController {
    
    @Autowired
    private VehicleDeliveryService vehicleDeliveryService;
    
    @Autowired
    private DealerOrderService dealerOrderService;
    
    @Autowired
    private DealerOrderItemService dealerOrderItemService;
    
    @Autowired
    private DealerService dealerService;
    
    @GetMapping
    public ResponseEntity<List<VehicleDelivery>> getAllDeliveries() {
        List<VehicleDelivery> deliveries = vehicleDeliveryService.getAllDeliveries();
        return ResponseEntity.ok(deliveries);
    }
    
    @GetMapping("/{deliveryId}")
    public ResponseEntity<VehicleDelivery> getDeliveryById(@PathVariable UUID deliveryId) {
        return vehicleDeliveryService.getDeliveryById(deliveryId)
                .map(delivery -> ResponseEntity.ok(delivery))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<VehicleDelivery>> getDeliveriesByOrder(@PathVariable UUID orderId) {
        List<VehicleDelivery> deliveries = vehicleDeliveryService.getDeliveriesByOrder(orderId);
        return ResponseEntity.ok(deliveries);
    }
    
    @GetMapping("/inventory/{inventoryId}")
    public ResponseEntity<List<VehicleDelivery>> getDeliveriesByInventory(@PathVariable UUID inventoryId) {
        List<VehicleDelivery> deliveries = vehicleDeliveryService.getDeliveriesByInventory(inventoryId);
        return ResponseEntity.ok(deliveries);
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<VehicleDelivery>> getDeliveriesByCustomer(@PathVariable UUID customerId) {
        List<VehicleDelivery> deliveries = vehicleDeliveryService.getDeliveriesByCustomer(customerId);
        return ResponseEntity.ok(deliveries);
    }
    
    @GetMapping("/status/{deliveryStatus}")
    public ResponseEntity<List<VehicleDelivery>> getDeliveriesByStatus(@PathVariable String deliveryStatus) {
        List<VehicleDelivery> deliveries = vehicleDeliveryService.getDeliveriesByStatus(deliveryStatus);
        return ResponseEntity.ok(deliveries);
    }
    
    @GetMapping("/date/{date}")
    public ResponseEntity<List<VehicleDelivery>> getDeliveriesByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<VehicleDelivery> deliveries = vehicleDeliveryService.getDeliveriesByDate(date);
        return ResponseEntity.ok(deliveries);
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<VehicleDelivery>> getDeliveriesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<VehicleDelivery> deliveries = vehicleDeliveryService.getDeliveriesByDateRange(startDate, endDate);
        return ResponseEntity.ok(deliveries);
    }
    
    @GetMapping("/delivered-by/{userId}")
    public ResponseEntity<List<VehicleDelivery>> getDeliveriesByDeliveredBy(@PathVariable UUID userId) {
        List<VehicleDelivery> deliveries = vehicleDeliveryService.getDeliveriesByDeliveredBy(userId);
        return ResponseEntity.ok(deliveries);
    }
    
    @GetMapping("/customer/{customerId}/status/{status}")
    public ResponseEntity<List<VehicleDelivery>> getDeliveriesByCustomerAndStatus(@PathVariable UUID customerId, @PathVariable String status) {
        List<VehicleDelivery> deliveries = vehicleDeliveryService.getDeliveriesByCustomerAndStatus(customerId, status);
        return ResponseEntity.ok(deliveries);
    }
    
    @GetMapping("/overdue")
    public ResponseEntity<List<VehicleDelivery>> getOverdueDeliveries() {
        List<VehicleDelivery> deliveries = vehicleDeliveryService.getOverdueDeliveries();
        return ResponseEntity.ok(deliveries);
    }
    
    @PostMapping
    public ResponseEntity<VehicleDelivery> createDelivery(@RequestBody VehicleDelivery delivery) {
        try {
            VehicleDelivery createdDelivery = vehicleDeliveryService.createDelivery(delivery);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDelivery);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{deliveryId}")
    public ResponseEntity<VehicleDelivery> updateDelivery(@PathVariable UUID deliveryId, @RequestBody VehicleDelivery deliveryDetails) {
        try {
            VehicleDelivery updatedDelivery = vehicleDeliveryService.updateDelivery(deliveryId, deliveryDetails);
            return ResponseEntity.ok(updatedDelivery);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{deliveryId}/status")
    public ResponseEntity<VehicleDelivery> updateDeliveryStatus(@PathVariable UUID deliveryId, @RequestParam String status) {
        try {
            VehicleDelivery updatedDelivery = vehicleDeliveryService.updateDeliveryStatus(deliveryId, status);
            return ResponseEntity.ok(updatedDelivery);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{deliveryId}/confirm")
    public ResponseEntity<VehicleDelivery> confirmDelivery(@PathVariable UUID deliveryId, @RequestBody User deliveredBy) {
        try {
            VehicleDelivery updatedDelivery = vehicleDeliveryService.confirmDelivery(deliveryId, deliveredBy);
            return ResponseEntity.ok(updatedDelivery);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{deliveryId}")
    public ResponseEntity<Void> deleteDelivery(@PathVariable UUID deliveryId) {
        try {
            vehicleDeliveryService.deleteDelivery(deliveryId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // ==================== NEW DEALER DELIVERY APIs ====================
    
    @PostMapping("/dealer-order/{dealerOrderId}")
    @Operation(summary = "Tạo giao hàng từ đơn hàng đại lý", description = "Tạo giao hàng cho đại lý từ đơn hàng đã duyệt")
    public ResponseEntity<?> createDeliveryFromDealerOrder(@PathVariable UUID dealerOrderId, @RequestBody Map<String, Object> deliveryRequest) {
        try {
            // Validate dealer order exists and is approved
            DealerOrder dealerOrder = dealerOrderService.getDealerOrderById(dealerOrderId)
                .orElseThrow(() -> new RuntimeException("Dealer order not found with ID: " + dealerOrderId));
            
            if (!"APPROVED".equals(dealerOrder.getApprovalStatus())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Cannot create delivery for non-approved order. Order status: " + dealerOrder.getApprovalStatus());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Extract delivery details
            LocalDate scheduledDeliveryDate = LocalDate.parse(deliveryRequest.get("scheduledDeliveryDate").toString());
            String deliveryAddress = deliveryRequest.getOrDefault("deliveryAddress", dealerOrder.getDealer().getAddress()).toString();
            String notes = deliveryRequest.getOrDefault("notes", "").toString();
            UUID deliveredBy = deliveryRequest.containsKey("deliveredBy") ? UUID.fromString(deliveryRequest.get("deliveredBy").toString()) : null;
            
            // Create delivery for each order item
            List<DealerOrderItem> items = dealerOrderItemService.getItemsByDealerOrderId(dealerOrderId);
            List<VehicleDelivery> createdDeliveries = new java.util.ArrayList<>();
            
            for (DealerOrderItem item : items) {
                VehicleDelivery delivery = new VehicleDelivery();
                delivery.setDealerOrder(dealerOrder);
                delivery.setDealerOrderItem(item);
                delivery.setScheduledDeliveryDate(scheduledDeliveryDate);
                delivery.setDeliveryAddress(deliveryAddress);
                delivery.setDeliveryStatus("SCHEDULED");
                delivery.setNotes(notes);
                delivery.setCreatedAt(LocalDateTime.now());
                
                if (deliveredBy != null) {
                    User deliveryPerson = new User();
                    deliveryPerson.setUserId(deliveredBy);
                    delivery.setDeliveredBy(deliveryPerson);
                }
                
                VehicleDelivery createdDelivery = vehicleDeliveryService.createDelivery(delivery);
                createdDeliveries.add(createdDelivery);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Deliveries created successfully for dealer order");
            response.put("dealerOrderId", dealerOrderId);
            response.put("dealerOrderNumber", dealerOrder.getDealerOrderNumber());
            response.put("dealerName", dealerOrder.getDealer().getDealerName());
            response.put("deliveryCount", createdDeliveries.size());
            response.put("scheduledDeliveryDate", scheduledDeliveryDate);
            response.put("deliveries", createdDeliveries);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create delivery: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create delivery: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/dealer/{dealerId}")
    @Operation(summary = "Lấy giao hàng theo đại lý", description = "Lấy danh sách giao hàng của một đại lý")
    public ResponseEntity<?> getDeliveriesByDealer(@PathVariable UUID dealerId) {
        try {
            Dealer dealer = dealerService.getDealerById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found with ID: " + dealerId));
            
            List<VehicleDelivery> deliveries = vehicleDeliveryService.getDeliveriesByDealer(dealerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("dealerId", dealerId);
            response.put("dealerName", dealer.getDealerName());
            response.put("deliveries", deliveries);
            response.put("deliveryCount", deliveries.size());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get deliveries: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @GetMapping("/dealer/{dealerId}/status/{status}")
    @Operation(summary = "Lấy giao hàng theo đại lý và trạng thái", description = "Lấy danh sách giao hàng của đại lý theo trạng thái")
    public ResponseEntity<?> getDeliveriesByDealerAndStatus(@PathVariable UUID dealerId, @PathVariable String status) {
        try {
            Dealer dealer = dealerService.getDealerById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found with ID: " + dealerId));
            
            List<VehicleDelivery> deliveries = vehicleDeliveryService.getDeliveriesByDealerAndStatus(dealerId, status);
            
            Map<String, Object> response = new HashMap<>();
            response.put("dealerId", dealerId);
            response.put("dealerName", dealer.getDealerName());
            response.put("status", status);
            response.put("deliveries", deliveries);
            response.put("deliveryCount", deliveries.size());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get deliveries: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @PutMapping("/{deliveryId}/dealer-confirm")
    @Operation(summary = "Xác nhận nhận xe từ đại lý", description = "Đại lý xác nhận đã nhận xe")
    public ResponseEntity<?> confirmDeliveryByDealer(@PathVariable UUID deliveryId, @RequestBody Map<String, Object> confirmationRequest) {
        try {
            VehicleDelivery delivery = vehicleDeliveryService.getDeliveryById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found with ID: " + deliveryId));
            
            if (!"IN_TRANSIT".equals(delivery.getDeliveryStatus())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Cannot confirm delivery that is not in transit. Current status: " + delivery.getDeliveryStatus());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            String dealerNotes = confirmationRequest.getOrDefault("dealerNotes", "").toString();
            String condition = confirmationRequest.getOrDefault("condition", "GOOD").toString();
            
            // Update delivery status
            delivery.setDeliveryStatus("DELIVERED");
            delivery.setActualDeliveryDate(LocalDate.now());
            delivery.setNotes(delivery.getNotes() + " [DEALER CONFIRMED: " + dealerNotes + "]");
            delivery.setCondition(condition);
            
            VehicleDelivery updatedDelivery = vehicleDeliveryService.updateDelivery(deliveryId, delivery);
            
            // Update order item status
            if (delivery.getDealerOrderItem() != null) {
                DealerOrderItem item = delivery.getDealerOrderItem();
                item.setStatus("DELIVERED");
                dealerOrderItemService.updateDealerOrderItem(item.getItemId(), item);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Delivery confirmed by dealer successfully");
            response.put("deliveryId", deliveryId);
            response.put("dealerOrderId", delivery.getDealerOrder().getDealerOrderId());
            response.put("dealerName", delivery.getDealerOrder().getDealer().getDealerName());
            response.put("actualDeliveryDate", LocalDate.now());
            response.put("condition", condition);
            response.put("dealerNotes", dealerNotes);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to confirm delivery: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @GetMapping("/dealer/{dealerId}/summary")
    @Operation(summary = "Tóm tắt giao hàng đại lý", description = "Lấy tóm tắt giao hàng của đại lý")
    public ResponseEntity<?> getDealerDeliverySummary(@PathVariable UUID dealerId, @RequestParam(required = false) LocalDate startDate, @RequestParam(required = false) LocalDate endDate) {
        try {
            Dealer dealer = dealerService.getDealerById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found with ID: " + dealerId));
            
            Map<String, Object> summary = vehicleDeliveryService.getDealerDeliverySummary(dealerId);
            summary.put("dealerId", dealerId);
            summary.put("dealerName", dealer.getDealerName());
            
            return ResponseEntity.ok(summary);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get delivery summary: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @GetMapping("/dealer/{dealerId}/pending")
    @Operation(summary = "Lấy giao hàng chờ xử lý", description = "Lấy danh sách giao hàng chờ xử lý của đại lý")
    public ResponseEntity<?> getPendingDeliveriesByDealer(@PathVariable UUID dealerId) {
        try {
            Dealer dealer = dealerService.getDealerById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found with ID: " + dealerId));
            
            List<VehicleDelivery> pendingDeliveries = vehicleDeliveryService.getDeliveriesByDealerAndStatus(dealerId, "SCHEDULED");
            List<VehicleDelivery> inTransitDeliveries = vehicleDeliveryService.getDeliveriesByDealerAndStatus(dealerId, "IN_TRANSIT");
            
            Map<String, Object> response = new HashMap<>();
            response.put("dealerId", dealerId);
            response.put("dealerName", dealer.getDealerName());
            response.put("scheduledDeliveries", pendingDeliveries);
            response.put("inTransitDeliveries", inTransitDeliveries);
            response.put("scheduledCount", pendingDeliveries.size());
            response.put("inTransitCount", inTransitDeliveries.size());
            response.put("totalPendingCount", pendingDeliveries.size() + inTransitDeliveries.size());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get pending deliveries: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "Thống kê giao hàng", description = "Lấy thống kê tổng quan về giao hàng")
    public ResponseEntity<?> getDeliveryStatistics(@RequestParam(required = false) LocalDate startDate, @RequestParam(required = false) LocalDate endDate) {
        try {
            Map<String, Object> statistics = vehicleDeliveryService.getDeliveryStatistics();
            return ResponseEntity.ok(statistics);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get delivery statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
