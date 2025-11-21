package com.evdealer.dto;

import com.evdealer.enums.DealerStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Dealer request DTO for dealer management")
public class DealerRequest {
    
    @Schema(description = "Dealer code", example = "DL001", required = true)
    private String dealerCode;
    
    @Schema(description = "Dealer name", example = "Tesla Ho Chi Minh", required = true)
    private String dealerName;
    
    @Schema(description = "Dealer type", example = "authorized", allowableValues = {"authorized", "franchise", "distributor"})
    private String dealerType;
    
    @Schema(description = "Contact person", example = "John Smith")
    private String contactPerson;
    
    @Schema(description = "Email", example = "contact@tesla-hcm.com")
    private String email;
    
    @Schema(description = "Phone", example = "0123456789")
    private String phone;
    
    @Schema(description = "Address", example = "123 Nguyen Hue, District 1")
    private String address;
    
    @Schema(description = "City", example = "Ho Chi Minh City")
    private String city;
    
    @Schema(description = "Province", example = "Ho Chi Minh")
    private String province;
    
    @Schema(description = "Postal code", example = "700000")
    private String postalCode;
    
    @Schema(description = "License number", example = "LIC123456")
    private String licenseNumber;
    
    @Schema(description = "Tax code", example = "TAX123456")
    private String taxCode;
    
    @Schema(description = "Commission rate", example = "5.5")
    private BigDecimal commissionRate;
    
    @Schema(description = "Status", example = "ACTIVE", allowableValues = {"ACTIVE", "INACTIVE", "SUSPENDED", "TERMINATED"})
    private DealerStatus status;
    
    @Schema(description = "Contract start date", example = "2025-01-01")
    private LocalDate contractStartDate;
    
    @Schema(description = "Contract end date", example = "2025-12-31")
    private LocalDate contractEndDate;
    
    @Schema(description = "Monthly sales target", example = "1000000000")
    private BigDecimal monthlySalesTarget;
    
    @Schema(description = "Yearly sales target", example = "12000000000")
    private BigDecimal yearlySalesTarget;
    
    @Schema(description = "Notes", example = "Premium dealer with excellent service")
    private String notes;
    
    // Constructors
    public DealerRequest() {}
    
    public DealerRequest(String dealerCode, String dealerName, String dealerType) {
        this.dealerCode = dealerCode;
        this.dealerName = dealerName;
        this.dealerType = dealerType;
    }
    
    // Getters and Setters
    public String getDealerCode() {
        return dealerCode;
    }
    
    public void setDealerCode(String dealerCode) {
        this.dealerCode = dealerCode;
    }
    
    public String getDealerName() {
        return dealerName;
    }
    
    public void setDealerName(String dealerName) {
        this.dealerName = dealerName;
    }
    
    public String getDealerType() {
        return dealerType;
    }
    
    public void setDealerType(String dealerType) {
        this.dealerType = dealerType;
    }
    
    public String getContactPerson() {
        return contactPerson;
    }
    
    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getProvince() {
        return province;
    }
    
    public void setProvince(String province) {
        this.province = province;
    }
    
    public String getPostalCode() {
        return postalCode;
    }
    
    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }
    
    public String getLicenseNumber() {
        return licenseNumber;
    }
    
    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }
    
    public String getTaxCode() {
        return taxCode;
    }
    
    public void setTaxCode(String taxCode) {
        this.taxCode = taxCode;
    }
    
    public BigDecimal getCommissionRate() {
        return commissionRate;
    }
    
    public void setCommissionRate(BigDecimal commissionRate) {
        this.commissionRate = commissionRate;
    }
    
    public DealerStatus getStatus() {
        return status;
    }
    
    public void setStatus(DealerStatus status) {
        this.status = status;
    }
    
    public LocalDate getContractStartDate() {
        return contractStartDate;
    }
    
    public void setContractStartDate(LocalDate contractStartDate) {
        this.contractStartDate = contractStartDate;
    }
    
    public LocalDate getContractEndDate() {
        return contractEndDate;
    }
    
    public void setContractEndDate(LocalDate contractEndDate) {
        this.contractEndDate = contractEndDate;
    }
    
    public BigDecimal getMonthlySalesTarget() {
        return monthlySalesTarget;
    }
    
    public void setMonthlySalesTarget(BigDecimal monthlySalesTarget) {
        this.monthlySalesTarget = monthlySalesTarget;
    }
    
    public BigDecimal getYearlySalesTarget() {
        return yearlySalesTarget;
    }
    
    public void setYearlySalesTarget(BigDecimal yearlySalesTarget) {
        this.yearlySalesTarget = yearlySalesTarget;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}
