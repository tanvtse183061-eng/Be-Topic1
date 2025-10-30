package com.evdealer.controller;

import com.evdealer.dto.PromotionDTO;
import com.evdealer.entity.Promotion;
import com.evdealer.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "*")
public class PromotionController {
    
    @Autowired
    private PromotionService promotionService;
    
    @GetMapping
    public ResponseEntity<List<PromotionDTO>> getAllPromotions() {
        List<Promotion> promotions = promotionService.getAllPromotions();
        return ResponseEntity.ok(promotions.stream().map(this::toDTO).toList());
    }
    
    @GetMapping("/{promotionId}")
    public ResponseEntity<PromotionDTO> getPromotionById(@PathVariable UUID promotionId) {
        return promotionService.getPromotionById(promotionId)
                .map(promotion -> ResponseEntity.ok(toDTO(promotion)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/variant/{variantId}")
    public ResponseEntity<List<PromotionDTO>> getPromotionsByVariant(@PathVariable Integer variantId) {
        List<Promotion> promotions = promotionService.getPromotionsByVariant(variantId);
        return ResponseEntity.ok(promotions.stream().map(this::toDTO).toList());
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<PromotionDTO>> getPromotionsByStatus(@PathVariable String status) {
        List<Promotion> promotions = promotionService.getPromotionsByStatus(status);
        return ResponseEntity.ok(promotions.stream().map(this::toDTO).toList());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<PromotionDTO>> getActivePromotions() {
        List<Promotion> promotions = promotionService.getActivePromotions();
        return ResponseEntity.ok(promotions.stream().map(this::toDTO).toList());
    }
    
    @GetMapping("/active/date/{date}")
    public ResponseEntity<List<PromotionDTO>> getActivePromotionsByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Promotion> promotions = promotionService.getActivePromotionsByDate(date);
        return ResponseEntity.ok(promotions.stream().map(this::toDTO).toList());
    }
    
    @GetMapping("/active/variant/{variantId}")
    public ResponseEntity<List<PromotionDTO>> getActivePromotionsByVariant(@PathVariable Integer variantId) {
        List<Promotion> promotions = promotionService.getActivePromotionsByVariant(variantId);
        return ResponseEntity.ok(promotions.stream().map(this::toDTO).toList());
    }
    
    @GetMapping("/active/variant/{variantId}/date/{date}")
    public ResponseEntity<List<PromotionDTO>> getActivePromotionsByVariantAndDate(
            @PathVariable Integer variantId, 
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Promotion> promotions = promotionService.getActivePromotionsByVariantAndDate(variantId, date);
        return ResponseEntity.ok(promotions.stream().map(this::toDTO).toList());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<PromotionDTO>> getPromotionsByTitle(@RequestParam String title) {
        List<Promotion> promotions = promotionService.getPromotionsByTitle(title);
        return ResponseEntity.ok(promotions.stream().map(this::toDTO).toList());
    }
    
    @PostMapping
    public ResponseEntity<PromotionDTO> createPromotion(@RequestBody Promotion promotion) {
        try {
            Promotion createdPromotion = promotionService.createPromotion(promotion);
            return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(createdPromotion));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{promotionId}")
    public ResponseEntity<PromotionDTO> updatePromotion(@PathVariable UUID promotionId, @RequestBody Promotion promotionDetails) {
        try {
            Promotion updatedPromotion = promotionService.updatePromotion(promotionId, promotionDetails);
            return ResponseEntity.ok(toDTO(updatedPromotion));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{promotionId}/status")
    public ResponseEntity<PromotionDTO> updatePromotionStatus(@PathVariable UUID promotionId, @RequestParam String status) {
        try {
            Promotion updatedPromotion = promotionService.updatePromotionStatus(promotionId, status);
            return ResponseEntity.ok(toDTO(updatedPromotion));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{promotionId}")
    public ResponseEntity<Void> deletePromotion(@PathVariable UUID promotionId) {
        try {
            promotionService.deletePromotion(promotionId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private PromotionDTO toDTO(Promotion p) {
        PromotionDTO dto = new PromotionDTO();
        dto.setPromotionId(p.getPromotionId());
        dto.setVariantId(p.getVariant() != null ? p.getVariant().getVariantId() : null);
        dto.setTitle(p.getTitle());
        dto.setDiscountPercent(p.getDiscountPercent());
        dto.setDiscountAmount(p.getDiscountAmount());
        dto.setStartDate(p.getStartDate());
        dto.setEndDate(p.getEndDate());
        return dto;
    }
}

