package com.evdealer.repository;

import com.evdealer.entity.VehicleModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleModelRepository extends JpaRepository<VehicleModel, Integer> {
    
    @Query("SELECT vm FROM VehicleModel vm")
    List<VehicleModel> findAllWithDetails();
    
    List<VehicleModel> findByBrandBrandId(Integer brandId);
    
    @Query("SELECT vm FROM VehicleModel vm WHERE vm.isActive = true")
    List<VehicleModel> findByIsActiveTrue();
    
    @Query("SELECT vm FROM VehicleModel vm WHERE vm.brand.brandId = :brandId AND vm.isActive = true")
    List<VehicleModel> findActiveByBrandId(@Param("brandId") Integer brandId);
    
    @Query("SELECT vm FROM VehicleModel vm WHERE vm.modelName LIKE %:name%")
    List<VehicleModel> findByModelNameContaining(@Param("name") String name);
    
    @Query("SELECT vm FROM VehicleModel vm WHERE vm.vehicleType = :vehicleType")
    List<VehicleModel> findByVehicleType(@Param("vehicleType") String vehicleType);
    
    @Query("SELECT vm FROM VehicleModel vm WHERE vm.modelYear = :year")
    List<VehicleModel> findByModelYear(@Param("year") Integer year);
}

