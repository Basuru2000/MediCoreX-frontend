import React, { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Box,
  Drawer,
  AppBar,
  CssBaseline,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Collapse,
  Stack,
  Chip,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Inventory,
  Category,
  QrCodeScanner,
  ShoppingCart,
  Assessment,
  Warning,
  MonitorHeart,
  CalendarMonth,
  Block,
  Notifications,
  Settings,
  Logout,
  AccountCircle,
  ExpandLess,
  ExpandMore,
  NotificationsActive,
  SettingsApplications,
  BarChart,
  TrendingUp,
  WarningAmber,
  EventNote,
  Person,
  Business,
  LocalShipping,
  RequestQuote,
  Receipt,
  AutoAwesome
} from "@mui/icons-material";
import NotificationBell from './notifications/NotificationBell'
import WebSocketStatus from './notifications/WebSocketStatus'

const drawerWidth = 280

function Layout() {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  
  // Expandable menu states
  const [expiryOpen, setExpiryOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [reportsOpen, setReportsOpen] = useState(false)
  const [procurementOpen, setProcurementOpen] = useState(false)
  
  // Determine user role for menu filtering
  const isManager = user?.role === 'HOSPITAL_MANAGER'
  const isStaff = user?.role === 'PHARMACY_STAFF'
  const isProcurement = user?.role === 'PROCUREMENT_OFFICER'

  // Auto-expand sections based on current path
  useEffect(() => {
    const path = location.pathname
    if (path.includes('/expiry-config') || path.includes('/expiry-monitoring')) {
      setExpiryOpen(true)
    }
    if (path.includes('/notification')) {
      setNotificationsOpen(true)
    }
    if (path.includes('/reports/')) {
      setReportsOpen(true)
    }
    if (path.includes('/suppliers') || path.includes('/purchase-orders') || path.includes('/receiving') || path.includes('/auto-po-settings')) {
      setProcurementOpen(true)
    }
  }, [location.pathname])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleClose()
    logout()
    navigate('/login')
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.fullName) {
      return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return user?.username ? user.username[0].toUpperCase() : 'U'
  }

  const getInitials = () => {
    return getUserInitials()
  }

  // Get avatar background color based on role
  const getAvatarColor = () => {
    switch(user?.role) {
      case 'HOSPITAL_MANAGER': return theme.palette.primary.main
      case 'PHARMACY_STAFF': return theme.palette.success.main
      case 'PROCUREMENT_OFFICER': return theme.palette.info.main
      default: return theme.palette.grey[600]
    }
  }

  // Navigation items with improved structure
  const navigationItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER']
    },
    {
      text: 'Users',
      icon: <People />,
      path: '/users',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF']
    },
    {
      text: 'Products',
      icon: <Inventory />,
      path: '/products',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF']
    },
    {
      text: 'Categories',
      icon: <Category />,
      path: '/categories',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF']
    },
    {
      text: 'Batch Tracking',
      icon: <QrCodeScanner />,
      path: '/batch-tracking',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF']
    }
  ]

  // Grouped navigation sections
  const groupedSections = [
    {
      title: 'Procurement',
      icon: <LocalShipping />,
      open: procurementOpen,
      toggle: () => setProcurementOpen(!procurementOpen),
      roles: ['HOSPITAL_MANAGER', 'PROCUREMENT_OFFICER'],
      items: [
        {
          text: 'Suppliers',
          icon: <Business />,
          path: '/suppliers',
          roles: ['HOSPITAL_MANAGER', 'PROCUREMENT_OFFICER']
        },
        {
          text: 'Purchase Orders',
          icon: <ShoppingCart />,
          path: '/purchase-orders',
          roles: ['HOSPITAL_MANAGER', 'PROCUREMENT_OFFICER'],
        },
        {
          text: 'Receiving',
          icon: <Receipt />,
          path: '/receiving',
          roles: ['HOSPITAL_MANAGER', 'PROCUREMENT_OFFICER'],
        },
        {
          text: 'Auto PO Settings',
          icon: <Settings />,
          path: '/auto-po-settings',
          roles: ['HOSPITAL_MANAGER', 'PROCUREMENT_OFFICER']
        }
      ]
    },
    {
      title: 'Expiry Management',
      icon: <Warning />,
      open: expiryOpen,
      toggle: () => setExpiryOpen(!expiryOpen),
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER'],
      items: [
        {
          text: 'Expiry Alerts',
          icon: <WarningAmber />,
          path: '/expiry-config',
          roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF']
        },
        {
          text: 'Expiry Monitoring',
          icon: <MonitorHeart />,
          path: '/expiry-monitoring',
          roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER']
        }
      ]
    },
    {
      title: 'Reports',
      icon: <Assessment />,
      open: reportsOpen,
      toggle: () => setReportsOpen(!reportsOpen),
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER'],
      items: [
        {
          text: 'Stock Valuation',
          icon: <BarChart />,
          path: '/reports/stock-valuation',
          roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER']
        },
        {
          text: 'Category Valuation',
          icon: <TrendingUp />,
          path: '/reports/category-valuation',
          roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF']
        }
      ]
    },
    {
      title: 'Notifications',
      icon: <Notifications />,
      open: notificationsOpen,
      toggle: () => setNotificationsOpen(!notificationsOpen),
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER'],
      items: [
        {
          text: 'Notifications',
          icon: <NotificationsActive />,
          path: '/notifications',
          roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER']
        },
        {
          text: 'Notification Settings',
          icon: <Settings />,
          path: '/notification-preferences',
          roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF']
        }
      ]
    }
  ]

  // Additional standalone items
  const additionalItems = [
    {
      text: 'Expiry Calendar',
      icon: <EventNote />,
      path: '/expiry-calendar',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF']
    },
    {
      text: 'Quarantine',
      icon: <Block />,
      path: '/quarantine',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF']
    }
  ]

  const isItemActive = (path) => location.pathname === path

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>
      {/* Logo Section - Aligned with top bar */}
      <Box
        sx={{
          height: 64, // Same height as AppBar
          px: 3,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          borderRight: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              color: theme.palette.primary.main,
              letterSpacing: '-0.5px',
              fontSize: '1.2rem',
              lineHeight: 1.3
            }}
          >
            MediCoreX
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '0.75rem',
              lineHeight: 1.2,
              display: 'block',
              mt: -0.25
            }}
          >
            Healthcare Inventory System
          </Typography>
        </Box>
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2, backgroundColor: '#f8f9fa' }}>
        <List sx={{ px: 2 }}>
          {/* Main Navigation Items */}
          {navigationItems
            .filter(item => item.roles.includes(user?.role))
            .map((item) => (
              <ListItem 
                key={item.text} 
                disablePadding 
                sx={{ mb: 0.5 }}
              >
                <ListItemButton
                  component={Link}
                  to={item.path}
                  disabled={item.disabled}
                  sx={{
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    backgroundColor: isItemActive(item.path) 
                      ? theme.palette.background.paper 
                      : 'transparent',
                    borderLeft: isItemActive(item.path) 
                      ? `3px solid ${theme.palette.primary.main}` 
                      : '3px solid transparent',
                    boxShadow: isItemActive(item.path) 
                      ? `0 1px 3px ${alpha(theme.palette.common.black, 0.08)}` 
                      : 'none',
                    '&:hover': {
                      backgroundColor: isItemActive(item.path) 
                        ? theme.palette.background.paper
                        : alpha(theme.palette.background.paper, 0.7),
                      transform: 'translateX(2px)'
                    }
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 40,
                      color: isItemActive(item.path) 
                        ? theme.palette.primary.main 
                        : theme.palette.text.secondary 
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isItemActive(item.path) ? 600 : 500,
                      color: isItemActive(item.path) 
                        ? theme.palette.primary.main 
                        : theme.palette.text.primary
                    }}
                  />
                  {item.disabled && (
                    <Chip
                      label="Soon"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        backgroundColor: alpha(theme.palette.warning.main, 0.1),
                        color: theme.palette.warning.dark
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
        </List>

        <Divider sx={{ my: 2, mx: 3, backgroundColor: alpha(theme.palette.divider, 0.5) }} />

        {/* Grouped Sections */}
        <List sx={{ px: 2 }}>
          {groupedSections
            .filter(section => section.roles.includes(user?.role))
            .map((section) => (
              <Box key={section.title} sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={section.toggle}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.7)
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: theme.palette.text.secondary }}>
                    {section.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={section.title}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: theme.palette.text.primary
                    }}
                  />
                  {section.open ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={section.open} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {section.items
                      .filter(item => item.roles.includes(user?.role))
                      .map((item) => (
                        <ListItem key={item.text} disablePadding sx={{ pl: 2 }}>
                          <ListItemButton
                            component={Link}
                            to={item.path}
                            disabled={item.disabled}
                            sx={{
                              borderRadius: 2,
                              backgroundColor: isItemActive(item.path) 
                                ? theme.palette.background.paper 
                                : 'transparent',
                              borderLeft: isItemActive(item.path) 
                                ? `3px solid ${theme.palette.primary.main}` 
                                : '3px solid transparent',
                              boxShadow: isItemActive(item.path) 
                                ? `0 1px 3px ${alpha(theme.palette.common.black, 0.08)}` 
                                : 'none',
                              '&:hover': {
                                backgroundColor: isItemActive(item.path) 
                                  ? theme.palette.background.paper
                                  : alpha(theme.palette.background.paper, 0.7),
                                transform: 'translateX(2px)'
                              }
                            }}
                          >
                            <ListItemIcon 
                              sx={{ 
                                minWidth: 36,
                                color: isItemActive(item.path) 
                                  ? theme.palette.primary.main 
                                  : theme.palette.text.secondary 
                              }}
                            >
                              {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={item.text}
                              primaryTypographyProps={{
                                fontSize: '0.8125rem',
                                fontWeight: isItemActive(item.path) ? 600 : 500,
                                color: isItemActive(item.path) 
                                  ? theme.palette.primary.main 
                                  : theme.palette.text.secondary
                              }}
                            />
                            {item.disabled && (
                              <Chip
                                label="Soon"
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.6rem',
                                  backgroundColor: alpha(theme.palette.warning.main, 0.1),
                                  color: theme.palette.warning.dark
                                }}
                              />
                            )}
                          </ListItemButton>
                        </ListItem>
                      ))}
                  </List>
                </Collapse>
              </Box>
            ))}
        </List>

        <Divider sx={{ my: 2, mx: 3 }} />

        {/* Additional Items */}
        <List sx={{ px: 2 }}>
          {additionalItems
            .filter(item => item.roles.includes(user?.role))
            .map((item) => (
              <ListItem 
                key={item.text} 
                disablePadding 
                sx={{ mb: 0.5 }}
              >
                <ListItemButton
                  component={Link}
                  to={item.path}
                  disabled={item.disabled}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: isItemActive(item.path) 
                      ? theme.palette.background.paper 
                      : 'transparent',
                    borderLeft: isItemActive(item.path) 
                      ? `3px solid ${theme.palette.primary.main}` 
                      : '3px solid transparent',
                    boxShadow: isItemActive(item.path) 
                      ? `0 1px 3px ${alpha(theme.palette.common.black, 0.08)}` 
                      : 'none',
                    '&:hover': {
                      backgroundColor: isItemActive(item.path) 
                        ? theme.palette.background.paper
                        : alpha(theme.palette.background.paper, 0.7),
                      transform: 'translateX(2px)'
                    }
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 40,
                      color: isItemActive(item.path) 
                        ? theme.palette.primary.main 
                        : theme.palette.text.secondary 
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isItemActive(item.path) ? 600 : 500,
                      color: isItemActive(item.path) 
                        ? theme.palette.primary.main 
                        : theme.palette.text.primary
                    }}
                  />
                  {item.disabled && (
                    <Chip
                      label="Soon"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        backgroundColor: alpha(theme.palette.warning.main, 0.1),
                        color: theme.palette.warning.dark
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
        </List>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
          height: 64
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, minHeight: 64, height: 64, display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Page Title */}
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              fontSize: '1.125rem',
              color: theme.palette.primary.main
            }}
          >
            {location.pathname === '/' ? 'Dashboard' : 
             location.pathname.split('/').pop().split('-').map(word => 
               word.charAt(0).toUpperCase() + word.slice(1)
             ).join(' ')}
          </Typography>
          
          {/* Right Side Actions */}
          <Stack direction="row" spacing={2} alignItems="center">
            {/* WebSocket Status */}
            <WebSocketStatus compact={false} />
            
            {/* Notification Bell */}
            <NotificationBell />
            
            {/* User Menu */}
            <Button
              onClick={handleMenu}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                },
                my: 0.5
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: getAvatarColor(),
                  fontSize: '0.8125rem',
                  fontWeight: 600
                }}
                src={user?.profileImageUrl ? `http://localhost:8080${user.profileImageUrl}` : undefined}
              >
                {!user?.profileImageUrl && getUserInitials()}
              </Avatar>
              <Box sx={{ textAlign: 'left', display: { xs: 'none', md: 'block' } }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    textTransform: 'none',
                    color: theme.palette.text.primary
                  }}
                >
                  {user?.fullName || user?.username}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: '0.7rem',
                    textTransform: 'none'
                  }}
                >
                  {user?.role?.replace('_', ' ')}
                </Typography>
              </Box>
            </Button>
          </Stack>
            
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: 2,
                '& .MuiMenuItem-root': {
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5
                }
              }
            }}
          >
            <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary">
                Signed in as
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {user?.email}
              </Typography>
            </Box>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: theme.palette.error.main }} />
              </ListItemIcon>
              <Typography color="error">Logout</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: '#f8f9fa',
              borderRight: `1px solid ${theme.palette.divider}`
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: '#f8f9fa',
              borderRight: `1px solid ${theme.palette.divider}`
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: '#ffffff'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout