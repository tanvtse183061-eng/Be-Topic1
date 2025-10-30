package com.evdealer.controller;

import com.evdealer.dto.*;
import com.evdealer.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
@Tag(name = "Report Management", description = "APIs for generating reports")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/sales-by-staff")
    @Operation(summary = "Get sales by staff report", description = "Generate sales report by staff")
    public ResponseEntity<List<SalesByStaffItemDTO>> getSalesByStaffReport() {
        return ResponseEntity.ok(reportService.getSalesReportByStaff());
    }
    
    @GetMapping("/inventory-turnover")
    @Operation(summary = "Get inventory turnover report", description = "Inventory turnover metrics")
    public ResponseEntity<InventoryTurnoverReportDTO> getInventoryTurnover() {
        return ResponseEntity.ok(reportService.getInventoryTurnoverReport());
    }
    
    @GetMapping("/customer-debt")
    @Operation(summary = "Get customer debt report", description = "Generate customer debt report")
    public ResponseEntity<List<CustomerDebtItemDTO>> getCustomerDebtReport() {
        return ResponseEntity.ok(reportService.getCustomerDebtReport());
    }
    
    @GetMapping("/dealer-performance")
    @Operation(summary = "Get dealer performance report", description = "Dealer performance metrics")
    public ResponseEntity<List<DealerPerformanceItemDTO>> getDealerPerformance() {
        return ResponseEntity.ok(reportService.getDealerPerformanceReport());
    }
    
    @GetMapping("/sales-by-role/{role}")
    @Operation(summary = "Get sales by role", description = "Sales aggregated by user role")
    public ResponseEntity<List<SalesByStaffItemDTO>> getSalesByRole(@PathVariable("role") String role) {
        return ResponseEntity.ok(reportService.getSalesReportByRole(role));
    }
    
    @GetMapping("/deliveries")
    @Operation(summary = "Get all deliveries", description = "List of vehicle deliveries")
    public ResponseEntity<List<VehicleDeliveryDTO>> getAllDeliveries() {
        // keeping entity-list for all deliveries would be heavy; here we align to DTO list by status/date instead
        return ResponseEntity.ok(reportService.getDeliveriesByStatus("SCHEDULED"));
    }

    @GetMapping("/deliveries/by-status/{status}")
    @Operation(summary = "Get deliveries by status", description = "Filter deliveries by status")
    public ResponseEntity<List<VehicleDeliveryDTO>> getDeliveriesByStatus(@PathVariable("status") String status) {
        return ResponseEntity.ok(reportService.getDeliveriesByStatus(status));
    }

    @GetMapping("/deliveries/by-date")
    @Operation(summary = "Get deliveries by date", description = "Filter deliveries by date")
    public ResponseEntity<List<VehicleDeliveryDTO>> getDeliveriesByDate(@RequestParam("date") String date) {
        return ResponseEntity.ok(reportService.getDeliveriesByDate(LocalDate.parse(date)));
    }
    
    @GetMapping("/monthly-sales")
    @Operation(summary = "Get monthly sales report", description = "Monthly sales summary")
    public ResponseEntity<MonthlySalesSummaryDTO> getMonthlySales(
            @RequestParam("year") Integer year,
            @RequestParam("month") Integer month) {
        return ResponseEntity.ok(reportService.getMonthlySalesSummary(year, month));
    }

    @GetMapping("/walk-in-purchases")
    @Operation(summary = "Get walk-in customer purchases", description = "Orders without quotations (khách vãng lai mua xe). Optional filters: startDate, endDate, status")
    public ResponseEntity<List<OrderDTO>> getWalkInPurchases(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "status", required = false) String status
    ) {
        LocalDate s = (startDate != null && !startDate.isBlank()) ? LocalDate.parse(startDate) : null;
        LocalDate e = (endDate != null && !endDate.isBlank()) ? LocalDate.parse(endDate) : null;
        return ResponseEntity.ok(reportService.getWalkInPurchases(s, e, (status != null && !status.isBlank()) ? status : null));
    }

    @GetMapping("/walk-in-purchases/paged")
    @Operation(summary = "Get walk-in purchases (paged)", description = "Orders without quotations (khách vãng lai). Params: startDate, endDate, status, page, size, sort=field,dir")
    public ResponseEntity<Page<OrderDTO>> getWalkInPurchasesPaged(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "20") int size,
            @RequestParam(value = "sort", required = false, defaultValue = "orderDate,desc") String sort
    ) {
        LocalDate s = (startDate != null && !startDate.isBlank()) ? LocalDate.parse(startDate) : null;
        LocalDate e = (endDate != null && !endDate.isBlank()) ? LocalDate.parse(endDate) : null;

        String[] sortParts = sort.split(",", 2);
        String sortField = sortParts[0];
        Sort.Direction dir = (sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortField));

        Page<OrderDTO> result = reportService.getWalkInPurchasesPaged(s, e, (status != null && !status.isBlank()) ? status : null, pageable);
        return ResponseEntity.ok(result);
    }
}