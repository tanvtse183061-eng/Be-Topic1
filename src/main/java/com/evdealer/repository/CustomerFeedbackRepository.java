package com.evdealer.repository;

import com.evdealer.entity.CustomerFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CustomerFeedbackRepository extends JpaRepository<CustomerFeedback, UUID> {
    
    @Query("SELECT cf FROM CustomerFeedback cf")
    List<CustomerFeedback> findAllWithDetails();
    
    @Query("SELECT cf FROM CustomerFeedback cf WHERE cf.customer.customerId = :customerId")
    List<CustomerFeedback> findByCustomerCustomerId(@Param("customerId") UUID customerId);
    
    @Query("SELECT cf FROM CustomerFeedback cf WHERE cf.order.orderId = :orderId")
    List<CustomerFeedback> findByOrderOrderId(@Param("orderId") UUID orderId);
    
    List<CustomerFeedback> findByStatus(String status);
    
    List<CustomerFeedback> findByRating(Integer rating);
    
    @Query("SELECT cf FROM CustomerFeedback cf WHERE cf.rating >= :minRating")
    List<CustomerFeedback> findByRatingGreaterThanEqual(@Param("minRating") Integer minRating);
    
    @Query("SELECT cf FROM CustomerFeedback cf WHERE cf.feedbackType = :feedbackType")
    List<CustomerFeedback> findByFeedbackType(@Param("feedbackType") String feedbackType);
    
    @Query("SELECT cf FROM CustomerFeedback cf WHERE cf.customer.customerId = :customerId AND cf.status = :status")
    List<CustomerFeedback> findByCustomerAndStatus(@Param("customerId") UUID customerId, @Param("status") String status);
}

