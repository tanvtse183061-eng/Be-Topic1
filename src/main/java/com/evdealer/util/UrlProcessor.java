package com.evdealer.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utility class để xử lý và normalize các loại URL hình ảnh
 * - Google redirect URLs: extract URL thực sự từ query parameter
 * - Wikipedia file URLs: convert sang direct image URL
 * - Relative paths: thêm base URL
 * - Direct URLs: sử dụng trực tiếp
 */
@Component
public class UrlProcessor {
    
    private static final Logger logger = LoggerFactory.getLogger(UrlProcessor.class);
    
    private int serverPort = 8080;
    private String contextPath = "";
    
    @Value("${server.port:8080}")
    public void setServerPort(int port) {
        this.serverPort = port;
    }
    
    @Value("${server.servlet.context-path:}")
    public void setContextPath(String path) {
        this.contextPath = path != null ? path : "";
    }
    
    // Pattern để detect Google redirect URLs - cải thiện để match nhiều format hơn
    private static final Pattern GOOGLE_REDIRECT_PATTERN = Pattern.compile(
        "https?://(www\\.)?google\\.(com|com\\.vn|co\\.uk|co\\.jp|com\\.au)/url\\?.*[&?]url=([^&]+)",
        Pattern.CASE_INSENSITIVE
    );
    
    // Pattern đơn giản hơn để extract URL từ query string
    private static final Pattern URL_PARAM_PATTERN = Pattern.compile(
        "[&?]url=([^&]+)",
        Pattern.CASE_INSENSITIVE
    );
    
    // Pattern để detect Wikipedia file URLs
    private static final Pattern WIKIPEDIA_FILE_PATTERN = Pattern.compile(
        "https?://([a-z]+\\.)?wikipedia\\.org/wiki/(?:Tập_tin|File|Image):(.+)",
        Pattern.CASE_INSENSITIVE
    );
    
    // Pattern để detect image file extensions
    private static final Pattern IMAGE_EXTENSION_PATTERN = Pattern.compile(
        "\\.(jpg|jpeg|png|gif|svg|webp|bmp)(\\?.*)?$",
        Pattern.CASE_INSENSITIVE
    );
    
    /**
     * Process và normalize logo URL
     * @param url URL cần xử lý (có thể là Google redirect, Wikipedia URL, relative path, hoặc direct URL)
     * @param baseUrl Base URL của server (ví dụ: http://localhost:8080)
     * @return URL đã được normalize, hoặc null nếu không xử lý được
     */
    public String processLogoUrl(String url, String baseUrl) {
        if (url == null || url.trim().isEmpty()) {
            return null;
        }
        
        String trimmedUrl = url.trim();
        logger.debug("Processing logo URL: {}", trimmedUrl);
        
        // 1. Xử lý Google redirect URLs - extract URL thực sự (có thể là bất kỳ URL nào)
        String processedUrl = extractFromGoogleRedirect(trimmedUrl);
        if (processedUrl != null && !processedUrl.equals(trimmedUrl)) {
            logger.debug("Extracted URL from Google redirect: {} -> {}", trimmedUrl, processedUrl);
            trimmedUrl = processedUrl;
        }
        
        // 2. Xử lý Wikipedia file URLs (nếu URL extract được là Wikipedia)
        processedUrl = convertWikipediaUrl(trimmedUrl);
        if (processedUrl != null && !processedUrl.equals(trimmedUrl)) {
            logger.debug("Converted Wikipedia URL: {} -> {}", trimmedUrl, processedUrl);
            trimmedUrl = processedUrl;
        }
        
        // 3. Kiểm tra và xử lý các loại redirect URLs khác (nếu cần)
        // Nếu URL vẫn là redirect hoặc không phải direct image URL, thử extract tiếp
        if (isRedirectUrl(trimmedUrl)) {
            logger.warn("URL appears to be a redirect URL, may not display directly: {}", trimmedUrl);
            // Vẫn trả về URL, nhưng log warning - frontend có thể cần xử lý thêm
        }
        
        // 3. Xử lý relative paths
        if (trimmedUrl.startsWith("/") && !trimmedUrl.startsWith("//")) {
            // Relative path - thêm base URL
            if (baseUrl != null && !baseUrl.isEmpty()) {
                String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
                trimmedUrl = normalizedBaseUrl + trimmedUrl;
                logger.debug("Added base URL to relative path: {}", trimmedUrl);
            }
        }
        
        // 4. Validate URL format và đảm bảo là direct image URL
        if (!isDirectImageUrl(trimmedUrl)) {
            if (isValidImageUrl(trimmedUrl)) {
                // URL có extension hợp lệ nhưng có thể là redirect
                logger.debug("URL has valid image extension but may be redirect: {}", trimmedUrl);
            } else {
                logger.warn("URL does not appear to be a valid direct image URL: {}", trimmedUrl);
            }
            // Vẫn trả về URL để frontend có thể thử hiển thị
        } else {
            logger.debug("URL is a valid direct image URL: {}", trimmedUrl);
        }
        
        return trimmedUrl;
    }
    
