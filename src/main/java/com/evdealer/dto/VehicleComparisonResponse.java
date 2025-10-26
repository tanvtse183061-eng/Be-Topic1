package com.evdealer.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Vehicle comparison response DTO")
public class VehicleComparisonResponse {
    
    @Schema(description = "List of vehicles being compared")
    private List<VehicleComparisonItem> vehicles;
    
    @Schema(description = "Comparison summary")
    private ComparisonSummary summary;
    
    @Schema(description = "Comparison criteria used")
    private List<String> comparisonCriteria;
    
    @Schema(description = "Comparison timestamp")
    private String comparisonTimestamp;
    
    // Constructors
    public VehicleComparisonResponse() {}
    
    public VehicleComparisonResponse(List<VehicleComparisonItem> vehicles, ComparisonSummary summary) {
        this.vehicles = vehicles;
        this.summary = summary;
    }
    
    // Getters and Setters
    public List<VehicleComparisonItem> getVehicles() {
        return vehicles;
    }
    
    public void setVehicles(List<VehicleComparisonItem> vehicles) {
        this.vehicles = vehicles;
    }
    
    public ComparisonSummary getSummary() {
        return summary;
    }
    
    public void setSummary(ComparisonSummary summary) {
        this.summary = summary;
    }
    
    public List<String> getComparisonCriteria() {
        return comparisonCriteria;
    }
    
    public void setComparisonCriteria(List<String> comparisonCriteria) {
        this.comparisonCriteria = comparisonCriteria;
    }
    
    public String getComparisonTimestamp() {
        return comparisonTimestamp;
    }
    
    public void setComparisonTimestamp(String comparisonTimestamp) {
        this.comparisonTimestamp = comparisonTimestamp;
    }
    
    // Inner classes
    @Schema(description = "Individual vehicle comparison item")
    public static class VehicleComparisonItem {
        
        @Schema(description = "Vehicle variant ID")
        private Integer variantId;
        
        @Schema(description = "Vehicle variant name")
        private String variantName;
        
        @Schema(description = "Brand name")
        private String brandName;
        
        @Schema(description = "Model name")
        private String modelName;
        
        @Schema(description = "Base price")
        private BigDecimal basePrice;
        
        @Schema(description = "Battery capacity (kWh)")
        private BigDecimal batteryCapacity;
        
        @Schema(description = "Range (km)")
        private Integer rangeKm;
        
        @Schema(description = "Power (kW)")
        private BigDecimal powerKw;
        
        @Schema(description = "Acceleration 0-100 km/h (seconds)")
        private BigDecimal acceleration0100;
        
        @Schema(description = "Top speed (km/h)")
        private Integer topSpeed;
        
        @Schema(description = "Fast charging time (minutes)")
        private Integer chargingTimeFast;
        
        @Schema(description = "Slow charging time (minutes)")
        private Integer chargingTimeSlow;
        
        @Schema(description = "Variant image URL")
        private String variantImageUrl;
        
        @Schema(description = "Availability status")
        private String availabilityStatus;
        
        @Schema(description = "Available quantity")
        private Integer availableQuantity;
        
        @Schema(description = "Comparison score (0-100)")
        private Integer comparisonScore;
        
        @Schema(description = "Comparison rank")
        private Integer comparisonRank;
        
        // Constructors
        public VehicleComparisonItem() {}
        
        // Getters and Setters
        public Integer getVariantId() {
            return variantId;
        }
        
        public void setVariantId(Integer variantId) {
            this.variantId = variantId;
        }
        
        public String getVariantName() {
            return variantName;
        }
        
        public void setVariantName(String variantName) {
            this.variantName = variantName;
        }
        
        public String getBrandName() {
            return brandName;
        }
        
        public void setBrandName(String brandName) {
            this.brandName = brandName;
        }
        
        public String getModelName() {
            return modelName;
        }
        
        public void setModelName(String modelName) {
            this.modelName = modelName;
        }
        
        public BigDecimal getBasePrice() {
            return basePrice;
        }
        
        public void setBasePrice(BigDecimal basePrice) {
            this.basePrice = basePrice;
        }
        
        public BigDecimal getBatteryCapacity() {
            return batteryCapacity;
        }
        
        public void setBatteryCapacity(BigDecimal batteryCapacity) {
            this.batteryCapacity = batteryCapacity;
        }
        
        public Integer getRangeKm() {
            return rangeKm;
        }
        
        public void setRangeKm(Integer rangeKm) {
            this.rangeKm = rangeKm;
        }
        
        public BigDecimal getPowerKw() {
            return powerKw;
        }
        
        public void setPowerKw(BigDecimal powerKw) {
            this.powerKw = powerKw;
        }
        
        public BigDecimal getAcceleration0100() {
            return acceleration0100;
        }
        
        public void setAcceleration0100(BigDecimal acceleration0100) {
            this.acceleration0100 = acceleration0100;
        }
        
        public Integer getTopSpeed() {
            return topSpeed;
        }
        
        public void setTopSpeed(Integer topSpeed) {
            this.topSpeed = topSpeed;
        }
        
        public Integer getChargingTimeFast() {
            return chargingTimeFast;
        }
        
        public void setChargingTimeFast(Integer chargingTimeFast) {
            this.chargingTimeFast = chargingTimeFast;
        }
        
        public Integer getChargingTimeSlow() {
            return chargingTimeSlow;
        }
        
