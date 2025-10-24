package com.evdealer.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "customer_debt_report")
@Immutable
public class CustomerDebtReport {
    
    @Id
    @Column(name = "customer_id")
    private UUID customerId;
    
    @Column(name = "customer_name")
    private String customerName;
    
    @Column(name = "email")
    private String email;
    
    @Column(name = "phone")
    private String phone;
    
    @Column(name = "total_orders")
    private Long totalOrders;
    
    @Column(name = "total_purchases")
    private BigDecimal totalPurchases;
    
    @Column(name = "outstanding_balance")
    private BigDecimal outstandingBalance;
    
    @Column(name = "active_installments")
    private Long activeInstallments;
    
    @Column(name = "total_loan_amount")
    private BigDecimal totalLoanAmount;
    
    @Column(name = "last_order_date")
    private LocalDate lastOrderDate;
    
    // Constructors
    public CustomerDebtReport() {}
    
    // Getters and Setters
    public UUID getCustomerId() {
        return customerId;
    }
    
    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }
    
    public String getCustomerName() {
        return customerName;
    }
    
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
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
    
    public Long getTotalOrders() {
        return totalOrders;
    }
    
    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }
    
    public BigDecimal getTotalPurchases() {
        return totalPurchases;
    }
    
    public void setTotalPurchases(BigDecimal totalPurchases) {
        this.totalPurchases = totalPurchases;
    }
    
    public BigDecimal getOutstandingBalance() {
        return outstandingBalance;
    }
    
    public void setOutstandingBalance(BigDecimal outstandingBalance) {
        this.outstandingBalance = outstandingBalance;
    }
    
    public Long getActiveInstallments() {
        return activeInstallments;
    }
    
    public void setActiveInstallments(Long activeInstallments) {
        this.activeInstallments = activeInstallments;
    }
    
    public BigDecimal getTotalLoanAmount() {
        return totalLoanAmount;
    }
    
    public void setTotalLoanAmount(BigDecimal totalLoanAmount) {
        this.totalLoanAmount = totalLoanAmount;
    }
    
    public LocalDate getLastOrderDate() {
        return lastOrderDate;
    }
    
    public void setLastOrderDate(LocalDate lastOrderDate) {
        this.lastOrderDate = lastOrderDate;
    }
}
