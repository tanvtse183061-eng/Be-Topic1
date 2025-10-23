package com.evdealer.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "dealers")
public class Dealer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "dealer_id")
    private UUID dealerId;
    
    @Column(name = "dealer_code", nullable = false, unique = true, length = 50)
    private String dealerCode;
    
    @Column(name = "dealer_name", nullable = false, length = 255)
    private String dealerName;
    
    @Column(name = "contact_person", length = 255)
    private String contactPerson;
    
    @Column(name = "email", length = 255)
    private String email;
    
    @Column(name = "phone", length = 20)
    private String phone;
    
    @Column(name = "address", columnDefinition = "TEXT")
    private String address;
    
    @Column(name = "city", length = 100)
    private String city;
    
    @Column(name = "province", length = 100)
    private String province;
    
    @Column(name = "postal_code", length = 20)
    private String postalCode;
    
    @Column(name = "dealer_type", length = 50, nullable = false)
    private String dealerType = "authorized";
    
    @Column(name = "license_number", length = 100)
    private String licenseNumber;
    
    @Column(name = "tax_code", length = 50)
    private String taxCode;
    
    @Column(name = "bank_account", length = 50)
    private String bankAccount;
    
    @Column(name = "bank_name", length = 255)
    private String bankName;
    
    @Column(name = "commission_rate", precision = 5, scale = 2)
    private java.math.BigDecimal commissionRate;
    
    @Column(name = "status", length = 50, nullable = false)
    private String status = "active";
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public Dealer() {}
    
    public Dealer(String dealerCode, String dealerName, String dealerType) {
        this.dealerCode = dealerCode;
        this.dealerName = dealerName;
        this.dealerType = dealerType;
    }
    
    // Getters and Setters
    public UUID getDealerId() {
        return dealerId;
    }
    
    public void setDealerId(UUID dealerId) {
        this.dealerId = dealerId;
    }
    
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
    
    public String getDealerType() {
        return dealerType;
    }
    
    public void setDealerType(String dealerType) {
        this.dealerType = dealerType;
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
    
    public String getBankAccount() {
        return bankAccount;
    }
    
    public void setBankAccount(String bankAccount) {
        this.bankAccount = bankAccount;
    }
    
    public String getBankName() {
        return bankName;
    }
    
    public void setBankName(String bankName) {
        this.bankName = bankName;
    }
    
    public java.math.BigDecimal getCommissionRate() {
        return commissionRate;
    }
    
    public void setCommissionRate(java.math.BigDecimal commissionRate) {
        this.commissionRate = commissionRate;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

