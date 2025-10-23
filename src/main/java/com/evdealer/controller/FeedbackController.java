package com.evdealer.controller;

import com.evdealer.entity.CustomerFeedback;
import com.evdealer.service.CustomerFeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/feedbacks")
@CrossOrigin(origins = "*")
public class FeedbackController {
    
    @Autowired
    private CustomerFeedbackService customerFeedbackService;
    
    @GetMapping
    public ResponseEntity<List<CustomerFeedback>> getAllFeedbacks() {
        List<CustomerFeedback> feedbacks = customerFeedbackService.getAllFeedbacks();
        return ResponseEntity.ok(feedbacks);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CustomerFeedback> getFeedbackById(@PathVariable UUID id) {
        return customerFeedbackService.getFeedbackById(id)
                .map(feedback -> ResponseEntity.ok(feedback))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<CustomerFeedback>> getFeedbacksByCustomer(@PathVariable UUID customerId) {
        List<CustomerFeedback> feedbacks = customerFeedbackService.getFeedbacksByCustomer(customerId);
        return ResponseEntity.ok(feedbacks);
    }
    
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<CustomerFeedback>> getFeedbacksByOrder(@PathVariable UUID orderId) {
        List<CustomerFeedback> feedbacks = customerFeedbackService.getFeedbacksByOrder(orderId);
        return ResponseEntity.ok(feedbacks);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<CustomerFeedback>> getFeedbacksByStatus(@PathVariable String status) {
        List<CustomerFeedback> feedbacks = customerFeedbackService.getFeedbacksByStatus(status);
        return ResponseEntity.ok(feedbacks);
    }
    
    @GetMapping("/type/{feedbackType}")
    public ResponseEntity<List<CustomerFeedback>> getFeedbacksByType(@PathVariable String feedbackType) {
        List<CustomerFeedback> feedbacks = customerFeedbackService.getFeedbacksByType(feedbackType);
        return ResponseEntity.ok(feedbacks);
    }
    
    @GetMapping("/rating/{rating}")
    public ResponseEntity<List<CustomerFeedback>> getFeedbacksByRating(@PathVariable Integer rating) {
        List<CustomerFeedback> feedbacks = customerFeedbackService.getFeedbacksByRating(rating);
        return ResponseEntity.ok(feedbacks);
    }
    
    @PostMapping
    public ResponseEntity<CustomerFeedback> createFeedback(@RequestBody CustomerFeedback feedback) {
        try {
            CustomerFeedback createdFeedback = customerFeedbackService.createFeedback(feedback);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdFeedback);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CustomerFeedback> updateFeedback(@PathVariable UUID id, @RequestBody CustomerFeedback feedbackDetails) {
        try {
            CustomerFeedback updatedFeedback = customerFeedbackService.updateFeedback(id, feedbackDetails);
            return ResponseEntity.ok(updatedFeedback);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<CustomerFeedback> updateFeedbackStatus(@PathVariable UUID id, @RequestParam String status) {
        try {
            CustomerFeedback updatedFeedback = customerFeedbackService.updateFeedbackStatus(id, status);
            return ResponseEntity.ok(updatedFeedback);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/{id}/reply")
    public ResponseEntity<CustomerFeedback> replyToFeedback(@PathVariable UUID id, @RequestParam String response) {
        try {
            CustomerFeedback updatedFeedback = customerFeedbackService.replyToFeedback(id, response);
            return ResponseEntity.ok(updatedFeedback);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable UUID id) {
        try {
            customerFeedbackService.deleteFeedback(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

