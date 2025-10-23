package com.evdealer.service;

import com.evdealer.entity.DealerContract;
import com.evdealer.repository.DealerContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class DealerContractService {
    
    @Autowired
    private DealerContractRepository dealerContractRepository;
    
    public List<DealerContract> getAllContracts() {
        return dealerContractRepository.findAll();
    }
    
    public Optional<DealerContract> getContractById(UUID contractId) {
        return dealerContractRepository.findById(contractId);
    }
    
    public Optional<DealerContract> getContractByNumber(String contractNumber) {
        return dealerContractRepository.findByContractNumber(contractNumber);
    }
    
    public List<DealerContract> getContractsByType(String contractType) {
        return dealerContractRepository.findByContractType(contractType);
    }
    
    public List<DealerContract> getContractsByStatus(String contractStatus) {
        return dealerContractRepository.findByContractStatus(contractStatus);
    }
    
    public List<DealerContract> getActiveContracts() {
        return dealerContractRepository.findActiveContracts(LocalDate.now());
    }
    
    public List<DealerContract> getActiveContractsByDate(LocalDate date) {
        return dealerContractRepository.findActiveContractsByDate(date);
    }
    
    public List<DealerContract> getContractsByTypeAndStatus(String contractType, String status) {
        return dealerContractRepository.findByContractTypeAndStatus(contractType, status);
    }
    
    public List<DealerContract> getContractsByTerritory(String territory) {
        return dealerContractRepository.findByTerritoryContaining(territory);
    }
    
    public DealerContract createContract(DealerContract contract) {
        if (dealerContractRepository.existsByContractNumber(contract.getContractNumber())) {
            throw new RuntimeException("Contract number already exists: " + contract.getContractNumber());
        }
        return dealerContractRepository.save(contract);
    }
    
    public DealerContract updateContract(UUID contractId, DealerContract contractDetails) {
        DealerContract contract = dealerContractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Dealer contract not found with id: " + contractId));
        
        // Check for duplicate contract number (excluding current contract)
        if (!contract.getContractNumber().equals(contractDetails.getContractNumber()) && 
            dealerContractRepository.existsByContractNumber(contractDetails.getContractNumber())) {
            throw new RuntimeException("Contract number already exists: " + contractDetails.getContractNumber());
        }
        
        contract.setContractNumber(contractDetails.getContractNumber());
        contract.setContractType(contractDetails.getContractType());
        contract.setStartDate(contractDetails.getStartDate());
        contract.setEndDate(contractDetails.getEndDate());
        contract.setTerritory(contractDetails.getTerritory());
        contract.setCommissionRate(contractDetails.getCommissionRate());
        contract.setMinimumSalesTarget(contractDetails.getMinimumSalesTarget());
        contract.setContractStatus(contractDetails.getContractStatus());
        contract.setSignedDate(contractDetails.getSignedDate());
        contract.setContractFileUrl(contractDetails.getContractFileUrl());
        contract.setContractFilePath(contractDetails.getContractFilePath());
        contract.setTermsAndConditions(contractDetails.getTermsAndConditions());
        
        return dealerContractRepository.save(contract);
    }
    
    public void deleteContract(UUID contractId) {
        DealerContract contract = dealerContractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Dealer contract not found with id: " + contractId));
        dealerContractRepository.delete(contract);
    }
    
    public DealerContract updateContractStatus(UUID contractId, String status) {
        DealerContract contract = dealerContractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Dealer contract not found with id: " + contractId));
        contract.setContractStatus(status);
        return dealerContractRepository.save(contract);
    }
    
    public DealerContract signContract(UUID contractId, LocalDate signedDate) {
        DealerContract contract = dealerContractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Dealer contract not found with id: " + contractId));
        contract.setSignedDate(signedDate);
        contract.setContractStatus("signed");
        return dealerContractRepository.save(contract);
    }
}
