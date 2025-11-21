package com.evdealer.dto;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("LoginRequest DTO Tests")
class LoginRequestTest_qodo {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Nested
    @DisplayName("Constructor Tests")
    class ConstructorTests {

        @Test
        @DisplayName("Default constructor creates object with null fields")
        void testDefaultConstructor() {
            // Test default constructor
            LoginRequest loginRequest = new LoginRequest();
            
            assertNotNull(loginRequest);
            assertNull(loginRequest.getUsername());
            assertNull(loginRequest.getPassword());
        }

        @Test
        @DisplayName("Parameterized constructor with valid values")
        void testParameterizedConstructorWithValidValues() {
            // Test parameterized constructor with valid values
            String username = "testuser";
            String password = "testpass123";
            
            LoginRequest loginRequest = new LoginRequest(username, password);
            
            assertNotNull(loginRequest);
            assertEquals(username, loginRequest.getUsername());
            assertEquals(password, loginRequest.getPassword());
        }

        @Test
        @DisplayName("Parameterized constructor with null values")
        void testParameterizedConstructorWithNullValues() {
            // Test parameterized constructor with null values
            LoginRequest loginRequest = new LoginRequest(null, null);
            
            assertNotNull(loginRequest);
            assertNull(loginRequest.getUsername());
            assertNull(loginRequest.getPassword());
        }

        @Test
        @DisplayName("Parameterized constructor with empty strings")
        void testParameterizedConstructorWithEmptyStrings() {
            // Test parameterized constructor with empty strings
            LoginRequest loginRequest = new LoginRequest("", "");
            
            assertNotNull(loginRequest);
            assertEquals("", loginRequest.getUsername());
            assertEquals("", loginRequest.getPassword());
        }
    }

    @Nested
    @DisplayName("Getter and Setter Tests")
    class GetterSetterTests {

        @Test
        @DisplayName("Username getter and setter with valid value")
        void testUsernameGetterSetterWithValidValue() {
            LoginRequest loginRequest = new LoginRequest();
            String username = "validuser";
            
            loginRequest.setUsername(username);
            
            assertEquals(username, loginRequest.getUsername());
        }

        @Test
        @DisplayName("Username getter and setter with null value")
        void testUsernameGetterSetterWithNull() {
            LoginRequest loginRequest = new LoginRequest();
            
            loginRequest.setUsername(null);
            
            assertNull(loginRequest.getUsername());
        }

        @Test
        @DisplayName("Username getter and setter with empty string")
        void testUsernameGetterSetterWithEmptyString() {
            LoginRequest loginRequest = new LoginRequest();
            
            loginRequest.setUsername("");
            
            assertEquals("", loginRequest.getUsername());
        }

        @Test
        @DisplayName("Password getter and setter with valid value")
        void testPasswordGetterSetterWithValidValue() {
            LoginRequest loginRequest = new LoginRequest();
            String password = "validpass123";
            
            loginRequest.setPassword(password);
            
            assertEquals(password, loginRequest.getPassword());
        }

        @Test
        @DisplayName("Password getter and setter with null value")
        void testPasswordGetterSetterWithNull() {
            LoginRequest loginRequest = new LoginRequest();
            
            loginRequest.setPassword(null);
            
            assertNull(loginRequest.getPassword());
        }

        @Test
        @DisplayName("Password getter and setter with empty string")
        void testPasswordGetterSetterWithEmptyString() {
            LoginRequest loginRequest = new LoginRequest();
            
            loginRequest.setPassword("");
            
            assertEquals("", loginRequest.getPassword());
        }
    }

    @Nested
    @DisplayName("Validation Tests")
    class ValidationTests {

