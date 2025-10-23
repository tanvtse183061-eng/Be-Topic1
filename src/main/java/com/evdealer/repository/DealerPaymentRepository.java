package com.evdealer.repository;

import com.evdealer.entity.DealerPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DealerPaymentRepository extends JpaRepository<DealerPayment, UUID> {
    
    @Query("SELECT dp FROM DealerPayment dp")
    List<DealerPayment> findAllWithDetails();
    
    Optional<DealerPayment> findByPaymentNumber(String paymentNumber);
    
    boolean existsByPaymentNumber(String paymentNumber);
    
    List<DealerPayment> findByStatus(String status);
    
    List<DealerPayment> findByInvoiceInvoiceId(UUID invoiceId);
    
    List<DealerPayment> findByPaymentDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<DealerPayment> findByPaymentType(String paymentType);
    
    List<DealerPayment> findByReferenceNumber(String referenceNumber);
}
