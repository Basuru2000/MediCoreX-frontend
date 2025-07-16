import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Users from './pages/Users'
import Products from './pages/Products'  // NEW
import Categories from './pages/Categories'  // NEW
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
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App