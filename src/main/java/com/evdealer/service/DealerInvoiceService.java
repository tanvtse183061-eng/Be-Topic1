package com.evdealer.service;

import com.evdealer.entity.DealerInvoice;
import com.evdealer.repository.DealerInvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class DealerInvoiceService {
    
    @Autowired
    private DealerInvoiceRepository dealerInvoiceRepository;
    
    public List<DealerInvoice> getAllInvoices() {
        try {
            return dealerInvoiceRepository.findAll();
        } catch (Exception e) {
            // Return empty list if there's an issue
            return new java.util.ArrayList<>();
        }
    }
    
    public List<DealerInvoice> getInvoicesByStatus(String status) {
        return dealerInvoiceRepository.findByStatus(status);
    }
    
    public List<DealerInvoice> getInvoicesByDealerOrder(UUID dealerOrderId) {
        return dealerInvoiceRepository.findByDealerOrderDealerOrderId(dealerOrderId);
    }
    
    public List<DealerInvoice> getInvoicesByEvmStaff(UUID evmStaffId) {
        return dealerInvoiceRepository.findByEvmStaffUserId(evmStaffId);
    }
    
    public List<DealerInvoice> getInvoicesByDateRange(LocalDate startDate, LocalDate endDate) {
        return dealerInvoiceRepository.findByInvoiceDateBetween(startDate, endDate);
    }
    
    public List<DealerInvoice> getOverdueInvoices() {
        return dealerInvoiceRepository.findOverdueInvoices();
    }
    
    public Optional<DealerInvoice> getInvoiceById(UUID invoiceId) {
        return dealerInvoiceRepository.findById(invoiceId);
    }
    
    public Optional<DealerInvoice> getInvoiceByNumber(String invoiceNumber) {
        return dealerInvoiceRepository.findByInvoiceNumber(invoiceNumber);
    }
    
    public DealerInvoice createInvoice(DealerInvoice invoice) {
        if (dealerInvoiceRepository.existsByInvoiceNumber(invoice.getInvoiceNumber())) {
            throw new RuntimeException("Invoice number already exists");
        }
        return dealerInvoiceRepository.save(invoice);
    }
    
    public DealerInvoice updateInvoice(UUID invoiceId, DealerInvoice invoiceDetails) {
        DealerInvoice invoice = dealerInvoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        invoice.setInvoiceNumber(invoiceDetails.getInvoiceNumber());
        invoice.setDealerOrder(invoiceDetails.getDealerOrder());
        invoice.setEvmStaff(invoiceDetails.getEvmStaff());
        invoice.setInvoiceDate(invoiceDetails.getInvoiceDate());
        invoice.setDueDate(invoiceDetails.getDueDate());
        invoice.setSubtotal(invoiceDetails.getSubtotal());
        invoice.setTaxAmount(invoiceDetails.getTaxAmount());
        invoice.setDiscountAmount(invoiceDetails.getDiscountAmount());
        invoice.setTotalAmount(invoiceDetails.getTotalAmount());
        invoice.setStatus(invoiceDetails.getStatus());
        invoice.setPaymentTermsDays(invoiceDetails.getPaymentTermsDays());
        invoice.setNotes(invoiceDetails.getNotes());
        
        return dealerInvoiceRepository.save(invoice);
    }
    
    public void deleteInvoice(UUID invoiceId) {
        if (!dealerInvoiceRepository.existsById(invoiceId)) {
            throw new RuntimeException("Invoice not found");
        }
        dealerInvoiceRepository.deleteById(invoiceId);
    }
    
    public DealerInvoice updateInvoiceStatus(UUID invoiceId, String status) {
        DealerInvoice invoice = dealerInvoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        invoice.setStatus(status);
        return dealerInvoiceRepository.save(invoice);
    }
    
    // Additional methods for new APIs
    public DealerInvoice generateInvoiceFromOrder(UUID dealerOrderId, UUID evmStaffId) {
        // This would typically involve creating invoice from dealer order
        // For now, return a basic implementation
        DealerInvoice invoice = new DealerInvoice();
        invoice.setInvoiceNumber("INV-" + System.currentTimeMillis());
        invoice.setInvoiceDate(java.time.LocalDate.now());
        invoice.setDueDate(java.time.LocalDate.now().plusDays(30));
        invoice.setStatus("PENDING");
        invoice.setPaymentTermsDays(30);
        invoice.setNotes("Generated from dealer order: " + dealerOrderId);
        
        // Initialize required fields
        invoice.setSubtotal(java.math.BigDecimal.ZERO);
        invoice.setTaxAmount(java.math.BigDecimal.ZERO);
        invoice.setDiscountAmount(java.math.BigDecimal.ZERO);
        invoice.setTotalAmount(java.math.BigDecimal.ZERO);
        
        return dealerInvoiceRepository.save(invoice);
    }
    
    public java.math.BigDecimal calculatePaidAmount(UUID invoiceId) {
        // This would calculate total paid amount for the invoice
        // For now, return 0
        return java.math.BigDecimal.ZERO;
    }
    
    public List<DealerInvoice> getInvoicesByDealer(UUID dealerId) {
        return dealerInvoiceRepository.findByDealerOrderDealerDealerId(dealerId);
    }
    
    public List<DealerInvoice> getUnpaidInvoicesByDealer(UUID dealerId) {
        return dealerInvoiceRepository.findByDealerOrderDealerDealerIdAndStatus(dealerId, "PENDING");
    }
    
    public java.util.Map<String, Object> getInvoiceStatistics() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        
        long totalInvoices = dealerInvoiceRepository.count();
        long pendingInvoices = dealerInvoiceRepository.countByStatus("PENDING");
        long paidInvoices = dealerInvoiceRepository.countByStatus("PAID");
        long overdueInvoices = dealerInvoiceRepository.findOverdueInvoices().size();
        
        stats.put("totalInvoices", totalInvoices);
        stats.put("pendingInvoices", pendingInvoices);
        stats.put("paidInvoices", paidInvoices);
        stats.put("overdueInvoices", overdueInvoices);
        
        return stats;
    }
}
