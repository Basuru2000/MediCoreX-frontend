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

export const searchProducts = (query) => api.get(`/products/search?query=${query}`)

export const createProduct = (data) => api.post('/products', data)

export const updateProduct = (id, data) => api.put(`/products/${id}`, data)

export const deleteProduct = (id) => api.delete(`/products/${id}`)

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

// Test endpoints
export const testConnection = () => api.get('/test/hello')
export const healthCheck = () => api.get('/test/health')

export default api