package com.evdealer.controller;

import com.evdealer.service.FileUploadService;
import com.evdealer.service.ImageUpdateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "*")
@Tag(name = "Image Management", description = "APIs quản lý hình ảnh")
public class ImageController {
    
    @Autowired
    private FileUploadService fileUploadService;
    
    @Autowired
    private ImageUpdateService imageUpdateService;
    
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload hình ảnh", description = "Upload một hình ảnh duy nhất")
    public ResponseEntity<?> uploadImage(
            @Parameter(description = "File hình ảnh cần upload") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Danh mục lưu trữ (vehicles, brands, models, variants, colors)") @RequestParam("category") String category) {
        
        try {
            FileUploadService.FileUploadResult result = fileUploadService.uploadImage(file, category);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping(value = "/upload-multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload nhiều hình ảnh", description = "Upload nhiều hình ảnh cùng lúc")
    public ResponseEntity<?> uploadMultipleImages(
            @Parameter(description = "Danh sách file hình ảnh cần upload") @RequestParam("files") MultipartFile[] files,
            @Parameter(description = "Danh mục lưu trữ") @RequestParam("category") String category) {
        
        try {
            FileUploadService.FileUploadResult result = fileUploadService.uploadMultipleImages(files, category);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping(value = "/upload/vehicle-brand", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload logo thương hiệu", description = "Upload logo cho thương hiệu xe")
    public ResponseEntity<?> uploadBrandLogo(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "brandId", required = false) Integer brandId) {
        
        try {
            FileUploadService.FileUploadResult result = fileUploadService.uploadImage(file, "brands");
            
            // TODO: Update brand entity with image URLs
            Map<String, Object> response = new HashMap<>();
            response.put("uploadResult", result);
            response.put("message", "Brand logo uploaded successfully");
            response.put("brandId", brandId);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Brand logo upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PostMapping(value = "/upload/vehicle-model", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload hình ảnh mẫu xe", description = "Upload hình ảnh cho mẫu xe")
    public ResponseEntity<?> uploadModelImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "modelId", required = false) Integer modelId) {
        
        try {
            FileUploadService.FileUploadResult result = fileUploadService.uploadImage(file, "models");
            
            Map<String, Object> response = new HashMap<>();
            response.put("uploadResult", result);
            response.put("message", "Model image uploaded successfully");
            response.put("modelId", modelId);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Model image upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PostMapping(value = "/upload/vehicle-variant", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload hình ảnh phiên bản xe", description = "Upload hình ảnh cho phiên bản xe")
    public ResponseEntity<?> uploadVariantImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "variantId", required = false) Integer variantId) {
        
        try {
            FileUploadService.FileUploadResult result = fileUploadService.uploadImage(file, "variants");
            
            Map<String, Object> response = new HashMap<>();
            response.put("uploadResult", result);
            response.put("message", "Variant image uploaded successfully");
            response.put("variantId", variantId);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Variant image upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PostMapping(value = "/upload/vehicle-inventory", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload hình ảnh xe trong kho", description = "Upload hình ảnh chi tiết cho xe trong kho")
    public ResponseEntity<?> uploadInventoryImages(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("imageType") String imageType, // main, interior, exterior
            @RequestParam(value = "inventoryId", required = false) String inventoryId) {
        
        try {
            String category = "inventory/" + imageType;
            FileUploadService.FileUploadResult result = fileUploadService.uploadMultipleImages(files, category);
            
            // Update database with image URLs if inventoryId is provided
            if (inventoryId != null && !inventoryId.trim().isEmpty()) {
                try {
                    UUID inventoryUuid = UUID.fromString(inventoryId);
                    Map<String, Object> updateResult = imageUpdateService.updateInventoryImagesFromUploadResult(
                            inventoryUuid, imageType, result);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("uploadResult", result);
                    response.put("updateResult", updateResult);
                    response.put("message", "Inventory images uploaded and database updated successfully");
                    response.put("imageType", imageType);
                    response.put("inventoryId", inventoryId);
                    
                    return ResponseEntity.ok(response);
                } catch (IllegalArgumentException e) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Invalid inventory ID format: " + inventoryId);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
                } catch (Exception e) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Failed to update database: " + e.getMessage());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
                }
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("uploadResult", result);
                response.put("message", "Inventory images uploaded successfully (database not updated - no inventoryId provided)");
                response.put("imageType", imageType);
                response.put("inventoryId", inventoryId);
                
                return ResponseEntity.ok(response);
            }
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Inventory images upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PostMapping(value = "/upload/color-swatch", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload mẫu màu xe", description = "Upload mẫu màu cho màu xe")
    public ResponseEntity<?> uploadColorSwatch(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "colorId", required = false) Integer colorId) {
        
        try {
            FileUploadService.FileUploadResult result = fileUploadService.uploadImage(file, "colors");
            
            Map<String, Object> response = new HashMap<>();
            response.put("uploadResult", result);
            response.put("message", "Color swatch uploaded successfully");
            response.put("colorId", colorId);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Color swatch upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @DeleteMapping("/delete/{category}/{filename}")
    @Operation(summary = "Xóa hình ảnh", description = "Xóa hình ảnh theo danh mục và tên file")
    public ResponseEntity<?> deleteImage(
            @PathVariable String category,
            @PathVariable String filename) {
        
        try {
            boolean deleted = fileUploadService.deleteImage(category, filename);
            
            if (deleted) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Image deleted successfully");
                response.put("category", category);
                response.put("filename", filename);
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Failed to delete image");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Delete failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @DeleteMapping("/delete-category/{category}")
    @Operation(summary = "Xóa toàn bộ danh mục hình ảnh", description = "Xóa toàn bộ hình ảnh trong một danh mục")
    public ResponseEntity<?> deleteImageCategory(@PathVariable String category) {
        
        try {
            boolean deleted = fileUploadService.deleteImageDirectory(category);
            
            if (deleted) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Category images deleted successfully");
                response.put("category", category);
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Failed to delete category images");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Delete failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/info")
    @Operation(summary = "Thông tin upload", description = "Lấy thông tin cấu hình upload")
    public ResponseEntity<Map<String, Object>> getUploadInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("maxFileSize", "10MB");
        info.put("allowedExtensions", "jpg, jpeg, png, gif, webp");
        info.put("allowedTypes", "image/jpeg, image/jpg, image/png, image/gif, image/webp");
        info.put("maxDimensions", "1920x1080");
        info.put("thumbnailDimensions", "300x200");
        info.put("categories", new String[]{"vehicles", "brands", "models", "variants", "colors", "inventory"});
        
        return ResponseEntity.ok(info);
    }
}
