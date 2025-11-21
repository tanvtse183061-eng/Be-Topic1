package com.evdealer.config;

import com.evdealer.repository.VehicleVariantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class StartupDataValidator implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(StartupDataValidator.class);

    private final VehicleVariantRepository vehicleVariantRepository;

    public StartupDataValidator(VehicleVariantRepository vehicleVariantRepository) {
        this.vehicleVariantRepository = vehicleVariantRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        int orphanVariants = vehicleVariantRepository.findVariantsWithNoModel().size();
        if (orphanVariants > 0) {
            log.error("Detected {} VehicleVariant records with NULL model. Please fix data before enforcing NOT NULL on model_id.", orphanVariants);
        } else {
            log.info("No orphan VehicleVariant records detected (model is NOT NULL for all variants).");
        }
    }
}


