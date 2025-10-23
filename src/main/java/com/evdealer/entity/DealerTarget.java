package com.evdealer.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "dealer_targets")
public class DealerTarget {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "target_id")
    private UUID targetId;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dealer_id", nullable = true)
    private Dealer dealer;
    
    @Column(name = "target_year", nullable = false)
    private Integer targetYear;
    
    @Column(name = "target_month")
    private Integer targetMonth;
    
    @Column(name = "target_type", nullable = false, length = 50)
    private String targetType;
    
    @Column(name = "target_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal targetAmount;
    
    @Column(name = "target_quantity")
    private Integer targetQuantity;
    
    @Column(name = "achieved_amount", precision = 15, scale = 2)
    private BigDecimal achievedAmount = BigDecimal.ZERO;
    
    @Column(name = "achieved_quantity")
    private Integer achievedQuantity = 0;
    
    @Column(name = "achievement_rate", precision = 5, scale = 2)
    private BigDecimal achievementRate;
    
    @Column(name = "target_status", length = 50, nullable = false)
    private String targetStatus = "active";
    
    @Column(name = "target_scope", length = 50, nullable = false)
    private String targetScope = "dealer";
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public DealerTarget() {}
    
    public DealerTarget(Integer targetYear, String targetType, BigDecimal targetAmount) {
        this.targetYear = targetYear;
        this.targetType = targetType;
        this.targetAmount = targetAmount;
    }
    
    // Getters and Setters
    public UUID getTargetId() {
        return targetId;
    }
    
    public void setTargetId(UUID targetId) {
        this.targetId = targetId;
    }
    
    public Dealer getDealer() {
        return dealer;
    }
    
    public void setDealer(Dealer dealer) {
        this.dealer = dealer;
    }
    
    public Integer getTargetYear() {
        return targetYear;
    }
    
    public void setTargetYear(Integer targetYear) {
        this.targetYear = targetYear;
    }
    
    public Integer getTargetMonth() {
        return targetMonth;
    }
    
    public void setTargetMonth(Integer targetMonth) {
        this.targetMonth = targetMonth;
    }
    
    public String getTargetType() {
        return targetType;
    }
    
    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }
    
    public BigDecimal getTargetAmount() {
        return targetAmount;
    }
    
    public void setTargetAmount(BigDecimal targetAmount) {
        this.targetAmount = targetAmount;
    }
    
    public Integer getTargetQuantity() {
        return targetQuantity;
    }
    
    public void setTargetQuantity(Integer targetQuantity) {
        this.targetQuantity = targetQuantity;
    }
    
    public BigDecimal getAchievedAmount() {
        return achievedAmount;
    }
    
    public void setAchievedAmount(BigDecimal achievedAmount) {
        this.achievedAmount = achievedAmount;
    }
    
    public Integer getAchievedQuantity() {
        return achievedQuantity;
    }
    
    public void setAchievedQuantity(Integer achievedQuantity) {
        this.achievedQuantity = achievedQuantity;
    }
    
    public BigDecimal getAchievementRate() {
        return achievementRate;
    }
    
    public void setAchievementRate(BigDecimal achievementRate) {
        this.achievementRate = achievementRate;
    }
    
    public String getTargetStatus() {
        return targetStatus;
    }
    
    public void setTargetStatus(String targetStatus) {
        this.targetStatus = targetStatus;
    }
    
    public String getTargetScope() {
        return targetScope;
    }
    
    public void setTargetScope(String targetScope) {
        this.targetScope = targetScope;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
