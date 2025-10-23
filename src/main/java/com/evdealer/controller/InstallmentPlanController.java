package com.evdealer.controller;

import com.evdealer.entity.InstallmentPlan;
import com.evdealer.service.InstallmentPlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/installment-plans")
@CrossOrigin(origins = "*")
@Tag(name = "Installment Plan Management", description = "APIs for managing installment plans")
public class InstallmentPlanController {
    
    @Autowired
    private InstallmentPlanService installmentPlanService;
    
    @GetMapping
    @Operation(summary = "Get all installment plans", description = "Retrieve a list of all installment plans")
    public ResponseEntity<List<InstallmentPlan>> getAllInstallmentPlans() {
        List<InstallmentPlan> installmentPlans = installmentPlanService.getAllInstallmentPlans();
        return ResponseEntity.ok(installmentPlans);
    }
    
    @GetMapping("/{planId}")
    @Operation(summary = "Get installment plan by ID", description = "Retrieve a specific installment plan by its ID")
    public ResponseEntity<InstallmentPlan> getInstallmentPlanById(@PathVariable @Parameter(description = "Plan ID") UUID planId) {
        return installmentPlanService.getInstallmentPlanById(planId)
                .map(plan -> ResponseEntity.ok(plan))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/contract/{contractNumber}")
    @Operation(summary = "Get installment plan by contract number", description = "Retrieve a specific installment plan by its contract number")
    public ResponseEntity<InstallmentPlan> getInstallmentPlanByContractNumber(@PathVariable String contractNumber) {
        return installmentPlanService.getInstallmentPlanByContractNumber(contractNumber)
                .map(plan -> ResponseEntity.ok(plan))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get installment plans by status", description = "Retrieve installment plans filtered by status")
    public ResponseEntity<List<InstallmentPlan>> getInstallmentPlansByStatus(@PathVariable String status) {
        List<InstallmentPlan> installmentPlans = installmentPlanService.getInstallmentPlansByStatus(status);
        return ResponseEntity.ok(installmentPlans);
    }
    
    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get installment plans by customer", description = "Retrieve installment plans for a specific customer")
    public ResponseEntity<List<InstallmentPlan>> getInstallmentPlansByCustomer(@PathVariable UUID customerId) {
        List<InstallmentPlan> installmentPlans = installmentPlanService.getInstallmentPlansByCustomer(customerId);
        return ResponseEntity.ok(installmentPlans);
    }
    
    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get installment plans by order", description = "Retrieve installment plans for a specific order")
    public ResponseEntity<List<InstallmentPlan>> getInstallmentPlansByOrder(@PathVariable UUID orderId) {
        List<InstallmentPlan> installmentPlans = installmentPlanService.getInstallmentPlansByOrder(orderId);
        return ResponseEntity.ok(installmentPlans);
    }
    
    @GetMapping("/finance-company/{financeCompany}")
    @Operation(summary = "Get installment plans by finance company", description = "Retrieve installment plans from a specific finance company")
    public ResponseEntity<List<InstallmentPlan>> getInstallmentPlansByFinanceCompany(@PathVariable String financeCompany) {
        List<InstallmentPlan> installmentPlans = installmentPlanService.getInstallmentPlansByFinanceCompany(financeCompany);
        return ResponseEntity.ok(installmentPlans);
    }
    
    @GetMapping("/invoice/{invoiceId}")
    @Operation(summary = "Get installment plans by invoice", description = "Retrieve installment plans for a specific dealer invoice")
    public ResponseEntity<List<InstallmentPlan>> getInstallmentPlansByInvoice(@PathVariable UUID invoiceId) {
        List<InstallmentPlan> installmentPlans = installmentPlanService.getInstallmentPlansByInvoice(invoiceId);
        return ResponseEntity.ok(installmentPlans);
    }
    
    @GetMapping("/dealer/{dealerId}")
    @Operation(summary = "Get installment plans by dealer", description = "Retrieve installment plans for a specific dealer")
    public ResponseEntity<List<InstallmentPlan>> getInstallmentPlansByDealer(@PathVariable UUID dealerId) {
        List<InstallmentPlan> installmentPlans = installmentPlanService.getInstallmentPlansByDealer(dealerId);
        return ResponseEntity.ok(installmentPlans);
    }
    
    @GetMapping("/plan-type/{planType}")
    @Operation(summary = "Get installment plans by plan type", description = "Retrieve installment plans filtered by plan type")
    public ResponseEntity<List<InstallmentPlan>> getInstallmentPlansByPlanType(@PathVariable String planType) {
        List<InstallmentPlan> installmentPlans = installmentPlanService.getInstallmentPlansByPlanType(planType);
        return ResponseEntity.ok(installmentPlans);
    }
    
    @GetMapping("/customer-plans")
    @Operation(summary = "Get customer installment plans", description = "Retrieve all customer installment plans")
    public ResponseEntity<List<InstallmentPlan>> getCustomerInstallmentPlans() {
        List<InstallmentPlan> installmentPlans = installmentPlanService.getInstallmentPlansByPlanType("customer");
        return ResponseEntity.ok(installmentPlans);
    }
    
    @GetMapping("/dealer-plans")
    @Operation(summary = "Get dealer installment plans", description = "Retrieve all dealer installment plans")
    public ResponseEntity<List<InstallmentPlan>> getDealerInstallmentPlans() {
        List<InstallmentPlan> installmentPlans = installmentPlanService.getInstallmentPlansByPlanType("dealer");
        return ResponseEntity.ok(installmentPlans);
    }
    
    @PostMapping
    @Operation(summary = "Create installment plan", description = "Create a new installment plan")
    public ResponseEntity<InstallmentPlan> createInstallmentPlan(@RequestBody InstallmentPlan installmentPlan) {
        try {
            InstallmentPlan createdPlan = installmentPlanService.createInstallmentPlan(installmentPlan);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPlan);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{planId}")
    @Operation(summary = "Update installment plan", description = "Update an existing installment plan")
    public ResponseEntity<InstallmentPlan> updateInstallmentPlan(
            @PathVariable UUID planId, 
            @RequestBody InstallmentPlan installmentPlanDetails) {
        try {
            InstallmentPlan updatedPlan = installmentPlanService.updateInstallmentPlan(planId, installmentPlanDetails);
            return ResponseEntity.ok(updatedPlan);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{planId}/status")
    @Operation(summary = "Update installment plan status", description = "Update the status of an installment plan")
    public ResponseEntity<InstallmentPlan> updateInstallmentPlanStatus(
            @PathVariable UUID planId, 
            @RequestParam String status) {
        try {
            InstallmentPlan updatedPlan = installmentPlanService.updateInstallmentPlanStatus(planId, status);
            return ResponseEntity.ok(updatedPlan);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{planId}")
    @Operation(summary = "Delete installment plan", description = "Delete an installment plan")
    public ResponseEntity<Void> deleteInstallmentPlan(@PathVariable UUID planId) {
        try {
            installmentPlanService.deleteInstallmentPlan(planId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
