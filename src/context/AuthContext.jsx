import { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // ✅ FIXED: Proper token validation on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        try {
          // Validate token format
          if (!isValidTokenFormat(token)) {
            throw new Error('Invalid token format')
          }

          // Check if token is expired
          if (isTokenExpired(token)) {
            throw new Error('Token expired')
          }

          // Token exists and is valid - set user
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          
        } catch (error) {
          console.error('Token validation failed:', error.message)
          // Clear invalid/expired token
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        }
      }
      
      setLoading(false)
    }

    initializeAuth()
  }, [])

  // ✅ Token validation helper
  const isValidTokenFormat = (token) => {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.')
    return parts.length === 3
  }

  // ✅ Token expiration check
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expirationTime = payload.exp * 1000 // Convert to milliseconds
      return Date.now() >= expirationTime
    } catch (error) {
      return true // If parsing fails, consider token expired
    }
  }

  const login = async (username, password) => {
    try {
      const response = await apiLogin({ username, password })
      const { token, ...userData } = response.data
      
      // Validate token before storing
      if (!token || !isValidTokenFormat(token)) {
        throw new Error('Invalid token received from server')
      }

      if (isTokenExpired(token)) {
        throw new Error('Received token is already expired')
      }
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      setUser(userData)
      navigate('/')
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  // ✅ Auto-logout on token expiration
  useEffect(() => {
    if (!user) return

    const token = localStorage.getItem('token')
    if (!token) return

    // Check token expiration every minute
    const interval = setInterval(() => {
      if (isTokenExpired(token)) {
        console.warn('Token expired - logging out')
        logout()
      }
    }, 60000) // Check every 60 seconds

    return () => clearInterval(interval)
  }, [user])

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isManager: user?.role === 'HOSPITAL_MANAGER',
    isStaff: user?.role === 'PHARMACY_STAFF',
    isProcurement: user?.role === 'PROCUREMENT_OFFICER'
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}