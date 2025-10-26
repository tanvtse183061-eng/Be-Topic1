package com.evdealer.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Vehicle comparison request DTO")
public class VehicleComparisonRequest {
    
    @Schema(description = "List of vehicle variant IDs to compare", example = "[1, 2, 3]", required = true)
    private List<Integer> variantIds;
    
    @Schema(description = "Comparison criteria", example = "[\"price\", \"range\", \"power\", \"acceleration\"]")
    private List<String> comparisonCriteria;
    
    @Schema(description = "Include detailed specifications", example = "true")
    private Boolean includeDetails = true;
    
    @Schema(description = "Include pricing information", example = "true")
    private Boolean includePricing = true;
    
    @Schema(description = "Include availability status", example = "true")
    private Boolean includeAvailability = true;
    
    // Constructors
    public VehicleComparisonRequest() {}
    
    public VehicleComparisonRequest(List<Integer> variantIds) {
        this.variantIds = variantIds;
    }
    
    public VehicleComparisonRequest(List<Integer> variantIds, List<String> comparisonCriteria) {
        this.variantIds = variantIds;
        this.comparisonCriteria = comparisonCriteria;
    }
    
    // Getters and Setters
    public List<Integer> getVariantIds() {
        return variantIds;
    }
    
    public void setVariantIds(List<Integer> variantIds) {
        this.variantIds = variantIds;
    }
    
    public List<String> getComparisonCriteria() {
        return comparisonCriteria;
    }
    
    public void setComparisonCriteria(List<String> comparisonCriteria) {
        this.comparisonCriteria = comparisonCriteria;
    }
    
    public Boolean getIncludeDetails() {
        return includeDetails;
    }
    
    public void setIncludeDetails(Boolean includeDetails) {
        this.includeDetails = includeDetails;
    }
    
    public Boolean getIncludePricing() {
        return includePricing;
    }
    
    public void setIncludePricing(Boolean includePricing) {
        this.includePricing = includePricing;
    }
    
    public Boolean getIncludeAvailability() {
        return includeAvailability;
    }
    
    public void setIncludeAvailability(Boolean includeAvailability) {
        this.includeAvailability = includeAvailability;
    }
}
