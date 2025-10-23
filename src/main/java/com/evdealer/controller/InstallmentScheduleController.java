package com.evdealer.controller;

import com.evdealer.entity.InstallmentSchedule;
import com.evdealer.service.InstallmentScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/installment-schedules")
@CrossOrigin(origins = "*")
@Tag(name = "Installment Schedule Management", description = "APIs for managing installment schedules")
public class InstallmentScheduleController {
    
    @Autowired
    private InstallmentScheduleService installmentScheduleService;
    
    @GetMapping
    @Operation(summary = "Get all installment schedules", description = "Retrieve a list of all installment schedules")
    public ResponseEntity<List<InstallmentSchedule>> getAllInstallmentSchedules() {
        List<InstallmentSchedule> schedules = installmentScheduleService.getAllInstallmentSchedules();
        return ResponseEntity.ok(schedules);
    }
    
    @GetMapping("/{scheduleId}")
    @Operation(summary = "Get installment schedule by ID", description = "Retrieve a specific installment schedule by its ID")
    public ResponseEntity<InstallmentSchedule> getScheduleById(@PathVariable @Parameter(description = "Schedule ID") UUID scheduleId) {
        return installmentScheduleService.getScheduleById(scheduleId)
                .map(schedule -> ResponseEntity.ok(schedule))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/plan/{planId}")
    @Operation(summary = "Get schedules by plan", description = "Retrieve installment schedules for a specific plan")
    public ResponseEntity<List<InstallmentSchedule>> getSchedulesByPlan(@PathVariable UUID planId) {
        List<InstallmentSchedule> schedules = installmentScheduleService.getSchedulesByPlan(planId);
        return ResponseEntity.ok(schedules);
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get schedules by status", description = "Retrieve installment schedules filtered by status")
    public ResponseEntity<List<InstallmentSchedule>> getSchedulesByStatus(@PathVariable String status) {
        List<InstallmentSchedule> schedules = installmentScheduleService.getSchedulesByStatus(status);
        return ResponseEntity.ok(schedules);
    }
    
    @GetMapping("/due-date-range")
    @Operation(summary = "Get schedules by due date range", description = "Retrieve installment schedules within a due date range")
    public ResponseEntity<List<InstallmentSchedule>> getSchedulesByDueDateRange(
            @RequestParam @Parameter(description = "Start date") LocalDate startDate,
            @RequestParam @Parameter(description = "End date") LocalDate endDate) {
        List<InstallmentSchedule> schedules = installmentScheduleService.getSchedulesByDueDateRange(startDate, endDate);
        return ResponseEntity.ok(schedules);
    }
    
    @GetMapping("/overdue")
    @Operation(summary = "Get overdue schedules", description = "Retrieve installment schedules that are overdue")
    public ResponseEntity<List<InstallmentSchedule>> getOverdueSchedules() {
        List<InstallmentSchedule> schedules = installmentScheduleService.getOverdueSchedules();
        return ResponseEntity.ok(schedules);
    }
    
    @GetMapping("/due-soon")
    @Operation(summary = "Get due soon schedules", description = "Retrieve installment schedules that are due within 7 days")
    public ResponseEntity<List<InstallmentSchedule>> getDueSoonSchedules() {
        List<InstallmentSchedule> schedules = installmentScheduleService.getDueSoonSchedules();
        return ResponseEntity.ok(schedules);
    }
    
    @GetMapping("/installment-number/{installmentNumber}")
    @Operation(summary = "Get schedules by installment number", description = "Retrieve installment schedules by installment number")
    public ResponseEntity<List<InstallmentSchedule>> getSchedulesByInstallmentNumber(@PathVariable Integer installmentNumber) {
        List<InstallmentSchedule> schedules = installmentScheduleService.getSchedulesByInstallmentNumber(installmentNumber);
        return ResponseEntity.ok(schedules);
    }
    
    @GetMapping("/paid-date-range")
    @Operation(summary = "Get schedules by paid date range", description = "Retrieve installment schedules within a paid date range")
    public ResponseEntity<List<InstallmentSchedule>> getSchedulesByPaidDateRange(
            @RequestParam @Parameter(description = "Start date") LocalDate startDate,
            @RequestParam @Parameter(description = "End date") LocalDate endDate) {
        List<InstallmentSchedule> schedules = installmentScheduleService.getSchedulesByPaidDateRange(startDate, endDate);
        return ResponseEntity.ok(schedules);
    }
    
    @PostMapping
    @Operation(summary = "Create installment schedule", description = "Create a new installment schedule")
    public ResponseEntity<InstallmentSchedule> createInstallmentSchedule(@RequestBody InstallmentSchedule installmentSchedule) {
        try {
            InstallmentSchedule createdSchedule = installmentScheduleService.createInstallmentSchedule(installmentSchedule);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSchedule);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{scheduleId}")
    @Operation(summary = "Update installment schedule", description = "Update an existing installment schedule")
    public ResponseEntity<InstallmentSchedule> updateInstallmentSchedule(
            @PathVariable UUID scheduleId, 
            @RequestBody InstallmentSchedule installmentScheduleDetails) {
        try {
            InstallmentSchedule updatedSchedule = installmentScheduleService.updateInstallmentSchedule(scheduleId, installmentScheduleDetails);
            return ResponseEntity.ok(updatedSchedule);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{scheduleId}/status")
    @Operation(summary = "Update schedule status", description = "Update the status of an installment schedule")
    public ResponseEntity<InstallmentSchedule> updateScheduleStatus(
            @PathVariable UUID scheduleId, 
            @RequestParam String status) {
        try {
            InstallmentSchedule updatedSchedule = installmentScheduleService.updateScheduleStatus(scheduleId, status);
            return ResponseEntity.ok(updatedSchedule);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{scheduleId}/mark-paid")
    @Operation(summary = "Mark schedule as paid", description = "Mark an installment schedule as paid")
    public ResponseEntity<InstallmentSchedule> markAsPaid(
            @PathVariable UUID scheduleId, 
            @RequestParam LocalDate paidDate,
            @RequestParam BigDecimal paidAmount) {
        try {
            InstallmentSchedule updatedSchedule = installmentScheduleService.markAsPaid(scheduleId, paidDate, paidAmount);
            return ResponseEntity.ok(updatedSchedule);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{scheduleId}")
    @Operation(summary = "Delete installment schedule", description = "Delete an installment schedule")
    public ResponseEntity<Void> deleteInstallmentSchedule(@PathVariable UUID scheduleId) {
        try {
            installmentScheduleService.deleteInstallmentSchedule(scheduleId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
