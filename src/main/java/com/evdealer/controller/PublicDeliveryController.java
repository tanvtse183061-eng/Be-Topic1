package com.evdealer.controller;

import com.evdealer.entity.Order;
import com.evdealer.entity.VehicleDelivery;
import com.evdealer.repository.VehicleDeliveryRepository;
import com.evdealer.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/deliveries")
@CrossOrigin(origins = "*")
@Tag(name = "Public Delivery Tracking", description = "Theo dõi giao xe cho khách vãng lai")
public class PublicDeliveryController {

    @Autowired
    private VehicleDeliveryRepository vehicleDeliveryRepository;

    @Autowired
    private OrderService orderService;

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Xem giao xe theo đơn", description = "Liệt kê các lịch giao xe của đơn hàng")
    public ResponseEntity<List<VehicleDelivery>> getByOrder(@PathVariable UUID orderId) {
        return ResponseEntity.ok(vehicleDeliveryRepository.findByOrderOrderId(orderId));
    }

    @GetMapping("/order-number/{orderNumber}")
    @Operation(summary = "Xem giao xe theo số đơn", description = "Tìm theo số đơn hàng")
    public ResponseEntity<?> getByOrderNumber(@PathVariable String orderNumber) {
        return orderService.getOrderByOrderNumber(orderNumber)
                .map(Order::getOrderId)
                .map(vehicleDeliveryRepository::findByOrderOrderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/date")
    @Operation(summary = "Xem giao xe theo ngày", description = "Lọc lịch giao xe theo ngày")
    public ResponseEntity<List<VehicleDelivery>> getByDate(@RequestParam("date") String date) {
        return ResponseEntity.ok(vehicleDeliveryRepository.findByDeliveryDate(LocalDate.parse(date)));
    }
}


