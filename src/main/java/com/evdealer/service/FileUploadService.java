package com.evdealer.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {
    
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;
    
    @Value("${app.upload.max-file-size:10485760}") // 10MB
    private long maxFileSize;
    
    @Value("${app.upload.allowed-extensions:jpg,jpeg,png,gif,webp}")
    private String allowedExtensions;
    
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );
    
    private static final int MAX_WIDTH = 1920;
    private static final int MAX_HEIGHT = 1080;
    private static final int THUMBNAIL_WIDTH = 300;
    private static final int THUMBNAIL_HEIGHT = 200;
    
    public FileUploadResult uploadImage(MultipartFile file, String category) throws IOException {
        // Validate file
        validateFile(file);
        
        // Create upload directory
        String categoryDir = uploadDir + File.separator + category;
        Path uploadPath = Paths.get(categoryDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + "." + extension;
        
        // Save original file
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Create thumbnail
        String thumbnailFilename = "thumb_" + uniqueFilename;
        Path thumbnailPath = uploadPath.resolve(thumbnailFilename);
        createThumbnail(filePath, thumbnailPath);
        
        // Optimize original image
        optimizeImage(filePath);
        
        // Return result
        FileUploadResult result = new FileUploadResult();
        result.setOriginalFilename(originalFilename);
        result.setStoredFilename(uniqueFilename);
        result.setThumbnailFilename(thumbnailFilename);
        result.setFileSize(file.getSize());
        result.setContentType(file.getContentType());
        result.setUrl("/uploads/" + category + "/" + uniqueFilename);
        result.setThumbnailUrl("/uploads/" + category + "/" + thumbnailFilename);
        result.setCategory(category);
        
        return result;
    }
    
    public FileUploadResult uploadMultipleImages(MultipartFile[] files, String category) throws IOException {
        FileUploadResult result = new FileUploadResult();
        result.setCategory(category);
        result.setMultipleFiles(true);
        
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                FileUploadResult singleResult = uploadImage(file, category);
                result.addFile(singleResult);
            }
        }
        
        return result;
    }
    
    public boolean deleteImage(String category, String filename) {
        try {
            Path filePath = Paths.get(uploadDir, category, filename);
            Path thumbnailPath = Paths.get(uploadDir, category, "thumb_" + filename);
            
            Files.deleteIfExists(filePath);
            Files.deleteIfExists(thumbnailPath);
            
            return true;
        } catch (IOException e) {
            return false;
        }
    }
    
    public boolean deleteImageDirectory(String category) {
        try {
            Path categoryPath = Paths.get(uploadDir, category);
            if (Files.exists(categoryPath)) {
                Files.walk(categoryPath)
                    .sorted((a, b) -> b.compareTo(a)) // Delete files before directories
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (IOException e) {
                            // Log error but continue
                        }
                    });
                return true;
            }
            return false;
        } catch (IOException e) {
            return false;
        }
    }
    
    private void validateFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("File is empty");
        }
        
        if (file.getSize() > maxFileSize) {
            throw new IOException("File size exceeds maximum allowed size: " + (maxFileSize / 1024 / 1024) + "MB");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IOException("Invalid file type. Allowed types: " + ALLOWED_IMAGE_TYPES);
        }
        
        String filename = file.getOriginalFilename();
        if (filename == null || filename.trim().isEmpty()) {
            throw new IOException("Invalid filename");
        }
        
        String extension = getFileExtension(filename).toLowerCase();
        List<String> allowedExts = Arrays.asList(allowedExtensions.toLowerCase().split(","));
        if (!allowedExts.contains(extension)) {
            throw new IOException("Invalid file extension. Allowed extensions: " + allowedExtensions);
        }
    }
    
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
    
    private void createThumbnail(Path originalPath, Path thumbnailPath) throws IOException {
        BufferedImage originalImage = ImageIO.read(originalPath.toFile());
        if (originalImage == null) {
            return;
        }
        
        // Calculate thumbnail dimensions maintaining aspect ratio
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();
        
        double aspectRatio = (double) originalWidth / originalHeight;
        int thumbnailWidth, thumbnailHeight;
        
        if (aspectRatio > (double) THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT) {
            thumbnailWidth = THUMBNAIL_WIDTH;
            thumbnailHeight = (int) (THUMBNAIL_WIDTH / aspectRatio);
        } else {
            thumbnailHeight = THUMBNAIL_HEIGHT;
            thumbnailWidth = (int) (THUMBNAIL_HEIGHT * aspectRatio);
        }
        
        // Create thumbnail
        BufferedImage thumbnail = new BufferedImage(thumbnailWidth, thumbnailHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = thumbnail.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.drawImage(originalImage, 0, 0, thumbnailWidth, thumbnailHeight, null);
        g2d.dispose();
        
        // Save thumbnail
        String extension = getFileExtension(originalPath.getFileName().toString());
        ImageIO.write(thumbnail, extension, thumbnailPath.toFile());
    }
    
    private void optimizeImage(Path imagePath) throws IOException {
        BufferedImage originalImage = ImageIO.read(imagePath.toFile());
        if (originalImage == null) {
            return;
        }
        
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();
        
        // Only resize if image is too large
        if (originalWidth > MAX_WIDTH || originalHeight > MAX_HEIGHT) {
            double aspectRatio = (double) originalWidth / originalHeight;
            int newWidth, newHeight;
            
            if (aspectRatio > (double) MAX_WIDTH / MAX_HEIGHT) {
                newWidth = MAX_WIDTH;
                newHeight = (int) (MAX_WIDTH / aspectRatio);
            } else {
                newHeight = MAX_HEIGHT;
                newWidth = (int) (MAX_HEIGHT * aspectRatio);
            }
            
            // Create optimized image - preserve original image type for PNG with alpha
            int imageType = originalImage.getType();
            if (imageType == BufferedImage.TYPE_CUSTOM) {
                imageType = originalImage.getColorModel().hasAlpha() ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB;
            }
            BufferedImage optimizedImage = new BufferedImage(newWidth, newHeight, imageType);
            Graphics2D g2d = optimizedImage.createGraphics();
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g2d.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
            g2d.dispose();
            
            // Save optimized image
            String extension = getFileExtension(imagePath.getFileName().toString());
            ImageIO.write(optimizedImage, extension, imagePath.toFile());
        }
    }
    
    public static class FileUploadResult {
        private String originalFilename;
        private String storedFilename;
        private String thumbnailFilename;
        private long fileSize;
        private String contentType;
        private String url;
        private String thumbnailUrl;
        private String category;
        private boolean multipleFiles = false;
        private java.util.List<FileUploadResult> files = new java.util.ArrayList<>();
        
        // Getters and Setters
        public String getOriginalFilename() {
            return originalFilename;
        }
        
        public void setOriginalFilename(String originalFilename) {
            this.originalFilename = originalFilename;
        }
        
        public String getStoredFilename() {
            return storedFilename;
        }
        
        public void setStoredFilename(String storedFilename) {
            this.storedFilename = storedFilename;
        }
        
        public String getThumbnailFilename() {
            return thumbnailFilename;
        }
        
        public void setThumbnailFilename(String thumbnailFilename) {
            this.thumbnailFilename = thumbnailFilename;
        }
        
        public long getFileSize() {
            return fileSize;
        }
        
        public void setFileSize(long fileSize) {
            this.fileSize = fileSize;
        }
        
        public String getContentType() {
            return contentType;
        }
        
        public void setContentType(String contentType) {
            this.contentType = contentType;
        }
        
        public String getUrl() {
            return url;
        }
        
        public void setUrl(String url) {
            this.url = url;
        }
        
        public String getThumbnailUrl() {
            return thumbnailUrl;
        }
        
        public void setThumbnailUrl(String thumbnailUrl) {
            this.thumbnailUrl = thumbnailUrl;
        }
        
        public String getCategory() {
            return category;
        }
        
        public void setCategory(String category) {
            this.category = category;
        }
        
        public boolean isMultipleFiles() {
            return multipleFiles;
        }
        
        public void setMultipleFiles(boolean multipleFiles) {
            this.multipleFiles = multipleFiles;
        }
        
        public java.util.List<FileUploadResult> getFiles() {
            return files;
        }
        
        public void setFiles(java.util.List<FileUploadResult> files) {
            this.files = files;
        }
        
        public void addFile(FileUploadResult file) {
            this.files.add(file);
        }
    }
}
