package com.evdealer.controller;

import com.evdealer.entity.User;
import com.evdealer.entity.VehicleDelivery;
import com.evdealer.service.VehicleDeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicle-deliveries")
@CrossOrigin(origins = "*")
public class VehicleDeliveryController {
    
    @Autowired
    private VehicleDeliveryService vehicleDeliveryService;
    
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
}
