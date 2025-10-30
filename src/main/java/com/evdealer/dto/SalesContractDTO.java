package com.evdealer.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class SalesContractDTO {
    private UUID contractId;
    private String contractNumber;
    private UUID orderId;
    private UUID customerId;
    private UUID userId;
    private LocalDate contractDate;
    private LocalDate deliveryDate;
    private BigDecimal contractValue;
    private String contractStatus;

    public UUID getContractId() { return contractId; }
    public void setContractId(UUID contractId) { this.contractId = contractId; }
    public String getContractNumber() { return contractNumber; }
    public void setContractNumber(String contractNumber) { this.contractNumber = contractNumber; }
    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }
    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public LocalDate getContractDate() { return contractDate; }
    public void setContractDate(LocalDate contractDate) { this.contractDate = contractDate; }
    public LocalDate getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDate deliveryDate) { this.deliveryDate = deliveryDate; }
    public BigDecimal getContractValue() { return contractValue; }
    public void setContractValue(BigDecimal contractValue) { this.contractValue = contractValue; }
    public String getContractStatus() { return contractStatus; }
    public void setContractStatus(String contractStatus) { this.contractStatus = contractStatus; }
}


