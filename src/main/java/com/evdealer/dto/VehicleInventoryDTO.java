package com.evdealer.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class VehicleInventoryDTO {
    private UUID inventoryId;
    private Integer variantId;
    private Integer colorId;
    private UUID warehouseId;
    private String status;
    private String vin;
    private LocalDate arrivalDate;
    private BigDecimal sellingPrice;

    public UUID getInventoryId() { return inventoryId; }
    public void setInventoryId(UUID inventoryId) { this.inventoryId = inventoryId; }
    public Integer getVariantId() { return variantId; }
    public void setVariantId(Integer variantId) { this.variantId = variantId; }
    public Integer getColorId() { return colorId; }
    public void setColorId(Integer colorId) { this.colorId = colorId; }
    public UUID getWarehouseId() { return warehouseId; }
    public void setWarehouseId(UUID warehouseId) { this.warehouseId = warehouseId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getVin() { return vin; }
    public void setVin(String vin) { this.vin = vin; }
    public LocalDate getArrivalDate() { return arrivalDate; }
    public void setArrivalDate(LocalDate arrivalDate) { this.arrivalDate = arrivalDate; }
    public BigDecimal getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; }
}


