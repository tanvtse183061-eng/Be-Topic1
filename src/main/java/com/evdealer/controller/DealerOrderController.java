package com.evdealer.controller;

import com.evdealer.entity.DealerOrder;
import com.evdealer.service.DealerOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dealer-orders")
@CrossOrigin(origins = "*")
@Tag(name = "Dealer Order Management", description = "APIs quản lý đơn hàng đại lý")
public class DealerOrderController {
    
    @Autowired
    private DealerOrderService dealerOrderService;
    
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
}