        @Test
        @DisplayName("Valid LoginRequest passes validation")
        void testValidLoginRequest() {
            LoginRequest loginRequest = new LoginRequest("validuser", "validpass123");
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("Null username fails validation")
        void testNullUsernameValidation() {
            LoginRequest loginRequest = new LoginRequest(null, "validpass123");
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertEquals(1, violations.size());
            ConstraintViolation<LoginRequest> violation = violations.iterator().next();
            assertEquals("Username is required", violation.getMessage());
            assertEquals("username", violation.getPropertyPath().toString());
        }

        @Test
        @DisplayName("Empty username fails validation")
        void testEmptyUsernameValidation() {
            LoginRequest loginRequest = new LoginRequest("", "validpass123");
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertEquals(1, violations.size());
            ConstraintViolation<LoginRequest> violation = violations.iterator().next();
            assertEquals("Username is required", violation.getMessage());
            assertEquals("username", violation.getPropertyPath().toString());
        }

        @Test
        @DisplayName("Whitespace-only username fails validation")
        void testWhitespaceOnlyUsernameValidation() {
            LoginRequest loginRequest = new LoginRequest("   ", "validpass123");
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertEquals(1, violations.size());
            ConstraintViolation<LoginRequest> violation = violations.iterator().next();
            assertEquals("Username is required", violation.getMessage());
            assertEquals("username", violation.getPropertyPath().toString());
        }

        @Test
        @DisplayName("Null password fails validation")
        void testNullPasswordValidation() {
            LoginRequest loginRequest = new LoginRequest("validuser", null);
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertEquals(1, violations.size());
            ConstraintViolation<LoginRequest> violation = violations.iterator().next();
            assertEquals("Password is required", violation.getMessage());
            assertEquals("password", violation.getPropertyPath().toString());
        }

        @Test
        @DisplayName("Empty password fails validation")
        void testEmptyPasswordValidation() {
            LoginRequest loginRequest = new LoginRequest("validuser", "");
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertEquals(1, violations.size());
            ConstraintViolation<LoginRequest> violation = violations.iterator().next();
            assertEquals("Password is required", violation.getMessage());
            assertEquals("password", violation.getPropertyPath().toString());
        }

        @Test
        @DisplayName("Whitespace-only password fails validation")
        void testWhitespaceOnlyPasswordValidation() {
            LoginRequest loginRequest = new LoginRequest("validuser", "   ");
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertEquals(1, violations.size());
            ConstraintViolation<LoginRequest> violation = violations.iterator().next();
            assertEquals("Password is required", violation.getMessage());
            assertEquals("password", violation.getPropertyPath().toString());
        }

        @Test
        @DisplayName("Both username and password null fails validation")
        void testBothFieldsNullValidation() {
            LoginRequest loginRequest = new LoginRequest(null, null);
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertEquals(2, violations.size());
            // Verify both fields have violations
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("username")));
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")));
        }

