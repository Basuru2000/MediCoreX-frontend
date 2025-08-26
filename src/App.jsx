import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { WebSocketProvider } from './context/WebSocketContext'  // Add this import
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Users from './pages/Users'
import Products from './pages/Products'
import Categories from './pages/Categories'
import BatchTracking from './pages/BatchTracking'
import QuarantineManagement from './pages/Quarantine'
import NotificationsPage from './pages/NotificationsPage'
import NotificationPreferencesPage from './pages/NotificationPreferencesPage'
import StockValuation from './pages/Reports/StockValuation'
import CategoryValuation from './pages/Reports/CategoryValuation'
import ExpiryAlertConfig from './pages/ExpiryAlertConfig'
import ExpiryMonitoring from './pages/ExpiryMonitoring'
import ExpiryCalendar from './pages/ExpiryCalendar'

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>  {/* Add WebSocketProvider here */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/users" element={<Users />} />
              <Route path="/products" element={<Products />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/batch-tracking" element={<BatchTracking />} />
              <Route path="/quarantine" element={<QuarantineManagement />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/notification-preferences" element={<NotificationPreferencesPage />} />
              
              {/* Expiry Management Routes */}
              <Route path="/expiry-config" element={<ExpiryAlertConfig />} />
              <Route path="/expiry-monitoring" element={<ExpiryMonitoring />} />
              <Route path="/expiry-calendar" element={<ExpiryCalendar />} />
              
              {/* Report Routes */}
              <Route path="/reports/stock-valuation" element={<StockValuation />} />
              <Route path="/reports/category-valuation" element={<CategoryValuation />} />
            </Route>
          </Route>
        </Routes>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;