import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Container
} from '@mui/material'
import {
  People,
  Inventory,
  ShoppingCart,
  Assessment,
  Warning,
  TrendingUp
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import {
  getUsers,
  getProducts,
  getLowStockProducts,
  getExpiringProducts,
  getCategories
} from '../services/api'
// Import the Critical Alerts Widget
import CriticalAlertsWidget from '../components/expiry/CriticalAlertsWidget'
// Add to imports
import ExpiryTrendsAnalysis from '../components/expiry/ExpiryTrendsAnalysis'
import ExpiryCalendarWidget from '../components/expiry/ExpiryCalendarWidget'

function Home() {
  const { user, isManager, isStaff, isProcurement } = useAuth()
  const navigate = useNavigate()
  
  // State for dynamic data
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalProducts: 0,
    lowStockCount: 0,
    expiringCount: 0,
    pendingOrders: 0,
    totalCategories: 0
  })

  // Control visibility of Critical Alerts Widget
  const canViewCriticalAlerts = ['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER'].includes(user?.role)

  // Add state for trends analysis visibility
  const [showTrendsAnalysis, setShowTrendsAnalysis] = useState(false)

  // Add state for calendar visibility
  const [showCalendar, setShowCalendar] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const results = await Promise.allSettled([
        isManager ? getUsers() : Promise.resolve(null),
        getProducts({ page: 0, size: 1 }), // Just get the total count
        getLowStockProducts(),
        getExpiringProducts(30),
        getCategories()
      ])

      const newData = {
        totalUsers: results[0].status === 'fulfilled' && results[0].value ? 
          results[0].value.data.length : 0,
        totalProducts: results[1].status === 'fulfilled' ? 
          results[1].value.data.totalElements : 0,
        lowStockCount: results[2].status === 'fulfilled' ? 
          results[2].value.data.length : 0,
        expiringCount: results[3].status === 'fulfilled' ? 
          results[3].value.data.length : 0,
        pendingOrders: 0, // This will be implemented in Week 6-7
        totalCategories: results[4].status === 'fulfilled' ? 
          results[4].value.data.length : 0
      }

      setDashboardData(newData)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const dashboardCards = [
    {
      title: 'Total Users',
      value: dashboardData.totalUsers,
      icon: <People />,
      color: '#1976d2',
      path: '/users',
      roles: ['HOSPITAL_MANAGER'],
      show: isManager
    },
    {
      title: 'Products',
      value: dashboardData.totalProducts,
      icon: <Inventory />,
      color: '#388e3c',
      path: '/products',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF'],
      show: isManager || isStaff
    },
    {
      title: 'Low Stock Items',
      value: dashboardData.lowStockCount,
      icon: <Warning />,
      color: '#f57c00',
      path: '/products',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER'],
      show: true
    },
    {
      title: 'Pending Orders',
      value: dashboardData.pendingOrders,
      icon: <ShoppingCart />,
      color: '#d32f2f',
      path: '/procurement',
      roles: ['HOSPITAL_MANAGER', 'PROCUREMENT_OFFICER'],
      show: isManager || isProcurement
    },
    {
      title: 'Expiring Soon',
      value: dashboardData.expiringCount,
      icon: <TrendingUp />,
      color: '#7b1fa2',
      path: '/products',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF'],
      show: isManager || isStaff
    },
    {
      title: 'Categories',
      value: dashboardData.totalCategories,
      icon: <Assessment />,
      color: '#0288d1',
      path: '/categories',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER'],
      show: true
    }
  ]

  const visibleCards = dashboardCards.filter(card => 
    card.roles.includes(user?.role) && card.show
  )

  const handleRefresh = () => {
    fetchDashboardData()
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome, {user?.fullName}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Role: {user?.role?.replace('_', ' ')}
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh Data
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Critical Alerts Widget - Full Width at Top */}
      {canViewCriticalAlerts && (
        <Box sx={{ mb: 4 }}>
          <CriticalAlertsWidget refreshInterval={60000} />
        </Box>
      )}

      {/* NEW: Expiry Trends Analysis Section */}
      {canViewCriticalAlerts && (
        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                Expiry Trends Analysis
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setShowTrendsAnalysis(!showTrendsAnalysis)}
              >
                {showTrendsAnalysis ? 'Hide' : 'Show'} Trends
              </Button>
            </Box>
            {showTrendsAnalysis && (
              <Box mt={2}>
                <ExpiryTrendsAnalysis />
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* Grid container for calendar */}
      <Grid container spacing={3}>
        {/* Add after the ExpiryTrendsAnalysis component */}
        {canViewCriticalAlerts && showCalendar && (
          <Grid item xs={12}>
            <ExpiryCalendarWidget 
              compact={false}
              viewMode="week"        // Show week view on dashboard
              showSummary={false}    // Hide summary on dashboard
              onEventClick={(event, date) => {
                console.log('Calendar event clicked:', event, date);
                // Navigation is handled inside the widget
              }}
            />
          </Grid>
        )}
      </Grid>

      {/* Dashboard Cards Grid */}
      <Grid container spacing={3}>
        {visibleCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => navigate(card.path)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    sx={{
                      backgroundColor: card.color,
                      borderRadius: '50%',
                      p: 1,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {React.cloneElement(card.icon, { 
                      sx: { color: 'white', fontSize: 30 } 
                    })}
                  </Box>
                  <Typography variant="h6" component="div">
                    {card.title}
                  </Typography>
                </Box>
                <Typography 
                  variant="h3" 
                  component="div" 
                  align="center"
                  sx={{ 
                    color: card.value === 0 ? 'text.secondary' : 'text.primary' 
                  }}
                >
                  {loading ? '...' : card.value}
                </Typography>
                {card.title === 'Low Stock Items' && card.value > 0 && (
                  <Typography 
                    variant="caption" 
                    color="warning.main" 
                    align="center" 
                    display="block"
                    sx={{ mt: 1 }}
                  >
                    Action required
                  </Typography>
                )}
                {card.title === 'Expiring Soon' && card.value > 0 && (
                  <Typography 
                    variant="caption" 
                    color="error.main" 
                    align="center" 
                    display="block"
                    sx={{ mt: 1 }}
                  >
                    Within 30 days
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions Section */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {isManager && (
            <Button
              variant="outlined"
              onClick={() => navigate('/users')}
            >
              Manage Users
            </Button>
          )}
          {(isManager || isStaff) && (
            <>
              <Button
                variant="outlined"
                onClick={() => navigate('/products')}
              >
                View Products
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/batch-tracking')}
              >
                Batch Tracking
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/quarantine')}
              >
                Quarantine Management
              </Button>
              {dashboardData.lowStockCount > 0 && (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => navigate('/products')}
                >
                  View Low Stock Items ({dashboardData.lowStockCount})
                </Button>
              )}
              {dashboardData.expiringCount > 0 && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => navigate('/products')}
                >
                  View Expiring Items ({dashboardData.expiringCount})
                </Button>
              )}
            </>
          )}
          {(isManager || isProcurement) && (
            <Button
              variant="outlined"
              onClick={() => navigate('/procurement')}
              disabled
            >
              Procurement (Coming Soon)
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => navigate('/reports/stock-valuation')}
          >
            Stock Valuation Report
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/reports/category-valuation')}
          >
            Category Report
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/expiry-monitoring')}
          >
            Expiry Monitoring
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default Home