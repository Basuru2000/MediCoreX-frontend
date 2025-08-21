import axios from 'axios'

// Use full backend URL
const API_URL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('=== API Request:', config.method.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('=== API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('=== API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('=== API Error:', error.response?.status, error.response?.data)
    
    if (error.response?.status === 401) {
      // Only redirect to login if we're not already trying to login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const login = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)

// User endpoints
export const getUsers = () => api.get('/users')
export const getUserById = (id) => api.get(`/users/${id}`)
export const createUser = (data) => api.post('/users', data)
export const updateUser = (id, data) => api.put(`/users/${id}`, data)
export const deleteUser = (id) => api.delete(`/users/${id}`)
export const toggleUserStatus = (id) => api.put(`/users/${id}/toggle-status`)

// Product endpoints
export const getProducts = (params = {}) => {
  const queryParams = new URLSearchParams({
    page: params.page || 0,
    size: params.size || 10,
    sortBy: params.sortBy || 'name',
    sortDirection: params.sortDirection || 'ASC'
  }).toString();
  return api.get(`/products?${queryParams}`)
}

export const getProductsByCategory = (categoryId, params = {}) => {
  const queryParams = new URLSearchParams({
    page: params.page || 0,
    size: params.size || 10
  }).toString();
  return api.get(`/products/category/${categoryId}?${queryParams}`)
}

export const getLowStockProducts = () => api.get('/products/low-stock')

export const getExpiringProducts = (daysAhead = 30) => api.get(`/products/expiring?daysAhead=${daysAhead}`)

export const getProductById = (id) => api.get(`/products/${id}`)

export const getProductByCode = (code) => api.get(`/products/code/${code}`)

export const getProductByBarcode = (barcode) => api.get(`/products/barcode/${barcode}`)

export const searchProducts = (query) => api.get(`/products/search?query=${query}`)

export const createProduct = (data) => api.post('/products', data)

export const updateProduct = (id, data) => api.put(`/products/${id}`, data)

export const deleteProduct = (id) => api.delete(`/products/${id}`)

export const scanBarcode = (data) => api.post('/products/barcode/scan', data)

export const generateBarcodeImage = (barcode) => api.get(`/products/barcode/generate/${barcode}`)

// Product Import/Export endpoints
export const exportProductsCSV = (filter = 'all') => {
  return api.get(`/products/export/csv?filter=${filter}`, {
    responseType: 'blob'
  })
}

export const exportProductsExcel = (filter = 'all') => {
  return api.get(`/products/export/excel?filter=${filter}`, {
    responseType: 'blob'
  })
}

export const downloadImportTemplate = () => {
  return api.get('/products/import/template', {
    responseType: 'blob'
  })
}

export const importProducts = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return api.post('/products/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// Category endpoints
export const getCategories = () => api.get('/categories')

export const getCategoryTree = () => api.get('/categories/tree')

export const getRootCategories = () => api.get('/categories/root')

export const getChildCategories = (parentId) => api.get(`/categories/${parentId}/children`)

export const getCategoryById = (id) => api.get(`/categories/${id}`)

export const createCategory = (data) => api.post('/categories', data)

export const updateCategory = (id, data) => api.put(`/categories/${id}`, data)

export const deleteCategory = (id) => api.delete(`/categories/${id}`)

// Stock endpoints
export const adjustStock = (data) => api.post('/stock/adjust', data)

export const getStockTransactions = (params = {}) => {
  const queryParams = new URLSearchParams({
    ...(params.productId && { productId: params.productId }),
    page: params.page || 0,
    size: params.size || 10
  }).toString();
  return api.get(`/stock/transactions?${queryParams}`)
}

export const getProductStockHistory = (productId) => api.get(`/stock/history/${productId}`)

// File upload endpoints
export const uploadProductImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return api.post('/files/upload/product-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const uploadUserProfileImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return api.post('/files/upload/user-profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// Report endpoints
export const getStockValuationReport = () => api.get('/reports/stock-valuation')

export const getValuationSummary = () => api.get('/reports/valuation-summary')

export const getProductValuation = (params = {}) => {
  const queryParams = new URLSearchParams({
    sortBy: params.sortBy || 'totalValue',
    sortDirection: params.sortDirection || 'DESC'
  }).toString();
  return api.get(`/reports/product-valuation?${queryParams}`)
}

export const getCategoryValuation = () => api.get('/reports/category-valuation')

export const exportStockValuationCSV = () => {
  return api.get('/reports/stock-valuation/export/csv', {
    responseType: 'blob'
  })
}

export const exportCategoryValuationCSV = () => {
  return api.get('/reports/category-valuation/export/csv', {
    responseType: 'blob'
  })
}

// Expiry Alert Configuration endpoints
export const getExpiryAlertConfigs = () => api.get('/expiry/configs')
export const getActiveExpiryAlertConfigs = () => api.get('/expiry/configs/active')
export const getExpiryAlertConfigById = (id) => api.get(`/expiry/configs/${id}`)
export const getExpiryAlertConfigsForRole = (role) => api.get(`/expiry/configs/role/${role}`)
export const createExpiryAlertConfig = (data) => api.post('/expiry/configs', data)
export const updateExpiryAlertConfig = (id, data) => api.put(`/expiry/configs/${id}`, data)
export const deleteExpiryAlertConfig = (id) => api.delete(`/expiry/configs/${id}`)
export const toggleExpiryAlertConfigStatus = (id) => api.put(`/expiry/configs/${id}/toggle`)
export const updateExpiryAlertConfigSortOrder = (configIds) => api.put('/expiry/configs/sort-order', configIds)
export const getAffectedProductCount = (id) => api.get(`/expiry/configs/${id}/affected-products`)

// Expiry Monitoring endpoints
export const triggerExpiryCheck = () => api.post('/expiry/monitoring/check')
export const getExpiryCheckHistory = () => api.get('/expiry/monitoring/history')
export const getExpiryCheckStatus = (date) => api.get(`/expiry/monitoring/status/${date}`)
export const getExpiryMonitoringDashboard = () => api.get('/expiry/monitoring/dashboard')

// ============================================
// EXPIRY SUMMARY ENDPOINTS (Phase 3.1)
// ============================================
// Get comprehensive expiry summary for dashboard
export const getExpirySummary = () => api.get('/expiry/summary')
// Get critical alerts only
export const getExpiryCriticalAlerts = (limit = 10) => 
  api.get(`/expiry/summary/critical?limit=${limit}`)
// Get summary counts only (lightweight)
export const getExpirySummaryCounts = () => api.get('/expiry/summary/counts')
// Get financial impact summary (managers only)
export const getExpiryFinancialImpact = () => api.get('/expiry/summary/financial-impact')

// Expiry Alerts endpoints
export const getExpiryAlerts = (params = {}) => {
  const queryParams = new URLSearchParams({
    status: params.status || 'PENDING',
    page: params.page || 0,
    size: params.size || 20
  }).toString();
  return api.get(`/expiry/alerts?${queryParams}`)
}
export const acknowledgeExpiryAlert = (id, notes) => api.put(`/expiry/alerts/${id}/acknowledge`, { notes })
export const resolveExpiryAlert = (id, notes) => api.put(`/expiry/alerts/${id}/resolve`, { notes })

// Batch Management endpoints
export const createBatch = (data) => api.post('/batches', data)
export const getBatchesByProduct = (productId) => api.get(`/batches/product/${productId}`)
export const getBatchById = (batchId) => api.get(`/batches/${batchId}`)
export const consumeStock = (productId, quantity, reason) => 
  api.post(`/batches/consume?productId=${productId}&quantity=${quantity}&reason=${encodeURIComponent(reason)}`)
export const adjustBatchStock = (data) => api.post('/batches/adjust', data)
export const getExpiringBatches = (daysAhead = 30) => api.get(`/batches/expiring?daysAhead=${daysAhead}`)
export const getBatchExpiryReport = () => api.get('/batches/expiry-report')
export const markExpiredBatches = () => api.post('/batches/mark-expired')

// Test endpoints
export const testConnection = () => api.get('/test/hello')
export const healthCheck = () => api.get('/test/health')

// ============================================
// QUARANTINE MANAGEMENT ENDPOINTS
// ============================================
// Quarantine a batch
export const quarantineBatch = (batchId, reason) => 
  api.post(`/quarantine/quarantine-batch?batchId=${batchId}&reason=${encodeURIComponent(reason)}`);
// Get quarantine records with pagination
export const getQuarantineRecords = (params = {}) => {
  const queryParams = new URLSearchParams({
    ...(params.status && { status: params.status }),
    page: params.page || 0,
    size: params.size || 10
  }).toString();
  return api.get(`/quarantine?${queryParams}`);
};
// Get single quarantine record
export const getQuarantineRecord = (id) => api.get(`/quarantine/${id}`);
// Process quarantine action (review, approve, dispose, return)
export const processQuarantineAction = (actionData) => 
  api.post('/quarantine/action', actionData);
// Get pending review items
export const getQuarantinePendingReview = () => api.get('/quarantine/pending-review');
// Get quarantine summary
export const getQuarantineSummary = () => api.get('/quarantine/summary');
// Trigger auto-quarantine for expired batches
export const triggerAutoQuarantine = () => api.post('/quarantine/auto-quarantine');

// ============================================
// NOTIFICATION ENDPOINTS
// ============================================
// Get user notifications
export const getNotifications = (params = {}) => {
  const queryParams = new URLSearchParams()
  
  if (params.status) queryParams.append('status', params.status)
  if (params.category) queryParams.append('category', params.category)
  if (params.priority) queryParams.append('priority', params.priority)
  if (params.page !== undefined) queryParams.append('page', params.page)
  if (params.size !== undefined) queryParams.append('size', params.size)
  
  const queryString = queryParams.toString()
  return api.get(`/notifications${queryString ? '?' + queryString : ''}`)
}
// Get notification by ID
export const getNotification = (id) => api.get(`/notifications/${id}`);
// Get unread count
export const getUnreadNotificationCount = () => api.get('/notifications/unread-count');
// Get notification summary
export const getNotificationSummary = () => api.get('/notifications/summary');
// Get critical notifications
export const getCriticalNotifications = () => api.get('/notifications/critical');
// Mark notification as read
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`);
// Mark all notifications as read
export const markAllNotificationsAsRead = () => api.put('/notifications/mark-all-read');
// Archive notification
export const archiveNotification = (id) => api.put(`/notifications/${id}/archive`);
// Delete notification
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
// Create custom notification (admin only)
export const createNotification = (data) => api.post('/notifications', data);
// Send batch notifications (admin only)
export const sendBatchNotifications = (data) => api.post('/notifications/batch', data);
// Test notification
export const sendTestNotification = () => api.post('/notifications/test');

// Notification Preferences endpoints
export const getNotificationPreferences = () => api.get('/notification-preferences')
export const updateNotificationPreferences = (data) => api.put('/notification-preferences', data)
export const getNotificationCategoryStatus = () => api.get('/notification-preferences/categories')
export const updateCategoryPreference = (category, data) => api.patch(`/notification-preferences/categories/${category}`, data)
export const resetNotificationPreferences = () => api.post('/notification-preferences/reset')
export const testNotificationPreferences = (params) => api.post('/notification-preferences/test', params)
export const getUserNotificationPreferences = (userId) => api.get(`/notification-preferences/user/${userId}`)

export default api