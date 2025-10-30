package com.evdealer.dto;

import java.math.BigDecimal;

public class VehicleVariantDTO {
    private Integer variantId;
    private Integer modelId;
    private String variantName;
    private BigDecimal priceBase;
    private Integer rangeKm;

    public Integer getVariantId() { return variantId; }
    public void setVariantId(Integer variantId) { this.variantId = variantId; }
    public Integer getModelId() { return modelId; }
    public void setModelId(Integer modelId) { this.modelId = modelId; }
    public String getVariantName() { return variantName; }
    public void setVariantName(String variantName) { this.variantName = variantName; }
    public BigDecimal getPriceBase() { return priceBase; }
    public void setPriceBase(BigDecimal priceBase) { this.priceBase = priceBase; }
    public Integer getRangeKm() { return rangeKm; }
    public void setRangeKm(Integer rangeKm) { this.rangeKm = rangeKm; }
}


