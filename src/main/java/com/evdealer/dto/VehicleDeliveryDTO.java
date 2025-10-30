package com.evdealer.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class VehicleDeliveryDTO {
    private UUID deliveryId;
    private UUID orderId;
    private UUID inventoryId;
    private UUID customerId;
    private LocalDate deliveryDate;
    private String deliveryStatus;
    private String deliveryAddress;
    private String deliveryContactName;
    private String deliveryContactPhone;
    private UUID deliveredBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UUID getDeliveryId() { return deliveryId; }
    public void setDeliveryId(UUID deliveryId) { this.deliveryId = deliveryId; }
    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }
    public UUID getInventoryId() { return inventoryId; }
    public void setInventoryId(UUID inventoryId) { this.inventoryId = inventoryId; }
    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }
    public LocalDate getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDate deliveryDate) { this.deliveryDate = deliveryDate; }
    public String getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public String getDeliveryContactName() { return deliveryContactName; }
    public void setDeliveryContactName(String deliveryContactName) { this.deliveryContactName = deliveryContactName; }
    public String getDeliveryContactPhone() { return deliveryContactPhone; }
    public void setDeliveryContactPhone(String deliveryContactPhone) { this.deliveryContactPhone = deliveryContactPhone; }
    public UUID getDeliveredBy() { return deliveredBy; }
    public void setDeliveredBy(UUID deliveredBy) { this.deliveredBy = deliveredBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}