        @Test
        @DisplayName("Both username and password empty fails validation")
        void testBothFieldsEmptyValidation() {
            LoginRequest loginRequest = new LoginRequest("", "");
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertEquals(2, violations.size());
            // Verify both fields have violations
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("username")));
            assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")));
        }
    }

    @Nested
    @DisplayName("Boundary Value Tests")
    class BoundaryValueTests {

        @Test
        @DisplayName("Single character username and password")
        void testSingleCharacterValues() {
            LoginRequest loginRequest = new LoginRequest("a", "b");
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertTrue(violations.isEmpty());
            assertEquals("a", loginRequest.getUsername());
            assertEquals("b", loginRequest.getPassword());
        }

        @Test
        @DisplayName("Very long username and password")
        void testVeryLongValues() {
            String longUsername = "a".repeat(1000);
            String longPassword = "b".repeat(1000);
            LoginRequest loginRequest = new LoginRequest(longUsername, longPassword);
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertTrue(violations.isEmpty());
            assertEquals(longUsername, loginRequest.getUsername());
            assertEquals(longPassword, loginRequest.getPassword());
        }

        @Test
        @DisplayName("Username and password with special characters")
        void testSpecialCharacters() {
            String specialUsername = "user@domain.com";
            String specialPassword = "pass!@#$%^&*()";
            LoginRequest loginRequest = new LoginRequest(specialUsername, specialPassword);
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertTrue(violations.isEmpty());
            assertEquals(specialUsername, loginRequest.getUsername());
            assertEquals(specialPassword, loginRequest.getPassword());
        }

        @Test
        @DisplayName("Username and password with unicode characters")
        void testUnicodeCharacters() {
            String unicodeUsername = "用户名";
            String unicodePassword = "密码123";
            LoginRequest loginRequest = new LoginRequest(unicodeUsername, unicodePassword);
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertTrue(violations.isEmpty());
            assertEquals(unicodeUsername, loginRequest.getUsername());
            assertEquals(unicodePassword, loginRequest.getPassword());
        }
    }

    @Nested
    @DisplayName("Equivalence Partitioning Tests")
    class EquivalencePartitioningTests {

        @Test
        @DisplayName("Valid partition - both fields have valid non-blank values")
        void testValidPartition() {
            LoginRequest loginRequest = new LoginRequest("admin", "admin123");
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertTrue(violations.isEmpty());
        }

        @Test
        @DisplayName("Invalid partition - username is blank, password is valid")
        void testInvalidPartitionBlankUsername() {
            LoginRequest loginRequest = new LoginRequest("", "validpass");
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertEquals(1, violations.size());
            assertEquals("username", violations.iterator().next().getPropertyPath().toString());
        }

        @Test
        @DisplayName("Invalid partition - username is valid, password is blank")
        void testInvalidPartitionBlankPassword() {
            LoginRequest loginRequest = new LoginRequest("validuser", "");
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertEquals(1, violations.size());
            assertEquals("password", violations.iterator().next().getPropertyPath().toString());
        }

        @Test
        @DisplayName("Invalid partition - both fields are blank")
        void testInvalidPartitionBothBlank() {
            LoginRequest loginRequest = new LoginRequest("", "");
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertEquals(2, violations.size());
        }

        @Test
        @DisplayName("Invalid partition - username is null, password is valid")
        void testInvalidPartitionNullUsername() {
            LoginRequest loginRequest = new LoginRequest(null, "validpass");
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertEquals(1, violations.size());
            assertEquals("username", violations.iterator().next().getPropertyPath().toString());
        }

        @Test
        @DisplayName("Invalid partition - username is valid, password is null")
        void testInvalidPartitionNullPassword() {
            LoginRequest loginRequest = new LoginRequest("validuser", null);
            
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            
            assertEquals(1, violations.size());
            assertEquals("password", violations.iterator().next().getPropertyPath().toString());
        }
    }

    @Nested
    @DisplayName("Edge Cases and Integration Tests")
    class EdgeCaseTests {

        @Test
        @DisplayName("Modify object after creation and validation")
        void testModifyAfterCreation() {
            LoginRequest loginRequest = new LoginRequest("initial", "initial");
            
            // Verify initial state is valid
            Set<ConstraintViolation<LoginRequest>> violations = validator.validate(loginRequest);
            assertTrue(violations.isEmpty());
            
            // Modify to invalid state
            loginRequest.setUsername("");
            loginRequest.setPassword("");
            
            // Verify modified state is invalid
            violations = validator.validate(loginRequest);
            assertEquals(2, violations.size());
            
            // Modify back to valid state
            loginRequest.setUsername("modified");
            loginRequest.setPassword("modified");
            
            // Verify final state is valid
            violations = validator.validate(loginRequest);
            assertTrue(violations.isEmpty());
            assertEquals("modified", loginRequest.getUsername());
            assertEquals("modified", loginRequest.getPassword());
        }

        @Test
        @DisplayName("Test object state consistency")
        void testObjectStateConsistency() {
            LoginRequest loginRequest = new LoginRequest();
            
            // Test multiple setter calls
            loginRequest.setUsername("first");
            loginRequest.setPassword("first");
            assertEquals("first", loginRequest.getUsername());
            assertEquals("first", loginRequest.getPassword());
            
            loginRequest.setUsername("second");
            loginRequest.setPassword("second");
            assertEquals("second", loginRequest.getUsername());
            assertEquals("second", loginRequest.getPassword());
            
            // Test overwriting with null
            loginRequest.setUsername(null);
            loginRequest.setPassword(null);
            assertNull(loginRequest.getUsername());
            assertNull(loginRequest.getPassword());
        }
    }
}
