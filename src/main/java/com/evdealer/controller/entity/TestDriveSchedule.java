package com.evdealer.controller.entity;

import com.evdealer.entity.Customer;
import com.evdealer.entity.VehicleVariant;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "test_drive_schedules")
public class TestDriveSchedule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "schedule_id")
    private UUID scheduleId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = true)
    private Customer customer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = true)
    private VehicleVariant variant;
    
    @Column(name = "preferred_date", nullable = false)
    private LocalDate preferredDate;
    
    @Column(name = "preferred_time", nullable = false)
    private LocalTime preferredTime;
    
    @Column(name = "status", length = 50, nullable = false)
    private String status = "pending";
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public TestDriveSchedule() {}
    
    public TestDriveSchedule(Customer customer, VehicleVariant variant, LocalDate preferredDate, LocalTime preferredTime) {
        this.customer = customer;
        this.variant = variant;
        this.preferredDate = preferredDate;
        this.preferredTime = preferredTime;
    }
    
    // Getters and Setters
    public UUID getScheduleId() {
        return scheduleId;
    }
    
    public void setScheduleId(UUID scheduleId) {
        this.scheduleId = scheduleId;
    }
    
    public Customer getCustomer() {
        return customer;
    }
    
    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
    
    public VehicleVariant getVariant() {
        return variant;
    }
    
    public void setVariant(VehicleVariant variant) {
        this.variant = variant;
    }
    
    public LocalDate getPreferredDate() {
        return preferredDate;
    }
    
    public void setPreferredDate(LocalDate preferredDate) {
        this.preferredDate = preferredDate;
    }
    
    public LocalTime getPreferredTime() {
        return preferredTime;
    }
    
    public void setPreferredTime(LocalTime preferredTime) {
        this.preferredTime = preferredTime;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TestDriveSchedule that = (TestDriveSchedule) o;
        return java.util.Objects.equals(scheduleId, that.scheduleId);
    }

    @Override
    public int hashCode() {
        return scheduleId != null ? scheduleId.hashCode() : 0;
    }
}

