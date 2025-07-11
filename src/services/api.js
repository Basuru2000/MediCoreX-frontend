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

// Test endpoints
export const testConnection = () => api.get('/test/hello')
export const healthCheck = () => api.get('/test/health')

export default api