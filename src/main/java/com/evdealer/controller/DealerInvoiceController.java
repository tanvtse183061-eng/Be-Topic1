package com.evdealer.controller;

import com.evdealer.entity.DealerInvoice;
import com.evdealer.service.DealerInvoiceService;
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
@RequestMapping("/api/dealer-invoices")
@CrossOrigin(origins = "*")
@Tag(name = "Dealer Invoice Management", description = "APIs quản lý hóa đơn đại lý")
public class DealerInvoiceController {
    
    @Autowired
    private DealerInvoiceService dealerInvoiceService;
    
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
}
