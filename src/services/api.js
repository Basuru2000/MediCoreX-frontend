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

// ============================================
// EXPIRY TRENDS ANALYSIS ENDPOINTS (Phase 3.2)
// ============================================
// Get trend analysis for date range
export const getExpiryTrendAnalysis = (startDate, endDate, granularity = 'DAILY') => {
  const params = new URLSearchParams({
    startDate,
    endDate,
    granularity
  }).toString();
  return api.get(`/expiry/trends/analysis?${params}`);
};
// Get current trend metrics
export const getExpiryTrendMetrics = () => api.get('/expiry/trends/metrics');
// Get historical trend data
export const getExpiryTrendHistory = (daysBack = 30) => 
  api.get(`/expiry/trends/history?daysBack=${daysBack}`);
// Get predictive analysis
export const getExpiryPredictions = (daysAhead = 30) => 
  api.get(`/expiry/trends/predictions?daysAhead=${daysAhead}`);
// Get category-wise trends
export const getExpiryTrendsByCategory = (daysBack = 30) => 
  api.get(`/expiry/trends/by-category?daysBack=${daysBack}`);
// Export trend report
export const exportExpiryTrendReport = (startDate, endDate) => {
  const params = new URLSearchParams({ startDate, endDate }).toString();
  return api.get(`/expiry/trends/export?${params}`, {
    responseType: 'blob'
  });
};
// Create manual trend snapshot
export const createTrendSnapshot = () => api.post('/expiry/trends/snapshot');
// Compare two periods
export const compareTrendPeriods = (period1Start, period1End, period2Start, period2End) => {
  const params = new URLSearchParams({
    period1Start,
    period1End,
    period2Start,
    period2End
  }).toString();
  return api.get(`/expiry/trends/compare?${params}`);
};

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

// ============================================
// EXPIRY CALENDAR ENDPOINTS
// ============================================
// Get expiry calendar for specific month
export const getExpiryCalendar = (year, month) => 
  api.get(`/expiry/calendar/month/${year}/${month}`);
// Get expiry calendar for date range
export const getExpiryCalendarRange = (startDate, endDate) => {
  const params = new URLSearchParams({ startDate, endDate }).toString();
  return api.get(`/expiry/calendar/range?${params}`);
};
// Get expiry calendar data with flexible parameters
export const getExpiryCalendarData = (params = {}) => {
  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    view: params.view || 'week'
  }).toString();
  return api.get(`/expiry/calendar/events?${queryParams}`);
};
// Get calendar summary
export const getCalendarSummary = (year, month) => {
  return api.get(`/expiry/calendar/summary?year=${year}&month=${month}`);
};
// Get events for specific date
export const getEventsForDate = (date) => {
  return api.get(`/expiry/calendar/events/${date}`);
};
// Search expiry calendar with filters
export const searchExpiryCalendar = (filters) => 
  api.post('/expiry/calendar/search', filters);
// Refresh calendar cache
export const refreshCalendarCache = () => 
  api.post('/expiry/calendar/refresh');

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

// Supplier endpoints
export const getSuppliers = (params = {}) => {
  const queryParams = new URLSearchParams({
    page: params.page || 0,
    size: params.size || 10,
    sortBy: params.sortBy || 'name',
    sortDirection: params.sortDirection || 'ASC'
  }).toString();
  return api.get(`/suppliers?${queryParams}`)
}
export const searchSuppliers = (query, params = {}) => {
  const queryParams = new URLSearchParams({
    query: query,
    page: params.page || 0,
    size: params.size || 10
  }).toString();
  return api.get(`/suppliers/search?${queryParams}`)
}
export const getActiveSuppliers = () => api.get('/suppliers/active')
export const getSupplierById = (id) => api.get(`/suppliers/${id}`)
export const createSupplier = (data) => api.post('/suppliers', data)
export const updateSupplier = (id, data) => api.put(`/suppliers/${id}`, data)
export const deleteSupplier = (id) => api.delete(`/suppliers/${id}`)
export const updateSupplierStatus = (id, status) => api.put(`/suppliers/${id}/status?status=${status}`)
export const addSupplierContact = (supplierId, data) => api.post(`/suppliers/${supplierId}/contacts`, data)
export const deleteSupplierContact = (contactId) => api.delete(`/suppliers/contacts/${contactId}`)