    /**
     * Process logo URL với base URL mặc định từ server config
     */
    public String processLogoUrl(String url) {
        String baseUrl = "http://localhost:" + serverPort + contextPath;
        return processLogoUrl(url, baseUrl);
    }
    
    /**
     * Extract URL thực sự từ Google redirect URL hoặc bất kỳ redirect URL nào
     * @param googleUrl Google redirect URL hoặc redirect URL khác
     * @return URL thực sự hoặc original URL nếu không phải redirect
     */
    public String extractFromGoogleRedirect(String googleUrl) {
        if (googleUrl == null || googleUrl.trim().isEmpty()) {
            return googleUrl;
        }
        
        String lowerUrl = googleUrl.toLowerCase();
        
        // Kiểm tra nếu là Google redirect URL
        boolean isGoogleRedirect = lowerUrl.contains("google.com/url") || 
                                   lowerUrl.contains("google.co.uk/url") ||
                                   lowerUrl.contains("google.com.vn/url");
        
        if (!isGoogleRedirect) {
            // Kiểm tra các loại redirect URL khác
            if (!lowerUrl.contains("/url?") && 
                !lowerUrl.contains("/redirect") &&
                !lowerUrl.contains("/link?") &&
                !lowerUrl.contains("redirect=") &&
                !lowerUrl.contains("url=")) {
                return googleUrl; // Không phải redirect URL
            }
        }
        
        try {
            // Thử với pattern chính
            Matcher matcher = GOOGLE_REDIRECT_PATTERN.matcher(googleUrl);
            if (matcher.find()) {
                String encodedUrl = matcher.group(3);
                if (encodedUrl != null && !encodedUrl.isEmpty()) {
                    // URL decode - có thể cần decode nhiều lần
                    String decodedUrl = encodedUrl;
                    int maxDecodeAttempts = 3;
                    for (int i = 0; i < maxDecodeAttempts; i++) {
                        try {
                            String temp = URLDecoder.decode(decodedUrl, StandardCharsets.UTF_8.toString());
                            if (temp.equals(decodedUrl)) {
                                break; // Không còn gì để decode
                            }
                            decodedUrl = temp;
                        } catch (Exception e) {
                            break; // Không thể decode thêm
                        }
                    }
                    logger.debug("Extracted URL from Google redirect: {} -> {}", googleUrl, decodedUrl);
                    return decodedUrl;
                }
            }
            
            // Fallback: tìm parameter url= trong query string
            Matcher urlParamMatcher = URL_PARAM_PATTERN.matcher(googleUrl);
            if (urlParamMatcher.find()) {
                String encodedUrl = urlParamMatcher.group(1);
                if (encodedUrl != null && !encodedUrl.isEmpty()) {
                    // URL decode
                    String decodedUrl = encodedUrl;
                    int maxDecodeAttempts = 3;
                    for (int i = 0; i < maxDecodeAttempts; i++) {
                        try {
                            String temp = URLDecoder.decode(decodedUrl, StandardCharsets.UTF_8.toString());
                            if (temp.equals(decodedUrl)) {
                                break;
                            }
                            decodedUrl = temp;
                        } catch (Exception e) {
                            break;
                        }
                    }
                    logger.debug("Extracted URL from query parameter: {} -> {}", googleUrl, decodedUrl);
                    return decodedUrl;
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to extract URL from Google redirect: {}", e.getMessage());
        }
        
        return googleUrl; // Return original if extraction failed
    }
    
    /**
     * Convert Wikipedia file URL sang direct image URL
     * @param wikipediaUrl Wikipedia file URL
     * @return Direct image URL hoặc original URL nếu không phải Wikipedia URL
     */
    public String convertWikipediaUrl(String wikipediaUrl) {
        if (wikipediaUrl == null || wikipediaUrl.trim().isEmpty()) {
            return wikipediaUrl;
        }
        
        try {
            Matcher matcher = WIKIPEDIA_FILE_PATTERN.matcher(wikipediaUrl);
            if (matcher.find()) {
                String langPrefix = matcher.group(1);
                String fileName = matcher.group(2);
                
                // URL decode fileName nếu cần (có thể được encode nhiều lần)
                try {
                    String tempFileName = fileName;
                    int maxDecodeAttempts = 3;
                    for (int i = 0; i < maxDecodeAttempts; i++) {
                        String decoded = URLDecoder.decode(tempFileName, StandardCharsets.UTF_8.toString());
                        if (decoded.equals(tempFileName)) {
                            break; // Không còn gì để decode
                        }
                        tempFileName = decoded;
                    }
                    fileName = tempFileName;
                } catch (Exception e) {
                    // Nếu decode fail, dùng fileName gốc
                    logger.debug("Could not decode Wikipedia filename, using original: {}", fileName);
                }
                
                // Build direct image URL
                // Format: https://[lang.]wikipedia.org/wiki/Special:FilePath/[filename]
                // Wikipedia Special:FilePath tự động handle URL encoding
                String lang = langPrefix != null && !langPrefix.isEmpty() 
                    ? langPrefix.replace(".", "") 
                    : "en";
                
                // Encode filename để đảm bảo URL hợp lệ (nhưng giữ nguyên spaces và special chars cho Wikipedia)
                String directUrl = String.format("https://%s.wikipedia.org/wiki/Special:FilePath/%s", 
                    lang, fileName);
                
                logger.debug("Converted Wikipedia URL: {} -> {}", wikipediaUrl, directUrl);
                return directUrl;
            }
        } catch (Exception e) {
            logger.warn("Failed to convert Wikipedia URL: {}", e.getMessage());
        }
        
        return wikipediaUrl; // Return original if not a Wikipedia URL
    }
    
    /**
     * Kiểm tra xem URL có phải là image URL hợp lệ không
     * @param url URL cần kiểm tra
     * @return true nếu có vẻ là image URL
     */
    public boolean isValidImageUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }
        
        // Kiểm tra extension
        Matcher matcher = IMAGE_EXTENSION_PATTERN.matcher(url);
        if (matcher.find()) {
            return true;
        }
        
        // Kiểm tra nếu là data URL (base64 image)
        if (url.startsWith("data:image/")) {
            return true;
        }
        
        // Kiểm tra nếu là Wikipedia Special:FilePath URL
        if (url.contains("wikipedia.org/wiki/Special:FilePath/")) {
            return true;
        }
        
        // Kiểm tra nếu là relative path bắt đầu với /uploads
        if (url.startsWith("/uploads/")) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Normalize URL - loại bỏ whitespace, kiểm tra format
     */
    public String normalizeUrl(String url) {
        if (url == null) {
            return null;
        }
        
        String normalized = url.trim();
        
        // Loại bỏ trailing slashes (trừ khi là root)
        if (normalized.length() > 1 && normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        
        return normalized.isEmpty() ? null : normalized;
    }
    
    /**
     * Kiểm tra xem URL có phải là redirect URL không
     * @param url URL cần kiểm tra
     * @return true nếu có vẻ là redirect URL
     */
    private boolean isRedirectUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }
        
        String lowerUrl = url.toLowerCase();
        
        // Kiểm tra các pattern redirect phổ biến
        if (lowerUrl.contains("/url?") || 
            lowerUrl.contains("/redirect") ||
            lowerUrl.contains("/link?") ||
            lowerUrl.contains("redirect=") ||
            lowerUrl.contains("url=")) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Kiểm tra xem URL có phải là direct image URL không (có thể dùng trực tiếp trong thẻ img)
     * @param url URL cần kiểm tra
     * @return true nếu là direct image URL
     */
    public boolean isDirectImageUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }
        
        // Nếu là redirect URL thì không phải direct
        if (isRedirectUrl(url)) {
            return false;
        }
        
        // Kiểm tra extension
        if (isValidImageUrl(url)) {
            return true;
        }
        
        // Kiểm tra nếu là data URL
        if (url.startsWith("data:image/")) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Get base URL từ request hoặc config
     */
    public String getBaseUrl() {
        return "http://localhost:" + serverPort + contextPath;
    }
}

