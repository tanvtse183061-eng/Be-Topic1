package com.evdealer.dto;

import java.time.LocalDate;
import java.util.UUID;

public class CustomerDTO {
    private UUID customerId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String city;
    private String province;
    private LocalDate dateOfBirth;

    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
}


