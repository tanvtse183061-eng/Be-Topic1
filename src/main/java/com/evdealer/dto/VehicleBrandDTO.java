package com.evdealer.dto;

public class VehicleBrandDTO {
    private Integer brandId;
    private String brandName;
    private String country;
    private Integer foundedYear;
    private String brandLogoUrl;
    private String brandLogoPath;

    public Integer getBrandId() { return brandId; }
    public void setBrandId(Integer brandId) { this.brandId = brandId; }
    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public Integer getFoundedYear() { return foundedYear; }
    public void setFoundedYear(Integer foundedYear) { this.foundedYear = foundedYear; }
    public String getBrandLogoUrl() { return brandLogoUrl; }
    public void setBrandLogoUrl(String brandLogoUrl) { this.brandLogoUrl = brandLogoUrl; }
    public String getBrandLogoPath() { return brandLogoPath; }
    public void setBrandLogoPath(String brandLogoPath) { this.brandLogoPath = brandLogoPath; }
}


