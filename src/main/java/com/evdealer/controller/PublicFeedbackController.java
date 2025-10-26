package com.evdealer.controller;

import com.evdealer.entity.CustomerFeedback;
import com.evdealer.service.CustomerFeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/feedbacks")
@CrossOrigin(origins = "*")
@Tag(name = "Public Feedback Management", description = "APIs phản hồi cho khách vãng lai - không cần đăng nhập")
public class PublicFeedbackController {
    
    @Autowired
    private CustomerFeedbackService customerFeedbackService;
    
    @PostMapping
    @Operation(summary = "Gửi phản hồi", description = "Khách vãng lai có thể gửi phản hồi về sản phẩm hoặc dịch vụ")
    public ResponseEntity<?> createFeedback(@RequestBody Map<String, Object> request) {
        try {
            String customerName = (String) request.get("customerName");
            String customerEmail = (String) request.get("customerEmail");
            String customerPhone = (String) request.get("customerPhone");
            String feedbackType = (String) request.get("feedbackType");
            String subject = (String) request.get("subject");
            String message = (String) request.get("message");
            Integer rating = request.get("rating") != null ? (Integer) request.get("rating") : null;
            UUID orderId = request.get("orderId") != null ? UUID.fromString(request.get("orderId").toString()) : null;
            Integer variantId = request.get("variantId") != null ? (Integer) request.get("variantId") : null;
            
            CustomerFeedback feedback = new CustomerFeedback();
            feedback.setFeedbackType(feedbackType);
            feedback.setMessage(message);
            feedback.setRating(rating);
            String fullMessage = message + "\n\nCustomer Info: " + customerName + " (" + customerEmail + ", " + customerPhone + ")" +
                                (orderId != null ? ", Order ID: " + orderId : "") +
                                (variantId != null ? ", Variant ID: " + variantId : "") +
                                (subject != null ? ", Subject: " + subject : "");
            feedback.setMessage(fullMessage);
            feedback.setStatus("pending");
            feedback.setCreatedAt(LocalDateTime.now());
            
            CustomerFeedback createdFeedback = customerFeedbackService.createFeedback(feedback);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Feedback submitted successfully");
            response.put("feedbackId", createdFeedback.getFeedbackId());
            response.put("status", "pending");
            response.put("subject", subject);
            response.put("rating", rating);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Feedback submission failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/vehicle/{vehicleId}")
    @Operation(summary = "Xem phản hồi xe", description = "Khách vãng lai có thể xem phản hồi về một xe cụ thể")
    public ResponseEntity<?> getFeedbacksByVehicle(@PathVariable Integer vehicleId) {
        try {
            List<CustomerFeedback> feedbacks = customerFeedbackService.getAllFeedbacks().stream()
                    .filter(f -> f.getMessage() != null && f.getMessage().contains("Variant ID: " + vehicleId))
                    .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("vehicleId", vehicleId);
            response.put("feedbacks", feedbacks);
            response.put("totalFeedbacks", feedbacks.size());
            response.put("averageRating", feedbacks.stream()
                    .filter(f -> f.getRating() != null)
                    .mapToInt(CustomerFeedback::getRating)
                    .average()
                    .orElse(0.0));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to retrieve feedbacks: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/rating/{rating}")
    @Operation(summary = "Xem phản hồi theo điểm", description = "Khách vãng lai có thể xem phản hồi theo điểm đánh giá")
    public ResponseEntity<?> getFeedbacksByRating(@PathVariable Integer rating) {
        try {
            if (rating < 1 || rating > 5) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Rating must be between 1 and 5");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            List<CustomerFeedback> feedbacks = customerFeedbackService.getFeedbacksByRating(rating);
            
            Map<String, Object> response = new HashMap<>();
            response.put("rating", rating);
            response.put("feedbacks", feedbacks);
            response.put("totalFeedbacks", feedbacks.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to retrieve feedbacks: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/{feedbackId}")
    @Operation(summary = "Xem chi tiết phản hồi", description = "Khách vãng lai có thể xem chi tiết phản hồi")
    public ResponseEntity<?> getFeedbackById(@PathVariable UUID feedbackId) {
        try {
            return customerFeedbackService.getFeedbackById(feedbackId)
                    .map(feedback -> {
                        Map<String, Object> details = new HashMap<>();
                        details.put("feedbackId", feedback.getFeedbackId());
                        details.put("customerName", feedback.getCustomer() != null ? 
                            feedback.getCustomer().getFirstName() + " " + feedback.getCustomer().getLastName() : "N/A");
                        details.put("customerEmail", feedback.getCustomer() != null ? 
                            feedback.getCustomer().getEmail() : "N/A");
                        details.put("feedbackType", feedback.getFeedbackType());
                        details.put("subject", "See notes");
                        details.put("message", feedback.getMessage());
                        details.put("rating", feedback.getRating());
                        details.put("status", feedback.getStatus());
                        details.put("createdAt", feedback.getCreatedAt());
                        details.put("response", feedback.getResponse());
                        details.put("responseDate", feedback.getUpdatedAt());
                        
                        return ResponseEntity.ok(details);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to retrieve feedback: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/recent")
    @Operation(summary = "Phản hồi gần đây", description = "Khách vãng lai có thể xem các phản hồi gần đây")
    public ResponseEntity<?> getRecentFeedbacks(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<CustomerFeedback> feedbacks = customerFeedbackService.getAllFeedbacks().stream()
                    .limit(limit)
                    .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("feedbacks", feedbacks);
            response.put("limit", limit);
            response.put("totalCount", feedbacks.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to retrieve recent feedbacks: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/stats")
    @Operation(summary = "Thống kê phản hồi", description = "Khách vãng lai có thể xem thống kê phản hồi")
    public ResponseEntity<?> getFeedbackStats() {
        try {
            List<CustomerFeedback> allFeedbacks = customerFeedbackService.getAllFeedbacks();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalFeedbacks", allFeedbacks.size());
            stats.put("averageRating", allFeedbacks.stream()
                    .filter(f -> f.getRating() != null)
                    .mapToInt(CustomerFeedback::getRating)
                    .average()
                    .orElse(0.0));
            
            // Rating distribution
            Map<Integer, Long> ratingDistribution = new HashMap<>();
            for (int i = 1; i <= 5; i++) {
                final int rating = i;
                long count = allFeedbacks.stream()
                        .filter(f -> f.getRating() != null && f.getRating() == rating)
                        .count();
                ratingDistribution.put(rating, count);
            }
            stats.put("ratingDistribution", ratingDistribution);
            
            // Feedback types
            Map<String, Long> typeDistribution = allFeedbacks.stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                            CustomerFeedback::getFeedbackType,
                            java.util.stream.Collectors.counting()
                    ));
            stats.put("typeDistribution", typeDistribution);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to retrieve feedback stats: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/types")
    @Operation(summary = "Loại phản hồi", description = "Khách vãng lai có thể xem các loại phản hồi có sẵn")
    public ResponseEntity<?> getFeedbackTypes() {
        Map<String, Object> types = new HashMap<>();
        types.put("availableTypes", new String[]{
            "complaint", "suggestion", "compliment", "question", "service_issue", "product_issue"
        });
        types.put("typeDescriptions", Map.of(
            "complaint", "Khiếu nại",
            "suggestion", "Góp ý",
            "compliment", "Khen ngợi",
            "question", "Câu hỏi",
            "service_issue", "Vấn đề dịch vụ",
            "product_issue", "Vấn đề sản phẩm"
        ));
        types.put("ratingScale", "1-5 (1 = Rất không hài lòng, 5 = Rất hài lòng)");
        
        return ResponseEntity.ok(types);
    }
}
