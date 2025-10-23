package com.evdealer.controller;

import com.evdealer.entity.DealerTarget;
import com.evdealer.service.DealerTargetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dealer-targets")
@CrossOrigin(origins = "*")
@Tag(name = "Dealer Target Management", description = "APIs quản lý mục tiêu đại lý")
public class DealerTargetController {
    
    @Autowired
    private DealerTargetService dealerTargetService;
    
    @GetMapping
    @Operation(summary = "Lấy danh sách mục tiêu", description = "Lấy tất cả mục tiêu đại lý")
    public ResponseEntity<List<DealerTarget>> getAllTargets() {
        List<DealerTarget> targets = dealerTargetService.getAllTargets();
        return ResponseEntity.ok(targets);
    }
    
    @GetMapping("/{targetId}")
    @Operation(summary = "Lấy mục tiêu theo ID", description = "Lấy thông tin mục tiêu theo ID")
    public ResponseEntity<DealerTarget> getTargetById(@PathVariable UUID targetId) {
        return dealerTargetService.getTargetById(targetId)
                .map(target -> ResponseEntity.ok(target))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/year/{targetYear}")
    public ResponseEntity<List<DealerTarget>> getTargetsByYear(@PathVariable Integer targetYear) {
        List<DealerTarget> targets = dealerTargetService.getTargetsByYear(targetYear);
        return ResponseEntity.ok(targets);
    }
    
    @GetMapping("/month/{targetMonth}")
    public ResponseEntity<List<DealerTarget>> getTargetsByMonth(@PathVariable Integer targetMonth) {
        List<DealerTarget> targets = dealerTargetService.getTargetsByMonth(targetMonth);
        return ResponseEntity.ok(targets);
    }
    
    @GetMapping("/type/{targetType}")
    public ResponseEntity<List<DealerTarget>> getTargetsByType(@PathVariable String targetType) {
        List<DealerTarget> targets = dealerTargetService.getTargetsByType(targetType);
        return ResponseEntity.ok(targets);
    }
    
    @GetMapping("/status/{targetStatus}")
    public ResponseEntity<List<DealerTarget>> getTargetsByStatus(@PathVariable String targetStatus) {
        List<DealerTarget> targets = dealerTargetService.getTargetsByStatus(targetStatus);
        return ResponseEntity.ok(targets);
    }
    
    @GetMapping("/dealer/{dealerId}")
    @Operation(summary = "Lấy mục tiêu theo đại lý", description = "Lấy tất cả mục tiêu của một đại lý cụ thể")
    public ResponseEntity<List<DealerTarget>> getTargetsByDealer(@PathVariable UUID dealerId) {
        List<DealerTarget> targets = dealerTargetService.getTargetsByDealer(dealerId);
        return ResponseEntity.ok(targets);
    }
    
    @GetMapping("/scope/{targetScope}")
    @Operation(summary = "Lấy mục tiêu theo phạm vi", description = "Lấy mục tiêu theo phạm vi (dealer, global)")
    public ResponseEntity<List<DealerTarget>> getTargetsByScope(@PathVariable String targetScope) {
        List<DealerTarget> targets = dealerTargetService.getTargetsByScope(targetScope);
        return ResponseEntity.ok(targets);
    }
    
    @GetMapping("/dealer-specific")
    @Operation(summary = "Lấy mục tiêu đại lý cụ thể", description = "Lấy tất cả mục tiêu dành riêng cho đại lý")
    public ResponseEntity<List<DealerTarget>> getDealerSpecificTargets() {
        List<DealerTarget> targets = dealerTargetService.getTargetsByScope("dealer");
        return ResponseEntity.ok(targets);
    }
    
    @GetMapping("/dealer/{dealerId}/year/{targetYear}")
    @Operation(summary = "Lấy mục tiêu đại lý theo năm", description = "Lấy mục tiêu của đại lý trong một năm cụ thể")
    public ResponseEntity<List<DealerTarget>> getTargetsByDealerAndYear(@PathVariable UUID dealerId, @PathVariable Integer targetYear) {
        List<DealerTarget> targets = dealerTargetService.getTargetsByDealerAndYear(dealerId, targetYear);
        return ResponseEntity.ok(targets);
    }
    
    @GetMapping("/year/{targetYear}/month/{targetMonth}")
    public ResponseEntity<List<DealerTarget>> getTargetsByYearAndMonth(@PathVariable Integer targetYear, @PathVariable Integer targetMonth) {
        List<DealerTarget> targets = dealerTargetService.getTargetsByYearAndMonth(targetYear, targetMonth);
        return ResponseEntity.ok(targets);
    }
    
    @GetMapping("/year/{targetYear}/type/{targetType}")
    public ResponseEntity<List<DealerTarget>> getTargetsByYearAndType(@PathVariable Integer targetYear, @PathVariable String targetType) {
        List<DealerTarget> targets = dealerTargetService.getTargetsByYearAndType(targetYear, targetType);
        return ResponseEntity.ok(targets);
    }
    
    @GetMapping("/achievement-rate/min/{minRate}")
    public ResponseEntity<List<DealerTarget>> getTargetsByAchievementRateGreaterThanEqual(@PathVariable Double minRate) {
        List<DealerTarget> targets = dealerTargetService.getTargetsByAchievementRateGreaterThanEqual(minRate);
        return ResponseEntity.ok(targets);
    }
    
    @GetMapping("/achievement-rate/max/{maxRate}")
    public ResponseEntity<List<DealerTarget>> getTargetsByAchievementRateLessThan(@PathVariable Double maxRate) {
        List<DealerTarget> targets = dealerTargetService.getTargetsByAchievementRateLessThan(maxRate);
        return ResponseEntity.ok(targets);
    }
    
    @PostMapping
    @Operation(summary = "Tạo mục tiêu mới", description = "Tạo mục tiêu đại lý mới")
    public ResponseEntity<DealerTarget> createTarget(@RequestBody DealerTarget target) {
        try {
            DealerTarget createdTarget = dealerTargetService.createTarget(target);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTarget);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{targetId}")
    @Operation(summary = "Cập nhật mục tiêu", description = "Cập nhật thông tin mục tiêu")
    public ResponseEntity<DealerTarget> updateTarget(@PathVariable UUID targetId, @RequestBody DealerTarget targetDetails) {
        try {
            DealerTarget updatedTarget = dealerTargetService.updateTarget(targetId, targetDetails);
            return ResponseEntity.ok(updatedTarget);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{targetId}/status")
    public ResponseEntity<DealerTarget> updateTargetStatus(@PathVariable UUID targetId, @RequestParam String status) {
        try {
            DealerTarget updatedTarget = dealerTargetService.updateTargetStatus(targetId, status);
            return ResponseEntity.ok(updatedTarget);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{targetId}/achievement")
    public ResponseEntity<DealerTarget> updateAchievement(@PathVariable UUID targetId, @RequestParam BigDecimal achievedAmount, @RequestParam Integer achievedQuantity) {
        try {
            DealerTarget updatedTarget = dealerTargetService.updateAchievement(targetId, achievedAmount, achievedQuantity);
            return ResponseEntity.ok(updatedTarget);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{targetId}")
    @Operation(summary = "Xóa mục tiêu", description = "Xóa mục tiêu")
    public ResponseEntity<Void> deleteTarget(@PathVariable UUID targetId) {
        try {
            dealerTargetService.deleteTarget(targetId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
