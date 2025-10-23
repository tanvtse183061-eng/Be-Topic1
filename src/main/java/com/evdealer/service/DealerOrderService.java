package com.evdealer.service;

import com.evdealer.entity.DealerOrder;
import com.evdealer.repository.DealerOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class DealerOrderService {
    
    @Autowired
    private DealerOrderRepository dealerOrderRepository;
    
    public List<DealerOrder> getAllDealerOrders() {
        try {
            return dealerOrderRepository.findAll();
        } catch (Exception e) {
            // Return empty list if there's an issue
            return new java.util.ArrayList<>();
        }
    }
    
    public Optional<DealerOrder> getDealerOrderById(UUID dealerOrderId) {
        return dealerOrderRepository.findById(dealerOrderId);
    }
    
    public Optional<DealerOrder> getDealerOrderByOrderNumber(String orderNumber) {
        return dealerOrderRepository.findByDealerOrderNumber(orderNumber);
    }
    
    public List<DealerOrder> getDealerOrdersByEvmStaff(UUID evmStaffId) {
        return dealerOrderRepository.findByEvmStaffUserId(evmStaffId);
    }
    
    public List<DealerOrder> getDealerOrdersByStatus(String status) {
        return dealerOrderRepository.findByStatus(status);
    }
    
    public List<DealerOrder> getDealerOrdersByDateRange(LocalDate startDate, LocalDate endDate) {
        return dealerOrderRepository.findByOrderDateBetween(startDate, endDate);
    }
    
    public DealerOrder createDealerOrder(DealerOrder dealerOrder) {
        if (dealerOrderRepository.existsByDealerOrderNumber(dealerOrder.getDealerOrderNumber())) {
            throw new RuntimeException("Dealer order number already exists: " + dealerOrder.getDealerOrderNumber());
        }
        return dealerOrderRepository.save(dealerOrder);
    }
    
    public DealerOrder updateDealerOrder(UUID dealerOrderId, DealerOrder dealerOrderDetails) {
        DealerOrder dealerOrder = dealerOrderRepository.findById(dealerOrderId)
                .orElseThrow(() -> new RuntimeException("Dealer order not found with id: " + dealerOrderId));
        
        // Check for duplicate order number (excluding current order)
        if (!dealerOrder.getDealerOrderNumber().equals(dealerOrderDetails.getDealerOrderNumber()) && 
            dealerOrderRepository.existsByDealerOrderNumber(dealerOrderDetails.getDealerOrderNumber())) {
            throw new RuntimeException("Dealer order number already exists: " + dealerOrderDetails.getDealerOrderNumber());
        }
        
        dealerOrder.setDealerOrderNumber(dealerOrderDetails.getDealerOrderNumber());
        dealerOrder.setEvmStaff(dealerOrderDetails.getEvmStaff());
        dealerOrder.setOrderDate(dealerOrderDetails.getOrderDate());
        dealerOrder.setExpectedDeliveryDate(dealerOrderDetails.getExpectedDeliveryDate());
        dealerOrder.setTotalQuantity(dealerOrderDetails.getTotalQuantity());
        dealerOrder.setTotalAmount(dealerOrderDetails.getTotalAmount());
        dealerOrder.setStatus(dealerOrderDetails.getStatus());
        dealerOrder.setPriority(dealerOrderDetails.getPriority());
        dealerOrder.setNotes(dealerOrderDetails.getNotes());
        
        return dealerOrderRepository.save(dealerOrder);
    }
    
    public void deleteDealerOrder(UUID dealerOrderId) {
        DealerOrder dealerOrder = dealerOrderRepository.findById(dealerOrderId)
                .orElseThrow(() -> new RuntimeException("Dealer order not found with id: " + dealerOrderId));
        dealerOrderRepository.delete(dealerOrder);
    }
    
    public DealerOrder updateDealerOrderStatus(UUID dealerOrderId, String status) {
        DealerOrder dealerOrder = dealerOrderRepository.findById(dealerOrderId)
                .orElseThrow(() -> new RuntimeException("Dealer order not found with id: " + dealerOrderId));
        dealerOrder.setStatus(status);
        return dealerOrderRepository.save(dealerOrder);
    }
}

