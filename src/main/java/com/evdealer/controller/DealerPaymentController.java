package com.evdealer.controller;

import com.evdealer.entity.DealerPayment;
import com.evdealer.entity.DealerInvoice;
import com.evdealer.entity.DealerOrder;
import com.evdealer.service.DealerPaymentService;
import com.evdealer.service.DealerInvoiceService;
import com.evdealer.service.DealerOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/dealer-payments")
@CrossOrigin(origins = "*")
@Tag(name = "Dealer Payment Management", description = "APIs for managing dealer payments")
public class DealerPaymentController {
    
    @Autowired
    private DealerPaymentService dealerPaymentService;
    
    @Autowired
    private DealerInvoiceService dealerInvoiceService;
    
    @Autowired
    private DealerOrderService dealerOrderService;
    
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
    
    // ==================== NEW IMPROVED APIs ====================
    
    @PostMapping("/process-payment")
    @Operation(summary = "Xử lý thanh toán đại lý", description = "Xử lý thanh toán với validation đầy đủ")
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> paymentRequest) {
        try {
            // Validate required fields
            if (!paymentRequest.containsKey("invoiceId") || !paymentRequest.containsKey("amount")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Missing required fields: invoiceId and amount");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            UUID invoiceId = UUID.fromString(paymentRequest.get("invoiceId").toString());
            BigDecimal amount = new BigDecimal(paymentRequest.get("amount").toString());
            String paymentType = paymentRequest.getOrDefault("paymentType", "BANK_TRANSFER").toString();
            String referenceNumber = paymentRequest.getOrDefault("referenceNumber", "").toString();
            String notes = paymentRequest.getOrDefault("notes", "").toString();
            
            // Validate invoice exists
            DealerInvoice invoice = dealerInvoiceService.getInvoiceById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));
            
            // Validate payment amount
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Payment amount must be greater than zero");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Check if payment exceeds invoice balance
            BigDecimal paidAmount = dealerInvoiceService.calculatePaidAmount(invoiceId);
            BigDecimal balance = invoice.getTotalAmount().subtract(paidAmount);
            
            if (amount.compareTo(balance) > 0) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Payment amount exceeds invoice balance");
                error.put("invoiceBalance", balance.toString());
                error.put("paymentAmount", amount.toString());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Create payment
            DealerPayment payment = new DealerPayment();
            payment.setInvoice(invoice);
            payment.setAmount(amount);
            payment.setPaymentType(paymentType);
            payment.setPaymentDate(LocalDate.now());
            payment.setStatus("COMPLETED");
            payment.setNotes(notes);
            payment.setReferenceNumber(referenceNumber);
            payment.setPaymentNumber("PAY-" + System.currentTimeMillis());
            
            // Save payment
            DealerPayment savedPayment = dealerPaymentService.createDealerPayment(payment);
            
            // Update invoice status if fully paid
            BigDecimal newPaidAmount = paidAmount.add(amount);
            if (newPaidAmount.compareTo(invoice.getTotalAmount()) >= 0) {
                invoice.setStatus("PAID");
                dealerInvoiceService.updateInvoice(invoiceId, invoice);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Payment processed successfully");
            response.put("paymentId", savedPayment.getPaymentId());
            response.put("invoiceId", invoiceId);
            response.put("amount", amount);
            response.put("paymentType", paymentType);
            response.put("status", savedPayment.getStatus());
            response.put("remainingBalance", invoice.getTotalAmount().subtract(newPaidAmount));
            response.put("isFullyPaid", newPaidAmount.compareTo(invoice.getTotalAmount()) >= 0);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid payment data: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to process payment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to process payment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/refund/{paymentId}")
    @Operation(summary = "Hoàn tiền thanh toán", description = "Hoàn tiền một thanh toán đã thực hiện")
    public ResponseEntity<?> refundPayment(@PathVariable UUID paymentId, @RequestParam(required = false) String reason) {
        try {
            DealerPayment payment = dealerPaymentService.getDealerPaymentById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));
            
            if (!"COMPLETED".equals(payment.getStatus())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Cannot refund payment that is not completed. Current status: " + payment.getStatus());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Create refund payment
            DealerPayment refund = new DealerPayment();
            refund.setInvoice(payment.getInvoice());
            refund.setAmount(payment.getAmount().negate()); // Negative amount for refund
            refund.setPaymentType(payment.getPaymentType());
            refund.setPaymentDate(LocalDate.now());
            refund.setStatus("REFUNDED");
            refund.setNotes("Refund for payment " + paymentId + (reason != null ? ". Reason: " + reason : ""));
            refund.setReferenceNumber("REF-" + System.currentTimeMillis());
            refund.setPaymentNumber("REF-" + System.currentTimeMillis());
            
            DealerPayment savedRefund = dealerPaymentService.createDealerPayment(refund);
            
            // Update original payment status
            payment.setStatus("REFUNDED");
            payment.setNotes(payment.getNotes() + " [REFUNDED: " + reason + "]");
            dealerPaymentService.updateDealerPayment(paymentId, payment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Payment refunded successfully");
            response.put("originalPaymentId", paymentId);
            response.put("refundPaymentId", savedRefund.getPaymentId());
            response.put("refundAmount", payment.getAmount());
            response.put("reason", reason);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to refund payment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @GetMapping("/invoice/{invoiceId}")
    @Operation(summary = "Lấy thanh toán theo hóa đơn", description = "Lấy danh sách thanh toán của một hóa đơn")
    public ResponseEntity<?> getPaymentsByInvoice(@PathVariable UUID invoiceId) {
        try {
            DealerInvoice invoice = dealerInvoiceService.getInvoiceById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));
            
            List<DealerPayment> payments = dealerPaymentService.getPaymentsByInvoice(invoiceId);
            
            BigDecimal totalPaid = payments.stream()
                .filter(p -> "COMPLETED".equals(p.getStatus()))
                .map(DealerPayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal totalRefunded = payments.stream()
                .filter(p -> "REFUNDED".equals(p.getStatus()))
                .map(DealerPayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Map<String, Object> response = new HashMap<>();
            response.put("invoiceId", invoiceId);
            response.put("invoiceNumber", invoice.getInvoiceNumber());
            response.put("totalAmount", invoice.getTotalAmount());
            response.put("payments", payments);
            response.put("paymentCount", payments.size());
            response.put("totalPaid", totalPaid);
            response.put("totalRefunded", totalRefunded.abs());
            response.put("netPaid", totalPaid.add(totalRefunded));
            response.put("remainingBalance", invoice.getTotalAmount().subtract(totalPaid.add(totalRefunded)));
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get payments: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @GetMapping("/dealer/{dealerId}")
    @Operation(summary = "Lấy thanh toán theo đại lý", description = "Lấy danh sách thanh toán của một đại lý")
    public ResponseEntity<List<DealerPayment>> getPaymentsByDealer(@PathVariable UUID dealerId) {
        List<DealerPayment> payments = dealerPaymentService.getPaymentsByDealer(dealerId);
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/dealer/{dealerId}/summary")
    @Operation(summary = "Tóm tắt thanh toán đại lý", description = "Lấy tóm tắt thanh toán của đại lý")
    public ResponseEntity<?> getDealerPaymentSummary(@PathVariable UUID dealerId, @RequestParam(required = false) LocalDate startDate, @RequestParam(required = false) LocalDate endDate) {
        try {
            Map<String, Object> summary = dealerPaymentService.getDealerPaymentSummary(dealerId);
            return ResponseEntity.ok(summary);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get payment summary: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "Thống kê thanh toán", description = "Lấy thống kê tổng quan về thanh toán")
    public ResponseEntity<?> getPaymentStatistics(@RequestParam(required = false) LocalDate startDate, @RequestParam(required = false) LocalDate endDate) {
        try {
            Map<String, Object> statistics = dealerPaymentService.getPaymentStatistics();
            return ResponseEntity.ok(statistics);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get payment statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/validate-payment")
    @Operation(summary = "Validate thanh toán", description = "Kiểm tra tính hợp lệ của thanh toán trước khi xử lý")
    public ResponseEntity<?> validatePayment(@RequestBody Map<String, Object> paymentRequest) {
        try {
            Map<String, Object> validation = new HashMap<>();
            validation.put("valid", true);
            validation.put("errors", new java.util.ArrayList<String>());
            
            // Validate invoice exists
            if (paymentRequest.containsKey("invoiceId")) {
                try {
                    UUID invoiceId = UUID.fromString(paymentRequest.get("invoiceId").toString());
                    DealerInvoice invoice = dealerInvoiceService.getInvoiceById(invoiceId)
                        .orElseThrow(() -> new RuntimeException("Invoice not found"));
                    
                    validation.put("invoice", Map.of(
                        "invoiceId", invoiceId,
                        "invoiceNumber", invoice.getInvoiceNumber(),
                        "totalAmount", invoice.getTotalAmount(),
                        "status", invoice.getStatus()
                    ));
                    
                } catch (Exception e) {
                    validation.put("valid", false);
                    ((java.util.List<String>) validation.get("errors")).add("Invalid invoice ID: " + e.getMessage());
                }
            }
            
            // Validate amount
            if (paymentRequest.containsKey("amount")) {
                try {
                    BigDecimal amount = new BigDecimal(paymentRequest.get("amount").toString());
                    if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                        validation.put("valid", false);
                        ((java.util.List<String>) validation.get("errors")).add("Payment amount must be greater than zero");
                    } else {
                        validation.put("amount", amount);
                    }
                } catch (Exception e) {
                    validation.put("valid", false);
                    ((java.util.List<String>) validation.get("errors")).add("Invalid amount format: " + e.getMessage());
                }
            }
            
            return ResponseEntity.ok(validation);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to validate payment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
