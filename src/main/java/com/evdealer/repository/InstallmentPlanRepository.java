package com.evdealer.repository;

import com.evdealer.entity.InstallmentPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InstallmentPlanRepository extends JpaRepository<InstallmentPlan, UUID> {
    
    @Query("SELECT ip FROM InstallmentPlan ip")
    List<InstallmentPlan> findAllWithDetails();
    
    Optional<InstallmentPlan> findByContractNumber(String contractNumber);
    
    boolean existsByContractNumber(String contractNumber);
    
    List<InstallmentPlan> findByPlanStatus(String planStatus);
    
    @Query("SELECT ip FROM InstallmentPlan ip WHERE ip.customer.customerId = :customerId")
    List<InstallmentPlan> findByCustomerCustomerId(@Param("customerId") UUID customerId);
    
    @Query("SELECT ip FROM InstallmentPlan ip WHERE ip.order.orderId = :orderId")
    List<InstallmentPlan> findByOrderOrderId(@Param("orderId") UUID orderId);
    
    List<InstallmentPlan> findByFinanceCompany(String financeCompany);
    
    @Query("SELECT ip FROM InstallmentPlan ip WHERE ip.invoice.invoiceId = :invoiceId")
    List<InstallmentPlan> findByInvoiceInvoiceId(@Param("invoiceId") UUID invoiceId);
    
    @Query("SELECT ip FROM InstallmentPlan ip WHERE ip.dealer.dealerId = :dealerId")
    List<InstallmentPlan> findByDealerDealerId(@Param("dealerId") UUID dealerId);
    
    List<InstallmentPlan> findByPlanType(String planType);
}