import React from 'react'  // IMPORTANT: Add this import
import { useAuth } from '../context/AuthContext'
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button
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

function Home() {
  const { user, isManager, isStaff, isProcurement } = useAuth()
  const navigate = useNavigate()

  const dashboardCards = [
    {
      title: 'Total Users',
      value: '3',
      icon: <People />,
      color: '#1976d2',
      path: '/users',
      roles: ['HOSPITAL_MANAGER']
    },
    {
      title: 'Products',
      value: '0',
      icon: <Inventory />,
      color: '#388e3c',
      path: '/products',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF']
    },
    {
      title: 'Low Stock Items',
      value: '0',
      icon: <Warning />,
      color: '#f57c00',
      path: '/products',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF', 'PROCUREMENT_OFFICER']
    },
    {
      title: 'Pending Orders',
      value: '0',
      icon: <ShoppingCart />,
      color: '#d32f2f',
      path: '/procurement',
      roles: ['HOSPITAL_MANAGER', 'PROCUREMENT_OFFICER']
    },
    {
      title: 'Expiring Soon',
      value: '0',
      icon: <TrendingUp />,
      color: '#7b1fa2',
      path: '/products',
      roles: ['HOSPITAL_MANAGER', 'PHARMACY_STAFF']
    },
    {
      title: 'Reports',
      value: 'View',
      icon: <Assessment />,
      color: '#0288d1',
      path: '/reports',
      roles: ['HOSPITAL_MANAGER']
    }
  ]

  const visibleCards = dashboardCards.filter(card => 
    card.roles.includes(user?.role)
  )

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.fullName}
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Role: {user?.role?.replace('_', ' ')}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {visibleCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.2s'
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
                <Typography variant="h3" component="div" align="center">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        {isManager && (
          <Button
            variant="outlined"
            sx={{ mr: 2, mb: 1 }}
            onClick={() => navigate('/users')}
          >
            Manage Users
          </Button>
        )}
        {(isManager || isStaff) && (
          <Button
            variant="outlined"
            sx={{ mr: 2, mb: 1 }}
            onClick={() => navigate('/products')}
          >
            View Products
          </Button>
        )}
        {(isManager || isProcurement) && (
          <Button
            variant="outlined"
            sx={{ mr: 2, mb: 1 }}
            onClick={() => navigate('/procurement')}
          >
            Procurement
          </Button>
        )}
      </Paper>
    </Box>
  )
}

export default Home