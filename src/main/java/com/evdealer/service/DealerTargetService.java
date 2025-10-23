package com.evdealer.service;

import com.evdealer.entity.DealerTarget;
import com.evdealer.repository.DealerTargetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class DealerTargetService {
    
    @Autowired
    private DealerTargetRepository dealerTargetRepository;
    
    public List<DealerTarget> getAllTargets() {
        return dealerTargetRepository.findAll();
    }
    
    public Optional<DealerTarget> getTargetById(UUID targetId) {
        return dealerTargetRepository.findById(targetId);
    }
    
    public List<DealerTarget> getTargetsByYear(Integer targetYear) {
        return dealerTargetRepository.findByTargetYear(targetYear);
    }
    
    public List<DealerTarget> getTargetsByMonth(Integer targetMonth) {
        return dealerTargetRepository.findByTargetMonth(targetMonth);
    }
    
    public List<DealerTarget> getTargetsByType(String targetType) {
        return dealerTargetRepository.findByTargetType(targetType);
    }
    
    public List<DealerTarget> getTargetsByStatus(String targetStatus) {
        return dealerTargetRepository.findByTargetStatus(targetStatus);
    }
    
    public List<DealerTarget> getTargetsByDealer(UUID dealerId) {
        return dealerTargetRepository.findByDealerDealerId(dealerId);
    }
    
    public List<DealerTarget> getTargetsByScope(String targetScope) {
        return dealerTargetRepository.findByTargetScope(targetScope);
    }
    
    public List<DealerTarget> getTargetsByDealerAndYear(UUID dealerId, Integer targetYear) {
        return dealerTargetRepository.findByDealerDealerIdAndTargetYear(dealerId, targetYear);
    }
    
    public List<DealerTarget> getTargetsByYearAndMonth(Integer year, Integer month) {
        return dealerTargetRepository.findByTargetYearAndMonth(year, month);
    }
    
    public List<DealerTarget> getTargetsByYearAndType(Integer year, String type) {
        return dealerTargetRepository.findByTargetYearAndType(year, type);
    }
    
    public List<DealerTarget> getTargetsByAchievementRateGreaterThanEqual(Double minRate) {
        return dealerTargetRepository.findByAchievementRateGreaterThanEqual(minRate);
    }
    
    public List<DealerTarget> getTargetsByAchievementRateLessThan(Double maxRate) {
        return dealerTargetRepository.findByAchievementRateLessThan(maxRate);
    }
    
    public DealerTarget createTarget(DealerTarget target) {
        return dealerTargetRepository.save(target);
    }
    
    public DealerTarget updateTarget(UUID targetId, DealerTarget targetDetails) {
        DealerTarget target = dealerTargetRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("Dealer target not found with id: " + targetId));
        
        target.setDealer(targetDetails.getDealer());
        target.setTargetYear(targetDetails.getTargetYear());
        target.setTargetMonth(targetDetails.getTargetMonth());
        target.setTargetType(targetDetails.getTargetType());
        target.setTargetAmount(targetDetails.getTargetAmount());
        target.setTargetQuantity(targetDetails.getTargetQuantity());
        target.setAchievedAmount(targetDetails.getAchievedAmount());
        target.setAchievedQuantity(targetDetails.getAchievedQuantity());
        target.setTargetStatus(targetDetails.getTargetStatus());
        target.setTargetScope(targetDetails.getTargetScope());
        target.setNotes(targetDetails.getNotes());
        
        return dealerTargetRepository.save(target);
    }
    
    public void deleteTarget(UUID targetId) {
        DealerTarget target = dealerTargetRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("Dealer target not found with id: " + targetId));
        dealerTargetRepository.delete(target);
    }
    
    public DealerTarget updateTargetStatus(UUID targetId, String status) {
        DealerTarget target = dealerTargetRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("Dealer target not found with id: " + targetId));
        target.setTargetStatus(status);
        return dealerTargetRepository.save(target);
    }
    
    public DealerTarget updateAchievement(UUID targetId, BigDecimal achievedAmount, Integer achievedQuantity) {
        DealerTarget target = dealerTargetRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("Dealer target not found with id: " + targetId));
        
        target.setAchievedAmount(achievedAmount);
        target.setAchievedQuantity(achievedQuantity);
        
        // Calculate achievement rate
        if (target.getTargetAmount() != null && target.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal rate = achievedAmount.divide(target.getTargetAmount(), 4, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            target.setAchievementRate(rate);
        }
        
        return dealerTargetRepository.save(target);
    }
}
