import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material'
import {
  ShoppingCart,
  AttachMoney,
  CheckCircle,
  Timer,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material'

function MetricsCards({ metrics, loading }) {
  const theme = useTheme()

  if (loading || !metrics) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map(i => (
          <Grid item xs={12} sm={6} lg={3} key={i}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                borderRadius: '12px',
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '12px' }} />
                </Box>
                <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={40} />
                <Skeleton variant="text" width="50%" height={16} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  const cards = [
    {
      title: 'Total Purchase Orders',
      value: metrics.totalPOs || 0,
      icon: <ShoppingCart sx={{ fontSize: 24 }} />,
      color: theme.palette.primary.main,
      trend: metrics.monthlyGrowthPercentage,
      trendLabel: `${Math.abs(metrics.monthlyGrowthPercentage || 0).toFixed(1)}% vs last month`,
      bgColor: alpha(theme.palette.primary.main, 0.1)
    },
    {
      title: 'Total Value',
      value: `$${(metrics.totalValue || 0).toLocaleString()}`,
      icon: <AttachMoney sx={{ fontSize: 24 }} />,
      color: theme.palette.success.main,
      subtitle: `Avg: $${(metrics.avgPOValue || 0).toLocaleString()}`,
      bgColor: alpha(theme.palette.success.main, 0.1)
    },
    {
      title: 'Fulfillment Rate',
      value: `${(metrics.fulfillmentRate || 0).toFixed(1)}%`,
      icon: <CheckCircle sx={{ fontSize: 24 }} />,
      color: theme.palette.info.main,
      subtitle: `${metrics.received || 0} completed`,
      bgColor: alpha(theme.palette.info.main, 0.1)
    },
    {
      title: 'Avg Approval Time',
      value: metrics.avgApprovalTimeHours 
        ? `${Math.round(metrics.avgApprovalTimeHours)}h`
        : 'N/A',
      icon: <Timer sx={{ fontSize: 24 }} />,
      color: theme.palette.warning.main,
      subtitle: `${metrics.pendingApproval || 0} pending`,
      bgColor: alpha(theme.palette.warning.main, 0.1)
    }
  ]

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} lg={3} key={index}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
                borderColor: alpha(card.color, 0.3)
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: card.bgColor,
                    color: card.color
                  }}
                >
                  {card.icon}
                </Box>
                {card.trend !== undefined && (
                  <Chip
                    icon={card.trend >= 0 ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
                    label={card.trendLabel}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      bgcolor: card.trend >= 0 
                        ? alpha(theme.palette.success.main, 0.1) 
                        : alpha(theme.palette.error.main, 0.1),
                      color: card.trend >= 0 
                        ? theme.palette.success.main 
                        : theme.palette.error.main,
                      border: 'none',
                      '& .MuiChip-icon': {
                        color: 'inherit'
                      }
                    }}
                  />
                )}
              </Box>

              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  mb: 1,
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                {card.title}
              </Typography>

              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                  color: theme.palette.text.primary
                }}
              >
                {card.value}
              </Typography>

              {card.subtitle && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: '0.75rem'
                  }}
                >
                  {card.subtitle}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default MetricsCards