package com.evdealer.controller;

import com.evdealer.entity.DealerPayment;
import com.evdealer.service.DealerPaymentService;
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
@RequestMapping("/api/dealer-payments")
@CrossOrigin(origins = "*")
@Tag(name = "Dealer Payment Management", description = "APIs for managing dealer payments")
public class DealerPaymentController {
    
    @Autowired
    private DealerPaymentService dealerPaymentService;
    
    @GetMapping
    @Operation(summary = "Get all dealer payments", description = "Retrieve a list of all dealer payments")
    public ResponseEntity<List<DealerPayment>> getAllDealerPayments() {
        List<DealerPayment> payments = dealerPaymentService.getAllDealerPayments();
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/{paymentId}")
    @Operation(summary = "Get dealer payment by ID", description = "Retrieve a specific dealer payment by its ID")
    public ResponseEntity<DealerPayment> getPaymentById(@PathVariable @Parameter(description = "Payment ID") UUID paymentId) {
        return dealerPaymentService.getPaymentById(paymentId)
                .map(payment -> ResponseEntity.ok(payment))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/number/{paymentNumber}")
    @Operation(summary = "Get dealer payment by number", description = "Retrieve a specific dealer payment by its number")
    public ResponseEntity<DealerPayment> getPaymentByNumber(@PathVariable String paymentNumber) {
        return dealerPaymentService.getPaymentByNumber(paymentNumber)
                .map(payment -> ResponseEntity.ok(payment))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get payments by status", description = "Retrieve dealer payments filtered by status")
    public ResponseEntity<List<DealerPayment>> getPaymentsByStatus(@PathVariable String status) {
        List<DealerPayment> payments = dealerPaymentService.getPaymentsByStatus(status);
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/invoice/{invoiceId}")
    @Operation(summary = "Get payments by invoice", description = "Retrieve dealer payments for a specific invoice")
    public ResponseEntity<List<DealerPayment>> getPaymentsByInvoice(@PathVariable UUID invoiceId) {
        List<DealerPayment> payments = dealerPaymentService.getPaymentsByInvoice(invoiceId);
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/date-range")
    @Operation(summary = "Get payments by date range", description = "Retrieve dealer payments within a date range")
    public ResponseEntity<List<DealerPayment>> getPaymentsByDateRange(
            @RequestParam @Parameter(description = "Start date") LocalDate startDate,
            @RequestParam @Parameter(description = "End date") LocalDate endDate) {
        List<DealerPayment> payments = dealerPaymentService.getPaymentsByDateRange(startDate, endDate);
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/type/{paymentType}")
    @Operation(summary = "Get payments by type", description = "Retrieve dealer payments filtered by payment type")
    public ResponseEntity<List<DealerPayment>> getPaymentsByType(@PathVariable String paymentType) {
        List<DealerPayment> payments = dealerPaymentService.getPaymentsByType(paymentType);
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/reference/{referenceNumber}")
    @Operation(summary = "Get payments by reference number", description = "Retrieve dealer payments by reference number")
    public ResponseEntity<List<DealerPayment>> getPaymentsByReferenceNumber(@PathVariable String referenceNumber) {
        List<DealerPayment> payments = dealerPaymentService.getPaymentsByReferenceNumber(referenceNumber);
        return ResponseEntity.ok(payments);
    }
    
    @PostMapping
    @Operation(summary = "Create dealer payment", description = "Create a new dealer payment")
    public ResponseEntity<DealerPayment> createDealerPayment(@RequestBody DealerPayment dealerPayment) {
        try {
            DealerPayment createdPayment = dealerPaymentService.createDealerPayment(dealerPayment);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPayment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{paymentId}")
    @Operation(summary = "Update dealer payment", description = "Update an existing dealer payment")
    public ResponseEntity<DealerPayment> updateDealerPayment(
            @PathVariable UUID paymentId, 
            @RequestBody DealerPayment dealerPaymentDetails) {
        try {
            DealerPayment updatedPayment = dealerPaymentService.updateDealerPayment(paymentId, dealerPaymentDetails);
            return ResponseEntity.ok(updatedPayment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{paymentId}/status")
    @Operation(summary = "Update payment status", description = "Update the status of a dealer payment")
    public ResponseEntity<DealerPayment> updatePaymentStatus(
            @PathVariable UUID paymentId, 
            @RequestParam String status) {
        try {
            DealerPayment updatedPayment = dealerPaymentService.updatePaymentStatus(paymentId, status);
            return ResponseEntity.ok(updatedPayment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{paymentId}")
    @Operation(summary = "Delete dealer payment", description = "Delete a dealer payment")
    public ResponseEntity<Void> deleteDealerPayment(@PathVariable UUID paymentId) {
        try {
            dealerPaymentService.deleteDealerPayment(paymentId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
