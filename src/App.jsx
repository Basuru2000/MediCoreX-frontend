import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Users from './pages/Users'
import Products from './pages/Products'
import Categories from './pages/Categories'
import BatchTracking from './pages/BatchTracking'
import StockValuation from './pages/Reports/StockValuation'
import ExpiryAlertConfig from './pages/ExpiryAlertConfig'
import ExpiryMonitoring from './pages/ExpiryMonitoring'
import Unauthorized from './pages/Unauthorized'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={['HOSPITAL_MANAGER']}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="products"
            element={
              <ProtectedRoute allowedRoles={['HOSPITAL_MANAGER', 'PHARMACY_STAFF']}>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="categories"
            element={
              <ProtectedRoute allowedRoles={['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER']}>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="batch-tracking"
            element={
              <ProtectedRoute allowedRoles={['HOSPITAL_MANAGER', 'PHARMACY_STAFF']}>
                <BatchTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports/stock-valuation"
            element={
              <ProtectedRoute allowedRoles={['HOSPITAL_MANAGER', 'PHARMACY_STAFF']}>
                <StockValuation />
              </ProtectedRoute>
            }
          />
          <Route
            path="expiry-config"
            element={
              <ProtectedRoute allowedRoles={['HOSPITAL_MANAGER', 'PHARMACY_STAFF']}>
                <ExpiryAlertConfig />
              </ProtectedRoute>
            }
          />
          <Route
            path="expiry-monitoring"
            element={
              <ProtectedRoute allowedRoles={['HOSPITAL_MANAGER', 'PHARMACY_STAFF']}>
                <ExpiryMonitoring />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App