package com.evdealer.service;

import com.evdealer.entity.Customer;
import com.evdealer.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CustomerService {
    
    @Autowired
    private CustomerRepository customerRepository;
    
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }
    
    public Optional<Customer> getCustomerById(UUID customerId) {
        return customerRepository.findById(customerId);
    }
    
    public Optional<Customer> getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email);
    }
    
    public Optional<Customer> getCustomerByPhone(String phone) {
        return customerRepository.findByPhone(phone);
    }
    
    public List<Customer> searchCustomersByName(String name) {
        return customerRepository.findByNameContaining(name);
    }
    
    public List<Customer> getCustomersByCity(String city) {
        return customerRepository.findByCity(city);
    }
    
    public List<Customer> getCustomersByProvince(String province) {
        return customerRepository.findByProvince(province);
    }
    
    public Customer createCustomer(Customer customer) {
        if (customer.getEmail() != null && customerRepository.existsByEmail(customer.getEmail())) {
            throw new RuntimeException("Email already exists: " + customer.getEmail());
        }
        if (customer.getPhone() != null && customerRepository.existsByPhone(customer.getPhone())) {
            throw new RuntimeException("Phone already exists: " + customer.getPhone());
        }
        return customerRepository.save(customer);
    }
    
    public Customer updateCustomer(UUID customerId, Customer customerDetails) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));
        
        // Check for duplicate email (excluding current customer)
        if (customerDetails.getEmail() != null && 
            !customer.getEmail().equals(customerDetails.getEmail()) && 
            customerRepository.existsByEmail(customerDetails.getEmail())) {
            throw new RuntimeException("Email already exists: " + customerDetails.getEmail());
        }
        
        // Check for duplicate phone (excluding current customer)
        if (customerDetails.getPhone() != null && 
            !customer.getPhone().equals(customerDetails.getPhone()) && 
            customerRepository.existsByPhone(customerDetails.getPhone())) {
            throw new RuntimeException("Phone already exists: " + customerDetails.getPhone());
        }
        
        customer.setFirstName(customerDetails.getFirstName());
        customer.setLastName(customerDetails.getLastName());
        customer.setEmail(customerDetails.getEmail());
        customer.setPhone(customerDetails.getPhone());
        customer.setDateOfBirth(customerDetails.getDateOfBirth());
        customer.setAddress(customerDetails.getAddress());
        customer.setCity(customerDetails.getCity());
        customer.setProvince(customerDetails.getProvince());
        customer.setPostalCode(customerDetails.getPostalCode());
        customer.setCreditScore(customerDetails.getCreditScore());
        customer.setPreferredContactMethod(customerDetails.getPreferredContactMethod());
        customer.setNotes(customerDetails.getNotes());
        
        return customerRepository.save(customer);
    }
    
    public void deleteCustomer(UUID customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));
        customerRepository.delete(customer);
    }
}

