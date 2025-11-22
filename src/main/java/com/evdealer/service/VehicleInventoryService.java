package com.evdealer.service;

import com.evdealer.entity.VehicleInventory;
import com.evdealer.entity.VehicleVariant;
import com.evdealer.entity.VehicleColor;
import com.evdealer.dto.VehicleInventoryRequest;
import com.evdealer.enums.VehicleStatus;
import com.evdealer.repository.VehicleInventoryRepository;
import com.evdealer.repository.VehicleVariantRepository;
import com.evdealer.repository.VehicleColorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

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
    
    @Autowired
    private VehicleVariantRepository vehicleVariantRepository;
    
    @Autowired
    private VehicleColorRepository vehicleColorRepository;
    
    @Autowired
    private com.evdealer.repository.WarehouseRepository warehouseRepository;
    
    @Autowired
    private com.evdealer.repository.VehicleDeliveryRepository vehicleDeliveryRepository;
    
    @Autowired
    private com.evdealer.repository.OrderRepository orderRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public List<VehicleInventory> getAllVehicleInventory() {
        try {
            // Clear persistence context before query to ensure fresh data from database
            entityManager.clear();
            
            // Try to use findAllWithRelationships first for better performance
            List<VehicleInventory> result;
            try {
                result = vehicleInventoryRepository.findAllWithRelationships();
                System.out.println("[VehicleInventoryService] getAllVehicleInventory: Used findAllWithRelationships, found " + result.size() + " inventory items");
            } catch (Exception e) {
                // Fallback to simple findAll if there's an issue with relationships query
                System.out.println("[VehicleInventoryService] WARNING: findAllWithRelationships failed, using findAll: " + e.getMessage());
                result = vehicleInventoryRepository.findAll();
                System.out.println("[VehicleInventoryService] getAllVehicleInventory: Used findAll, found " + result.size() + " inventory items");
            }
            
            // Fix any enum issues in the result
            for (VehicleInventory inv : result) {
                try {
                    // Ensure status enum is valid
                    if (inv.getStatus() != null) {
                        inv.getStatus().getValue();
                    }
                } catch (Exception e) {
                    // If status is invalid, set to default
                    inv.setStatus(com.evdealer.enums.VehicleStatus.AVAILABLE);
                }
                try {
                    // Ensure condition enum is valid
                    if (inv.getCondition() != null) {
                        inv.getCondition().toString();
                    }
                } catch (Exception e) {
                    // If condition is invalid, set to default
                    inv.setCondition(com.evdealer.enums.VehicleCondition.NEW);
                }
            }
            return result;
        } catch (Exception e) {
            System.err.println("[VehicleInventoryService] ERROR in getAllVehicleInventory: " + e.getMessage());
            e.printStackTrace();
            // Log error and return empty list
            return new java.util.ArrayList<>();
        }
    }
    
    public List<VehicleInventory> getInventoryByStatus(String status) {
        VehicleStatus statusEnum = VehicleStatus.fromString(status);
        return vehicleInventoryRepository.findByStatus(statusEnum);
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
        // Use eager loading to fetch warehouse relationship
        return vehicleInventoryRepository.findByIdWithRelationships(inventoryId);
    }
    
    /**
     * Get inventory by ID with all relationships eagerly loaded (alias)
     */
    public Optional<VehicleInventory> getInventoryByIdWithDetails(UUID inventoryId) {
        return getInventoryById(inventoryId);
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
    
    public VehicleInventory createVehicleInventoryFromRequest(VehicleInventoryRequest request) {
        // Validate required fields
        if (request.getVariantId() == null) {
            throw new RuntimeException("Variant ID is required");
        }
        if (request.getColorId() == null) {
            throw new RuntimeException("Color ID is required");
        }
        if (request.getVin() == null || request.getVin().trim().isEmpty()) {
            throw new RuntimeException("VIN is required");
        }
        
        // Check for duplicate VIN
        if (vehicleInventoryRepository.existsByVin(request.getVin())) {
            throw new RuntimeException("VIN already exists: " + request.getVin());
        }
        
        // Get VehicleVariant - ensure it's managed
        VehicleVariant variant = vehicleVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new RuntimeException("Variant not found with id: " + request.getVariantId()));
        // Ensure variant is managed in persistence context
        if (!entityManager.contains(variant)) {
            variant = entityManager.merge(variant);
        }
        
        // Get VehicleColor - ensure it's managed
        VehicleColor color = vehicleColorRepository.findById(request.getColorId())
                .orElseThrow(() -> new RuntimeException("Color not found with id: " + request.getColorId()));
        // Ensure color is managed in persistence context
        if (!entityManager.contains(color)) {
            color = entityManager.merge(color);
        }
        
        // Get Warehouse if provided - ensure it's managed
        com.evdealer.entity.Warehouse warehouse = null;
        if (request.getWarehouseId() != null) {
            warehouse = warehouseRepository.findById(request.getWarehouseId())
                    .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + request.getWarehouseId()));
            // Ensure warehouse is managed in persistence context
            if (!entityManager.contains(warehouse)) {
                warehouse = entityManager.merge(warehouse);
            }
        }
        
        // Create VehicleInventory entity
        VehicleInventory inventory = new VehicleInventory();
        inventory.setVariant(variant);
        inventory.setColor(color);
        inventory.setWarehouse(warehouse);  // Set warehouse if provided
        
        inventory.setVin(request.getVin().trim());
        inventory.setChassisNumber(request.getChassisNumber());
        inventory.setManufacturingDate(request.getManufacturingDate());
        inventory.setWarehouseLocation(request.getLocation());
        
        // Set prices
        if (request.getPurchasePrice() != null) {
            inventory.setCostPrice(request.getPurchasePrice());
        }
        if (request.getSellingPrice() != null) {
            inventory.setSellingPrice(request.getSellingPrice());
        }
        
        // Normalize and set status
        if (request.getStatus() != null) {
            VehicleStatus normalizedStatus = VehicleStatus.fromString(request.getStatus());
            inventory.setStatus(normalizedStatus);
        } else {
            inventory.setStatus(VehicleStatus.AVAILABLE);
        }
        
        // Save inventory and flush to ensure relationships are persisted
        VehicleInventory savedInventory = vehicleInventoryRepository.save(inventory);
        
        entityManager.flush(); // Force immediate persistence to database
        entityManager.clear(); // Clear persistence context to force reload from database
        
        // Reload with relationships to ensure variant, color, and warehouse are loaded
        Optional<VehicleInventory> reloaded = vehicleInventoryRepository.findByIdWithRelationships(savedInventory.getInventoryId());
        
        if (reloaded.isPresent()) {
            return reloaded.get();
        }
        
        return savedInventory;
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
    
    public VehicleInventory updateVehicleInventoryFromRequest(UUID inventoryId, VehicleInventoryRequest request) {
        VehicleInventory inventory = vehicleInventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Vehicle inventory not found"));
        
        // Update variant if provided - ensure it's managed
        if (request.getVariantId() != null) {
            VehicleVariant variant = vehicleVariantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Variant not found with id: " + request.getVariantId()));
            // Ensure variant is managed in persistence context
            if (!entityManager.contains(variant)) {
                variant = entityManager.merge(variant);
            }
            inventory.setVariant(variant);
        }
        
        // Update color if provided - ensure it's managed
        if (request.getColorId() != null) {
            VehicleColor color = vehicleColorRepository.findById(request.getColorId())
                    .orElseThrow(() -> new RuntimeException("Color not found with id: " + request.getColorId()));
            // Ensure color is managed in persistence context
            if (!entityManager.contains(color)) {
                color = entityManager.merge(color);
            }
            inventory.setColor(color);
        }
        
        // Update warehouse if provided - ensure it's managed
        if (request.getWarehouseId() != null) {
            com.evdealer.entity.Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                    .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + request.getWarehouseId()));
            // Ensure warehouse is managed in persistence context
            if (!entityManager.contains(warehouse)) {
                warehouse = entityManager.merge(warehouse);
            }
            inventory.setWarehouse(warehouse);
        }
        // If warehouseId is not provided in request, warehouse remains unchanged
        
        // Update VIN if provided and not empty (check for duplicates)
        if (request.getVin() != null) {
            String trimmedVin = request.getVin().trim();
            // If VIN is empty string, skip update (keep current VIN)
            if (!trimmedVin.isEmpty()) {
                // Get current VIN (may be null)
                String currentVin = inventory.getVin();
                
                // Only check for duplicates if VIN is actually changing
                // Use Objects.equals to handle null safely
                if (!java.util.Objects.equals(trimmedVin, currentVin)) {
                    // VIN is changing, check if new VIN already exists
                    if (vehicleInventoryRepository.existsByVin(trimmedVin)) {
                        throw new RuntimeException("VIN already exists: " + trimmedVin);
                    }
                }
                // Update VIN (even if same, to ensure it's trimmed)
                inventory.setVin(trimmedVin);
            }
            // If trimmedVin is empty, do nothing - keep current VIN
        }
        
        // Update other fields - handle empty strings as null
        if (request.getChassisNumber() != null) {
            String chassisNumber = request.getChassisNumber().trim();
            inventory.setChassisNumber(chassisNumber.isEmpty() ? null : chassisNumber);
        }
        if (request.getManufacturingDate() != null) {
            inventory.setManufacturingDate(request.getManufacturingDate());
        }
        if (request.getLocation() != null) {
            String location = request.getLocation().trim();
            inventory.setWarehouseLocation(location.isEmpty() ? null : location);
        }
        if (request.getPurchasePrice() != null) {
            inventory.setCostPrice(request.getPurchasePrice());
        }
        if (request.getSellingPrice() != null) {
            inventory.setSellingPrice(request.getSellingPrice());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            VehicleStatus normalizedStatus = VehicleStatus.fromString(request.getStatus().trim());
            inventory.setStatus(normalizedStatus);
        }
        
        // Ensure inventory is managed before save
        if (!entityManager.contains(inventory)) {
            inventory = entityManager.merge(inventory);
        }
        
        // Save inventory and flush to ensure relationships are persisted
        VehicleInventory savedInventory = vehicleInventoryRepository.save(inventory);
        entityManager.flush(); // Force immediate persistence to database
        
        // Reload with relationships to ensure variant, color, and warehouse are loaded
        return vehicleInventoryRepository.findByIdWithRelationships(savedInventory.getInventoryId())
                .orElse(savedInventory);
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deleteVehicleInventory(UUID inventoryId) {
        // Log delete attempt
        System.out.println("[VehicleInventoryService] ========== DELETE INVENTORY START ==========");
        System.out.println("[VehicleInventoryService] Attempting to delete inventory: " + inventoryId);
        
        try {
            // Step 1: Find inventory
            VehicleInventory inventory = vehicleInventoryRepository.findById(inventoryId)
                    .orElseThrow(() -> {
                        System.out.println("[VehicleInventoryService] ERROR: Inventory not found: " + inventoryId);
                        return new RuntimeException("Vehicle inventory not found with id: " + inventoryId);
                    });
            
            String vin = inventory.getVin();
            System.out.println("[VehicleInventoryService] Found inventory to delete:");
            System.out.println("  - Inventory ID: " + inventoryId);
            System.out.println("  - VIN: " + vin);
            System.out.println("  - Status: " + (inventory.getStatus() != null ? inventory.getStatus().getValue() : "null"));
            
            // Step 2: Clear foreign key references in orders (CRITICAL - this was causing the error)
            try {
                System.out.println("[VehicleInventoryService] Step 2: Clearing inventory_id references in orders...");
                orderRepository.clearInventoryReference(inventoryId);
                entityManager.flush();
                System.out.println("[VehicleInventoryService] ✓ Cleared orders references");
            } catch (Exception e) {
                System.err.println("[VehicleInventoryService] ERROR: Failed to clear orders references: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Failed to clear orders references: " + e.getMessage(), e);
            }
            
            // Step 3: Clear foreign key references in vehicle_deliveries
            try {
                System.out.println("[VehicleInventoryService] Step 3: Clearing inventory_id references in vehicle_deliveries...");
                vehicleDeliveryRepository.clearInventoryReference(inventoryId);
                entityManager.flush();
                System.out.println("[VehicleInventoryService] ✓ Cleared vehicle_deliveries references");
            } catch (Exception e) {
                System.err.println("[VehicleInventoryService] WARNING: Failed to clear vehicle_deliveries references: " + e.getMessage());
                // Continue with delete anyway
            }
            
            // Step 4: Clear reservations in vehicle_inventory
            try {
                System.out.println("[VehicleInventoryService] Step 4: Clearing reservations (reserved_for_customer, reserved_for_dealer)...");
                vehicleInventoryRepository.clearAllReservations(inventoryId);
                entityManager.flush();
                System.out.println("[VehicleInventoryService] ✓ Cleared reservations");
            } catch (Exception e) {
                System.err.println("[VehicleInventoryService] WARNING: Failed to clear reservations: " + e.getMessage());
                // Continue with delete anyway
            }
            
            // Step 5: Reload inventory to ensure it's in sync with database
            inventory = vehicleInventoryRepository.findById(inventoryId)
                    .orElseThrow(() -> new RuntimeException("Inventory disappeared before delete: " + inventoryId));
            
            // Step 6: Delete inventory
            System.out.println("[VehicleInventoryService] Step 6: Deleting inventory record...");
            vehicleInventoryRepository.delete(inventory);
            entityManager.flush();
            entityManager.clear();
            System.out.println("[VehicleInventoryService] ✓ Delete executed and flushed");
            
            // Step 7: Verify deletion
            System.out.println("[VehicleInventoryService] Step 7: Verifying deletion...");
            Optional<VehicleInventory> deletedInventory = vehicleInventoryRepository.findById(inventoryId);
            if (deletedInventory.isPresent()) {
                System.err.println("[VehicleInventoryService] ❌ ERROR: Inventory still exists after delete: " + inventoryId);
                System.err.println("[VehicleInventoryService] Attempting force delete with native query...");
                
                // Try force delete with native query
                try {
                    entityManager.createNativeQuery("DELETE FROM vehicle_inventory WHERE inventory_id = :inventoryId")
                            .setParameter("inventoryId", inventoryId)
                            .executeUpdate();
                    entityManager.flush();
                    entityManager.clear();
                    
                    // Verify again
                    Optional<VehicleInventory> stillExists = vehicleInventoryRepository.findById(inventoryId);
                    if (stillExists.isPresent()) {
                        throw new RuntimeException("Failed to delete inventory even with native query: " + inventoryId);
                    } else {
                        System.out.println("[VehicleInventoryService] ✓ Force delete succeeded");
                    }
                } catch (Exception e) {
                    System.err.println("[VehicleInventoryService] ❌ CRITICAL: Force delete also failed: " + e.getMessage());
                    e.printStackTrace();
                    throw new RuntimeException("Failed to delete vehicle inventory: " + e.getMessage(), e);
                }
            } else {
                System.out.println("[VehicleInventoryService] ✓ Verification passed - inventory successfully deleted");
                System.out.println("[VehicleInventoryService] ========== DELETE INVENTORY SUCCESS ==========");
            }
            
        } catch (Exception e) {
            System.err.println("[VehicleInventoryService] ❌ ERROR during delete operation: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    public VehicleInventory updateInventoryStatus(UUID inventoryId, String status) {
        VehicleInventory vehicleInventory = vehicleInventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Vehicle inventory not found"));
        
        // Normalize status using enum
        VehicleStatus normalizedStatus = VehicleStatus.fromString(status);
        vehicleInventory.setStatus(normalizedStatus);
        
        return vehicleInventoryRepository.save(vehicleInventory);
    }
    
    public VehicleInventory createInventory(VehicleInventory inventory) {
        if (vehicleInventoryRepository.existsByVin(inventory.getVin())) {
            throw new RuntimeException("Vehicle with VIN already exists: " + inventory.getVin());
        }
        
        // Normalize status before saving
        if (inventory.getStatus() != null) {
            // Status is already VehicleStatus enum, no need to parse
            // Just ensure it's valid
            VehicleStatus currentStatus = inventory.getStatus();
            inventory.setStatus(currentStatus);
        } else {
            inventory.setStatus(VehicleStatus.AVAILABLE);
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
            VehicleStatus currentStatus = inventory.getStatus();
            if (currentStatus != null) {
                // Status is already VehicleStatus enum, no normalization needed
                // This method is kept for backward compatibility but should not modify anything
                // as status is already an enum
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
