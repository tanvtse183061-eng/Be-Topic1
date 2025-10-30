package com.evdealer.dto;

public class InventoryTurnoverReportDTO {
    private int totalInventory;
    private long availableCount;
    private long soldCount;
    private long reservedCount;
    private double turnoverRate;

    public int getTotalInventory() { return totalInventory; }
    public void setTotalInventory(int totalInventory) { this.totalInventory = totalInventory; }
    public long getAvailableCount() { return availableCount; }
    public void setAvailableCount(long availableCount) { this.availableCount = availableCount; }
    public long getSoldCount() { return soldCount; }
    public void setSoldCount(long soldCount) { this.soldCount = soldCount; }
    public long getReservedCount() { return reservedCount; }
    public void setReservedCount(long reservedCount) { this.reservedCount = reservedCount; }
    public double getTurnoverRate() { return turnoverRate; }
    public void setTurnoverRate(double turnoverRate) { this.turnoverRate = turnoverRate; }
}