        public void setChargingTimeSlow(Integer chargingTimeSlow) {
            this.chargingTimeSlow = chargingTimeSlow;
        }
        
        public String getVariantImageUrl() {
            return variantImageUrl;
        }
        
        public void setVariantImageUrl(String variantImageUrl) {
            this.variantImageUrl = variantImageUrl;
        }
        
        public String getAvailabilityStatus() {
            return availabilityStatus;
        }
        
        public void setAvailabilityStatus(String availabilityStatus) {
            this.availabilityStatus = availabilityStatus;
        }
        
        public Integer getAvailableQuantity() {
            return availableQuantity;
        }
        
        public void setAvailableQuantity(Integer availableQuantity) {
            this.availableQuantity = availableQuantity;
        }
        
        public Integer getComparisonScore() {
            return comparisonScore;
        }
        
        public void setComparisonScore(Integer comparisonScore) {
            this.comparisonScore = comparisonScore;
        }
        
        public Integer getComparisonRank() {
            return comparisonRank;
        }
        
        public void setComparisonRank(Integer comparisonRank) {
            this.comparisonRank = comparisonRank;
        }
    }
    
    @Schema(description = "Comparison summary")
    public static class ComparisonSummary {
        
        @Schema(description = "Total vehicles compared")
        private Integer totalVehicles;
        
        @Schema(description = "Price range")
        private PriceRange priceRange;
        
        @Schema(description = "Range comparison")
        private RangeComparison rangeComparison;
        
        @Schema(description = "Power comparison")
        private PowerComparison powerComparison;
        
        @Schema(description = "Best value recommendation")
        private String bestValueRecommendation;
        
        @Schema(description = "Performance leader")
        private String performanceLeader;
        
        @Schema(description = "Range leader")
        private String rangeLeader;
        
        // Constructors
        public ComparisonSummary() {}
        
        // Getters and Setters
        public Integer getTotalVehicles() {
            return totalVehicles;
        }
        
        public void setTotalVehicles(Integer totalVehicles) {
            this.totalVehicles = totalVehicles;
        }
        
        public PriceRange getPriceRange() {
            return priceRange;
        }
        
        public void setPriceRange(PriceRange priceRange) {
            this.priceRange = priceRange;
        }
        
        public RangeComparison getRangeComparison() {
            return rangeComparison;
        }
        
        public void setRangeComparison(RangeComparison rangeComparison) {
            this.rangeComparison = rangeComparison;
        }
        
        public PowerComparison getPowerComparison() {
            return powerComparison;
        }
        
        public void setPowerComparison(PowerComparison powerComparison) {
            this.powerComparison = powerComparison;
        }
        
        public String getBestValueRecommendation() {
            return bestValueRecommendation;
        }
        
        public void setBestValueRecommendation(String bestValueRecommendation) {
            this.bestValueRecommendation = bestValueRecommendation;
        }
        
        public String getPerformanceLeader() {
            return performanceLeader;
        }
        
        public void setPerformanceLeader(String performanceLeader) {
            this.performanceLeader = performanceLeader;
        }
        
        public String getRangeLeader() {
            return rangeLeader;
        }
        
        public void setRangeLeader(String rangeLeader) {
            this.rangeLeader = rangeLeader;
        }
    }
    
    @Schema(description = "Price range information")
    public static class PriceRange {
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private BigDecimal averagePrice;
        
        // Constructors, getters and setters
        public PriceRange() {}
        
        public BigDecimal getMinPrice() {
            return minPrice;
        }
        
        public void setMinPrice(BigDecimal minPrice) {
            this.minPrice = minPrice;
        }
        
        public BigDecimal getMaxPrice() {
            return maxPrice;
        }
        
        public void setMaxPrice(BigDecimal maxPrice) {
            this.maxPrice = maxPrice;
        }
        
        public BigDecimal getAveragePrice() {
            return averagePrice;
        }
        
        public void setAveragePrice(BigDecimal averagePrice) {
            this.averagePrice = averagePrice;
        }
    }
    
    @Schema(description = "Range comparison information")
    public static class RangeComparison {
        private Integer minRange;
        private Integer maxRange;
        private Integer averageRange;
        
        // Constructors, getters and setters
        public RangeComparison() {}
        
        public Integer getMinRange() {
            return minRange;
        }
        
        public void setMinRange(Integer minRange) {
            this.minRange = minRange;
        }
        
        public Integer getMaxRange() {
            return maxRange;
        }
        
        public void setMaxRange(Integer maxRange) {
            this.maxRange = maxRange;
        }
        
        public Integer getAverageRange() {
            return averageRange;
        }
        
        public void setAverageRange(Integer averageRange) {
            this.averageRange = averageRange;
        }
    }
    
    @Schema(description = "Power comparison information")
    public static class PowerComparison {
        private BigDecimal minPower;
        private BigDecimal maxPower;
        private BigDecimal averagePower;
        
        // Constructors, getters and setters
        public PowerComparison() {}
        
        public BigDecimal getMinPower() {
            return minPower;
        }
        
        public void setMinPower(BigDecimal minPower) {
            this.minPower = minPower;
        }
        
        public BigDecimal getMaxPower() {
            return maxPower;
        }
        
        public void setMaxPower(BigDecimal maxPower) {
            this.maxPower = maxPower;
        }
        
        public BigDecimal getAveragePower() {
            return averagePower;
        }
        
        public void setAveragePower(BigDecimal averagePower) {
            this.averagePower = averagePower;
        }
    }
}
