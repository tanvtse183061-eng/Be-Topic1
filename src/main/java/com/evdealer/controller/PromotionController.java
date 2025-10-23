package com.evdealer.controller;

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
    public ResponseEntity<List<Promotion>> getAllPromotions() {
        List<Promotion> promotions = promotionService.getAllPromotions();
        return ResponseEntity.ok(promotions);
    }
    
    @GetMapping("/{promotionId}")
    public ResponseEntity<Promotion> getPromotionById(@PathVariable UUID promotionId) {
        return promotionService.getPromotionById(promotionId)
                .map(promotion -> ResponseEntity.ok(promotion))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/variant/{variantId}")
    public ResponseEntity<List<Promotion>> getPromotionsByVariant(@PathVariable Integer variantId) {
        List<Promotion> promotions = promotionService.getPromotionsByVariant(variantId);
        return ResponseEntity.ok(promotions);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Promotion>> getPromotionsByStatus(@PathVariable String status) {
        List<Promotion> promotions = promotionService.getPromotionsByStatus(status);
        return ResponseEntity.ok(promotions);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Promotion>> getActivePromotions() {
        List<Promotion> promotions = promotionService.getActivePromotions();
        return ResponseEntity.ok(promotions);
    }
    
    @GetMapping("/active/date/{date}")
    public ResponseEntity<List<Promotion>> getActivePromotionsByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Promotion> promotions = promotionService.getActivePromotionsByDate(date);
        return ResponseEntity.ok(promotions);
    }
    
    @GetMapping("/active/variant/{variantId}")
    public ResponseEntity<List<Promotion>> getActivePromotionsByVariant(@PathVariable Integer variantId) {
        List<Promotion> promotions = promotionService.getActivePromotionsByVariant(variantId);
        return ResponseEntity.ok(promotions);
    }
    
    @GetMapping("/active/variant/{variantId}/date/{date}")
    public ResponseEntity<List<Promotion>> getActivePromotionsByVariantAndDate(
            @PathVariable Integer variantId, 
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Promotion> promotions = promotionService.getActivePromotionsByVariantAndDate(variantId, date);
        return ResponseEntity.ok(promotions);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Promotion>> getPromotionsByTitle(@RequestParam String title) {
        List<Promotion> promotions = promotionService.getPromotionsByTitle(title);
        return ResponseEntity.ok(promotions);
    }
    
    @PostMapping
    public ResponseEntity<Promotion> createPromotion(@RequestBody Promotion promotion) {
        try {
            Promotion createdPromotion = promotionService.createPromotion(promotion);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPromotion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{promotionId}")
    public ResponseEntity<Promotion> updatePromotion(@PathVariable UUID promotionId, @RequestBody Promotion promotionDetails) {
        try {
            Promotion updatedPromotion = promotionService.updatePromotion(promotionId, promotionDetails);
            return ResponseEntity.ok(updatedPromotion);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{promotionId}/status")
    public ResponseEntity<Promotion> updatePromotionStatus(@PathVariable UUID promotionId, @RequestParam String status) {
        try {
            Promotion updatedPromotion = promotionService.updatePromotionStatus(promotionId, status);
            return ResponseEntity.ok(updatedPromotion);
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
}

