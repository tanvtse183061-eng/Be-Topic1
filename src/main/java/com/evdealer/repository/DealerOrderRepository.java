package com.evdealer.repository;

import com.evdealer.entity.DealerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DealerOrderRepository extends JpaRepository<DealerOrder, UUID> {
    
    @Query("SELECT do FROM DealerOrder do")
    List<DealerOrder> findAllWithDetails();
    
    Optional<DealerOrder> findByDealerOrderNumber(String dealerOrderNumber);
    
    @Query("SELECT do FROM DealerOrder do WHERE do.evmStaff.userId = :evmStaffId")
    List<DealerOrder> findByEvmStaffUserId(@Param("evmStaffId") UUID evmStaffId);
    
    List<DealerOrder> findByStatus(String status);
    
    @Query("SELECT do FROM DealerOrder do WHERE do.orderDate BETWEEN :startDate AND :endDate")
    List<DealerOrder> findByOrderDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT do FROM DealerOrder do WHERE do.evmStaff.userId = :evmStaffId AND do.status = :status")
    List<DealerOrder> findByEvmStaffAndStatus(@Param("evmStaffId") UUID evmStaffId, @Param("status") String status);
    
    boolean existsByDealerOrderNumber(String dealerOrderNumber);
}

