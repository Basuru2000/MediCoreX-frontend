import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Grow,
  useTheme,
  alpha
} from '@mui/material'
import {
  AttachMoney,
  Inventory,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Category,
  Warning,
  Assessment,
  ShowChart
} from '@mui/icons-material'

function ValuationSummaryCards({ summaryCards }) {
  const theme = useTheme()

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value || 0)
  }

  const getIcon = (iconType, color) => {
    const iconStyle = { fontSize: 24, color: theme.palette[color].main }
    switch (iconType) {
      case 'money':
        return <AttachMoney sx={iconStyle} />
      case 'inventory':
        return <Inventory sx={iconStyle} />
      case 'warning':
        return <Warning sx={iconStyle} />
      case 'chart':
        return <ShowChart sx={iconStyle} />
      case 'trending':
        return <TrendingUp sx={iconStyle} />
      case 'shopping':
        return <ShoppingCart sx={iconStyle} />
      case 'category':
        return <Category sx={iconStyle} />
      case 'assessment':
        return <Assessment sx={iconStyle} />
      default:
        return <AttachMoney sx={iconStyle} />
    }
  }

  const getColorFromType = (color) => {
    return color || 'primary'
  }

  return (
    <Grid container spacing={3}>
      {summaryCards.map((card, index) => {
        const color = getColorFromType(card.color)
        
        return (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Grow in={true} timeout={500 + (index * 100)}>
              <Card 
                sx={{ 
                  height: '100%',
                  minHeight: 160,
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: theme.palette[color].main
                  }
                }}
              >
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Title Section */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      mb: 1.5
                    }}
                  >
                    {card.title}
                  </Typography>
                  
                  {/* Value Section */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700,
                          color: 'text.primary',
                          mb: 0.5
                        }}
                      >
                        {card.prefix === '$' 
                          ? formatCurrency(card.value).replace('$', '') 
                          : formatNumber(card.value)
                        }
                      </Typography>
                      
                      {/* Subtitle */}
                      {card.subtitle && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'text.primary',
                              fontWeight: 600,
                              fontSize: '0.875rem'
                            }}
                          >
                            {card.subtitle}
                          </Typography>
                          
                          {/* Change indicator */}
                          {card.change !== undefined && card.change !== null && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {card.changeType === 'increase' ? (
                                <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                              ) : (
                                <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                              )}
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: card.changeType === 'increase' ? 'success.main' : 'error.main',
                                  fontWeight: 600
                                }}
                              >
                                {Math.abs(card.change)}%
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                    
                    {/* Icon */}
                    <Box 
                      sx={{ 
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette[color].main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {getIcon(card.icon, color)}
                    </Box>
                  </Box>

                  {/* Description */}
                  {card.description && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        mt: 'auto'
                      }}
                    >
                      {card.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        )
      })}
    </Grid>
  )
}

export default ValuationSummaryCards