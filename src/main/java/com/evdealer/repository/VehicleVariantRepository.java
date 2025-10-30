package com.evdealer.repository;

import com.evdealer.entity.VehicleVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface VehicleVariantRepository extends JpaRepository<VehicleVariant, Integer> {
    
    @Query("SELECT vv FROM VehicleVariant vv")
    List<VehicleVariant> findAllWithDetails();
    
    List<VehicleVariant> findByModelModelId(Integer modelId);
    
    @Query("SELECT vv FROM VehicleVariant vv WHERE vv.isActive = true")
    List<VehicleVariant> findByIsActiveTrue();
    
    @Query("SELECT vv FROM VehicleVariant vv WHERE vv.model.modelId = :modelId AND vv.isActive = true")
    List<VehicleVariant> findActiveByModelId(@Param("modelId") Integer modelId);
    
    @Query("SELECT vv FROM VehicleVariant vv WHERE vv.variantName LIKE %:name%")
    List<VehicleVariant> findByVariantNameContaining(@Param("name") String name);
    
    @Query("SELECT vv FROM VehicleVariant vv WHERE vv.priceBase BETWEEN :minPrice AND :maxPrice")
    List<VehicleVariant> findByPriceRange(@Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice);
    
    @Query("SELECT vv FROM VehicleVariant vv WHERE vv.rangeKm >= :minRange")
    List<VehicleVariant> findByMinRange(@Param("minRange") Integer minRange);

    @Query("SELECT vv FROM VehicleVariant vv WHERE vv.model IS NULL")
    List<VehicleVariant> findVariantsWithNoModel();
}

