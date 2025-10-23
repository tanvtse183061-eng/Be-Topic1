package com.evdealer.repository;

import com.evdealer.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    
    @Query("SELECT o FROM Order o")
    List<Order> findAllWithDetails();
    
    Optional<Order> findByOrderNumber(String orderNumber);
    
    @Query("SELECT o FROM Order o WHERE o.customer.customerId = :customerId")
    List<Order> findByCustomerCustomerId(@Param("customerId") UUID customerId);
    
    
    List<Order> findByStatus(String status);
    
    @Query("SELECT o FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate")
    List<Order> findByOrderDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT o FROM Order o WHERE o.customer.customerId = :customerId AND o.status = :status")
    List<Order> findByCustomerAndStatus(@Param("customerId") UUID customerId, @Param("status") String status);
    
    @Query("SELECT o FROM Order o WHERE o.user.userId = :userId")
    List<Order> findByUserId(@Param("userId") UUID userId);
    
    boolean existsByOrderNumber(String orderNumber);
}
