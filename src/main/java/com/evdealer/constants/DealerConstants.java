package com.evdealer.constants;

import java.util.UUID;

/**
 * Constants for the single dealer system
 */
public class DealerConstants {
    
    /**
     * Single dealer UUID used throughout the system
     * This UUID represents the only dealer in the system
     */
    public static final UUID SINGLE_DEALER_ID = UUID.fromString("550e8400-e29b-41d4-a716-446655440001");
    
    /**
     * Dealer name for display purposes
     */
    public static final String DEALER_NAME = "EV Dealer Ho Chi Minh City";
    
    /**
     * Dealer code for identification
     */
    public static final String DEALER_CODE = "HCM001";
    
    /**
     * Dealer address
     */
    public static final String DEALER_ADDRESS = "123 Nguyen Hue Street, District 1, Ho Chi Minh City";
    
    /**
     * Dealer phone
     */
    public static final String DEALER_PHONE = "+84-28-123-4567";
    
    /**
     * Dealer email
     */
    public static final String DEALER_EMAIL = "info@dealerhcm.com";
    
    private DealerConstants() {
        // Utility class
    }
}

