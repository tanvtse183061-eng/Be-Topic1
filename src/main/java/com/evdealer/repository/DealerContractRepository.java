package com.evdealer.repository;

import com.evdealer.entity.DealerContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DealerContractRepository extends JpaRepository<DealerContract, UUID> {
    
    Optional<DealerContract> findByContractNumber(String contractNumber);
    
    List<DealerContract> findByContractType(String contractType);
    
    List<DealerContract> findByContractStatus(String contractStatus);
    
    @Query("SELECT dc FROM DealerContract dc WHERE dc.startDate <= :date AND dc.endDate >= :date")
    List<DealerContract> findActiveContracts(@Param("date") LocalDate date);
    
    @Query("SELECT dc FROM DealerContract dc WHERE dc.startDate <= :date AND dc.endDate >= :date AND dc.contractStatus = 'active'")
    List<DealerContract> findActiveContractsByDate(@Param("date") LocalDate date);
    
    @Query("SELECT dc FROM DealerContract dc WHERE dc.contractType = :contractType AND dc.contractStatus = :status")
    List<DealerContract> findByContractTypeAndStatus(@Param("contractType") String contractType, @Param("status") String status);
    
    @Query("SELECT dc FROM DealerContract dc WHERE dc.territory LIKE %:territory%")
    List<DealerContract> findByTerritoryContaining(@Param("territory") String territory);
    
    boolean existsByContractNumber(String contractNumber);
}