// Document management endpoints - COMPLETE REPLACEMENT
export const uploadSupplierDocument = (supplierId, formData) => {
  return api.post(`/suppliers/${supplierId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
export const getSupplierDocuments = (supplierId) => {
  return api.get(`/suppliers/${supplierId}/documents`)
}
export const deleteSupplierDocument = (documentId) => {
  return api.delete(`/suppliers/documents/${documentId}`)
}
// Keep this simple - just return the URL
export const getDocumentDownloadUrl = (documentId) => {
  return `${API_URL}/suppliers/documents/${documentId}/download`
}
export const getExpiringDocuments = (days = 30) => {
  return api.get(`/suppliers/documents/expiring?days=${days}`)
}

// Supplier Product Catalog endpoints
export const getSupplierCatalog = (supplierId, params = {}) => {
  const queryParams = new URLSearchParams({
    page: params.page || 0,
    size: params.size || 10
  }).toString()
  return api.get(`/supplier-products/supplier/${supplierId}?${queryParams}`)
}
export const getProductSuppliers = (productId) => {
  return api.get(`/supplier-products/product/${productId}`)
}
export const addProductToSupplier = (supplierId, data) => {
  return api.post(`/supplier-products/supplier/${supplierId}`, data)
}
export const updateSupplierProduct = (id, data) => {
  return api.put(`/supplier-products/${id}`, data)
}
export const removeProductFromCatalog = (id) => {
  return api.delete(`/supplier-products/${id}`)
}
export const compareSupplierPrices = (productId, quantity) => {
  const params = quantity ? `?quantity=${quantity}` : ''
  return api.get(`/supplier-products/compare/${productId}${params}`)
}
export const setPreferredSupplier = (supplierId, productId) => {
  return api.put(`/supplier-products/set-preferred/${supplierId}/${productId}`)
}

// Supplier Metrics endpoints
export const getSupplierMetrics = (supplierId) => {
  return api.get(`/supplier-metrics/supplier/${supplierId}/current`)
}
export const getSupplierMetricsForMonth = (supplierId, month) => {
  return api.get(`/supplier-metrics/supplier/${supplierId}/month?month=${month}`)
}
export const getSupplierMetricsHistory = (supplierId, months = 12) => {
  return api.get(`/supplier-metrics/supplier/${supplierId}/history?months=${months}`)
}
export const getSupplierComparison = (month) => {
  const params = month ? `?month=${month}` : ''
  return api.get(`/supplier-metrics/comparison${params}`)
}
export const getMetricsSummary = () => {
  return api.get('/supplier-metrics/summary')
}
export const updateDeliveryMetrics = (supplierId, onTime) => {
  return api.post(`/supplier-metrics/supplier/${supplierId}/delivery?onTime=${onTime}`)
}
export const updateQualityMetrics = (supplierId, itemsReceived, itemsAccepted) => {
  return api.post(`/supplier-metrics/supplier/${supplierId}/quality`, null, {
    params: { itemsReceived, itemsAccepted }
  })
}
export const updatePricingMetrics = (supplierId, orderAmount, marketPrice) => {
  const params = { orderAmount }
  if (marketPrice) params.marketPrice = marketPrice
  return api.post(`/supplier-metrics/supplier/${supplierId}/pricing`, null, { params })
}
export const calculateSupplierMetrics = (supplierId, month) => {
  return api.post(`/supplier-metrics/supplier/${supplierId}/calculate?month=${month}`)
}

// ============================================
// PURCHASE ORDER ENDPOINTS
// ============================================
// Create new purchase order
export const createPurchaseOrder = (data) => {
  return api.post('/purchase-orders', data)
}
// Get purchase order by ID
export const getPurchaseOrderById = (id) => {
  return api.get(`/purchase-orders/${id}`)
}
// Get purchase order by PO number
export const getPurchaseOrderByNumber = (poNumber) => {
  return api.get(`/purchase-orders/number/${poNumber}`)
}
// Get all purchase orders with pagination
export const getPurchaseOrders = (params = {}) => {
  const queryParams = new URLSearchParams({
    page: params.page || 0,
    size: params.size || 10,
    sortBy: params.sortBy || 'orderDate',
    sortDir: params.sortDir || 'desc'
  }).toString()
  return api.get(`/purchase-orders?${queryParams}`)
}
// Search purchase orders
export const searchPurchaseOrders = (params = {}) => {
  const queryParams = new URLSearchParams()
  if (params.status) queryParams.append('status', params.status)
  if (params.supplierId) queryParams.append('supplierId', params.supplierId)
  if (params.search) queryParams.append('search', params.search)
  queryParams.append('page', params.page || 0)
  queryParams.append('size', params.size || 10)
  
  return api.get(`/purchase-orders/search?${queryParams.toString()}`)
}
// Update purchase order
export const updatePurchaseOrder = (id, data) => {
  return api.put(`/purchase-orders/${id}`, data)
}
// Delete purchase order
export const deletePurchaseOrder = (id) => {
  return api.delete(`/purchase-orders/${id}`)
}
// Update purchase order status
export const updatePurchaseOrderStatus = (id, status) => {
  return api.put(`/purchase-orders/${id}/status?status=${status}`)
}
// Get purchase order summary
export const getPurchaseOrderSummary = () => {
  return api.get('/purchase-orders/summary')
}

export default api