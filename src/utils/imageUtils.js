// Helper function để xử lý image URL
// Nếu URL là relative path, thêm base URL từ backend
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:8080/api/public';

/**
 * Xử lý image URL để hiển thị đúng
 * @param {string} url - URL hoặc path của ảnh
 * @param {boolean} isPublic - Nếu true, dùng public API URL
 * @returns {string} - URL đầy đủ để hiển thị
 */
export const getImageUrl = (url, isPublic = false) => {
  if (!url) return null;
  
  // Nếu đã là full URL (http/https), trả về nguyên
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Nếu bắt đầu bằng /, thêm base URL
  if (url.startsWith('/')) {
    const baseUrl = isPublic ? PUBLIC_BASE_URL.replace('/api/public', '') : BASE_URL.replace('/api', '');
    return `${baseUrl}${url}`;
  }
  
  // Nếu là relative path, thêm base URL và /
  const baseUrl = isPublic ? PUBLIC_BASE_URL.replace('/api/public', '') : BASE_URL.replace('/api', '');
  return `${baseUrl}/${url}`;
};

/**
 * Xử lý image URL cho vehicle brand logo
 */
export const getBrandLogoUrl = (brand) => {
  if (!brand) return null;
  
  if (brand.brandLogoUrl) {
    return getImageUrl(brand.brandLogoUrl);
  }
  
  if (brand.brandLogoPath) {
    return getImageUrl(brand.brandLogoPath);
  }
  
  return null;
};

/**
 * Xử lý image URL cho vehicle model
 */
export const getModelImageUrl = (model) => {
  if (!model) return null;
  
  if (model.modelImageUrl) {
    return getImageUrl(model.modelImageUrl);
  }
  
  if (model.modelImagePath) {
    return getImageUrl(model.modelImagePath);
  }
  
  return null;
};

/**
 * Xử lý image URL cho vehicle variant
 */
export const getVariantImageUrl = (variant) => {
  if (!variant) return null;
  
  if (variant.variantImageUrl) {
    return getImageUrl(variant.variantImageUrl);
  }
  
  if (variant.variantImagePath) {
    return getImageUrl(variant.variantImagePath);
  }
  
  return null;
};

/**
 * Xử lý image URL cho color swatch
 */
export const getColorSwatchUrl = (color) => {
  if (!color) return null;
  
  if (color.colorSwatchUrl) {
    return getImageUrl(color.colorSwatchUrl);
  }
  
  if (color.colorSwatchPath) {
    return getImageUrl(color.colorSwatchPath);
  }
  
  return null;
};

/**
 * Xử lý image URL từ image management API
 */
export const getImageManagementUrl = (category, filename) => {
  if (!category || !filename) return null;
  
  const baseUrl = BASE_URL.replace('/api', '');
  return `${baseUrl}/images/${category}/${filename}`;
};

