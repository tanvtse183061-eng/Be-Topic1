package com.evdealer.repository;

import com.evdealer.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, UUID> {
    
    Optional<Warehouse> findByWarehouseCode(String warehouseCode);
    
    boolean existsByWarehouseCode(String warehouseCode);
    
    List<Warehouse> findByIsActiveTrue();
    
    List<Warehouse> findByIsActiveFalse();
    
    List<Warehouse> findByCity(String city);
    
    List<Warehouse> findByProvince(String province);
    
    List<Warehouse> findByWarehouseNameContainingIgnoreCase(String warehouseName);
}
