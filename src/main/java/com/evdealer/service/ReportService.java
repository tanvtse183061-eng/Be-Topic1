package com.evdealer.service;

import com.evdealer.entity.*;
import com.evdealer.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional
public class ReportService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private VehicleInventoryRepository vehicleInventoryRepository;
    
    @Autowired
    private DealerTargetRepository dealerTargetRepository;
    
    @Autowired
    private VehicleDeliveryRepository vehicleDeliveryRepository;
    
    @Autowired
    private InstallmentPlanRepository installmentPlanRepository;
    
    // Sales Report by Staff - Using actual Order and User data
    public Map<String, Object> getSalesReportByStaff() {
        List<User> salesStaff = userRepository.findByRoleString("DEALER_STAFF");
        Map<String, Object> report = new HashMap<>();
        
        for (User staff : salesStaff) {
            List<Order> staffOrders = orderRepository.findByUserId(staff.getUserId());
            BigDecimal totalSales = staffOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Map<String, Object> staffData = new HashMap<>();
            staffData.put("staffId", staff.getUserId());
            staffData.put("staffName", staff.getFirstName() + " " + staff.getLastName());
            staffData.put("totalOrders", staffOrders.size());
            staffData.put("totalSales", totalSales);
            
            report.put(staff.getUserId().toString(), staffData);
        }
        
        return report;
    }
    
    public Map<String, Object> getSalesReportByRole(String roleString) {
        List<User> users = userRepository.findByRoleString(roleString);
        Map<String, Object> report = new HashMap<>();
        
        for (User user : users) {
            List<Order> userOrders = orderRepository.findByUserId(user.getUserId());
            BigDecimal totalSales = userOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            Map<String, Object> userData = new HashMap<>();
            userData.put("userId", user.getUserId());
            userData.put("userName", user.getFirstName() + " " + user.getLastName());
            userData.put("role", user.getRoleString());
            userData.put("totalOrders", userOrders.size());
            userData.put("totalSales", totalSales);
            
            report.put(user.getUserId().toString(), userData);
        }
        
        return report;
    }
    
    // Customer Debt Report - Using InstallmentPlan data
    public Map<String, Object> getCustomerDebtReport() {
        List<InstallmentPlan> activePlans = installmentPlanRepository.findByPlanStatus("active");
        Map<String, Object> report = new HashMap<>();
        
        for (InstallmentPlan plan : activePlans) {
            if (plan.getCustomer() != null) {
                Map<String, Object> customerData = new HashMap<>();
                customerData.put("customerId", plan.getCustomer().getCustomerId());
                customerData.put("customerName", plan.getCustomer().getFirstName() + " " + plan.getCustomer().getLastName());
                customerData.put("totalAmount", plan.getTotalAmount());
                customerData.put("paidAmount", plan.getDownPaymentAmount()); // Using down payment as paid amount
                customerData.put("remainingAmount", plan.getTotalAmount().subtract(plan.getDownPaymentAmount()));
                customerData.put("installmentCount", plan.getLoanTermMonths()); // Using loan term months as count
                customerData.put("planType", plan.getPlanType());
                
                report.put(plan.getCustomer().getCustomerId().toString(), customerData);
            }
        }
        
        return report;
    }
    
    public List<InstallmentPlan> getCustomersWithActiveInstallments() {
        return installmentPlanRepository.findByPlanStatus("active");
    }
    
    // Inventory Turnover Report - Using VehicleInventory data
    public Map<String, Object> getInventoryTurnoverReport() {
        List<VehicleInventory> allInventory = vehicleInventoryRepository.findAll();
        Map<String, Object> report = new HashMap<>();
        
        long availableCount = allInventory.stream()
            .filter(inv -> "available".equals(inv.getStatus()))
            .count();
        
        long soldCount = allInventory.stream()
            .filter(inv -> "sold".equals(inv.getStatus()))
            .count();
        
        long reservedCount = allInventory.stream()
            .filter(inv -> "reserved".equals(inv.getStatus()))
            .count();
        
        report.put("totalInventory", allInventory.size());
        report.put("availableCount", availableCount);
        report.put("soldCount", soldCount);
        report.put("reservedCount", reservedCount);
        report.put("turnoverRate", soldCount > 0 ? (double) soldCount / allInventory.size() : 0.0);
        
        return report;
    }
    
    public List<VehicleInventory> getAvailableInventory() {
        return vehicleInventoryRepository.findByStatus("available");
    }
    
    public List<VehicleInventory> getSoldInventory() {
        return vehicleInventoryRepository.findByStatus("sold");
    }
    
    // Dealer Performance Report - Using DealerTarget data
    public Map<String, Object> getDealerPerformanceReport() {
        List<DealerTarget> allTargets = dealerTargetRepository.findAll();
        Map<String, Object> report = new HashMap<>();
        
        for (DealerTarget target : allTargets) {
            if (target.getDealer() != null) {
                Map<String, Object> dealerData = new HashMap<>();
                dealerData.put("dealerId", target.getDealer().getDealerId());
                dealerData.put("dealerName", target.getDealer().getDealerName());
                dealerData.put("targetYear", target.getTargetYear());
                dealerData.put("targetSales", target.getTargetQuantity());
                dealerData.put("targetRevenue", target.getTargetAmount());
                dealerData.put("targetScope", target.getTargetScope());
                
                // Calculate achievement rate (simplified)
                // Get all users from this dealer and sum their orders
                List<User> dealerUsers = userRepository.findByDealerDealerId(target.getDealer().getDealerId());
                BigDecimal actualSales = BigDecimal.ZERO;
                for (User dealerUser : dealerUsers) {
                    List<Order> userOrders = orderRepository.findByUserId(dealerUser.getUserId());
                    BigDecimal userSales = userOrders.stream()
                        .map(Order::getTotalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                    actualSales = actualSales.add(userSales);
                }
                
                double achievementRate = target.getTargetAmount().doubleValue() > 0 
                    ? (actualSales.doubleValue() / target.getTargetAmount().doubleValue()) * 100 
                    : 0.0;
                
                dealerData.put("actualSales", actualSales);
                dealerData.put("achievementRate", achievementRate);
                
                report.put(target.getDealer().getDealerId().toString(), dealerData);
            }
        }
        
        return report;
    }
    
    public List<DealerTarget> getPerformanceByYear(Integer year) {
        return dealerTargetRepository.findByTargetYear(year);
    }
    
    // Monthly Sales Summary - Using Order data
    public Map<String, Object> getMonthlySalesSummary(Integer year, Integer month) {
        List<Order> orders = orderRepository.findAll();
        Map<String, Object> summary = new HashMap<>();
        
        long monthlyOrders = orders.stream()
            .filter(order -> order.getOrderDate() != null 
                && order.getOrderDate().getYear() == year 
                && order.getOrderDate().getMonthValue() == month)
            .count();
        
        BigDecimal monthlyRevenue = orders.stream()
            .filter(order -> order.getOrderDate() != null 
                && order.getOrderDate().getYear() == year 
                && order.getOrderDate().getMonthValue() == month)
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        summary.put("year", year);
        summary.put("month", month);
        summary.put("totalOrders", monthlyOrders);
        summary.put("totalRevenue", monthlyRevenue);
        
        return summary;
    }
    
    public Map<String, Object> getSalesByYearRange(Integer startYear, Integer endYear) {
        List<Order> orders = orderRepository.findAll();
        Map<String, Object> summary = new HashMap<>();
        
        long totalOrders = orders.stream()
            .filter(order -> order.getOrderDate() != null 
                && order.getOrderDate().getYear() >= startYear 
                && order.getOrderDate().getYear() <= endYear)
            .count();
        
        BigDecimal totalRevenue = orders.stream()
            .filter(order -> order.getOrderDate() != null 
                && order.getOrderDate().getYear() >= startYear 
                && order.getOrderDate().getYear() <= endYear)
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        summary.put("startYear", startYear);
        summary.put("endYear", endYear);
        summary.put("totalOrders", totalOrders);
        summary.put("totalRevenue", totalRevenue);
        
        return summary;
    }
    
    // Delivery Tracking Report - Using VehicleDelivery data
    public List<VehicleDelivery> getAllDeliveryTrackingReports() {
        return vehicleDeliveryRepository.findAll();
    }
    
    public List<VehicleDelivery> getDeliveriesByStatus(String status) {
        return vehicleDeliveryRepository.findByDeliveryStatus(status);
    }
    
    public List<VehicleDelivery> getDeliveriesByDate(LocalDate date) {
        return vehicleDeliveryRepository.findByDeliveryDate(date);
    }
    
    public List<VehicleDelivery> getDeliveriesByDateRange(LocalDate startDate, LocalDate endDate) {
        return vehicleDeliveryRepository.findByDeliveryDateBetween(startDate, endDate);
    }
    
    public List<VehicleDelivery> getDeliveriesByCustomer(String customerName) {
        return vehicleDeliveryRepository.findByCustomerNameContainingIgnoreCase(customerName);
    }
}
