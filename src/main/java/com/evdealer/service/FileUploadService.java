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
import java.nio.file.attribute.BasicFileAttributes;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FileUploadService {
    
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;
    
    @Value("${app.upload.max-file-size:10485760}") // 10MB
    private long maxFileSize;
    
    @Value("${app.upload.allowed-extensions:jpg,jpeg,png,gif,webp}")
    private String allowedExtensions;
    
    private static final java.util.List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
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
        java.util.List<String> allowedExts = Arrays.asList(allowedExtensions.toLowerCase().split(","));
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
    
    // ==================== READ METHODS ====================
    
    public Map<String, Object> listImages(String category, int page, int size) throws IOException {
        Map<String, Object> result = new HashMap<>();
        java.util.List<Map<String, Object>> images = new ArrayList<>();
        
        Path basePath = Paths.get(uploadDir);
        if (!Files.exists(basePath)) {
            result.put("images", images);
            result.put("totalCount", 0);
            result.put("page", page);
            result.put("size", size);
            result.put("totalPages", 0);
            return result;
        }
        
        java.util.List<Path> directories = new ArrayList<>();
        if (category != null && !category.trim().isEmpty()) {
            Path categoryPath = basePath.resolve(category);
            if (Files.exists(categoryPath)) {
                directories.add(categoryPath);
            }
        } else {
            // List all categories
            Files.list(basePath)
                .filter(Files::isDirectory)
                .forEach(directories::add);
        }
        
        for (Path dir : directories) {
            String currentCategory = basePath.relativize(dir).toString();
            Files.list(dir)
                .filter(Files::isRegularFile)
                .filter(this::isImageFile)
                .forEach(filePath -> {
                    try {
                        Map<String, Object> imageInfo = getImageFileInfo(filePath, currentCategory);
                        images.add(imageInfo);
                    } catch (IOException e) {
                        // Skip files that can't be processed
                    }
                });
        }
        
        // Sort by creation time (newest first)
        images.sort((a, b) -> {
            LocalDateTime timeA = (LocalDateTime) a.get("createdAt");
            LocalDateTime timeB = (LocalDateTime) b.get("createdAt");
            return timeB.compareTo(timeA);
        });
        
        // Pagination
        int totalCount = images.size();
        int totalPages = (int) Math.ceil((double) totalCount / size);
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, totalCount);
        
        java.util.List<Map<String, Object>> paginatedImages = images.subList(startIndex, endIndex);
        
        result.put("images", paginatedImages);
        result.put("totalCount", totalCount);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", totalPages);
        
        return result;
    }
    
    public Map<String, Object> getImageInfo(String category, String filename) throws IOException {
        Path imagePath = Paths.get(uploadDir, category, filename);
        if (!Files.exists(imagePath)) {
            return null;
        }
        
        return getImageFileInfo(imagePath, category);
    }
    
    public Map<String, Object> searchImages(String filename, String category, int page, int size) throws IOException {
        Map<String, Object> result = new HashMap<>();
        java.util.List<Map<String, Object>> images = new ArrayList<>();
        
        Path basePath = Paths.get(uploadDir);
        if (!Files.exists(basePath)) {
            result.put("images", images);
            result.put("totalCount", 0);
            result.put("page", page);
            result.put("size", size);
            result.put("totalPages", 0);
            return result;
        }
        
        java.util.List<Path> directories = new ArrayList<>();
        if (category != null && !category.trim().isEmpty()) {
            Path categoryPath = basePath.resolve(category);
            if (Files.exists(categoryPath)) {
                directories.add(categoryPath);
            }
        } else {
            Files.list(basePath)
                .filter(Files::isDirectory)
                .forEach(directories::add);
        }
        
        for (Path dir : directories) {
            String currentCategory = basePath.relativize(dir).toString();
            Files.list(dir)
                .filter(Files::isRegularFile)
                .filter(this::isImageFile)
                .filter(filePath -> {
                    if (filename == null || filename.trim().isEmpty()) {
                        return true;
                    }
                    return filePath.getFileName().toString().toLowerCase()
                        .contains(filename.toLowerCase());
                })
                .forEach(filePath -> {
                    try {
                        Map<String, Object> imageInfo = getImageFileInfo(filePath, currentCategory);
                        images.add(imageInfo);
                    } catch (IOException e) {
                        // Skip files that can't be processed
                    }
                });
        }
        
        // Sort by creation time (newest first)
        images.sort((a, b) -> {
            LocalDateTime timeA = (LocalDateTime) a.get("createdAt");
            LocalDateTime timeB = (LocalDateTime) b.get("createdAt");
            return timeB.compareTo(timeA);
        });
        
        // Pagination
        int totalCount = images.size();
        int totalPages = (int) Math.ceil((double) totalCount / size);
        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, totalCount);
        
        java.util.List<Map<String, Object>> paginatedImages = images.subList(startIndex, endIndex);
        
        result.put("images", paginatedImages);
        result.put("totalCount", totalCount);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", totalPages);
        
        return result;
    }
    
    // ==================== UPDATE METHODS ====================
    
    public FileUploadResult uploadImageWithName(MultipartFile file, String category, String filename) throws IOException {
        validateFile(file);
        
        String categoryDir = uploadDir + File.separator + category;
        Path uploadPath = Paths.get(categoryDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Use the provided filename
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String finalFilename = filename;
        if (!finalFilename.toLowerCase().endsWith(extension.toLowerCase())) {
            finalFilename += extension;
        }
        
        Path filePath = uploadPath.resolve(finalFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Process image (resize and create thumbnail)
        Path thumbnailDir = uploadPath.resolve("thumbnails");
        if (!Files.exists(thumbnailDir)) {
            Files.createDirectories(thumbnailDir);
        }
        Path thumbnailPath = thumbnailDir.resolve(finalFilename);
        createThumbnail(filePath, thumbnailPath);
        optimizeImage(filePath);
        
        FileUploadResult result = new FileUploadResult();
        result.setStoredFilename(finalFilename);
        result.setOriginalFilename(originalFilename);
        result.setFileSize(file.getSize());
        result.setContentType(file.getContentType());
        result.setUrl("/uploads/" + category + "/" + finalFilename);
        result.setThumbnailUrl("/uploads/" + category + "/thumbnails/" + finalFilename);
        result.setCategory(category);
        
        return result;
    }
    
    public boolean renameImage(String category, String oldFilename, String newFilename) {
        try {
            Path oldPath = Paths.get(uploadDir, category, oldFilename);
            Path newPath = Paths.get(uploadDir, category, newFilename);
            
            if (!Files.exists(oldPath)) {
                return false;
            }
            
            Files.move(oldPath, newPath, StandardCopyOption.REPLACE_EXISTING);
            
            // Also rename thumbnail if exists
            Path oldThumbnailPath = Paths.get(uploadDir, category, "thumbnails", oldFilename);
            Path newThumbnailPath = Paths.get(uploadDir, category, "thumbnails", newFilename);
            
            if (Files.exists(oldThumbnailPath)) {
                Files.move(oldThumbnailPath, newThumbnailPath, StandardCopyOption.REPLACE_EXISTING);
            }
            
            return true;
        } catch (IOException e) {
            return false;
        }
    }
    
    public boolean moveImage(String oldCategory, String filename, String newCategory) {
        try {
            Path oldPath = Paths.get(uploadDir, oldCategory, filename);
            Path newDir = Paths.get(uploadDir, newCategory);
            Path newPath = newDir.resolve(filename);
            
            if (!Files.exists(oldPath)) {
                return false;
            }
            
            if (!Files.exists(newDir)) {
                Files.createDirectories(newDir);
            }
            
            Files.move(oldPath, newPath, StandardCopyOption.REPLACE_EXISTING);
            
            // Also move thumbnail if exists
            Path oldThumbnailPath = Paths.get(uploadDir, oldCategory, "thumbnails", filename);
            Path newThumbnailDir = Paths.get(uploadDir, newCategory, "thumbnails");
            Path newThumbnailPath = newThumbnailDir.resolve(filename);
            
            if (Files.exists(oldThumbnailPath)) {
                if (!Files.exists(newThumbnailDir)) {
                    Files.createDirectories(newThumbnailDir);
                }
                Files.move(oldThumbnailPath, newThumbnailPath, StandardCopyOption.REPLACE_EXISTING);
            }
            
            return true;
        } catch (IOException e) {
            return false;
        }
    }
    
    // ==================== BULK OPERATIONS ====================
    
    public Map<String, Object> bulkDeleteImages(java.util.List<Map<String, String>> images) {
        Map<String, Object> result = new HashMap<>();
        java.util.List<String> success = new ArrayList<>();
        java.util.List<String> failed = new ArrayList<>();
        
        for (Map<String, String> image : images) {
            String category = image.get("category");
            String filename = image.get("filename");
            
            if (deleteImage(category, filename)) {
                success.add(category + "/" + filename);
            } else {
                failed.add(category + "/" + filename);
            }
        }
        
        result.put("success", success);
        result.put("failed", failed);
        result.put("successCount", success.size());
        result.put("failedCount", failed.size());
        result.put("totalCount", images.size());
        
        return result;
    }
    
    public Map<String, Object> bulkMoveImages(java.util.List<Map<String, String>> images, String newCategory) {
        Map<String, Object> result = new HashMap<>();
        java.util.List<String> success = new ArrayList<>();
        java.util.List<String> failed = new ArrayList<>();
        
        for (Map<String, String> image : images) {
            String oldCategory = image.get("category");
            String filename = image.get("filename");
            
            if (moveImage(oldCategory, filename, newCategory)) {
                success.add(oldCategory + "/" + filename + " -> " + newCategory + "/" + filename);
            } else {
                failed.add(oldCategory + "/" + filename);
            }
        }
        
        result.put("success", success);
        result.put("failed", failed);
        result.put("successCount", success.size());
        result.put("failedCount", failed.size());
        result.put("totalCount", images.size());
        result.put("newCategory", newCategory);
        
        return result;
    }
    
    // ==================== STATISTICS ====================
    
    public Map<String, Object> getImageStats() throws IOException {
        Map<String, Object> stats = new HashMap<>();
        Path basePath = Paths.get(uploadDir);
        
        if (!Files.exists(basePath)) {
            stats.put("totalImages", 0);
            stats.put("totalSize", 0);
            stats.put("categories", new HashMap<>());
            return stats;
        }
        
        int totalImages = 0;
        long totalSize = 0;
        Map<String, Map<String, Object>> categories = new HashMap<>();
        
        Files.list(basePath)
            .filter(Files::isDirectory)
            .forEach(dir -> {
                try {
                    String categoryName = basePath.relativize(dir).toString();
                    Map<String, Object> categoryStats = getCategoryStats(dir);
                    categories.put(categoryName, categoryStats);
                } catch (IOException e) {
                    // Skip directories that can't be processed
                }
            });
        
        for (Map<String, Object> categoryStats : categories.values()) {
            totalImages += (Integer) categoryStats.get("imageCount");
            totalSize += (Long) categoryStats.get("totalSize");
        }
        
        stats.put("totalImages", totalImages);
        stats.put("totalSize", totalSize);
        stats.put("categories", categories);
        
        return stats;
    }
    
    public Map<String, Object> getImageStatsByCategory(String category) throws IOException {
        Path categoryPath = Paths.get(uploadDir, category);
        
        if (!Files.exists(categoryPath)) {
            Map<String, Object> emptyStats = new HashMap<>();
            emptyStats.put("imageCount", 0);
            emptyStats.put("totalSize", 0);
            emptyStats.put("category", category);
            return emptyStats;
        }
        
        Map<String, Object> stats = getCategoryStats(categoryPath);
        stats.put("category", category);
        
        return stats;
    }
    
    // ==================== HELPER METHODS ====================
    
    private boolean isImageFile(Path filePath) {
        String filename = filePath.getFileName().toString().toLowerCase();
        return Arrays.stream(allowedExtensions.split(","))
            .anyMatch(ext -> filename.endsWith("." + ext.trim()));
    }
    
    private Map<String, Object> getImageFileInfo(Path filePath, String category) throws IOException {
        Map<String, Object> info = new HashMap<>();
        BasicFileAttributes attrs = Files.readAttributes(filePath, BasicFileAttributes.class);
        
        info.put("filename", filePath.getFileName().toString());
        info.put("category", category);
        info.put("fileSize", attrs.size());
        info.put("createdAt", LocalDateTime.ofInstant(attrs.creationTime().toInstant(), ZoneId.systemDefault()));
        info.put("modifiedAt", LocalDateTime.ofInstant(attrs.lastModifiedTime().toInstant(), ZoneId.systemDefault()));
        info.put("url", "/uploads/" + category + "/" + filePath.getFileName().toString());
        info.put("thumbnailUrl", "/uploads/" + category + "/thumbnails/" + filePath.getFileName().toString());
        
        // Check if thumbnail exists
        Path thumbnailPath = Paths.get(uploadDir, category, "thumbnails", filePath.getFileName().toString());
        info.put("hasThumbnail", Files.exists(thumbnailPath));
        
        return info;
    }
    
    private Map<String, Object> getCategoryStats(Path categoryPath) throws IOException {
        Map<String, Object> stats = new HashMap<>();
        int imageCount = 0;
        long totalSize = 0;
        
        for (Path filePath : Files.list(categoryPath)
                .filter(Files::isRegularFile)
                .filter(this::isImageFile)
                .collect(Collectors.toList())) {
            try {
                BasicFileAttributes attrs = Files.readAttributes(filePath, BasicFileAttributes.class);
                imageCount++;
                totalSize += attrs.size();
            } catch (IOException e) {
                // Skip files that can't be processed
            }
        }
        
        stats.put("imageCount", imageCount);
        stats.put("totalSize", totalSize);
        
        return stats;
    }
}
