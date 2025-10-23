package com.evdealer.controller;

import com.evdealer.entity.SalesContract;
import com.evdealer.service.SalesContractService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sales-contracts")
@CrossOrigin(origins = "*")
@Tag(name = "Sales Contract Management", description = "APIs quản lý hợp đồng bán hàng")
public class SalesContractController {
    
    @Autowired
    private SalesContractService salesContractService;
    
    @GetMapping
    @Operation(summary = "Lấy danh sách hợp đồng bán hàng", description = "Lấy tất cả hợp đồng bán hàng")
    public ResponseEntity<List<SalesContract>> getAllContracts() {
        List<SalesContract> contracts = salesContractService.getAllContracts();
        return ResponseEntity.ok(contracts);
    }
    
    @GetMapping("/{contractId}")
    public ResponseEntity<SalesContract> getContractById(@PathVariable UUID contractId) {
        return salesContractService.getContractById(contractId)
                .map(contract -> ResponseEntity.ok(contract))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/contract-number/{contractNumber}")
    public ResponseEntity<SalesContract> getContractByNumber(@PathVariable String contractNumber) {
        return salesContractService.getContractByNumber(contractNumber)
                .map(contract -> ResponseEntity.ok(contract))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<SalesContract>> getContractsByOrder(@PathVariable UUID orderId) {
        List<SalesContract> contracts = salesContractService.getContractsByOrder(orderId);
        return ResponseEntity.ok(contracts);
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<SalesContract>> getContractsByCustomer(@PathVariable UUID customerId) {
        List<SalesContract> contracts = salesContractService.getContractsByCustomer(customerId);
        return ResponseEntity.ok(contracts);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SalesContract>> getContractsByUser(@PathVariable UUID userId) {
        List<SalesContract> contracts = salesContractService.getContractsByUser(userId);
        return ResponseEntity.ok(contracts);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<SalesContract>> getContractsByStatus(@PathVariable String status) {
        List<SalesContract> contracts = salesContractService.getContractsByStatus(status);
        return ResponseEntity.ok(contracts);
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<SalesContract>> getContractsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<SalesContract> contracts = salesContractService.getContractsByDateRange(startDate, endDate);
        return ResponseEntity.ok(contracts);
    }
    
    @PostMapping
    @Operation(summary = "Tạo hợp đồng bán hàng mới", description = "Tạo hợp đồng bán hàng mới")
    public ResponseEntity<SalesContract> createContract(@RequestBody SalesContract contract) {
        try {
            SalesContract createdContract = salesContractService.createContract(contract);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdContract);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{contractId}")
    public ResponseEntity<SalesContract> updateContract(@PathVariable UUID contractId, @RequestBody SalesContract contractDetails) {
        try {
            SalesContract updatedContract = salesContractService.updateContract(contractId, contractDetails);
            return ResponseEntity.ok(updatedContract);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{contractId}/status")
    public ResponseEntity<SalesContract> updateContractStatus(@PathVariable UUID contractId, @RequestParam String status) {
        try {
            SalesContract updatedContract = salesContractService.updateContractStatus(contractId, status);
            return ResponseEntity.ok(updatedContract);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{contractId}/sign")
    public ResponseEntity<SalesContract> signContract(@PathVariable UUID contractId, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate signedDate) {
        try {
            SalesContract updatedContract = salesContractService.signContract(contractId, signedDate);
            return ResponseEntity.ok(updatedContract);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{contractId}")
    public ResponseEntity<Void> deleteContract(@PathVariable UUID contractId) {
        try {
            salesContractService.deleteContract(contractId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
