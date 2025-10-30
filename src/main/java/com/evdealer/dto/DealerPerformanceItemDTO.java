package com.evdealer.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class DealerPerformanceItemDTO {
    private UUID dealerId;
    private String dealerName;
    private Integer targetYear;
    private BigDecimal targetRevenue;
    private BigDecimal actualSales;
    private double achievementRate;

    public UUID getDealerId() { return dealerId; }
    public void setDealerId(UUID dealerId) { this.dealerId = dealerId; }
    public String getDealerName() { return dealerName; }
    public void setDealerName(String dealerName) { this.dealerName = dealerName; }
    public Integer getTargetYear() { return targetYear; }
    public void setTargetYear(Integer targetYear) { this.targetYear = targetYear; }
    public BigDecimal getTargetRevenue() { return targetRevenue; }
    public void setTargetRevenue(BigDecimal targetRevenue) { this.targetRevenue = targetRevenue; }
    public BigDecimal getActualSales() { return actualSales; }
    public void setActualSales(BigDecimal actualSales) { this.actualSales = actualSales; }
    public double getAchievementRate() { return achievementRate; }
    public void setAchievementRate(double achievementRate) { this.achievementRate = achievementRate; }
}


