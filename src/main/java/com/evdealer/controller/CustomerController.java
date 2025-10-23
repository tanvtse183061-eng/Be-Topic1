package com.evdealer.controller;

import com.evdealer.entity.Customer;
import com.evdealer.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
@Tag(name = "Customer Management", description = "APIs quản lý khách hàng")
public class CustomerController {
    
    @Autowired
    private CustomerService customerService;
    
    @GetMapping
    @Operation(summary = "Lấy danh sách khách hàng", description = "Lấy tất cả khách hàng")
    public ResponseEntity<List<Customer>> getAllCustomers() {
        List<Customer> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }
    
    @GetMapping("/{customerId}")
    @Operation(summary = "Lấy khách hàng theo ID", description = "Lấy thông tin khách hàng theo ID")
    public ResponseEntity<Customer> getCustomerById(@PathVariable UUID customerId) {
        return customerService.getCustomerById(customerId)
                .map(customer -> ResponseEntity.ok(customer))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/email/{email}")
    @Operation(summary = "Lấy khách hàng theo email", description = "Lấy thông tin khách hàng theo email")
    public ResponseEntity<Customer> getCustomerByEmail(@PathVariable String email) {
        return customerService.getCustomerByEmail(email)
                .map(customer -> ResponseEntity.ok(customer))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/phone/{phone}")
    @Operation(summary = "Lấy khách hàng theo số điện thoại", description = "Lấy thông tin khách hàng theo số điện thoại")
    public ResponseEntity<Customer> getCustomerByPhone(@PathVariable String phone) {
        return customerService.getCustomerByPhone(phone)
                .map(customer -> ResponseEntity.ok(customer))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm khách hàng", description = "Tìm kiếm khách hàng theo tên")
    public ResponseEntity<List<Customer>> searchCustomersByName(@RequestParam String name) {
        List<Customer> customers = customerService.searchCustomersByName(name);
        return ResponseEntity.ok(customers);
    }
    
    @GetMapping("/city/{city}")
    @Operation(summary = "Lấy khách hàng theo thành phố", description = "Lấy danh sách khách hàng theo thành phố")
    public ResponseEntity<List<Customer>> getCustomersByCity(@PathVariable String city) {
        List<Customer> customers = customerService.getCustomersByCity(city);
        return ResponseEntity.ok(customers);
    }
    
    @GetMapping("/province/{province}")
    @Operation(summary = "Lấy khách hàng theo tỉnh", description = "Lấy danh sách khách hàng theo tỉnh")
    public ResponseEntity<List<Customer>> getCustomersByProvince(@PathVariable String province) {
        List<Customer> customers = customerService.getCustomersByProvince(province);
        return ResponseEntity.ok(customers);
    }
    
    @PostMapping
    @Operation(summary = "Tạo khách hàng mới", description = "Tạo khách hàng mới")
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        try {
            Customer createdCustomer = customerService.createCustomer(customer);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCustomer);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{customerId}")
    @Operation(summary = "Cập nhật khách hàng", description = "Cập nhật thông tin khách hàng")
    public ResponseEntity<Customer> updateCustomer(@PathVariable UUID customerId, @RequestBody Customer customerDetails) {
        try {
            Customer updatedCustomer = customerService.updateCustomer(customerId, customerDetails);
            return ResponseEntity.ok(updatedCustomer);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{customerId}")
    @Operation(summary = "Xóa khách hàng", description = "Xóa khách hàng")
    public ResponseEntity<Void> deleteCustomer(@PathVariable UUID customerId) {
        try {
            customerService.deleteCustomer(customerId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

