import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Grid,
  Card,
  Paper,
  Fade,
  Grow,
  Skeleton,
  Chip,
  Stack,
  useTheme,
  alpha,
  Divider
} from '@mui/material'
import {
  People,
  Inventory,
  ShoppingCart,
  Assessment,
  Warning,
  TrendingUp,
  Refresh,
  ArrowForward,
  CalendarMonth,
  Visibility,
  VisibilityOff,
  DashboardCustomize,
  Analytics,
  EventNote,
  Add,
  LocalShipping,
  WarningAmber,
  CheckCircle,
  Category as CategoryIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import {
  getUsers,
  getProducts,
  getLowStockProducts,
  getExpiringProducts,
  getCategories
} from '../services/api'
// Import the updated widgets
import CriticalAlertsWidget from '../components/expiry/CriticalAlertsWidget'
import ExpiryTrendsAnalysis from '../components/expiry/ExpiryTrendsAnalysis'
import ExpiryCalendarWidget from '../components/expiry/ExpiryCalendarWidget'

function Home() {
  const theme = useTheme()
  const { user, isManager, isStaff, isProcurement } = useAuth()
  const navigate = useNavigate()
  
  // State management
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
  
  // Widget visibility states
  const [widgetVisibility, setWidgetVisibility] = useState({
    criticalAlerts: true,
    expiryTrends: false,
    expiryCalendar: true
  })
  
  // Control visibility based on roles
  const canViewCriticalAlerts = ['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER'].includes(user?.role)
  
  useEffect(() => {
    fetchDashboardData()
  }, [])
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const results = await Promise.allSettled([
        isManager ? getUsers() : Promise.resolve(null),
        getProducts({ page: 0, size: 1 }),
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
        pendingOrders: 0,
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
  
  const handleRefresh = () => {
    fetchDashboardData()
  }
  
  const toggleWidget = (widget) => {
    setWidgetVisibility(prev => ({
      ...prev,
      [widget]: !prev[widget]
    }))
  }
  
  // Dashboard cards configuration
  const dashboardCards = [
    {
      title: 'Total Users',
      value: dashboardData.totalUsers,
      icon: <People sx={{ fontSize: 28 }} />,
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.1),
      path: '/users',
      roles: ['HOSPITAL_MANAGER'],
      show: isManager,
      trend: 'stable'
    },
    {
      title: 'Products',
      value: dashboardData.totalProducts,
      icon: <Inventory sx={{ fontSize: 28 }} />,
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.1),
      path: '/products',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF'],
      show: isManager || isStaff,
      trend: 'up'
    },
    {
      title: 'Low Stock',
      value: dashboardData.lowStockCount,
      icon: <WarningAmber sx={{ fontSize: 28 }} />,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.1),
      path: '/products',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER'],
      show: true,
      alert: true
    },
    {
      title: 'Expiring Soon',
      value: dashboardData.expiringCount,
      icon: <EventNote sx={{ fontSize: 28 }} />,
      color: theme.palette.error.main,
      bgColor: alpha(theme.palette.error.main, 0.1),
      path: '/expiry-calendar',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF'],
      show: isManager || isStaff,
      alert: dashboardData.expiringCount > 0
    },
    {
      title: 'Pending Orders',
      value: dashboardData.pendingOrders,
      icon: <LocalShipping sx={{ fontSize: 28 }} />,
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.1),
      path: '/procurement',
      roles: ['HOSPITAL_MANAGER', 'PROCUREMENT_OFFICER'],
      show: isManager || isProcurement,
      trend: 'stable'
    },
    {
      title: 'Categories',
      value: dashboardData.totalCategories,
      icon: <CategoryIcon sx={{ fontSize: 28 }} />,
      color: '#9c27b0',
      bgColor: alpha('#9c27b0', 0.1),
      path: '/categories',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER'],
      show: true,
      trend: 'stable'
    }
  ]
  
  const visibleCards = dashboardCards.filter(card => 
    card.roles.includes(user?.role) && card.show
  )
  
  // Quick actions configuration
  const quickActions = [
    {
      label: 'Add Product',
      icon: <Add />,
      path: '/products',
      color: 'primary',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF']
    },
    {
      label: 'Batch Tracking',
      icon: <Assessment />,
      path: '/batch-tracking',
      color: 'secondary',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF']
    },
    {
      label: 'Quarantine',
      icon: <Warning />,
      path: '/quarantine',
      color: 'warning',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF']
    },
    {
      label: 'Reports',
      icon: <Analytics />,
      path: '/reports/stock-valuation',
      color: 'info',
      roles: ['HOSPITAL_MANAGER']
    }
  ].filter(action => action.roles.includes(user?.role))
  
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '400px',
          gap: 2
        }}
      >
        <CircularProgress size={40} thickness={4} />
        <Typography variant="body2" color="text.secondary">
          Loading dashboard...
        </Typography>
      </Box>
    )
  }
  
  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      {/* Page Header */}
      <Fade in timeout={600}>
        <Box 
          sx={{ 
            mb: 4,
            p: 3,
            borderRadius: '12px',
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[0]
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 1
                }}
              >
                Welcome back, {user?.fullName || user?.username}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  label={user?.role?.replace(/_/g, ' ')}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                    px: 1
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Typography>
              </Stack>
            </Box>
            <Tooltip title="Refresh Dashboard" arrow>
              <IconButton
                onClick={handleRefresh}
                sx={{
                  bgcolor: 'background.default',
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    bgcolor: 'background.paper',
                    transform: 'rotate(180deg)',
                    transition: 'transform 0.5s ease'
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Fade>
      
      {/* Error Alert */}
      {error && (
        <Fade in>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: '8px',
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            {error}
          </Alert>
        </Fade>
      )}
      
      {/* Stats Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {visibleCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Grow in timeout={800 + index * 100}>
              <Card
                sx={{
                  p: 3,
                  height: 140,
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.shadows[0],
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-4px)',
                    borderColor: card.color,
                    '& .hover-arrow': {
                      opacity: 1,
                      transform: 'translateX(0)'
                    }
                  }
                }}
                onClick={() => navigate(card.path)}
              >
                {/* Background Pattern */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: card.bgColor,
                    opacity: 0.3
                  }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                  <Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500,
                        mb: 1,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.75rem'
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 700,
                        color: card.alert && card.value > 0 ? card.color : 'text.primary',
                        mb: 1
                      }}
                    >
                      {card.value}
                    </Typography>
                    {card.alert && card.value > 0 && (
                      <Chip
                        label="Action Required"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: alpha(card.color, 0.1),
                          color: card.color,
                          fontWeight: 600
                        }}
                      />
                    )}
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: card.bgColor,
                      color: card.color
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
                
                {/* Hover Arrow */}
                <ArrowForward
                  className="hover-arrow"
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    fontSize: 20,
                    color: card.color,
                    opacity: 0,
                    transform: 'translateX(-10px)',
                    transition: 'all 0.3s ease'
                  }}
                />
              </Card>
            </Grow>
          </Grid>
        ))}
      </Grid>
      
      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <Fade in timeout={1000}>
          <Paper
            sx={{
              p: 3,
              mb: 4,
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.shadows[0]
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                mb: 2
              }}
            >
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  startIcon={action.icon}
                  onClick={() => navigate(action.path)}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderColor: theme.palette.divider,
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: theme.palette[action.color].main,
                      bgcolor: alpha(theme.palette[action.color].main, 0.05)
                    }
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          </Paper>
        </Fade>
      )}
      
      {/* Widget Controls */}
      <Fade in timeout={1200}>
        <Paper
          sx={{
            p: 2,
            mb: 3,
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[0]
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <DashboardCustomize sx={{ fontSize: 20 }} />
              Dashboard Widgets
            </Typography>
            <Stack direction="row" spacing={1}>
              {canViewCriticalAlerts && (
                <Chip
                  label="Critical Alerts"
                  icon={widgetVisibility.criticalAlerts ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                  onClick={() => toggleWidget('criticalAlerts')}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: widgetVisibility.criticalAlerts 
                      ? alpha(theme.palette.error.main, 0.1)
                      : 'background.default',
                    color: widgetVisibility.criticalAlerts 
                      ? theme.palette.error.main
                      : 'text.secondary',
                    '&:hover': {
                      bgcolor: widgetVisibility.criticalAlerts
                        ? alpha(theme.palette.error.main, 0.2)
                        : alpha(theme.palette.action.hover, 0.1)
                    }
                  }}
                />
              )}
              <Chip
                label="Expiry Trends"
                icon={widgetVisibility.expiryTrends ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                onClick={() => toggleWidget('expiryTrends')}
                sx={{
                  cursor: 'pointer',
                  bgcolor: widgetVisibility.expiryTrends 
                    ? alpha(theme.palette.info.main, 0.1)
                    : 'background.default',
                  color: widgetVisibility.expiryTrends 
                    ? theme.palette.info.main
                    : 'text.secondary',
                  '&:hover': {
                    bgcolor: widgetVisibility.expiryTrends
                      ? alpha(theme.palette.info.main, 0.2)
                      : alpha(theme.palette.action.hover, 0.1)
                  }
                }}
              />
              <Chip
                label="Expiry Calendar"
                icon={widgetVisibility.expiryCalendar ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                onClick={() => toggleWidget('expiryCalendar')}
                sx={{
                  cursor: 'pointer',
                  bgcolor: widgetVisibility.expiryCalendar 
                    ? alpha(theme.palette.primary.main, 0.1)
                    : 'background.default',
                  color: widgetVisibility.expiryCalendar 
                    ? theme.palette.primary.main
                    : 'text.secondary',
                  '&:hover': {
                    bgcolor: widgetVisibility.expiryCalendar
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.action.hover, 0.1)
                  }
                }}
              />
            </Stack>
          </Box>
        </Paper>
      </Fade>
      
      {/* Critical Alerts Widget */}
      {canViewCriticalAlerts && widgetVisibility.criticalAlerts && (
        <Fade in timeout={1400}>
          <Box sx={{ mb: 4 }}>
            <CriticalAlertsWidget />
          </Box>
        </Fade>
      )}
      
      {/* Expiry Trends Analysis */}
      {widgetVisibility.expiryTrends && (
        <Fade in timeout={1600}>
          <Box sx={{ mb: 4 }}>
            <ExpiryTrendsAnalysis />
          </Box>
        </Fade>
      )}
      
      {/* Expiry Calendar Widget */}
      {widgetVisibility.expiryCalendar && (
        <Fade in timeout={1800}>
          <Box sx={{ mb: 4 }}>
            <ExpiryCalendarWidget 
              viewMode="week"
              dashboardView={true}
              compact={false}
              showSummary={false}
              onEventClick={(event, date) => {
                console.log('Calendar event clicked:', event, date)
              }}
            />
          </Box>
        </Fade>
      )}
      
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  )
}

export default Home