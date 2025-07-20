import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip
} from '@mui/material'
import {
  Inventory,
  Warning,
  Schedule,
  Analytics,
  TrendingUp,
  TrendingDown,
  Remove
} from '@mui/icons-material'

function ValuationSummaryCards({ summaryCards }) {
  const getIcon = (iconName) => {
    const icons = {
      inventory: <Inventory />,
      warning: <Warning />,
      schedule: <Schedule />,
      analytics: <Analytics />
    }
    return icons[iconName] || <Inventory />
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'UP':
        return <TrendingUp fontSize="small" />
      case 'DOWN':
        return <TrendingDown fontSize="small" />
      default:
        return <Remove fontSize="small" />
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'UP':
        return 'success'
      case 'DOWN':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Grid container spacing={3}>
      {summaryCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            sx={{
              height: '100%',
              position: 'relative',
              overflow: 'visible',
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)',
                transition: 'all 0.3s'
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                <Box flex={1}>
                  <Typography color="text.secondary" variant="caption" display="block">
                    {card.label}
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ my: 1 }}>
                    {formatCurrency(card.value)}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="text.secondary">
                      {card.count} items
                    </Typography>
                    {card.percentageChange > 0 && (
                      <Chip
                        size="small"
                        icon={getTrendIcon(card.trend)}
                        label={`${card.percentageChange.toFixed(1)}%`}
                        color={getTrendColor(card.trend)}
                        sx={{ height: 20 }}
                      />
                    )}
                  </Box>
                </Box>
                <Box
                  sx={{
                    backgroundColor: card.color,
                    borderRadius: '50%',
                    p: 1.5,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {React.cloneElement(getIcon(card.icon), { fontSize: 'medium' })}
                </Box>
              </Box>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  display: 'block',
                  mt: 2,
                  fontSize: '0.7rem'
                }}
              >
                {card.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default ValuationSummaryCards