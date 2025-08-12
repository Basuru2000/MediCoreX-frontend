import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
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
import StockValuation from './pages/Reports/StockValuation'
import CategoryValuation from './pages/Reports/CategoryValuation'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
              
              {/* ADD THIS ROUTE */}
              <Route path="/notifications" element={<NotificationsPage />} />
              
              <Route path="/reports/stock-valuation" element={<StockValuation />} />
              <Route path="/reports/category-valuation" element={<CategoryValuation />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;