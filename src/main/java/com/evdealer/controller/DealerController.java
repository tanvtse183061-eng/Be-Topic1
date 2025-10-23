package com.evdealer.controller;

import com.evdealer.dto.DealerRequest;
import com.evdealer.entity.Dealer;
import com.evdealer.service.DealerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dealers")
@CrossOrigin(origins = "*")
@Tag(name = "Dealer Management", description = "APIs quản lý đại lý")
public class DealerController {
    
    @Autowired
    private DealerService dealerService;
    
    @GetMapping
    public ResponseEntity<List<Dealer>> getAllDealers() {
        List<Dealer> dealers = dealerService.getAllDealers();
        return ResponseEntity.ok(dealers);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Dealer> getDealerById(@PathVariable UUID id) {
        return dealerService.getDealerById(id)
                .map(dealer -> ResponseEntity.ok(dealer))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/code/{dealerCode}")
    public ResponseEntity<Dealer> getDealerByCode(@PathVariable String dealerCode) {
        return dealerService.getDealerByCode(dealerCode)
                .map(dealer -> ResponseEntity.ok(dealer))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Dealer>> getDealersByStatus(@PathVariable String status) {
        List<Dealer> dealers = dealerService.getDealersByStatus(status);
        return ResponseEntity.ok(dealers);
    }
    
    @GetMapping("/type/{dealerType}")
    public ResponseEntity<List<Dealer>> getDealersByType(@PathVariable String dealerType) {
        List<Dealer> dealers = dealerService.getDealersByType(dealerType);
        return ResponseEntity.ok(dealers);
    }
    
    @GetMapping("/city/{city}")
    public ResponseEntity<List<Dealer>> getDealersByCity(@PathVariable String city) {
        List<Dealer> dealers = dealerService.getDealersByCity(city);
        return ResponseEntity.ok(dealers);
    }
    
    @GetMapping("/province/{province}")
    public ResponseEntity<List<Dealer>> getDealersByProvince(@PathVariable String province) {
        List<Dealer> dealers = dealerService.getDealersByProvince(province);
        return ResponseEntity.ok(dealers);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Dealer>> getDealersByName(@RequestParam String name) {
        List<Dealer> dealers = dealerService.getDealersByName(name);
        return ResponseEntity.ok(dealers);
    }
    
    @GetMapping("/contact")
    public ResponseEntity<List<Dealer>> getDealersByContactPerson(@RequestParam String contactPerson) {
        List<Dealer> dealers = dealerService.getDealersByContactPerson(contactPerson);
        return ResponseEntity.ok(dealers);
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<Dealer> getDealerByEmail(@PathVariable String email) {
        return dealerService.getDealerByEmail(email)
                .map(dealer -> ResponseEntity.ok(dealer))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/phone/{phone}")
    public ResponseEntity<Dealer> getDealerByPhone(@PathVariable String phone) {
        return dealerService.getDealerByPhone(phone)
                .map(dealer -> ResponseEntity.ok(dealer))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @Operation(summary = "Tạo đại lý mới", description = "Tạo đại lý mới")
    public ResponseEntity<Dealer> createDealer(@RequestBody Dealer dealer) {
        try {
            Dealer createdDealer = dealerService.createDealer(dealer);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDealer);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/dto")
    @Operation(summary = "Tạo đại lý mới từ DTO", description = "Tạo đại lý mới từ DealerRequest DTO")
    public ResponseEntity<Dealer> createDealerFromRequest(@RequestBody DealerRequest request) {
        try {
            Dealer createdDealer = dealerService.createDealerFromRequest(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDealer);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Dealer> updateDealer(@PathVariable UUID id, @RequestBody Dealer dealerDetails) {
        try {
            Dealer updatedDealer = dealerService.updateDealer(id, dealerDetails);
            return ResponseEntity.ok(updatedDealer);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<Dealer> updateDealerStatus(@PathVariable UUID id, @RequestParam String status) {
        try {
            Dealer updatedDealer = dealerService.updateDealerStatus(id, status);
            return ResponseEntity.ok(updatedDealer);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDealer(@PathVariable UUID id) {
        try {
            dealerService.deleteDealer(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

