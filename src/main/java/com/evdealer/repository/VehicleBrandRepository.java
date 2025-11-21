package com.evdealer.repository;

import com.evdealer.entity.VehicleBrand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleBrandRepository extends JpaRepository<VehicleBrand, Integer> {
    
    Optional<VehicleBrand> findByBrandName(String brandName);
    
    List<VehicleBrand> findByIsActiveTrue();
    
    @Query("SELECT vb FROM VehicleBrand vb WHERE vb.country = :country")
    List<VehicleBrand> findByCountry(@Param("country") String country);
    
    @Query("SELECT vb FROM VehicleBrand vb WHERE vb.brandName LIKE %:name%")
    List<VehicleBrand> findByBrandNameContaining(@Param("name") String name);
    
    boolean existsByBrandName(String brandName);
}

