package com.evdealer.controller;

import com.evdealer.dto.CreateDealerOrderRequest;
import com.evdealer.dto.CreateDealerOrderResponse;
import com.evdealer.entity.DealerOrder;
import com.evdealer.entity.DealerOrderItem;
import com.evdealer.service.DealerOrderService;
import com.evdealer.service.DealerOrderItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/dealer-orders")
@CrossOrigin(origins = "*")
@Tag(name = "Dealer Order Management", description = "APIs quản lý đơn hàng đại lý")
public class DealerOrderController {
    
    @Autowired
    private DealerOrderService dealerOrderService;
    
    @Autowired
    private DealerOrderItemService dealerOrderItemService;
    
    @GetMapping
    @Operation(summary = "Lấy danh sách đơn hàng đại lý", description = "Lấy tất cả đơn hàng đại lý")
    public ResponseEntity<List<DealerOrder>> getAllDealerOrders() {
        List<DealerOrder> orders = dealerOrderService.getAllDealerOrders();
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/{dealerOrderId}")
    public ResponseEntity<DealerOrder> getDealerOrderById(@PathVariable UUID dealerOrderId) {
        return dealerOrderService.getDealerOrderById(dealerOrderId)
                .map(order -> ResponseEntity.ok(order))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/order-number/{orderNumber}")
    public ResponseEntity<DealerOrder> getDealerOrderByOrderNumber(@PathVariable String orderNumber) {
        return dealerOrderService.getDealerOrderByOrderNumber(orderNumber)
                .map(order -> ResponseEntity.ok(order))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/evm-staff/{evmStaffId}")
    public ResponseEntity<List<DealerOrder>> getDealerOrdersByEvmStaff(@PathVariable UUID evmStaffId) {
        List<DealerOrder> orders = dealerOrderService.getDealerOrdersByEvmStaff(evmStaffId);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<DealerOrder>> getDealerOrdersByStatus(@PathVariable String status) {
        List<DealerOrder> orders = dealerOrderService.getDealerOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<DealerOrder>> getDealerOrdersByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<DealerOrder> orders = dealerOrderService.getDealerOrdersByDateRange(startDate, endDate);
        return ResponseEntity.ok(orders);
    }
    
    @PostMapping
    @Operation(summary = "Tạo đơn hàng đại lý mới", description = "Tạo đơn hàng đại lý mới")
    public ResponseEntity<DealerOrder> createDealerOrder(@RequestBody DealerOrder dealerOrder) {
        try {
            DealerOrder createdOrder = dealerOrderService.createDealerOrder(dealerOrder);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{dealerOrderId}")
    public ResponseEntity<DealerOrder> updateDealerOrder(@PathVariable UUID dealerOrderId, @RequestBody DealerOrder dealerOrderDetails) {
        try {
            DealerOrder updatedOrder = dealerOrderService.updateDealerOrder(dealerOrderId, dealerOrderDetails);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{dealerOrderId}/status")
    public ResponseEntity<DealerOrder> updateDealerOrderStatus(@PathVariable UUID dealerOrderId, @RequestParam String status) {
        try {
            DealerOrder updatedOrder = dealerOrderService.updateDealerOrderStatus(dealerOrderId, status);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{dealerOrderId}")
    public ResponseEntity<Void> deleteDealerOrder(@PathVariable UUID dealerOrderId) {
        try {
            dealerOrderService.deleteDealerOrder(dealerOrderId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // ==================== NEW IMPROVED APIs ====================
    
    @PostMapping("/create-detailed")
    @Operation(summary = "Tạo đơn hàng đại lý chi tiết", description = "Tạo đơn hàng đại lý với danh sách xe chi tiết")
    public ResponseEntity<?> createDetailedDealerOrder(@RequestBody CreateDealerOrderRequest request) {
        try {
            CreateDealerOrderResponse response = dealerOrderService.createDetailedDealerOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Dealer order creation failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Dealer order creation failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/{dealerOrderId}/items")
    @Operation(summary = "Lấy chi tiết xe trong đơn hàng", description = "Lấy danh sách xe trong đơn hàng đại lý")
    public ResponseEntity<List<DealerOrderItem>> getDealerOrderItems(@PathVariable UUID dealerOrderId) {
        List<DealerOrderItem> items = dealerOrderItemService.getItemsByDealerOrderId(dealerOrderId);
        return ResponseEntity.ok(items);
    }
    
    @PostMapping("/{dealerOrderId}/items")
    @Operation(summary = "Thêm xe vào đơn hàng", description = "Thêm xe mới vào đơn hàng đại lý")
    public ResponseEntity<?> addItemToDealerOrder(@PathVariable UUID dealerOrderId, @RequestBody DealerOrderItem item) {
        try {
            // Set dealer order
            DealerOrder dealerOrder = dealerOrderService.getDealerOrderById(dealerOrderId)
                .orElseThrow(() -> new RuntimeException("Dealer order not found"));
            item.setDealerOrder(dealerOrder);
            
            DealerOrderItem createdItem = dealerOrderItemService.createDealerOrderItem(item);
            
            // Recalculate totals
            dealerOrderService.recalculateOrderTotals(dealerOrderId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(createdItem);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add item: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PutMapping("/{dealerOrderId}/items/{itemId}")
    @Operation(summary = "Cập nhật xe trong đơn hàng", description = "Cập nhật thông tin xe trong đơn hàng đại lý")
    public ResponseEntity<?> updateDealerOrderItem(@PathVariable UUID dealerOrderId, @PathVariable UUID itemId, @RequestBody DealerOrderItem itemDetails) {
        try {
            DealerOrderItem updatedItem = dealerOrderItemService.updateDealerOrderItem(itemId, itemDetails);
            
            // Recalculate totals
            dealerOrderService.recalculateOrderTotals(dealerOrderId);
            
            return ResponseEntity.ok(updatedItem);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update item: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @DeleteMapping("/{dealerOrderId}/items/{itemId}")
    @Operation(summary = "Xóa xe khỏi đơn hàng", description = "Xóa xe khỏi đơn hàng đại lý")
    public ResponseEntity<?> deleteDealerOrderItem(@PathVariable UUID dealerOrderId, @PathVariable UUID itemId) {
        try {
            dealerOrderItemService.deleteDealerOrderItem(itemId);
            
            // Recalculate totals
            dealerOrderService.recalculateOrderTotals(dealerOrderId);
            
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete item: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PostMapping("/{dealerOrderId}/approve")
    @Operation(summary = "Duyệt đơn hàng", description = "Duyệt đơn hàng đại lý")
    public ResponseEntity<?> approveDealerOrder(@PathVariable UUID dealerOrderId, @RequestParam @Parameter(description = "ID người duyệt") UUID approvedBy) {
        try {
            DealerOrder approvedOrder = dealerOrderService.approveDealerOrder(dealerOrderId, approvedBy);
            return ResponseEntity.ok(approvedOrder);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to approve order: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PostMapping("/{dealerOrderId}/reject")
    @Operation(summary = "Từ chối đơn hàng", description = "Từ chối đơn hàng đại lý")
    public ResponseEntity<?> rejectDealerOrder(@PathVariable UUID dealerOrderId, @RequestParam @Parameter(description = "Lý do từ chối") String rejectionReason) {
        try {
            DealerOrder rejectedOrder = dealerOrderService.rejectDealerOrder(dealerOrderId, rejectionReason);
            return ResponseEntity.ok(rejectedOrder);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to reject order: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @GetMapping("/{dealerOrderId}/summary")
    @Operation(summary = "Lấy tóm tắt đơn hàng", description = "Lấy thông tin tóm tắt đơn hàng đại lý")
    public ResponseEntity<?> getDealerOrderSummary(@PathVariable UUID dealerOrderId) {
        try {
            Map<String, Object> summary = dealerOrderService.getDealerOrderSummary(dealerOrderId);
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get order summary: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @GetMapping("/pending-approval")
    @Operation(summary = "Lấy đơn hàng chờ duyệt", description = "Lấy danh sách đơn hàng chờ duyệt")
    public ResponseEntity<List<DealerOrder>> getPendingApprovalOrders() {
        List<DealerOrder> orders = dealerOrderService.getOrdersByApprovalStatus("PENDING");
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/approved")
    @Operation(summary = "Lấy đơn hàng đã duyệt", description = "Lấy danh sách đơn hàng đã duyệt")
    public ResponseEntity<List<DealerOrder>> getApprovedOrders() {
        List<DealerOrder> orders = dealerOrderService.getOrdersByApprovalStatus("APPROVED");
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/rejected")
    @Operation(summary = "Lấy đơn hàng bị từ chối", description = "Lấy danh sách đơn hàng bị từ chối")
    public ResponseEntity<List<DealerOrder>> getRejectedOrders() {
        List<DealerOrder> orders = dealerOrderService.getOrdersByApprovalStatus("REJECTED");
        return ResponseEntity.ok(orders);
    }
}

