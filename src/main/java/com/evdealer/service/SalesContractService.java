package com.evdealer.service;

import com.evdealer.entity.SalesContract;
import com.evdealer.repository.SalesContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class SalesContractService {
    
    @Autowired
    private SalesContractRepository salesContractRepository;
    
    public List<SalesContract> getAllContracts() {
        try {
            return salesContractRepository.findAll();
        } catch (Exception e) {
            // Return empty list if there's an issue
            return new java.util.ArrayList<>();
        }
    }
    
    public Optional<SalesContract> getContractById(UUID contractId) {
        return salesContractRepository.findById(contractId);
    }
    
    public Optional<SalesContract> getContractByNumber(String contractNumber) {
        return salesContractRepository.findByContractNumber(contractNumber);
    }
    
    public List<SalesContract> getContractsByOrder(UUID orderId) {
        try {
            return salesContractRepository.findByOrderOrderId(orderId);
        } catch (Exception e) {
            // Return empty list if there's an issue
            return new java.util.ArrayList<>();
        }
    }
    
    public List<SalesContract> getContractsByCustomer(UUID customerId) {
        try {
            return salesContractRepository.findByCustomerCustomerId(customerId);
        } catch (Exception e) {
            // Return empty list if there's an issue
            return new java.util.ArrayList<>();
        }
    }
    
    public List<SalesContract> getContractsByUser(UUID userId) {
        try {
            return salesContractRepository.findByUserUserId(userId);
        } catch (Exception e) {
            // Return empty list if there's an issue
            return new java.util.ArrayList<>();
        }
    }
    
    public List<SalesContract> getContractsByStatus(String contractStatus) {
        try {
            return salesContractRepository.findByContractStatus(contractStatus);
        } catch (Exception e) {
            // Return empty list if there's an issue
            return new java.util.ArrayList<>();
        }
    }
    
    public List<SalesContract> getContractsByDateRange(LocalDate startDate, LocalDate endDate) {
        return salesContractRepository.findByContractDateBetween(startDate, endDate);
    }
    
    public List<SalesContract> getContractsByDeliveryDateRange(LocalDate startDate, LocalDate endDate) {
        return salesContractRepository.findByDeliveryDateBetween(startDate, endDate);
    }
    
    public List<SalesContract> getContractsByCustomerAndStatus(UUID customerId, String status) {
        return salesContractRepository.findByCustomerAndStatus(customerId, status);
    }
    
    public SalesContract createContract(SalesContract contract) {
        if (salesContractRepository.existsByContractNumber(contract.getContractNumber())) {
            throw new RuntimeException("Contract number already exists: " + contract.getContractNumber());
        }
        return salesContractRepository.save(contract);
    }
    
    public SalesContract updateContract(UUID contractId, SalesContract contractDetails) {
        SalesContract contract = salesContractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Sales contract not found with id: " + contractId));
        
        // Check for duplicate contract number (excluding current contract)
        if (!contract.getContractNumber().equals(contractDetails.getContractNumber()) && 
            salesContractRepository.existsByContractNumber(contractDetails.getContractNumber())) {
            throw new RuntimeException("Contract number already exists: " + contractDetails.getContractNumber());
        }
        
        contract.setContractNumber(contractDetails.getContractNumber());
        contract.setOrder(contractDetails.getOrder());
        contract.setCustomer(contractDetails.getCustomer());
        contract.setUser(contractDetails.getUser());
        contract.setContractDate(contractDetails.getContractDate());
        contract.setDeliveryDate(contractDetails.getDeliveryDate());
        contract.setContractValue(contractDetails.getContractValue());
        contract.setPaymentTerms(contractDetails.getPaymentTerms());
        contract.setWarrantyPeriodMonths(contractDetails.getWarrantyPeriodMonths());
        contract.setContractStatus(contractDetails.getContractStatus());
        contract.setSignedDate(contractDetails.getSignedDate());
        contract.setContractFileUrl(contractDetails.getContractFileUrl());
        contract.setContractFilePath(contractDetails.getContractFilePath());
        contract.setNotes(contractDetails.getNotes());
        
        return salesContractRepository.save(contract);
    }
    
    public void deleteContract(UUID contractId) {
        SalesContract contract = salesContractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Sales contract not found with id: " + contractId));
        salesContractRepository.delete(contract);
    }
    
    public SalesContract updateContractStatus(UUID contractId, String status) {
        SalesContract contract = salesContractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Sales contract not found with id: " + contractId));
        contract.setContractStatus(status);
        return salesContractRepository.save(contract);
    }
    
    public SalesContract signContract(UUID contractId, LocalDate signedDate) {
        SalesContract contract = salesContractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Sales contract not found with id: " + contractId));
        contract.setSignedDate(signedDate);
        contract.setContractStatus("signed");
        return salesContractRepository.save(contract);
    }
}
