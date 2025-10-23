package com.evdealer.controller;

import com.evdealer.entity.PricingPolicy;
import com.evdealer.service.PricingPolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pricing-policies")
@CrossOrigin(origins = "*")
public class PricingPolicyController {
    
    @Autowired
    private PricingPolicyService pricingPolicyService;
    
    @GetMapping
    public ResponseEntity<List<PricingPolicy>> getAllPricingPolicies() {
        List<PricingPolicy> policies = pricingPolicyService.getAllPricingPolicies();
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PricingPolicy> getPricingPolicyById(@PathVariable UUID id) {
        return pricingPolicyService.getPricingPolicyById(id)
                .map(policy -> ResponseEntity.ok(policy))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/variant/{variantId}")
    public ResponseEntity<List<PricingPolicy>> getPricingPoliciesByVariant(@PathVariable Integer variantId) {
        List<PricingPolicy> policies = pricingPolicyService.getPricingPoliciesByVariant(variantId);
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<PricingPolicy>> getPricingPoliciesByStatus(@PathVariable String status) {
        List<PricingPolicy> policies = pricingPolicyService.getPricingPoliciesByStatus(status);
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/type/{policyType}")
    public ResponseEntity<List<PricingPolicy>> getPricingPoliciesByType(@PathVariable String policyType) {
        List<PricingPolicy> policies = pricingPolicyService.getPricingPoliciesByType(policyType);
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/customer-type/{customerType}")
    public ResponseEntity<List<PricingPolicy>> getPricingPoliciesByCustomerType(@PathVariable String customerType) {
        List<PricingPolicy> policies = pricingPolicyService.getPricingPoliciesByCustomerType(customerType);
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/region/{region}")
    public ResponseEntity<List<PricingPolicy>> getPricingPoliciesByRegion(@PathVariable String region) {
        List<PricingPolicy> policies = pricingPolicyService.getPricingPoliciesByRegion(region);
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/dealer/{dealerId}")
    public ResponseEntity<List<PricingPolicy>> getPricingPoliciesByDealer(@PathVariable UUID dealerId) {
        List<PricingPolicy> policies = pricingPolicyService.getPricingPoliciesByDealer(dealerId);
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/scope/{scope}")
    public ResponseEntity<List<PricingPolicy>> getPricingPoliciesByScope(@PathVariable String scope) {
        List<PricingPolicy> policies = pricingPolicyService.getPricingPoliciesByScope(scope);
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/global")
    public ResponseEntity<List<PricingPolicy>> getGlobalPricingPolicies() {
        List<PricingPolicy> policies = pricingPolicyService.getPricingPoliciesByScope("global");
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/dealer-specific")
    public ResponseEntity<List<PricingPolicy>> getDealerSpecificPricingPolicies() {
        List<PricingPolicy> policies = pricingPolicyService.getPricingPoliciesByScope("dealer");
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<PricingPolicy>> getActivePricingPolicies() {
        List<PricingPolicy> policies = pricingPolicyService.getActivePricingPoliciesByDate(LocalDate.now());
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/active/date/{date}")
    public ResponseEntity<List<PricingPolicy>> getActivePricingPoliciesByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<PricingPolicy> policies = pricingPolicyService.getActivePricingPoliciesByDate(date);
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/active/variant/{variantId}")
    public ResponseEntity<List<PricingPolicy>> getActivePricingPoliciesByVariant(@PathVariable Integer variantId) {
        List<PricingPolicy> policies = pricingPolicyService.getActivePricingPoliciesByVariantAndDate(variantId, LocalDate.now());
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/active/variant/{variantId}/date/{date}")
    public ResponseEntity<List<PricingPolicy>> getActivePricingPoliciesByVariantAndDate(
            @PathVariable Integer variantId, 
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<PricingPolicy> policies = pricingPolicyService.getActivePricingPoliciesByVariantAndDate(variantId, date);
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/active/variant/{variantId}/customer-type/{customerType}")
    public ResponseEntity<List<PricingPolicy>> getActivePricingPoliciesByVariantAndCustomerType(
            @PathVariable Integer variantId, 
            @PathVariable String customerType) {
        List<PricingPolicy> policies = pricingPolicyService.getActivePricingPoliciesByVariantCustomerTypeAndDate(variantId, customerType, LocalDate.now());
        return ResponseEntity.ok(policies);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<PricingPolicy>> getPricingPoliciesByName(@RequestParam String policyName) {
        List<PricingPolicy> policies = pricingPolicyService.getPricingPoliciesByName(policyName);
        return ResponseEntity.ok(policies);
    }
    
    @PostMapping
    public ResponseEntity<PricingPolicy> createPricingPolicy(@RequestBody PricingPolicy pricingPolicy) {
        try {
            PricingPolicy createdPolicy = pricingPolicyService.createPricingPolicy(pricingPolicy);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPolicy);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PricingPolicy> updatePricingPolicy(@PathVariable UUID id, @RequestBody PricingPolicy pricingPolicyDetails) {
        try {
            PricingPolicy updatedPolicy = pricingPolicyService.updatePricingPolicy(id, pricingPolicyDetails);
            return ResponseEntity.ok(updatedPolicy);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<PricingPolicy> updatePricingPolicyStatus(@PathVariable UUID id, @RequestParam String status) {
        try {
            PricingPolicy updatedPolicy = pricingPolicyService.updatePricingPolicyStatus(id, status);
            return ResponseEntity.ok(updatedPolicy);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePricingPolicy(@PathVariable UUID id) {
        try {
            pricingPolicyService.deletePricingPolicy(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

