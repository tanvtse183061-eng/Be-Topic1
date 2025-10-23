package com.evdealer.controller;

import com.evdealer.entity.DealerContract;
import com.evdealer.service.DealerContractService;
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
@RequestMapping("/api/dealer-contracts")
@CrossOrigin(origins = "*")
@Tag(name = "Dealer Contract Management", description = "APIs quản lý hợp đồng đại lý")
public class DealerContractController {
    
    @Autowired
    private DealerContractService dealerContractService;
    
    @GetMapping
    @Operation(summary = "Lấy danh sách hợp đồng", description = "Lấy tất cả hợp đồng đại lý")
    public ResponseEntity<List<DealerContract>> getAllContracts() {
        List<DealerContract> contracts = dealerContractService.getAllContracts();
        return ResponseEntity.ok(contracts);
    }
    
    @GetMapping("/{contractId}")
    @Operation(summary = "Lấy hợp đồng theo ID", description = "Lấy thông tin hợp đồng theo ID")
    public ResponseEntity<DealerContract> getContractById(@PathVariable UUID contractId) {
        return dealerContractService.getContractById(contractId)
                .map(contract -> ResponseEntity.ok(contract))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/contract-number/{contractNumber}")
    @Operation(summary = "Lấy hợp đồng theo số", description = "Lấy thông tin hợp đồng theo số hợp đồng")
    public ResponseEntity<DealerContract> getContractByNumber(@PathVariable String contractNumber) {
        return dealerContractService.getContractByNumber(contractNumber)
                .map(contract -> ResponseEntity.ok(contract))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/type/{contractType}")
    @Operation(summary = "Lấy hợp đồng theo loại", description = "Lấy danh sách hợp đồng theo loại")
    public ResponseEntity<List<DealerContract>> getContractsByType(@PathVariable String contractType) {
        List<DealerContract> contracts = dealerContractService.getContractsByType(contractType);
        return ResponseEntity.ok(contracts);
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Lấy hợp đồng theo trạng thái", description = "Lấy danh sách hợp đồng theo trạng thái")
    public ResponseEntity<List<DealerContract>> getContractsByStatus(@PathVariable String status) {
        List<DealerContract> contracts = dealerContractService.getContractsByStatus(status);
        return ResponseEntity.ok(contracts);
    }
    
    @GetMapping("/active")
    @Operation(summary = "Lấy hợp đồng đang hoạt động", description = "Lấy danh sách hợp đồng đang hoạt động")
    public ResponseEntity<List<DealerContract>> getActiveContracts() {
        List<DealerContract> contracts = dealerContractService.getActiveContracts();
        return ResponseEntity.ok(contracts);
    }
    
    @GetMapping("/active/date/{date}")
    @Operation(summary = "Lấy hợp đồng hoạt động theo ngày", description = "Lấy hợp đồng hoạt động theo ngày")
    public ResponseEntity<List<DealerContract>> getActiveContractsByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<DealerContract> contracts = dealerContractService.getActiveContractsByDate(date);
        return ResponseEntity.ok(contracts);
    }
    
    @GetMapping("/type/{contractType}/status/{status}")
    @Operation(summary = "Lấy hợp đồng theo loại và trạng thái", description = "Lấy hợp đồng theo loại và trạng thái")
    public ResponseEntity<List<DealerContract>> getContractsByTypeAndStatus(@PathVariable String contractType, @PathVariable String status) {
        List<DealerContract> contracts = dealerContractService.getContractsByTypeAndStatus(contractType, status);
        return ResponseEntity.ok(contracts);
    }
    
    @GetMapping("/territory/{territory}")
    @Operation(summary = "Lấy hợp đồng theo khu vực", description = "Lấy hợp đồng theo khu vực")
    public ResponseEntity<List<DealerContract>> getContractsByTerritory(@PathVariable String territory) {
        List<DealerContract> contracts = dealerContractService.getContractsByTerritory(territory);
        return ResponseEntity.ok(contracts);
    }
    
    @PostMapping
    @Operation(summary = "Tạo hợp đồng mới", description = "Tạo hợp đồng đại lý mới")
    public ResponseEntity<DealerContract> createContract(@RequestBody DealerContract contract) {
        try {
            DealerContract createdContract = dealerContractService.createContract(contract);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdContract);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{contractId}")
    @Operation(summary = "Cập nhật hợp đồng", description = "Cập nhật thông tin hợp đồng")
    public ResponseEntity<DealerContract> updateContract(@PathVariable UUID contractId, @RequestBody DealerContract contractDetails) {
        try {
            DealerContract updatedContract = dealerContractService.updateContract(contractId, contractDetails);
            return ResponseEntity.ok(updatedContract);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{contractId}/status")
    @Operation(summary = "Cập nhật trạng thái hợp đồng", description = "Cập nhật trạng thái hợp đồng")
    public ResponseEntity<DealerContract> updateContractStatus(@PathVariable UUID contractId, @RequestParam String status) {
        try {
            DealerContract updatedContract = dealerContractService.updateContractStatus(contractId, status);
            return ResponseEntity.ok(updatedContract);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{contractId}/sign")
    @Operation(summary = "Ký hợp đồng", description = "Ký hợp đồng")
    public ResponseEntity<DealerContract> signContract(@PathVariable UUID contractId, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate signedDate) {
        try {
            DealerContract updatedContract = dealerContractService.signContract(contractId, signedDate);
            return ResponseEntity.ok(updatedContract);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{contractId}")
    @Operation(summary = "Xóa hợp đồng", description = "Xóa hợp đồng")
    public ResponseEntity<Void> deleteContract(@PathVariable UUID contractId) {
        try {
            dealerContractService.deleteContract(contractId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
