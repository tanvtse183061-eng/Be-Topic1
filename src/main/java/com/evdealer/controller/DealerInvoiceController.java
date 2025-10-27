package com.evdealer.controller;

import com.evdealer.entity.DealerInvoice;
import com.evdealer.entity.DealerOrder;
import com.evdealer.entity.DealerOrderItem;
import com.evdealer.service.DealerInvoiceService;
import com.evdealer.service.DealerOrderService;
import com.evdealer.service.DealerOrderItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/dealer-invoices")
@CrossOrigin(origins = "*")
@Tag(name = "Dealer Invoice Management", description = "APIs quản lý hóa đơn đại lý")
public class DealerInvoiceController {
    
    @Autowired
    private DealerInvoiceService dealerInvoiceService;
    
    @Autowired
    private DealerOrderService dealerOrderService;
    
    @Autowired
    private DealerOrderItemService dealerOrderItemService;
    
    @GetMapping
    @Operation(summary = "Lấy danh sách hóa đơn", description = "Lấy tất cả hóa đơn đại lý")
    public ResponseEntity<List<DealerInvoice>> getAllInvoices() {
        List<DealerInvoice> invoices = dealerInvoiceService.getAllInvoices();
        return ResponseEntity.ok(invoices);
    }
    
    @GetMapping("/{invoiceId}")
    @Operation(summary = "Lấy hóa đơn theo ID", description = "Lấy hóa đơn theo ID")
    public ResponseEntity<DealerInvoice> getInvoiceById(@PathVariable @Parameter(description = "Invoice ID") UUID invoiceId) {
        return dealerInvoiceService.getInvoiceById(invoiceId)
                .map(invoice -> ResponseEntity.ok(invoice))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/number/{invoiceNumber}")
    @Operation(summary = "Lấy hóa đơn theo số", description = "Lấy hóa đơn theo số hóa đơn")
    public ResponseEntity<DealerInvoice> getInvoiceByNumber(@PathVariable String invoiceNumber) {
        return dealerInvoiceService.getInvoiceByNumber(invoiceNumber)
                .map(invoice -> ResponseEntity.ok(invoice))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Lấy hóa đơn theo trạng thái", description = "Lấy hóa đơn theo trạng thái")
    public ResponseEntity<List<DealerInvoice>> getInvoicesByStatus(@PathVariable String status) {
        List<DealerInvoice> invoices = dealerInvoiceService.getInvoicesByStatus(status);
        return ResponseEntity.ok(invoices);
    }
    
    @GetMapping("/dealer-order/{dealerOrderId}")
    @Operation(summary = "Lấy hóa đơn theo đơn hàng", description = "Lấy hóa đơn theo đơn hàng đại lý")
    public ResponseEntity<List<DealerInvoice>> getInvoicesByDealerOrder(@PathVariable UUID dealerOrderId) {
        List<DealerInvoice> invoices = dealerInvoiceService.getInvoicesByDealerOrder(dealerOrderId);
        return ResponseEntity.ok(invoices);
    }
    
    @GetMapping("/evm-staff/{evmStaffId}")
    @Operation(summary = "Lấy hóa đơn theo nhân viên", description = "Lấy hóa đơn theo nhân viên EVM")
    public ResponseEntity<List<DealerInvoice>> getInvoicesByEvmStaff(@PathVariable UUID evmStaffId) {
        List<DealerInvoice> invoices = dealerInvoiceService.getInvoicesByEvmStaff(evmStaffId);
        return ResponseEntity.ok(invoices);
    }
    
    @GetMapping("/date-range")
    @Operation(summary = "Lấy hóa đơn theo khoảng ngày", description = "Lấy hóa đơn theo khoảng ngày")
    public ResponseEntity<List<DealerInvoice>> getInvoicesByDateRange(
            @RequestParam @Parameter(description = "Start date") LocalDate startDate,
            @RequestParam @Parameter(description = "End date") LocalDate endDate) {
        List<DealerInvoice> invoices = dealerInvoiceService.getInvoicesByDateRange(startDate, endDate);
        return ResponseEntity.ok(invoices);
    }
    
    @GetMapping("/overdue")
    @Operation(summary = "Lấy hóa đơn quá hạn", description = "Lấy hóa đơn quá hạn")
    public ResponseEntity<List<DealerInvoice>> getOverdueInvoices() {
        List<DealerInvoice> invoices = dealerInvoiceService.getOverdueInvoices();
        return ResponseEntity.ok(invoices);
    }
    
    @PostMapping
    @Operation(summary = "Tạo hóa đơn mới", description = "Tạo hóa đơn đại lý mới")
    public ResponseEntity<DealerInvoice> createInvoice(@RequestBody DealerInvoice invoice) {
        try {
            DealerInvoice createdInvoice = dealerInvoiceService.createInvoice(invoice);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdInvoice);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{invoiceId}")
    @Operation(summary = "Cập nhật hóa đơn", description = "Cập nhật hóa đơn")
    public ResponseEntity<DealerInvoice> updateInvoice(
            @PathVariable UUID invoiceId, 
            @RequestBody DealerInvoice invoiceDetails) {
        try {
            DealerInvoice updatedInvoice = dealerInvoiceService.updateInvoice(invoiceId, invoiceDetails);
            return ResponseEntity.ok(updatedInvoice);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{invoiceId}/status")
    @Operation(summary = "Cập nhật trạng thái hóa đơn", description = "Cập nhật trạng thái hóa đơn")
    public ResponseEntity<DealerInvoice> updateInvoiceStatus(
            @PathVariable UUID invoiceId, 
            @RequestParam String status) {
        try {
            DealerInvoice updatedInvoice = dealerInvoiceService.updateInvoiceStatus(invoiceId, status);
            return ResponseEntity.ok(updatedInvoice);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{invoiceId}")
    @Operation(summary = "Xóa hóa đơn", description = "Xóa hóa đơn")
    public ResponseEntity<Void> deleteInvoice(@PathVariable UUID invoiceId) {
        try {
            dealerInvoiceService.deleteInvoice(invoiceId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // ==================== NEW IMPROVED APIs ====================
    
    @PostMapping("/generate-from-order/{dealerOrderId}")
    @Operation(summary = "Tự động tạo hóa đơn từ đơn hàng", description = "Tự động tạo hóa đơn từ đơn hàng đại lý đã duyệt")
    public ResponseEntity<?> generateInvoiceFromOrder(@PathVariable UUID dealerOrderId, @RequestParam(required = false) UUID evmStaffId) {
        try {
            // Validate dealer order exists and is approved
            DealerOrder dealerOrder = dealerOrderService.getDealerOrderById(dealerOrderId)
                .orElseThrow(() -> new RuntimeException("Dealer order not found with ID: " + dealerOrderId));
            
            if (!"APPROVED".equals(dealerOrder.getApprovalStatus())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Cannot generate invoice for non-approved order. Order status: " + dealerOrder.getApprovalStatus());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Check if invoice already exists for this order
            List<DealerInvoice> existingInvoices = dealerInvoiceService.getInvoicesByDealerOrder(dealerOrderId);
            if (!existingInvoices.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invoice already exists for this order");
                error.put("existingInvoiceId", existingInvoices.get(0).getInvoiceId().toString());
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }
            
            // Generate invoice
            DealerInvoice invoice = dealerInvoiceService.generateInvoiceFromOrder(dealerOrderId, evmStaffId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Invoice generated successfully from dealer order");
            response.put("invoiceId", invoice.getInvoiceId());
            response.put("invoiceNumber", invoice.getInvoiceNumber());
            response.put("dealerOrderId", dealerOrderId);
            response.put("totalAmount", invoice.getTotalAmount());
            response.put("dueDate", invoice.getDueDate());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to generate invoice: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to generate invoice: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/{invoiceId}/items")
    @Operation(summary = "Lấy chi tiết xe trong hóa đơn", description = "Lấy danh sách xe trong hóa đơn đại lý")
    public ResponseEntity<?> getInvoiceItems(@PathVariable UUID invoiceId) {
        try {
            DealerInvoice invoice = dealerInvoiceService.getInvoiceById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));
            
            List<DealerOrderItem> items = dealerOrderItemService.getItemsByDealerOrderId(invoice.getDealerOrder().getDealerOrderId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("invoiceId", invoiceId);
            response.put("invoiceNumber", invoice.getInvoiceNumber());
            response.put("dealerOrderId", invoice.getDealerOrder().getDealerOrderId());
            response.put("dealerOrderNumber", invoice.getDealerOrder().getDealerOrderNumber());
            response.put("items", items);
            response.put("itemCount", items.size());
            response.put("totalAmount", invoice.getTotalAmount());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get invoice items: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @PostMapping("/{invoiceId}/send")
    @Operation(summary = "Gửi hóa đơn cho đại lý", description = "Gửi hóa đơn cho đại lý qua email")
    public ResponseEntity<?> sendInvoiceToDealer(@PathVariable UUID invoiceId, @RequestParam(required = false) String email) {
        try {
            DealerInvoice invoice = dealerInvoiceService.getInvoiceById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));
            
            // Get dealer email if not provided
            String dealerEmail = email != null ? email : invoice.getDealerOrder().getDealer().getEmail();
            
            if (dealerEmail == null || dealerEmail.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Dealer email not found. Please provide email address.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            // Update invoice status to sent
            invoice.setStatus("SENT");
            dealerInvoiceService.updateInvoice(invoiceId, invoice);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Invoice sent successfully to dealer");
            response.put("invoiceId", invoiceId);
            response.put("invoiceNumber", invoice.getInvoiceNumber());
            response.put("dealerEmail", dealerEmail);
            response.put("sentAt", java.time.LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to send invoice: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @GetMapping("/{invoiceId}/pdf")
    @Operation(summary = "Tải hóa đơn PDF", description = "Tải hóa đơn dưới dạng PDF")
    public ResponseEntity<?> downloadInvoicePDF(@PathVariable UUID invoiceId) {
        try {
            DealerInvoice invoice = dealerInvoiceService.getInvoiceById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));
            
            // For now, return invoice data as JSON
            // In real implementation, you would generate PDF and return as byte array
            Map<String, Object> response = new HashMap<>();
            response.put("message", "PDF generation not implemented yet. Returning invoice data.");
            response.put("invoice", invoice);
            response.put("dealerOrder", invoice.getDealerOrder());
            response.put("items", dealerOrderItemService.getItemsByDealerOrderId(invoice.getDealerOrder().getDealerOrderId()));
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to generate PDF: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @GetMapping("/{invoiceId}/balance")
    @Operation(summary = "Kiểm tra số dư còn lại", description = "Kiểm tra số tiền còn lại chưa thanh toán")
    public ResponseEntity<?> getInvoiceBalance(@PathVariable UUID invoiceId) {
        try {
            DealerInvoice invoice = dealerInvoiceService.getInvoiceById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));
            
            // Calculate paid amount and balance
            BigDecimal paidAmount = dealerInvoiceService.calculatePaidAmount(invoiceId);
            BigDecimal balance = invoice.getTotalAmount().subtract(paidAmount);
            
            Map<String, Object> response = new HashMap<>();
            response.put("invoiceId", invoiceId);
            response.put("invoiceNumber", invoice.getInvoiceNumber());
            response.put("totalAmount", invoice.getTotalAmount());
            response.put("paidAmount", paidAmount);
            response.put("balance", balance);
            response.put("isFullyPaid", balance.compareTo(BigDecimal.ZERO) <= 0);
            response.put("overdue", invoice.getDueDate().isBefore(LocalDate.now()) && balance.compareTo(BigDecimal.ZERO) > 0);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get invoice balance: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @GetMapping("/dealer/{dealerId}")
    @Operation(summary = "Lấy hóa đơn theo đại lý", description = "Lấy danh sách hóa đơn của một đại lý")
    public ResponseEntity<List<DealerInvoice>> getInvoicesByDealer(@PathVariable UUID dealerId) {
        List<DealerInvoice> invoices = dealerInvoiceService.getInvoicesByDealer(dealerId);
        return ResponseEntity.ok(invoices);
    }
    
    @GetMapping("/dealer/{dealerId}/unpaid")
    @Operation(summary = "Lấy hóa đơn chưa thanh toán", description = "Lấy danh sách hóa đơn chưa thanh toán của đại lý")
    public ResponseEntity<?> getUnpaidInvoicesByDealer(@PathVariable UUID dealerId) {
        try {
            List<DealerInvoice> unpaidInvoices = dealerInvoiceService.getUnpaidInvoicesByDealer(dealerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("dealerId", dealerId);
            response.put("unpaidInvoices", unpaidInvoices);
            response.put("count", unpaidInvoices.size());
            response.put("totalUnpaidAmount", unpaidInvoices.stream()
                .map(DealerInvoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get unpaid invoices: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "Thống kê hóa đơn", description = "Lấy thống kê tổng quan về hóa đơn")
    public ResponseEntity<?> getInvoiceStatistics(@RequestParam(required = false) LocalDate startDate, @RequestParam(required = false) LocalDate endDate) {
        try {
            Map<String, Object> statistics = dealerInvoiceService.getInvoiceStatistics();
            return ResponseEntity.ok(statistics);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get invoice statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
