package com.evdealer.repository;

import com.evdealer.entity.DealerInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DealerInvoiceRepository extends JpaRepository<DealerInvoice, UUID> {
    
    @Query("SELECT di FROM DealerInvoice di")
    List<DealerInvoice> findAllWithDetails();
    
    Optional<DealerInvoice> findByInvoiceNumber(String invoiceNumber);
    
    boolean existsByInvoiceNumber(String invoiceNumber);
    
    List<DealerInvoice> findByStatus(String status);
    
    @Query("SELECT di FROM DealerInvoice di WHERE di.dealerOrder.dealerOrderId = :dealerOrderId")
    List<DealerInvoice> findByDealerOrderDealerOrderId(@Param("dealerOrderId") UUID dealerOrderId);
    
    @Query("SELECT di FROM DealerInvoice di WHERE di.evmStaff.userId = :evmStaffId")
    List<DealerInvoice> findByEvmStaffUserId(@Param("evmStaffId") UUID evmStaffId);
    
    List<DealerInvoice> findByInvoiceDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT di FROM DealerInvoice di WHERE di.dueDate < :currentDate AND di.status IN ('issued', 'partially_paid')")
    List<DealerInvoice> findOverdueInvoices(@Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT di FROM DealerInvoice di WHERE di.dueDate < CURRENT_DATE AND di.status IN ('issued', 'partially_paid')")
    List<DealerInvoice> findOverdueInvoices();
    
    List<DealerInvoice> findByDueDateBetween(LocalDate startDate, LocalDate endDate);
}