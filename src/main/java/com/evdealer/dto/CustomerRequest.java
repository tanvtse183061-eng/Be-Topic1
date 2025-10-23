package com.evdealer.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Customer request DTO for public registration")
public class CustomerRequest {
    
    @Schema(description = "First name", example = "John", required = true)
    private String firstName;
    
    @Schema(description = "Last name", example = "Doe", required = true)
    private String lastName;
    
    @Schema(description = "Email address", example = "john.doe@example.com")
    private String email;
    
    @Schema(description = "Phone number", example = "0123456789")
    private String phone;
    
    @Schema(description = "Date of birth", example = "1990-01-01")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;
    
    @Schema(description = "Address", example = "123 Main Street")
    private String address;
    
    @Schema(description = "City", example = "Ho Chi Minh City")
    private String city;
    
    @Schema(description = "Province", example = "Ho Chi Minh")
    private String province;
    
    @Schema(description = "Postal code", example = "700000")
    private String postalCode;
    
    @Schema(description = "Credit score", example = "750")
    private Integer creditScore;
    
    @Schema(description = "Preferred contact method", example = "email", allowableValues = {"email", "phone", "sms"})
    private String preferredContactMethod;
    
    @Schema(description = "Notes", example = "Interested in electric vehicles")
    private String notes;
    
    // Constructors
    public CustomerRequest() {}
    
    public CustomerRequest(String firstName, String lastName, String email, String phone) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
    }
    
    // Getters and Setters
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }
    
    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getCity() {
        return city;
    }
    
    public void setCity(String city) {
        this.city = city;
    }
    
    public String getProvince() {
        return province;
    }
    
    public void setProvince(String province) {
        this.province = province;
    }
    
    public String getPostalCode() {
        return postalCode;
    }
    
    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }
    
    public Integer getCreditScore() {
        return creditScore;
    }
    
    public void setCreditScore(Integer creditScore) {
        this.creditScore = creditScore;
    }
    
    public String getPreferredContactMethod() {
        return preferredContactMethod;
    }
    
    public void setPreferredContactMethod(String preferredContactMethod) {
        this.preferredContactMethod = preferredContactMethod;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}
