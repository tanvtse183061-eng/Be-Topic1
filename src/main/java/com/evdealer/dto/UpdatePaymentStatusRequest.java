package com.evdealer.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request DTO for updating payment status")
public class UpdatePaymentStatusRequest {
    
    @Schema(description = "Payment status", example = "completed", required = true)
    private String status;
    
    public UpdatePaymentStatusRequest() {}
    
    public UpdatePaymentStatusRequest(String status) {
        this.status = status;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}

