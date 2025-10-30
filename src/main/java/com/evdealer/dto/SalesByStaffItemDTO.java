package com.evdealer.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class SalesByStaffItemDTO {
    private UUID staffId;
    private String staffName;
    private String role;
    private int totalOrders;
    private BigDecimal totalSales;

    public SalesByStaffItemDTO() {}

    public SalesByStaffItemDTO(UUID staffId, String staffName, String role, int totalOrders, BigDecimal totalSales) {
        this.staffId = staffId;
        this.staffName = staffName;
        this.role = role;
        this.totalOrders = totalOrders;
        this.totalSales = totalSales;
    }

    public UUID getStaffId() { return staffId; }
    public void setStaffId(UUID staffId) { this.staffId = staffId; }
    public String getStaffName() { return staffName; }
    public void setStaffName(String staffName) { this.staffName = staffName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public int getTotalOrders() { return totalOrders; }
    public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }
    public BigDecimal getTotalSales() { return totalSales; }
    public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }
}


