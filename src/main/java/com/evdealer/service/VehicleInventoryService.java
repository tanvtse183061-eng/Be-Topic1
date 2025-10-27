package com.evdealer.service;

import com.evdealer.entity.VehicleInventory;
import com.evdealer.enums.VehicleStatus;
import com.evdealer.repository.VehicleInventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class VehicleInventoryService {
    
    @Autowired
    private VehicleInventoryRepository vehicleInventoryRepository;
    
    public List<VehicleInventory> getAllVehicleInventory() {
        try {
            return vehicleInventoryRepository.findAll();
        } catch (Exception e) {
            // Return empty list if there's an issue
            return new java.util.ArrayList<>();
        }
    }
    
    public List<VehicleInventory> getInventoryByStatus(String status) {
        return vehicleInventoryRepository.findByStatus(status);
    }
    
    public List<VehicleInventory> getInventoryByVariant(Integer variantId) {
        return vehicleInventoryRepository.findByVariantVariantId(variantId);
    }
    
    public List<VehicleInventory> getInventoryByColor(Integer colorId) {
        return vehicleInventoryRepository.findByColorColorId(colorId);
    }
    
    public List<VehicleInventory> getInventoryByWarehouse(UUID warehouseId) {
        return vehicleInventoryRepository.findByWarehouseWarehouseId(warehouseId);
    }
    
    public List<VehicleInventory> getInventoryByWarehouseLocation(String warehouseLocation) {
        return vehicleInventoryRepository.findByWarehouseLocation(warehouseLocation);
    }
    
    public List<VehicleInventory> getInventoryByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return vehicleInventoryRepository.findByPriceRange(minPrice, maxPrice);
    }
    
    public List<VehicleInventory> getInventoryByManufacturingDateRange(LocalDate startDate, LocalDate endDate) {
        return vehicleInventoryRepository.findByManufacturingDateRange(startDate, endDate);
    }
    
    public List<VehicleInventory> getInventoryByArrivalDateRange(LocalDate startDate, LocalDate endDate) {
        return vehicleInventoryRepository.findByArrivalDateRange(startDate, endDate);
    }
    
    public List<VehicleInventory> searchByVin(String vin) {
        return vehicleInventoryRepository.findByVinContaining(vin);
    }
    
    public List<VehicleInventory> searchByChassisNumber(String chassisNumber) {
        return vehicleInventoryRepository.findByChassisNumberContaining(chassisNumber);
    }
    
    public Optional<VehicleInventory> getInventoryById(UUID inventoryId) {
        return vehicleInventoryRepository.findById(inventoryId);
    }
    
    public Optional<VehicleInventory> getInventoryByVin(String vin) {
        return vehicleInventoryRepository.findByVin(vin);
    }
    
    public VehicleInventory createVehicleInventory(VehicleInventory vehicleInventory) {
        if (vehicleInventory.getVin() != null && 
            vehicleInventoryRepository.existsByVin(vehicleInventory.getVin())) {
            throw new RuntimeException("VIN already exists");
        }
        return vehicleInventoryRepository.save(vehicleInventory);
    }
    
    public VehicleInventory updateVehicleInventory(UUID inventoryId, VehicleInventory vehicleInventoryDetails) {
        VehicleInventory vehicleInventory = vehicleInventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Vehicle inventory not found"));
        
        vehicleInventory.setVariant(vehicleInventoryDetails.getVariant());
        vehicleInventory.setColor(vehicleInventoryDetails.getColor());
        vehicleInventory.setWarehouse(vehicleInventoryDetails.getWarehouse());
        vehicleInventory.setWarehouseLocation(vehicleInventoryDetails.getWarehouseLocation());
        vehicleInventory.setVin(vehicleInventoryDetails.getVin());
        vehicleInventory.setChassisNumber(vehicleInventoryDetails.getChassisNumber());
        vehicleInventory.setManufacturingDate(vehicleInventoryDetails.getManufacturingDate());
        vehicleInventory.setArrivalDate(vehicleInventoryDetails.getArrivalDate());
        vehicleInventory.setStatus(vehicleInventoryDetails.getStatus());
        vehicleInventory.setCostPrice(vehicleInventoryDetails.getCostPrice());
        vehicleInventory.setSellingPrice(vehicleInventoryDetails.getSellingPrice());
        vehicleInventory.setVehicleImages(vehicleInventoryDetails.getVehicleImages());
        vehicleInventory.setInteriorImages(vehicleInventoryDetails.getInteriorImages());
        vehicleInventory.setExteriorImages(vehicleInventoryDetails.getExteriorImages());
        
        return vehicleInventoryRepository.save(vehicleInventory);
    }
    
    public void deleteVehicleInventory(UUID inventoryId) {
        if (!vehicleInventoryRepository.existsById(inventoryId)) {
            throw new RuntimeException("Vehicle inventory not found");
        }
        vehicleInventoryRepository.deleteById(inventoryId);
    }
    
    public VehicleInventory updateInventoryStatus(UUID inventoryId, String status) {
        VehicleInventory vehicleInventory = vehicleInventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Vehicle inventory not found"));
        
        // Normalize status using enum
        VehicleStatus normalizedStatus = VehicleStatus.fromString(status);
        vehicleInventory.setStatus(normalizedStatus.getValue());
        
        return vehicleInventoryRepository.save(vehicleInventory);
    }
    
    public VehicleInventory createInventory(VehicleInventory inventory) {
        if (vehicleInventoryRepository.existsByVin(inventory.getVin())) {
            throw new RuntimeException("Vehicle with VIN already exists: " + inventory.getVin());
        }
        
        // Normalize status before saving
        if (inventory.getStatus() != null) {
            VehicleStatus normalizedStatus = VehicleStatus.fromString(inventory.getStatus());
            inventory.setStatus(normalizedStatus.getValue());
        } else {
            inventory.setStatus(VehicleStatus.AVAILABLE.getValue());
        }
        
        return vehicleInventoryRepository.save(inventory);
    }
    
    /**
     * Normalize all existing status values in the database
     * This method should be called once to fix existing data
     */
    public int normalizeAllStatuses() {
        List<VehicleInventory> allInventory = vehicleInventoryRepository.findAll();
        int updatedCount = 0;
        
        for (VehicleInventory inventory : allInventory) {
            String currentStatus = inventory.getStatus();
            if (currentStatus != null) {
                VehicleStatus normalizedStatus = VehicleStatus.fromString(currentStatus);
                if (!normalizedStatus.getValue().equals(currentStatus)) {
                    inventory.setStatus(normalizedStatus.getValue());
                    vehicleInventoryRepository.save(inventory);
                    updatedCount++;
                }
            }
        }
        
        return updatedCount;
    }
    
    /**
     * Get all available status values with descriptions
     */
    public java.util.Map<String, String> getAllStatusOptions() {
        return VehicleStatus.getAllWithDescriptions();
    }
    
    /**
     * Validate status value
     */
    public boolean isValidStatus(String status) {
        return VehicleStatus.isValid(status);
    }
}
