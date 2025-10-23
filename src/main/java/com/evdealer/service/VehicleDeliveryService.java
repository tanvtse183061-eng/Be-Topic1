package com.evdealer.service;

import com.evdealer.entity.User;
import com.evdealer.entity.VehicleDelivery;
import com.evdealer.repository.VehicleDeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class VehicleDeliveryService {
    
    @Autowired
    private VehicleDeliveryRepository vehicleDeliveryRepository;
    
    public List<VehicleDelivery> getAllDeliveries() {
        try {
            return vehicleDeliveryRepository.findAll();
        } catch (Exception e) {
            // Return empty list if there's an issue
            return new java.util.ArrayList<>();
        }
    }
    
    public Optional<VehicleDelivery> getDeliveryById(UUID deliveryId) {
        return vehicleDeliveryRepository.findById(deliveryId);
    }
    
    public List<VehicleDelivery> getDeliveriesByOrder(UUID orderId) {
        return vehicleDeliveryRepository.findByOrderOrderId(orderId);
    }
    
    public List<VehicleDelivery> getDeliveriesByInventory(UUID inventoryId) {
        return vehicleDeliveryRepository.findByInventoryInventoryId(inventoryId);
    }
    
    public List<VehicleDelivery> getDeliveriesByCustomer(UUID customerId) {
        return vehicleDeliveryRepository.findByCustomerCustomerId(customerId);
    }
    
    public List<VehicleDelivery> getDeliveriesByStatus(String deliveryStatus) {
        return vehicleDeliveryRepository.findByDeliveryStatus(deliveryStatus);
    }
    
    public List<VehicleDelivery> getDeliveriesByDate(LocalDate date) {
        return vehicleDeliveryRepository.findByDeliveryDate(date);
    }
    
    public List<VehicleDelivery> getDeliveriesByDateRange(LocalDate startDate, LocalDate endDate) {
        return vehicleDeliveryRepository.findByDeliveryDateBetween(startDate, endDate);
    }
    
    public List<VehicleDelivery> getDeliveriesByDeliveredBy(UUID userId) {
        return vehicleDeliveryRepository.findByDeliveredBy(userId);
    }
    
    public List<VehicleDelivery> getDeliveriesByCustomerAndStatus(UUID customerId, String status) {
        return vehicleDeliveryRepository.findByCustomerAndStatus(customerId, status);
    }
    
    public List<VehicleDelivery> getOverdueDeliveries() {
        return vehicleDeliveryRepository.findOverdueDeliveries(LocalDate.now());
    }
    
    public VehicleDelivery createDelivery(VehicleDelivery delivery) {
        return vehicleDeliveryRepository.save(delivery);
    }
    
    public VehicleDelivery updateDelivery(UUID deliveryId, VehicleDelivery deliveryDetails) {
        VehicleDelivery delivery = vehicleDeliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Vehicle delivery not found with id: " + deliveryId));
        
        delivery.setOrder(deliveryDetails.getOrder());
        delivery.setInventory(deliveryDetails.getInventory());
        delivery.setCustomer(deliveryDetails.getCustomer());
        delivery.setDeliveryDate(deliveryDetails.getDeliveryDate());
        delivery.setDeliveryTime(deliveryDetails.getDeliveryTime());
        delivery.setDeliveryAddress(deliveryDetails.getDeliveryAddress());
        delivery.setDeliveryContactName(deliveryDetails.getDeliveryContactName());
        delivery.setDeliveryContactPhone(deliveryDetails.getDeliveryContactPhone());
        delivery.setDeliveryStatus(deliveryDetails.getDeliveryStatus());
        delivery.setDeliveryNotes(deliveryDetails.getDeliveryNotes());
        delivery.setDeliveredBy(deliveryDetails.getDeliveredBy());
        delivery.setDeliveryConfirmationDate(deliveryDetails.getDeliveryConfirmationDate());
        delivery.setCustomerSignatureUrl(deliveryDetails.getCustomerSignatureUrl());
        delivery.setCustomerSignaturePath(deliveryDetails.getCustomerSignaturePath());
        
        return vehicleDeliveryRepository.save(delivery);
    }
    
    public void deleteDelivery(UUID deliveryId) {
        VehicleDelivery delivery = vehicleDeliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Vehicle delivery not found with id: " + deliveryId));
        vehicleDeliveryRepository.delete(delivery);
    }
    
    public VehicleDelivery updateDeliveryStatus(UUID deliveryId, String status) {
        VehicleDelivery delivery = vehicleDeliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Vehicle delivery not found with id: " + deliveryId));
        delivery.setDeliveryStatus(status);
        return vehicleDeliveryRepository.save(delivery);
    }
    
    public VehicleDelivery confirmDelivery(UUID deliveryId, User deliveredBy) {
        VehicleDelivery delivery = vehicleDeliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Vehicle delivery not found with id: " + deliveryId));
        
        delivery.setDeliveryStatus("delivered");
        delivery.setDeliveredBy(deliveredBy);
        delivery.setDeliveryConfirmationDate(LocalDateTime.now());
        
        return vehicleDeliveryRepository.save(delivery);
    }
}
