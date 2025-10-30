package com.evdealer.dto;

import java.math.BigDecimal;

public class MonthlySalesSummaryDTO {
    private Integer year;
    private Integer month;
    private long totalOrders;
    private BigDecimal totalRevenue;

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
}


