package com.evdealer.controller;

import com.evdealer.dto.QuotationRequest;
import com.evdealer.entity.Quotation;
import com.evdealer.service.QuotationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/quotations")
@CrossOrigin(origins = "*")
@Tag(name = "Quotation Management", description = "APIs quản lý báo giá")
public class QuotationController {
    
    @Autowired
    private QuotationService quotationService;
    
    @GetMapping
    @Operation(summary = "Lấy danh sách báo giá", description = "Lấy tất cả báo giá")
    public ResponseEntity<List<Quotation>> getAllQuotations() {
        List<Quotation> quotations = quotationService.getAllQuotations();
        return ResponseEntity.ok(quotations);
    }
    
    @GetMapping("/{quotationId}")
    @Operation(summary = "Lấy báo giá theo ID", description = "Lấy thông tin báo giá theo ID")
    public ResponseEntity<Quotation> getQuotationById(@PathVariable @Parameter(description = "Quotation ID") UUID quotationId) {
        return quotationService.getQuotationById(quotationId)
                .map(quotation -> ResponseEntity.ok(quotation))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/number/{quotationNumber}")
    @Operation(summary = "Lấy báo giá theo số", description = "Lấy thông tin báo giá theo số báo giá")
    public ResponseEntity<Quotation> getQuotationByNumber(@PathVariable String quotationNumber) {
        return quotationService.getQuotationByNumber(quotationNumber)
                .map(quotation -> ResponseEntity.ok(quotation))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Lấy báo giá theo trạng thái", description = "Lấy báo giá theo trạng thái")
    public ResponseEntity<List<Quotation>> getQuotationsByStatus(@PathVariable String status) {
        List<Quotation> quotations = quotationService.getQuotationsByStatus(status);
        return ResponseEntity.ok(quotations);
    }
    
    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Lấy báo giá theo khách hàng", description = "Lấy báo giá theo khách hàng")
    public ResponseEntity<List<Quotation>> getQuotationsByCustomer(@PathVariable UUID customerId) {
        List<Quotation> quotations = quotationService.getQuotationsByCustomer(customerId);
        return ResponseEntity.ok(quotations);
    }
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Lấy báo giá theo người dùng", description = "Lấy báo giá theo người dùng")
    public ResponseEntity<List<Quotation>> getQuotationsByUser(@PathVariable UUID userId) {
        List<Quotation> quotations = quotationService.getQuotationsByUser(userId);
        return ResponseEntity.ok(quotations);
    }
    
    @GetMapping("/date-range")
    @Operation(summary = "Lấy báo giá theo khoảng ngày", description = "Lấy báo giá theo khoảng ngày")
    public ResponseEntity<List<Quotation>> getQuotationsByDateRange(
            @RequestParam @Parameter(description = "Start date") LocalDate startDate,
            @RequestParam @Parameter(description = "End date") LocalDate endDate) {
        List<Quotation> quotations = quotationService.getQuotationsByDateRange(startDate, endDate);
        return ResponseEntity.ok(quotations);
    }
    
    @GetMapping("/expired")
    @Operation(summary = "Lấy báo giá đã hết hạn", description = "Lấy báo giá đã hết hạn")
    public ResponseEntity<List<Quotation>> getExpiredQuotations() {
        List<Quotation> quotations = quotationService.getExpiredQuotations();
        return ResponseEntity.ok(quotations);
    }
    
    @PostMapping
    @Operation(summary = "Tạo báo giá mới", description = "Tạo báo giá mới từ QuotationRequest DTO")
    public ResponseEntity<Quotation> createQuotation(@RequestBody QuotationRequest request) {
        try {
            Quotation createdQuotation = quotationService.createQuotationFromRequest(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdQuotation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/legacy")
    @Operation(summary = "Tạo báo giá mới (Legacy)", description = "Tạo báo giá mới từ Quotation entity (legacy method)")
    public ResponseEntity<Quotation> createQuotationLegacy(@RequestBody Quotation quotation) {
        try {
            Quotation createdQuotation = quotationService.createQuotation(quotation);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdQuotation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{quotationId}")
    @Operation(summary = "Cập nhật báo giá", description = "Cập nhật báo giá")
    public ResponseEntity<Quotation> updateQuotation(
            @PathVariable UUID quotationId, 
            @RequestBody Quotation quotationDetails) {
        try {
            Quotation updatedQuotation = quotationService.updateQuotation(quotationId, quotationDetails);
            return ResponseEntity.ok(updatedQuotation);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{quotationId}/status")
    @Operation(summary = "Cập nhật trạng thái báo giá", description = "Cập nhật trạng thái báo giá")
    public ResponseEntity<Quotation> updateQuotationStatus(
            @PathVariable UUID quotationId, 
            @RequestParam String status) {
        try {
            Quotation updatedQuotation = quotationService.updateQuotationStatus(quotationId, status);
            return ResponseEntity.ok(updatedQuotation);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{quotationId}")
    @Operation(summary = "Xóa báo giá", description = "Xóa báo giá")
    public ResponseEntity<Void> deleteQuotation(@PathVariable UUID quotationId) {
        try {
            quotationService.deleteQuotation(quotationId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
