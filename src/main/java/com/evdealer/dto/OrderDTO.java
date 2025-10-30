package com.evdealer.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class OrderDTO {
    private UUID orderId;
    private String orderNumber;
    private UUID customerId;
    private UUID userId;
    private UUID inventoryId;
    private LocalDate orderDate;
    private String status;
    private BigDecimal totalAmount;

    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public UUID getInventoryId() { return inventoryId; }
    public void setInventoryId(UUID inventoryId) { this.inventoryId = inventoryId; }
    public LocalDate getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
}


