import axios from 'axios';

// Lấy base URL từ .env hoặc mặc định localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const PUBLIC_BASE_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:8080/api/public';

// ==================== AXIOS INSTANCE ====================
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const publicApi = axios.create({
  baseURL: PUBLIC_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ==================== INTERCEPTORS ====================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const isValidToken =
      typeof token === 'string' &&
      token !== 'null' &&
      token !== 'undefined' &&
      token.trim() !== '';

    if (isValidToken && !config.url.includes('/auth/login')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc sai
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  validate: (token) => {
    // Backend reads token from Authorization header, so we set it manually if provided
    if (token) {
      return api.post('/auth/validate', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    // If no token provided, use default interceptor behavior
    return api.post('/auth/validate');
  },
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// ==================== USER API ====================
export const userAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  getUsersByDealer: (dealerId) => api.get(`/users/dealer/${dealerId}`),
  createUser: (data) => api.post('/users', data),
  createUserFromDTO: (data) => api.post('/users/dto', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  deactivateUser: (id) => api.put(`/users/${id}/deactivate`),
  resetPassword: (id) => api.post(`/users/${id}/reset-password`),
  resetPasswordByUsername: (username) => api.post(`/users/username/${username}/reset-password`),
  resetPasswordByEmail: (email) => api.post(`/users/email/${email}/reset-password`),
  bulkResetPassword: (data) => api.post('/users/bulk-reset-password', data),
};

// ==================== CUSTOMER API ====================
export const customerAPI = {
  getCustomers: () => api.get('/customers'),
  getCustomer: (id) => api.get(`/customers/${id}`),
  getCustomerByEmail: (email) => api.get(`/customers/email/${email}`),
  getCustomerByPhone: (phone) => api.get(`/customers/phone/${phone}`),
  searchCustomers: (name) => api.get(`/customers/search?name=${name}`),
  createCustomer: (data) => api.post('/customers', data),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
};

// ==================== PUBLIC CUSTOMER API ====================
export const publicCustomerAPI = {
  createCustomer: (data) => publicApi.post('/customers', data),
};

// ==================== VEHICLE API ====================
export const vehicleAPI = {
  // Brands
  getBrands: () => api.get('/vehicles/brands'),
  getBrand: (id) => api.get(`/vehicles/brands/${id}`),
  createBrand: (data) => api.post('/vehicles/brands', data),
  updateBrand: (id, data) => api.put(`/vehicles/brands/${id}`, data),
  deleteBrand: (id) => api.delete(`/vehicles/brands/${id}`),
  
  // Models
  getModels: () => api.get('/vehicles/models'),
  getModel: (id) => api.get(`/vehicles/models/${id}`),
  getModelsByBrand: (brandId) => api.get(`/vehicles/models/brand/${brandId}`),
  searchModels: (q) => api.get(`/vehicles/models/search?name=${q}`),
  createModel: (data) => api.post('/vehicles/models', data),
  updateModel: (id, data) => api.put(`/vehicles/models/${id}`, data),
  deleteModel: (id) => api.delete(`/vehicles/models/${id}`),
  
  // Variants
  getVariants: () => api.get('/vehicles/variants'),
  getVariant: (id) => api.get(`/vehicles/variants/${id}`),
  getVariantsByModel: (modelId) => api.get(`/vehicles/variants/model/${modelId}`),
  searchVariants: (q) => api.get(`/vehicles/variants/search?name=${q}`),
  createVariant: (data) => api.post('/vehicles/variants', data),
  updateVariant: (id, data) => api.put(`/vehicles/variants/${id}`, data),
  deleteVariant: (id) => api.delete(`/vehicles/variants/${id}`),
  
  // Colors
  getColors: () => api.get('/vehicles/colors'),
  getColor: (id) => api.get(`/vehicles/colors/${id}`),
  searchColors: (q) => api.get(`/vehicles/colors/search?name=${q}`),
  createColor: (data) => api.post('/vehicles/colors', data),
  updateColor: (id, data) => api.put(`/vehicles/colors/${id}`, data),
  deleteColor: (id) => api.delete(`/vehicles/colors/${id}`),
  
  // Full Vehicle Creation
  createFullVehicle: (data) =>
    api.post('/vehicle-creation/create-full-vehicle', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ==================== ORDER API ====================
export const orderAPI = {
  getOrders: () => api.get('/orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  updateOrder: (id, data) => api.put(`/orders/${id}`, data),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
};

// ==================== PUBLIC ORDER API ====================
export const publicOrderAPI = {
  createOrder: (data) => publicApi.post('/orders', data),
  getOrder: (orderId) => publicApi.get(`/orders/${orderId}`),
  getOrderByNumber: (orderNumber) => publicApi.get(`/orders/order-number/${orderNumber}`),
  getOrderStatus: (orderId) => publicApi.get(`/orders/${orderId}/status`),
  trackOrder: (orderNumber) => publicApi.get(`/orders/track/${orderNumber}`),
  cancelOrder: (orderId, reason) => {
    const params = reason ? { reason } : {};
    return publicApi.put(`/orders/${orderId}/cancel`, null, { params });
  },
};

// ==================== WAREHOUSE API ====================
export const warehouseAPI = {
  getWarehouses: () => api.get('/warehouses'),
  getWarehouse: (id) => api.get(`/warehouses/${id}`),
  createWarehouse: (data) => api.post('/warehouses', data),
  updateWarehouse: (id, data) => api.put(`/warehouses/${id}`, data),
  activateWarehouse: (id) => api.put(`/warehouses/${id}/activate`),
  deactivateWarehouse: (id) => api.put(`/warehouses/${id}/deactivate`),
  deleteWarehouse: (id) => api.delete(`/warehouses/${id}`),
};

// ==================== PUBLIC VEHICLE API ====================
export const publicVehicleAPI = {
  getBrands: () => publicApi.get('/vehicle-brands'),
  getModels: (brandId) => {
    const params = brandId ? { brandId } : {};
    return publicApi.get('/vehicle-models', { params });
  },
  getVariants: (modelId) => {
    const params = modelId ? { modelId } : {};
    return publicApi.get('/vehicle-variants', { params });
  },
  getColors: () => publicApi.get('/vehicle-colors'),
  getInventory: () => publicApi.get('/vehicle-inventory'),
  getInventoryById: (id) => publicApi.get(`/vehicle-inventory/${id}`),
  getPromotions: () => publicApi.get('/promotions'),
};
// ==================== DEALER API ====================
export const dealerAPI = {
  getAll: () => api.get('/dealers'),
  getDealer: (id) => api.get(`/dealers/${id}`),
  search: (keyword) => api.get(`/dealers/search?keyword=${keyword}`),
  create: (data) => api.post('/dealers', data),
  createFromDTO: (data) => api.post('/dealers/dto', data),
  update: (id, data) => api.put(`/dealers/${id}`, data),
  updateStatus: (id, status) => api.put(`/dealers/${id}/status`, { status }),
  delete: (id) => api.delete(`/dealers/${id}`),
};
// ==================== INVENTORY API ====================
export const inventoryAPI = {
  getInventory: () => api.get('/inventory-management'),
  getInventoryById: (id) => api.get(`/inventory-management/${id}`),
  createInventory: (data) => api.post('/inventory-management', data),
  createFromRequest: (data) => api.post('/inventory-management/create-from-request', data),
  updateInventory: (id, data) => api.put(`/inventory-management/${id}`, data),
  updateFromRequest: (id, data) => api.put(`/inventory-management/${id}/update-from-request`, data),
  updateStatus: (id, status) => api.put(`/inventory-management/${id}/status`, { status }),
  markSold: (id) => api.put(`/inventory-management/${id}/mark-sold`),
  markReserved: (id) => api.put(`/inventory-management/${id}/mark-reserved`),
  deleteInventory: (id) => api.delete(`/inventory-management/${id}`),
  normalizeStatuses: () => api.post('/inventory-management/normalize-statuses'),
  validateStatus: (status) => api.post('/inventory-management/validate-status', { status }),
  
  // Get by status
  getInventoryByStatus: (status) => api.get(`/inventory/status/${status}`),
  getAvailableInventory: () => api.get('/inventory/available'),
  
  // Legacy endpoints (keep for backward compatibility)
  getInventoryByVin: (vin) => api.get(`/vehicle-inventory/vin/${vin}`),
  getAllStatuses: () => api.get('/vehicle-inventory/statuses'),
  getStatusSummary: () => api.get('/vehicle-inventory/status-summary'),
  getStatusOptions: () => api.get('/vehicle-inventory/status-options'),
  getInventoryByVariant: (variantId) => api.get(`/vehicle-inventory/variant/${variantId}`),
  getInventoryByColor: (colorId) => api.get(`/vehicle-inventory/color/${colorId}`),
  getInventoryByWarehouse: (warehouseId) => api.get(`/vehicle-inventory/warehouse/${warehouseId}`),
  getInventoryByWarehouseLocation: (location) => api.get(`/vehicle-inventory/warehouse-location/${location}`),
  getInventoryByPriceRange: (minPrice, maxPrice) => 
    api.get(`/vehicle-inventory/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`),
  getInventoryByManufacturingDateRange: (startDate, endDate) => 
    api.get(`/vehicle-inventory/manufacturing-date-range?startDate=${startDate}&endDate=${endDate}`),
  getInventoryByArrivalDateRange: (startDate, endDate) => 
    api.get(`/vehicle-inventory/date-range?startDate=${startDate}&endDate=${endDate}`),
  searchByVin: (vin) => api.get(`/vehicle-inventory/search/vin?vin=${vin}`),
  searchByChassisNumber: (chassisNumber) => api.get(`/vehicle-inventory/search/chassis?chassisNumber=${chassisNumber}`),
  updateInventoryStatus: (id, status) => api.put(`/vehicle-inventory/${id}/status?status=${status}`),
};

// ==================== PROMOTION API ====================
export const promotionAPI = {
  getPromotions: () => api.get('/promotions'),
  getPromotion: (id) => api.get(`/promotions/${id}`),
  getPromotionsByVariant: (variantId) => api.get(`/promotions/variant/${variantId}`),
  getPromotionsByStatus: (status) => api.get(`/promotions/status/${status}`),
  getActivePromotions: () => api.get('/promotions/active'),
  getActivePromotionsByDate: (date) => api.get(`/promotions/active/date/${date}`),
  createPromotion: (data) => api.post('/promotions', data),
  updatePromotion: (id, data) => api.put(`/promotions/${id}`, data),
  updateStatus: (id, status) => api.put(`/promotions/${id}/status`, { status }),
  activatePromotion: (id) => api.put(`/promotions/${id}/activate`),
  deactivatePromotion: (id) => api.put(`/promotions/${id}/deactivate`),
  deletePromotion: (id) => api.delete(`/promotions/${id}`),
};

// ==================== FEEDBACK API ====================
export const feedbackAPI = {
  getFeedbacks: () => api.get('/feedbacks'),
  getFeedback: (id) => api.get(`/feedbacks/${id}`),
  getFeedbacksByCustomer: (customerId) => api.get(`/feedbacks/customer/${customerId}`),
  getFeedbacksByOrder: (orderId) => api.get(`/feedbacks/order/${orderId}`),
  getFeedbacksByStatus: (status) => api.get(`/feedbacks/status/${status}`),
  createFeedback: (data) => api.post('/feedbacks', data),
  updateFeedback: (id, data) => api.put(`/feedbacks/${id}`, data),
  updateStatus: (id, status) => api.put(`/feedbacks/${id}/status`, { status }),
  respondFeedback: (id, response) => api.put(`/feedbacks/${id}/respond`, { response }),
  replyFeedback: (id, reply) => api.post(`/feedbacks/${id}/reply`, { reply }), // Legacy, use respondFeedback
  deleteFeedback: (id) => api.delete(`/feedbacks/${id}`),
};

// ==================== PUBLIC FEEDBACK API ====================
export const publicFeedbackAPI = {
  createFeedback: (data) => publicApi.post('/feedbacks', data),
  getFeedback: (id) => publicApi.get(`/feedbacks/${id}`),
};

// ==================== SALES CONTRACT API ====================
export const salesContractAPI = {
  getContracts: () => api.get('/sales-contracts'),
  getContract: (id) => api.get(`/sales-contracts/${id}`),
  getContractsByOrder: (orderId) => api.get(`/sales-contracts/order/${orderId}`),
  getContractsByCustomer: (customerId) => api.get(`/sales-contracts/customer/${customerId}`),
  getContractsByStatus: (status) => api.get(`/sales-contracts/status/${status}`),
  createContract: (data) => api.post('/sales-contracts', data),
  updateContract: (id, data) => api.put(`/sales-contracts/${id}`, data),
  updateStatus: (id, status) => api.put(`/sales-contracts/${id}/status`, { status }),
  signContract: (id, signedDate) => {
    const params = signedDate ? { signedDate } : {};
    return api.put(`/sales-contracts/${id}/sign`, null, { params });
  },
  deleteContract: (id) => api.delete(`/sales-contracts/${id}`),
};

// ==================== PUBLIC CONTRACT API ====================
export const publicContractAPI = {
  getContract: (contractId) => publicApi.get(`/contracts/${contractId}`),
  getContractByOrder: (orderId) => publicApi.get(`/contracts/order/${orderId}`),
  getContractStatus: (contractId) => publicApi.get(`/contracts/${contractId}/status`),
  downloadContract: (contractId) => publicApi.get(`/contracts/${contractId}/download`, { responseType: 'blob' }),
  signContract: (contractId, customerSignature, signatureMethod) => {
    const params = {};
    if (customerSignature) params.customerSignature = customerSignature;
    if (signatureMethod) params.signatureMethod = signatureMethod;
    return publicApi.post(`/contracts/${contractId}/sign`, null, { params });
  },
  rejectContract: (contractId, reason) => {
    const params = reason ? { reason } : {};
    return publicApi.post(`/contracts/${contractId}/reject`, null, { params });
  },
};

// ==================== DEALER TARGET API ====================
export const dealerTargetAPI = {
  getTargets: () => api.get('/dealer-targets'),
  getTarget: (id) => api.get(`/dealer-targets/${id}`),
  getTargetsByDealer: (dealerId) => api.get(`/dealer-targets/dealer/${dealerId}`),
  getTargetsByDealerAndYear: (dealerId, year) => api.get(`/dealer-targets/dealer/${dealerId}/year/${year}`),
  createTarget: (data) => api.post('/dealer-targets', data),
  updateTarget: (id, data) => api.put(`/dealer-targets/${id}`, data),
  updateStatus: (id, status) => api.put(`/dealer-targets/${id}/status`, { status }),
  updateAchievement: (id, achievement) => api.put(`/dealer-targets/${id}/achievement`, { achievement }),
  deleteTarget: (id) => api.delete(`/dealer-targets/${id}`),
};

// ==================== DEALER CONTRACT API ====================
export const dealerContractAPI = {
  getContracts: () => api.get('/dealer-contracts'),
  getContract: (id) => api.get(`/dealer-contracts/${id}`),
  getContractsByDealer: (dealerId) => api.get(`/dealer-contracts/dealer/${dealerId}`),
  getContractsByStatus: (status) => api.get(`/dealer-contracts/status/${status}`),
  createContract: (data) => api.post('/dealer-contracts', data),
  updateContract: (id, data) => api.put(`/dealer-contracts/${id}`, data),
  updateStatus: (id, status) => api.put(`/dealer-contracts/${id}/status`, { status }),
  signContract: (id, signedDate) => {
    const params = signedDate ? { signedDate } : {};
    return api.put(`/dealer-contracts/${id}/sign`, null, { params });
  },
  deleteContract: (id) => api.delete(`/dealer-contracts/${id}`),
};

// ==================== PRICING POLICY API ====================
export const pricingPolicyAPI = {
  getPolicies: () => api.get('/pricing-policies'),
  getPolicy: (id) => api.get(`/pricing-policies/${id}`),
  getPoliciesByDealer: (dealerId) => api.get(`/pricing-policies/dealer/${dealerId}`),
  getDealerSpecificPolicies: () => api.get('/pricing-policies/dealer-specific'),
  createPolicy: (data) => api.post('/pricing-policies', data),
  updatePolicy: (id, data) => api.put(`/pricing-policies/${id}`, data),
  updateStatus: (id, status) => api.put(`/pricing-policies/${id}/status`, { status }),
  deletePolicy: (id) => api.delete(`/pricing-policies/${id}`),
};

// ==================== REPORT API ====================
export const reportAPI = {
  getSalesReport: (params) => api.get('/reports/sales', { params }),
  getInventoryReport: (params) => api.get('/reports/inventory', { params }),
  getDealerReport: (params) => api.get('/reports/dealer', { params }),
  getCustomerReport: (params) => api.get('/reports/customer', { params }),
  getPaymentReport: (params) => api.get('/reports/payment', { params }),
};

// ==================== IMAGE API ====================
export const imageAPI = {
  // Get images by category
  getImages: (category) => api.get(`/images/${category}`),
  getAllImages: () => api.get('/images'),
  // Upload
  upload: (formData) => api.post('/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadMultiple: (formData) => api.post('/images/upload-multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadVehicleBrand: (formData) => api.post('/images/upload/vehicle-brand', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadVehicleModel: (formData) => api.post('/images/upload/vehicle-model', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadVehicleVariant: (formData) => api.post('/images/upload/vehicle-variant', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadVehicleInventory: (formData) => api.post('/images/upload/vehicle-inventory', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadColorSwatch: (formData) => api.post('/images/upload/color-swatch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  // Delete
  deleteImage: (category, filename) => api.delete(`/images/delete/${category}/${filename}`),
  deleteCategory: (category) => api.delete(`/images/delete-category/${category}`),
  // Update
  updateImage: (category, filename, formData) => api.put(`/images/update/${category}/${filename}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  renameImage: (category, oldFilename, newFilename) => api.put(`/images/rename/${category}/${oldFilename}`, { newFilename }),
  moveImage: (oldCategory, filename, newCategory) => api.put(`/images/move/${oldCategory}/${filename}`, { newCategory }),
  // Bulk operations
  bulkDelete: (data) => api.post('/images/bulk-delete', data),
  bulkMove: (data) => api.post('/images/bulk-move', data),
};

// ==================== INSTALLMENT PLAN API ====================
export const installmentPlanAPI = {
  getPlans: () => api.get('/installment-plans'),
  getPlan: (id) => api.get(`/installment-plans/${id}`),
  getDealerPlans: () => api.get('/installment-plans/dealer-plans'),
  getPlansByDealer: (dealerId) => api.get(`/installment-plans/dealer/${dealerId}`),
  getPlansByInvoice: (invoiceId) => api.get(`/installment-plans/invoice/${invoiceId}`),
  createPlan: (data) => api.post('/installment-plans', data),
  updatePlan: (id, data) => api.put(`/installment-plans/${id}`, data),
  updateStatus: (id, status) => api.put(`/installment-plans/${id}/status`, { status }),
  deletePlan: (id) => api.delete(`/installment-plans/${id}`),
};

// ==================== INSTALLMENT SCHEDULE API ====================
export const installmentScheduleAPI = {
  getSchedules: () => api.get('/installment-schedules'),
  getSchedule: (id) => api.get(`/installment-schedules/${id}`),
  createSchedule: (data) => api.post('/installment-schedules', data),
  updateSchedule: (id, data) => api.put(`/installment-schedules/${id}`, data),
  updateStatus: (id, status) => api.put(`/installment-schedules/${id}/status`, { status }),
  markPaid: (id) => api.put(`/installment-schedules/${id}/mark-paid`),
  deleteSchedule: (id) => api.delete(`/installment-schedules/${id}`),
};

// ==================== QUOTATION API (Customer) ====================
export const quotationAPI = {
  getQuotations: () => api.get('/quotations'),
  getQuotation: (id) => api.get(`/quotations/${id}`),
  getQuotationByNumber: (number) => api.get(`/quotations/number/${number}`),
  getQuotationsByStatus: (status) => api.get(`/quotations/status/${status}`),
  getQuotationsByCustomer: (customerId) => api.get(`/quotations/customer/${customerId}`),
  createQuotation: (data) => api.post('/quotations', data),
  updateQuotation: (id, data) => api.put(`/quotations/${id}`, data),
  deleteQuotation: (id) => api.delete(`/quotations/${id}`),
  sendQuotation: (id) => api.put(`/quotations/${id}/send`),
};

// ==================== PUBLIC QUOTATION API ====================
export const publicQuotationAPI = {
  getQuotation: (id) => publicApi.get(`/quotations/${id}`),
  acceptQuotation: (id, conditions) => {
    // Backend uses @RequestParam, so we send as query params
    const params = conditions ? { conditions } : {};
    return publicApi.post(`/quotations/${id}/accept`, null, { params });
  },
  rejectQuotation: (id, reason, adjustmentRequest) => {
    // Backend uses @RequestParam, so we send as query params
    const params = {};
    if (reason) params.reason = reason;
    if (adjustmentRequest) params.adjustmentRequest = adjustmentRequest;
    return publicApi.post(`/quotations/${id}/reject`, null, { params });
  },
};

// ==================== DEALER ORDER API ====================
export const dealerOrderAPI = {
  getOrders: () => api.get('/dealer-orders'),
  getOrder: (id) => api.get(`/dealer-orders/${id}`),
  getOrderByNumber: (orderNumber) => api.get(`/dealer-orders/order-number/${orderNumber}`),
  getOrdersByEvmStaff: (evmStaffId) => api.get(`/dealer-orders/evm-staff/${evmStaffId}`),
  getOrdersByStatus: (status) => api.get(`/dealer-orders/status/${status}`),
  getOrdersByDealer: (dealerId) => api.get(`/dealer-orders/dealer/${dealerId}`),
  createDetailedOrder: (data) => api.post('/dealer-orders/create-detailed', data),
  updateOrder: (id, data) => api.put(`/dealer-orders/${id}`, data),
  approveOrder: (id) => api.post(`/dealer-orders/${id}/approve`),
  rejectOrder: (id, rejectionReason) => {
    // Backend uses @RequestParam, so we send as query params
    return api.post(`/dealer-orders/${id}/reject`, null, { 
      params: { rejectionReason } 
    });
  },
  requestQuotation: (id, notes) => {
    // Backend uses @RequestParam, so we send as query params
    const params = notes ? { notes } : {};
    return api.post(`/dealer-orders/${id}/request-quotation`, null, { params });
  },
  cancelOrder: (id) => api.put(`/dealer-orders/${id}/cancel`),
  deleteOrder: (id) => api.delete(`/dealer-orders/${id}`),
};

// ==================== DEALER QUOTATION API ====================
export const dealerQuotationAPI = {
  getQuotations: () => api.get('/dealer-quotations'),
  getQuotation: (id) => api.get(`/dealer-quotations/${id}`),
  getQuotationByNumber: (number) => api.get(`/dealer-quotations/number/${number}`),
  getQuotationsByDealer: (dealerId) => api.get(`/dealer-quotations/dealer/${dealerId}`),
  getQuotationsByDealerOrder: (dealerOrderId) => api.get(`/dealer-quotations/dealer-order/${dealerOrderId}`),
  getQuotationsByStatus: (status) => api.get(`/dealer-quotations/status/${status}`),
  // Create quotation from order - uses query params: evmStaffId, discountPercentage, notes
  createQuotationFromOrder: (orderId, evmStaffId, discountPercentage, notes) => {
    const params = {};
    if (evmStaffId) params.evmStaffId = evmStaffId;
    if (discountPercentage !== undefined) params.discountPercentage = discountPercentage;
    if (notes) params.notes = notes;
    return api.post(`/dealer-quotations/from-order/${orderId}`, null, { params });
  },
  sendQuotation: (id) => api.post(`/dealer-quotations/${id}/send`),
  acceptQuotation: (id) => api.post(`/dealer-quotations/${id}/accept`),
  rejectQuotation: (id, reason) => {
    // Backend uses @RequestParam, so we send as query params
    const params = reason ? { reason } : {};
    return api.post(`/dealer-quotations/${id}/reject`, null, { params });
  },
  updateQuotation: (id, data) => api.put(`/dealer-quotations/${id}`, data),
  deleteQuotation: (id) => api.delete(`/dealer-quotations/${id}`),
};

// ==================== DEALER INVOICE API ====================
export const dealerInvoiceAPI = {
  getInvoices: () => api.get('/dealer-invoices'),
  getInvoice: (id) => api.get(`/dealer-invoices/${id}`),
  getInvoiceByNumber: (invoiceNumber) => api.get(`/dealer-invoices/number/${invoiceNumber}`),
  getInvoicesByDealerOrder: (dealerOrderId) => api.get(`/dealer-invoices/dealer-order/${dealerOrderId}`),
  getInvoicesByDealer: (dealerId) => api.get(`/dealer-invoices/dealer/${dealerId}`),
  getInvoicesByStatus: (status) => api.get(`/dealer-invoices/status/${status}`),
  createInvoice: (data) => api.post('/dealer-invoices', data),
  updateInvoice: (id, data) => api.put(`/dealer-invoices/${id}`, data),
  updateStatus: (id, status) => api.put(`/dealer-invoices/${id}/status`, { status }),
  deleteInvoice: (id) => api.delete(`/dealer-invoices/${id}`),
};

// ==================== DEALER PAYMENT API ====================
export const dealerPaymentAPI = {
  getPayments: () => api.get('/dealer-payments'),
  getPayment: (id) => api.get(`/dealer-payments/${id}`),
  getPaymentsByInvoice: (invoiceId) => api.get(`/dealer-payments/invoice/${invoiceId}`),
  getPaymentsByDealer: (dealerId) => api.get(`/dealer-payments/dealer/${dealerId}`),
  processPayment: (data) => api.post('/dealer-payments/process-payment', data),
  updatePayment: (id, data) => api.put(`/dealer-payments/${id}`, data),
  updateStatus: (id, status) => api.put(`/dealer-payments/${id}/status`, { status }),
  deletePayment: (id) => api.delete(`/dealer-payments/${id}`),
};

// ==================== CUSTOMER PAYMENT API ====================
export const customerPaymentAPI = {
  getPayments: () => api.get('/customer-payments'),
  getPayment: (id) => api.get(`/customer-payments/${id}`),
  createPayment: (data) => api.post('/customer-payments', data),
  updatePaymentStatus: (id, status) => api.put(`/customer-payments/${id}/status`, { status }),
};

// ==================== PUBLIC PAYMENT API ====================
export const publicPaymentAPI = {
  createDeposit: (data) => publicApi.post('/payments/deposit', data),
  createFullPayment: (data) => publicApi.post('/payments/full', data),
  createInstallmentPayment: (data) => publicApi.post('/payments/installment', data),
  getPayment: (paymentId) => publicApi.get(`/payments/${paymentId}`),
  requestRefund: (paymentId, reason) => {
    const params = reason ? { reason } : {};
    return publicApi.post(`/payments/${paymentId}/refund`, null, { params });
  },
};

// ==================== APPOINTMENT API ====================
export const appointmentAPI = {
  getAppointments: () => api.get('/appointments'),
  getAppointment: (id) => api.get(`/appointments/${id}`),
  getAppointmentsByCustomer: (customerId) => api.get(`/appointments/customer/${customerId}`),
  getAppointmentsByOrder: (orderId) => api.get(`/appointments/order/${orderId}`),
  getAppointmentsByStaff: (staffId) => api.get(`/appointments/staff/${staffId}`),
  getAppointmentsByStatus: (status) => api.get(`/appointments/status/${status}`),
  getAppointmentsByType: (type) => api.get(`/appointments/type/${type}`),
  createAppointment: (data) => api.post('/appointments', data),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  confirmAppointment: (id) => api.put(`/appointments/${id}/confirm`),
  completeAppointment: (id, notes) => {
    const body = notes ? { notes } : {};
    return api.put(`/appointments/${id}/complete`, body);
  },
  cancelAppointment: (id, reason) => {
    const params = reason ? { reason } : {};
    return api.put(`/appointments/${id}/cancel`, null, { params });
  },
  rescheduleAppointment: (id, newDate, reason) => {
    const params = {};
    if (newDate) params.newDate = newDate;
    if (reason) params.reason = reason;
    return api.put(`/appointments/${id}/reschedule`, null, { params });
  },
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
};

// ==================== PUBLIC APPOINTMENT API ====================
export const publicAppointmentAPI = {
  createTestDrive: (data) => publicApi.post('/appointments/test-drive', data),
  createDelivery: (data) => publicApi.post('/appointments/delivery', data),
  getAppointment: (id) => publicApi.get(`/appointments/${id}`),
  rescheduleAppointment: (id, newDate, reason) => {
    const params = {};
    if (newDate) params.newDate = newDate;
    if (reason) params.reason = reason;
    return publicApi.put(`/appointments/${id}/reschedule`, null, { params });
  },
  cancelAppointment: (id, reason) => {
    const params = reason ? { reason } : {};
    return publicApi.put(`/appointments/${id}/cancel`, null, { params });
  },
};

// ==================== VEHICLE DELIVERY API ====================
export const vehicleDeliveryAPI = {
  getDeliveries: () => api.get('/vehicle-deliveries'),
  getDelivery: (id) => api.get(`/vehicle-deliveries/${id}`),
  getDeliveriesByOrder: (orderId) => api.get(`/vehicle-deliveries/order/${orderId}`),
  getDeliveriesByDealerOrder: (dealerOrderId) => api.get(`/vehicle-deliveries/dealer-order/${dealerOrderId}`),
  getDeliveriesByInventory: (inventoryId) => api.get(`/vehicle-deliveries/inventory/${inventoryId}`),
  getDeliveriesByStatus: (status) => api.get(`/vehicle-deliveries/status/${status}`),
  createDelivery: (data) => api.post('/vehicle-deliveries', data),
  // Create delivery for dealer order - body contains delivery details
  createDeliveryForDealerOrder: (dealerOrderId, data) => api.post(`/vehicle-deliveries/dealer-order/${dealerOrderId}`, data),
  updateDelivery: (id, data) => api.put(`/vehicle-deliveries/${id}`, data),
  updateStatus: (id, status) => api.put(`/vehicle-deliveries/${id}/status?status=${status}`),
  // Confirm delivery by EVM staff - empty body
  confirmDelivery: (id) => api.put(`/vehicle-deliveries/${id}/confirm`),
  // Dealer confirm delivery - empty body
  dealerConfirmDelivery: (id) => api.put(`/vehicle-deliveries/${id}/dealer-confirm`),
  cancelDelivery: (id) => api.put(`/vehicle-deliveries/${id}/cancel`),
  deleteDelivery: (id) => api.delete(`/vehicle-deliveries/${id}`),
};

// ==================== EXPORT DEFAULT ====================
export default api;
