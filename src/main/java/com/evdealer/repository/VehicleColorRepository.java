package com.evdealer.repository;

import com.evdealer.entity.VehicleColor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleColorRepository extends JpaRepository<VehicleColor, Integer> {
    
    Optional<VehicleColor> findByColorName(String colorName);
    
    Optional<VehicleColor> findByColorCode(String colorCode);
    
    boolean existsByColorName(String colorName);
    
    boolean existsByColorCode(String colorCode);
    
    List<VehicleColor> findByIsActiveTrue();
    
    List<VehicleColor> findByIsActiveFalse();
    
    List<VehicleColor> findByColorNameContainingIgnoreCase(String colorName);
}
