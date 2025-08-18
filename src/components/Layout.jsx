import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './notifications/NotificationBell'
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Divider,
  Avatar
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Inventory,
  ShoppingCart,
  Assessment,
  AccountCircle,
  Logout,
  Category,
  Schedule,
  Layers,
  Warning,
  Notifications,
  Settings as SettingsIcon,
  NotificationsActive as NotificationPrefIcon
} from '@mui/icons-material'

const drawerWidth = 240

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const { user, logout, isManager, isStaff, isProcurement } = useAuth()
  const navigate = useNavigate()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleClose()
    logout()
  }

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/', roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER'] },
    { text: 'Users', icon: <People />, path: '/users', roles: ['HOSPITAL_MANAGER'] },
    { text: 'Products', icon: <Inventory />, path: '/products', roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF'] },
    { text: 'Categories', icon: <Category />, path: '/categories', roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER'] },
    { text: 'Batch Tracking', icon: <Layers />, path: '/batch-tracking', roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF'] },
    { text: 'Procurement', icon: <ShoppingCart />, path: '/procurement', roles: ['HOSPITAL_MANAGER', 'PROCUREMENT_OFFICER'] },
    { text: 'Stock Valuation', icon: <Assessment />, path: '/reports/stock-valuation', roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF'] },
    { text: 'Expiry Alerts', icon: <Schedule />, path: '/expiry-config', roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF'] },
    { text: 'Expiry Monitoring', icon: <Schedule />, path: '/expiry-monitoring', roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF'] },
    { text: 'Quarantine', icon: <Warning />, path: '/quarantine', roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF'] },
    { text: 'Notifications', icon: <Notifications />, path: '/notifications', roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER'] },
    { text: 'Notification Settings', icon: <NotificationPrefIcon />, path: '/notification-preferences', roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER'] },
  ]

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          MediCoreX
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems
          .filter(item => item.roles.includes(user?.role))
          .map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton component={Link} to={item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </div>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            MediCoreX
          </Typography>
          
          <NotificationBell />
          
          <Box sx={{ ml: 2 }}>
            <Button
              color="inherit"
              onClick={handleMenu}
              startIcon={<AccountCircle />}
            >
              {user?.fullName || user?.username}
            </Button>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>
                <Typography variant="caption">
                  Role: {user?.role?.replace('_', ' ')}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout