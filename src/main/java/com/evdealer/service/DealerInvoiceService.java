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
}
