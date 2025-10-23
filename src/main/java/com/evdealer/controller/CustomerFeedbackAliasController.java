package com.evdealer.controller;

import com.evdealer.entity.CustomerFeedback;
import com.evdealer.service.CustomerFeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer-feedback")
@CrossOrigin(origins = "*")
@Tag(name = "Customer Feedback Management", description = "APIs quản lý phản hồi khách hàng")
public class CustomerFeedbackAliasController {
    
    @Autowired
    private CustomerFeedbackService customerFeedbackService;
    
    @GetMapping
    @Operation(summary = "Lấy danh sách phản hồi", description = "Lấy tất cả phản hồi khách hàng")
    public ResponseEntity<List<CustomerFeedback>> getAllFeedbacks() {
        List<CustomerFeedback> feedbacks = customerFeedbackService.getAllFeedbacks();
        return ResponseEntity.ok(feedbacks);
    }
}
