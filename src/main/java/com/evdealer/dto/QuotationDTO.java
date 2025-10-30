package com.evdealer.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class QuotationDTO {
    private UUID quotationId;
    private String quotationNumber;
    private UUID customerId;
    private UUID userId;
    private Integer variantId;
    private Integer colorId;
    private LocalDate quotationDate;
    private BigDecimal totalPrice;
    private BigDecimal finalPrice;
    private String status;

    public UUID getQuotationId() { return quotationId; }
    public void setQuotationId(UUID quotationId) { this.quotationId = quotationId; }
    public String getQuotationNumber() { return quotationNumber; }
    public void setQuotationNumber(String quotationNumber) { this.quotationNumber = quotationNumber; }
    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public Integer getVariantId() { return variantId; }
    public void setVariantId(Integer variantId) { this.variantId = variantId; }
    public Integer getColorId() { return colorId; }
    public void setColorId(Integer colorId) { this.colorId = colorId; }
    public LocalDate getQuotationDate() { return quotationDate; }
    public void setQuotationDate(LocalDate quotationDate) { this.quotationDate = quotationDate; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public BigDecimal getFinalPrice() { return finalPrice; }
    public void setFinalPrice(BigDecimal finalPrice) { this.finalPrice = finalPrice; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}


