package com.evdealer.repository;

import com.evdealer.entity.CustomerDebtReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface CustomerDebtReportRepository extends JpaRepository<CustomerDebtReport, UUID> {
    
    @Query("SELECT c FROM CustomerDebtReport c WHERE c.outstandingBalance > 0")
    List<CustomerDebtReport> findCustomersWithDebt();
    
    @Query("SELECT c FROM CustomerDebtReport c WHERE c.outstandingBalance >= :minDebt")
    List<CustomerDebtReport> findByMinDebt(@Param("minDebt") BigDecimal minDebt);
    
    @Query("SELECT c FROM CustomerDebtReport c WHERE c.activeInstallments > 0")
    List<CustomerDebtReport> findCustomersWithActiveInstallments();
    
    @Query("SELECT c FROM CustomerDebtReport c ORDER BY c.outstandingBalance DESC")
    List<CustomerDebtReport> findAllOrderByOutstandingBalanceDesc();
}
