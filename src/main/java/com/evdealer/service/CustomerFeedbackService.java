package com.evdealer.service;

import com.evdealer.entity.CustomerFeedback;
import com.evdealer.repository.CustomerFeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CustomerFeedbackService {
    
    @Autowired
    private CustomerFeedbackRepository customerFeedbackRepository;
    
    public List<CustomerFeedback> getAllFeedbacks() {
        try {
            return customerFeedbackRepository.findAll();
        } catch (Exception e) {
            // Return empty list if there's an issue
            return new java.util.ArrayList<>();
        }
    }
    
    public Optional<CustomerFeedback> getFeedbackById(UUID feedbackId) {
        return customerFeedbackRepository.findById(feedbackId);
    }
    
    public List<CustomerFeedback> getFeedbacksByCustomer(UUID customerId) {
        return customerFeedbackRepository.findByCustomerCustomerId(customerId);
    }
    
    public List<CustomerFeedback> getFeedbacksByOrder(UUID orderId) {
        return customerFeedbackRepository.findByOrderOrderId(orderId);
    }
    
    public List<CustomerFeedback> getFeedbacksByStatus(String status) {
        return customerFeedbackRepository.findByStatus(status);
    }
    
    public List<CustomerFeedback> getFeedbacksByRating(Integer rating) {
        return customerFeedbackRepository.findByRating(rating);
    }
    
    public List<CustomerFeedback> getFeedbacksByMinRating(Integer minRating) {
        return customerFeedbackRepository.findByRatingGreaterThanEqual(minRating);
    }
    
    public List<CustomerFeedback> getFeedbacksByType(String feedbackType) {
        return customerFeedbackRepository.findByFeedbackType(feedbackType);
    }
    
    public List<CustomerFeedback> getFeedbacksByCustomerAndStatus(UUID customerId, String status) {
        return customerFeedbackRepository.findByCustomerAndStatus(customerId, status);
    }
    
    public CustomerFeedback createFeedback(CustomerFeedback feedback) {
        return customerFeedbackRepository.save(feedback);
    }
    
    public CustomerFeedback updateFeedback(UUID feedbackId, CustomerFeedback feedbackDetails) {
        CustomerFeedback feedback = customerFeedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + feedbackId));
        
        feedback.setCustomer(feedbackDetails.getCustomer());
        feedback.setOrder(feedbackDetails.getOrder());
        feedback.setRating(feedbackDetails.getRating());
        feedback.setFeedbackType(feedbackDetails.getFeedbackType());
        feedback.setMessage(feedbackDetails.getMessage());
        feedback.setResponse(feedbackDetails.getResponse());
        feedback.setStatus(feedbackDetails.getStatus());
        
        return customerFeedbackRepository.save(feedback);
    }
    
    public void deleteFeedback(UUID feedbackId) {
        CustomerFeedback feedback = customerFeedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + feedbackId));
        customerFeedbackRepository.delete(feedback);
    }
    
    public CustomerFeedback updateFeedbackStatus(UUID feedbackId, String status) {
        CustomerFeedback feedback = customerFeedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + feedbackId));
        feedback.setStatus(status);
        return customerFeedbackRepository.save(feedback);
    }
    
    public CustomerFeedback addResponse(UUID feedbackId, String response) {
        CustomerFeedback feedback = customerFeedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found with id: " + feedbackId));
        feedback.setResponse(response);
        feedback.setStatus("responded");
        return customerFeedbackRepository.save(feedback);
    }
    
    public CustomerFeedback replyToFeedback(UUID feedbackId, String response) {
        return addResponse(feedbackId, response);
    }
}

