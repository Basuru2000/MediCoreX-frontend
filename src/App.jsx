import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { WebSocketProvider } from './context/WebSocketContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Unauthorized from './pages/Unauthorized'
import Users from './pages/Users'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Suppliers from './pages/Suppliers'
import BatchTracking from './pages/BatchTracking'
import QuarantineManagement from './pages/Quarantine'
import NotificationsPage from './pages/NotificationsPage'
import NotificationPreferencesPage from './pages/NotificationPreferencesPage'
import StockValuation from './pages/Reports/StockValuation'
import CategoryValuation from './pages/Reports/CategoryValuation'
import ExpiryAlertConfig from './pages/ExpiryAlertConfig'
import ExpiryMonitoring from './pages/ExpiryMonitoring'
import ExpiryCalendar from './pages/ExpiryCalendar'
import PurchaseOrders from './pages/PurchaseOrders'
import Receiving from './pages/Receiving'
import AutoPOSettings from './pages/AutoPOSettings'
import ProcurementAnalytics from './pages/ProcurementAnalytics'

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/users" element={<Users />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<Products />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/batch-tracking" element={<BatchTracking />} />
              <Route path="/quarantine" element={<QuarantineManagement />} />
              <Route path="/purchase-orders" element={<PurchaseOrders />} />
              <Route path="/procurement-analytics" element={<ProcurementAnalytics />} />
              <Route path="/receiving" element={<Receiving />} />
              <Route path="/auto-po-settings" element={<AutoPOSettings />} />
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