package com.evdealer.controller;

import com.evdealer.dto.SalesContractDTO;
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
    public ResponseEntity<List<SalesContractDTO>> getAllContracts() {
        List<SalesContract> contracts = salesContractService.getAllContracts();
        return ResponseEntity.ok(contracts.stream().map(this::toDTO).toList());
    }
    
    @GetMapping("/{contractId}")
    public ResponseEntity<SalesContractDTO> getContractById(@PathVariable UUID contractId) {
        return salesContractService.getContractById(contractId)
                .map(contract -> ResponseEntity.ok(toDTO(contract)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/contract-number/{contractNumber}")
    public ResponseEntity<SalesContractDTO> getContractByNumber(@PathVariable String contractNumber) {
        return salesContractService.getContractByNumber(contractNumber)
                .map(contract -> ResponseEntity.ok(toDTO(contract)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<SalesContractDTO>> getContractsByOrder(@PathVariable UUID orderId) {
        List<SalesContract> contracts = salesContractService.getContractsByOrder(orderId);
        return ResponseEntity.ok(contracts.stream().map(this::toDTO).toList());
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<SalesContractDTO>> getContractsByCustomer(@PathVariable UUID customerId) {
        List<SalesContract> contracts = salesContractService.getContractsByCustomer(customerId);
        return ResponseEntity.ok(contracts.stream().map(this::toDTO).toList());
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SalesContractDTO>> getContractsByUser(@PathVariable UUID userId) {
        List<SalesContract> contracts = salesContractService.getContractsByUser(userId);
        return ResponseEntity.ok(contracts.stream().map(this::toDTO).toList());
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<SalesContractDTO>> getContractsByStatus(@PathVariable String status) {
        List<SalesContract> contracts = salesContractService.getContractsByStatus(status);
        return ResponseEntity.ok(contracts.stream().map(this::toDTO).toList());
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<SalesContractDTO>> getContractsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<SalesContract> contracts = salesContractService.getContractsByDateRange(startDate, endDate);
        return ResponseEntity.ok(contracts.stream().map(this::toDTO).toList());
    }
    
    @PostMapping
    @Operation(summary = "Tạo hợp đồng bán hàng mới", description = "Tạo hợp đồng bán hàng mới")
    public ResponseEntity<SalesContractDTO> createContract(@RequestBody SalesContract contract) {
        try {
            SalesContract createdContract = salesContractService.createContract(contract);
            return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(createdContract));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{contractId}")
    public ResponseEntity<SalesContractDTO> updateContract(@PathVariable UUID contractId, @RequestBody SalesContract contractDetails) {
        try {
            SalesContract updatedContract = salesContractService.updateContract(contractId, contractDetails);
            return ResponseEntity.ok(toDTO(updatedContract));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{contractId}/status")
    public ResponseEntity<SalesContractDTO> updateContractStatus(@PathVariable UUID contractId, @RequestParam String status) {
        try {
            SalesContract updatedContract = salesContractService.updateContractStatus(contractId, status);
            return ResponseEntity.ok(toDTO(updatedContract));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{contractId}/sign")
    public ResponseEntity<SalesContractDTO> signContract(@PathVariable UUID contractId, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate signedDate) {
        try {
            SalesContract updatedContract = salesContractService.signContract(contractId, signedDate);
            return ResponseEntity.ok(toDTO(updatedContract));
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
    private SalesContractDTO toDTO(SalesContract c) {
        SalesContractDTO dto = new SalesContractDTO();
        dto.setContractId(c.getContractId());
        dto.setContractNumber(c.getContractNumber());
        dto.setOrderId(c.getOrder() != null ? c.getOrder().getOrderId() : null);
        dto.setCustomerId(c.getCustomer() != null ? c.getCustomer().getCustomerId() : null);
        dto.setUserId(c.getUser() != null ? c.getUser().getUserId() : null);
        dto.setContractDate(c.getContractDate());
        dto.setDeliveryDate(c.getDeliveryDate());
        dto.setContractValue(c.getContractValue());
        dto.setContractStatus(c.getContractStatus());
        return dto;
    }
}
