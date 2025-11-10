package com.evdealer.controller.entity;

import com.evdealer.entity.Customer;
import com.evdealer.entity.Order;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "customer_feedbacks")
public class CustomerFeedback {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "feedback_id")
    private UUID feedbackId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = true)
    private Customer customer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = true)
    private com.evdealer.entity.Order order;
    
    @Column(name = "rating", nullable = false)
    private Integer rating;
    
    @Column(name = "feedback_type", length = 50, nullable = false)
    private String feedbackType = "general";
    
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "response", columnDefinition = "TEXT")
    private String response;
    
    @Column(name = "status", length = 50, nullable = false)
    private String status = "open";
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public CustomerFeedback() {}
    
    public CustomerFeedback(Customer customer, Integer rating, String message) {
        this.customer = customer;
        this.rating = rating;
        this.message = message;
    }
    
    // Getters and Setters
    public UUID getFeedbackId() {
        return feedbackId;
    }
    
    public void setFeedbackId(UUID feedbackId) {
        this.feedbackId = feedbackId;
    }
    
    public Customer getCustomer() {
        return customer;
    }
    
    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
    
    public com.evdealer.entity.Order getOrder() {
        return order;
    }
    
    public void setOrder(Order order) {
        this.order = order;
    }
    
    public Integer getRating() {
        return rating;
    }
    
    public void setRating(Integer rating) {
        this.rating = rating;
    }
    
    public String getFeedbackType() {
        return feedbackType;
    }
    
    public void setFeedbackType(String feedbackType) {
        this.feedbackType = feedbackType;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getResponse() {
        return response;
    }
    
    public void setResponse(String response) {
        this.response = response;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
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

