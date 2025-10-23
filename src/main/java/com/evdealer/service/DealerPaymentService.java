package com.evdealer.service;

import com.evdealer.entity.DealerPayment;
import com.evdealer.repository.DealerPaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class DealerPaymentService {
    
    @Autowired
    private DealerPaymentRepository dealerPaymentRepository;
    
    public List<DealerPayment> getAllDealerPayments() {
        try {
            return dealerPaymentRepository.findAll();
        } catch (Exception e) {
            // Return empty list if there's an issue
            return new java.util.ArrayList<>();
        }
    }
    
    public List<DealerPayment> getPaymentsByStatus(String status) {
        return dealerPaymentRepository.findByStatus(status);
    }
    
    public List<DealerPayment> getPaymentsByInvoice(UUID invoiceId) {
        return dealerPaymentRepository.findByInvoiceInvoiceId(invoiceId);
    }
    
    public List<DealerPayment> getPaymentsByDateRange(LocalDate startDate, LocalDate endDate) {
        return dealerPaymentRepository.findByPaymentDateBetween(startDate, endDate);
    }
    
    public List<DealerPayment> getPaymentsByType(String paymentType) {
        return dealerPaymentRepository.findByPaymentType(paymentType);
    }
    
    public List<DealerPayment> getPaymentsByReferenceNumber(String referenceNumber) {
        return dealerPaymentRepository.findByReferenceNumber(referenceNumber);
    }
    
    public Optional<DealerPayment> getPaymentById(UUID paymentId) {
        return dealerPaymentRepository.findById(paymentId);
    }
    
    public Optional<DealerPayment> getPaymentByNumber(String paymentNumber) {
        return dealerPaymentRepository.findByPaymentNumber(paymentNumber);
    }
    
    public DealerPayment createDealerPayment(DealerPayment dealerPayment) {
        if (dealerPaymentRepository.existsByPaymentNumber(dealerPayment.getPaymentNumber())) {
            throw new RuntimeException("Payment number already exists");
        }
        return dealerPaymentRepository.save(dealerPayment);
    }
    
    public DealerPayment updateDealerPayment(UUID paymentId, DealerPayment dealerPaymentDetails) {
        DealerPayment dealerPayment = dealerPaymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Dealer payment not found"));
        
        dealerPayment.setInvoice(dealerPaymentDetails.getInvoice());
        dealerPayment.setPaymentNumber(dealerPaymentDetails.getPaymentNumber());
        dealerPayment.setPaymentDate(dealerPaymentDetails.getPaymentDate());
        dealerPayment.setAmount(dealerPaymentDetails.getAmount());
        dealerPayment.setPaymentType(dealerPaymentDetails.getPaymentType());
        dealerPayment.setReferenceNumber(dealerPaymentDetails.getReferenceNumber());
        dealerPayment.setStatus(dealerPaymentDetails.getStatus());
        dealerPayment.setNotes(dealerPaymentDetails.getNotes());
        
        return dealerPaymentRepository.save(dealerPayment);
    }
    
    public void deleteDealerPayment(UUID paymentId) {
        if (!dealerPaymentRepository.existsById(paymentId)) {
            throw new RuntimeException("Dealer payment not found");
        }
        dealerPaymentRepository.deleteById(paymentId);
    }
    
    public DealerPayment updatePaymentStatus(UUID paymentId, String status) {
        DealerPayment dealerPayment = dealerPaymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Dealer payment not found"));
        dealerPayment.setStatus(status);
        return dealerPaymentRepository.save(dealerPayment);
    }
}
