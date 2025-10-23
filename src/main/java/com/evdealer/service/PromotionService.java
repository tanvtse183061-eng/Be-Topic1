package com.evdealer.service;

import com.evdealer.entity.Promotion;
import com.evdealer.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class PromotionService {
    
    @Autowired
    private PromotionRepository promotionRepository;
    
    public List<Promotion> getAllPromotions() {
        try {
            return promotionRepository.findAll();
        } catch (Exception e) {
            // Return empty list if there's an issue
            return new java.util.ArrayList<>();
        }
    }
    
    public Optional<Promotion> getPromotionById(UUID promotionId) {
        return promotionRepository.findById(promotionId);
    }
    
    public List<Promotion> getPromotionsByVariant(Integer variantId) {
        return promotionRepository.findByVariantVariantId(variantId);
    }
    
    public List<Promotion> getPromotionsByStatus(String status) {
        return promotionRepository.findByStatus(status);
    }
    
    public List<Promotion> getActivePromotions() {
        return promotionRepository.findActivePromotions(LocalDate.now());
    }
    
    public List<Promotion> getActivePromotionsByDate(LocalDate date) {
        return promotionRepository.findActivePromotionsByDate(date);
    }
    
    public List<Promotion> getActivePromotionsByVariant(Integer variantId) {
        return promotionRepository.findActivePromotionsByVariantAndDate(variantId, LocalDate.now());
    }
    
    public List<Promotion> getActivePromotionsByVariantAndDate(Integer variantId, LocalDate date) {
        return promotionRepository.findActivePromotionsByVariantAndDate(variantId, date);
    }
    
    public List<Promotion> getPromotionsByTitle(String title) {
        return promotionRepository.findByTitleContaining(title);
    }
    
    public Promotion createPromotion(Promotion promotion) {
        return promotionRepository.save(promotion);
    }
    
    public Promotion updatePromotion(UUID promotionId, Promotion promotionDetails) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + promotionId));
        
        promotion.setVariant(promotionDetails.getVariant());
        promotion.setTitle(promotionDetails.getTitle());
        promotion.setDescription(promotionDetails.getDescription());
        promotion.setDiscountPercent(promotionDetails.getDiscountPercent());
        promotion.setDiscountAmount(promotionDetails.getDiscountAmount());
        promotion.setStartDate(promotionDetails.getStartDate());
        promotion.setEndDate(promotionDetails.getEndDate());
        promotion.setStatus(promotionDetails.getStatus());
        
        return promotionRepository.save(promotion);
    }
    
    public void deletePromotion(UUID promotionId) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + promotionId));
        promotionRepository.delete(promotion);
    }
    
    public Promotion updatePromotionStatus(UUID promotionId, String status) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + promotionId));
        promotion.setStatus(status);
        return promotionRepository.save(promotion);
    }
}

