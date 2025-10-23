package com.evdealer.repository;

import com.evdealer.entity.InstallmentSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface InstallmentScheduleRepository extends JpaRepository<InstallmentSchedule, UUID> {
    
    List<InstallmentSchedule> findByPlanPlanId(UUID planId);
    
    List<InstallmentSchedule> findByStatus(String status);
    
    List<InstallmentSchedule> findByDueDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT is FROM InstallmentSchedule is WHERE is.dueDate < :currentDate AND is.status = 'pending'")
    List<InstallmentSchedule> findOverdueSchedules(@Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT is FROM InstallmentSchedule is WHERE is.dueDate < CURRENT_DATE AND is.status = 'pending'")
    List<InstallmentSchedule> findOverdueSchedules();
    
    @Query("SELECT is FROM InstallmentSchedule is WHERE is.dueDate <= :currentDate AND is.status = 'pending'")
    List<InstallmentSchedule> findDueSoonSchedules(@Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT is FROM InstallmentSchedule is WHERE is.dueDate <= CURRENT_DATE AND is.status = 'pending'")
    List<InstallmentSchedule> findDueSoonSchedules();
    
    List<InstallmentSchedule> findByInstallmentNumber(Integer installmentNumber);
    
    List<InstallmentSchedule> findByPaidDateBetween(LocalDate startDate, LocalDate endDate);
}
