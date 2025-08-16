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
  Alert
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

      <Grid container spacing={3} sx={{ mt: 2 }}>
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
            >
              Procurement
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => navigate('/categories')}
          >
            View Categories
          </Button>
          {isManager && (
            <Button 
              variant="contained"
              color="secondary"
              onClick={async () => {
                try {
                  const response = await fetch('/api/test/notifications/test-all', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                  });
                  const result = await response.json();
                  console.log('Test Results:', result);
                  alert('Check notifications - should have 6 new ones!');
                } catch (error) {
                  console.error('Error testing notifications:', error);
                  alert('Error testing notifications: ' + error.message);
                }
              }}
            >
              Test All Notifications
            </Button>
          )}
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          System Status
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Last Updated: {new Date().toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              System Version: 1.0.0 (Week 3)
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default Home