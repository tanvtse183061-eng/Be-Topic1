package com.evdealer.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Customer feedback request DTO for public submission")
public class CustomerFeedbackRequest {
    
    @Schema(description = "Customer ID", example = "78fe7eb0-ceb8-4793-a8af-187a3fe26f67")
    private UUID customerId;
    
    @Schema(description = "Rating (1-5)", example = "5", minimum = "1", maximum = "5")
    private Integer rating;
    
    @Schema(description = "Feedback comment", example = "Great service and excellent customer support!")
    private String comment;
    
    @Schema(description = "Feedback type", example = "service", allowableValues = {"service", "product", "delivery", "support", "general"})
    private String feedbackType;
    
    @Schema(description = "Order ID (if related to order)", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID orderId;
    
    @Schema(description = "Quotation ID (if related to quotation)", example = "e913b770-4755-4375-9744-ff97ff827c7a")
    private UUID quotationId;
    
    @Schema(description = "Is anonymous feedback", example = "false")
    private Boolean isAnonymous;
    
    @Schema(description = "Customer name (if anonymous)", example = "John D.")
    private String customerName;
    
    @Schema(description = "Customer email (if anonymous)", example = "john@example.com")
    private String customerEmail;
    
    @Schema(description = "Additional notes", example = "Would recommend to friends")
    private String notes;
    
    // Constructors
    public CustomerFeedbackRequest() {}
    
    public CustomerFeedbackRequest(UUID customerId, Integer rating, String comment) {
        this.customerId = customerId;
        this.rating = rating;
        this.comment = comment;
    }
    
    // Getters and Setters
    public UUID getCustomerId() {
        return customerId;
    }
    
    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }
    
    public Integer getRating() {
        return rating;
    }
    
    public void setRating(Integer rating) {
        this.rating = rating;
    }
    
    public String getComment() {
        return comment;
    }
    
    public void setComment(String comment) {
        this.comment = comment;
    }
    
    public String getFeedbackType() {
        return feedbackType;
    }
    
    public void setFeedbackType(String feedbackType) {
        this.feedbackType = feedbackType;
    }
    
    public UUID getOrderId() {
        return orderId;
    }
    
    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }
    
    public UUID getQuotationId() {
        return quotationId;
    }
    
    public void setQuotationId(UUID quotationId) {
        this.quotationId = quotationId;
    }
    
    public Boolean getIsAnonymous() {
        return isAnonymous;
    }
    
    public void setIsAnonymous(Boolean isAnonymous) {
        this.isAnonymous = isAnonymous;
    }
    
    public String getCustomerName() {
        return customerName;
    }
    
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
    
    public String getCustomerEmail() {
        return customerEmail;
    }
    
    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}
