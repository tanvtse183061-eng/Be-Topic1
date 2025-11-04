package com.evdealer.service;

import com.evdealer.entity.CustomerPayment;
import com.evdealer.repository.CustomerPaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CustomerPaymentService {
    
    @Autowired
    private CustomerPaymentRepository customerPaymentRepository;
    
    public List<CustomerPayment> getAllCustomerPayments() {
        try {
            return customerPaymentRepository.findAll();
        } catch (Exception e) {
            // Return empty list if there's an issue
            return new java.util.ArrayList<>();
        }
    }
    
    public List<CustomerPayment> getPaymentsByStatus(String status) {
        return customerPaymentRepository.findByStatus(status);
    }
    
    public List<CustomerPayment> getPaymentsByCustomer(UUID customerId) {
        return customerPaymentRepository.findByCustomerCustomerId(customerId);
    }
    
    public List<CustomerPayment> getPaymentsByOrder(UUID orderId) {
        return customerPaymentRepository.findByOrderOrderId(orderId);
    }
    
    public List<CustomerPayment> getPaymentsByDateRange(LocalDate startDate, LocalDate endDate) {
        return customerPaymentRepository.findByPaymentDateBetween(startDate, endDate);
    }
    
    public List<CustomerPayment> getPaymentsByType(String paymentType) {
        return customerPaymentRepository.findByPaymentType(paymentType);
    }
    
    public List<CustomerPayment> getPaymentsByMethod(String paymentMethod) {
        return customerPaymentRepository.findByPaymentMethod(paymentMethod);
    }
    
    public List<CustomerPayment> getPaymentsByProcessedBy(UUID userId) {
        return customerPaymentRepository.findByProcessedByUserId(userId);
    }
    
    public Optional<CustomerPayment> getPaymentById(UUID paymentId) {
        return customerPaymentRepository.findById(paymentId);
    }
    
    public Optional<CustomerPayment> getPaymentByNumber(String paymentNumber) {
        return customerPaymentRepository.findByPaymentNumber(paymentNumber);
    }
    
    public CustomerPayment createCustomerPayment(CustomerPayment customerPayment) {
        if (customerPaymentRepository.existsByPaymentNumber(customerPayment.getPaymentNumber())) {
            throw new RuntimeException("Payment number already exists");
        }
        return customerPaymentRepository.save(customerPayment);
    }
    
    public CustomerPayment updateCustomerPayment(UUID paymentId, CustomerPayment customerPaymentDetails) {
        CustomerPayment customerPayment = customerPaymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Customer payment not found"));
        
        customerPayment.setOrder(customerPaymentDetails.getOrder());
        customerPayment.setCustomer(customerPaymentDetails.getCustomer());
        customerPayment.setPaymentNumber(customerPaymentDetails.getPaymentNumber());
        customerPayment.setPaymentDate(customerPaymentDetails.getPaymentDate());
        customerPayment.setAmount(customerPaymentDetails.getAmount());
        customerPayment.setPaymentType(customerPaymentDetails.getPaymentType());
        customerPayment.setPaymentMethod(customerPaymentDetails.getPaymentMethod());
        customerPayment.setReferenceNumber(customerPaymentDetails.getReferenceNumber());
        customerPayment.setStatus(customerPaymentDetails.getStatus());
        customerPayment.setProcessedBy(customerPaymentDetails.getProcessedBy());
        customerPayment.setNotes(customerPaymentDetails.getNotes());
        
        return customerPaymentRepository.save(customerPayment);
    }
    
    public void deleteCustomerPayment(UUID paymentId) {
        if (!customerPaymentRepository.existsById(paymentId)) {
            throw new RuntimeException("Customer payment not found");
        }
        customerPaymentRepository.deleteById(paymentId);
    }
    
    public CustomerPayment updatePaymentStatus(UUID paymentId, String status) {
        CustomerPayment customerPayment = customerPaymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Customer payment not found"));
        customerPayment.setStatus(status);
        return customerPaymentRepository.save(customerPayment);
    }
}
