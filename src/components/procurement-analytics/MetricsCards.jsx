import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
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
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Loading...
                </Typography>
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
      value: metrics.totalPOs,
      icon: <ShoppingCart />,
      color: theme.palette.primary.main,
      trend: metrics.monthlyGrowthPercentage,
      trendLabel: `${Math.abs(metrics.monthlyGrowthPercentage || 0)}% vs last month`
    },
    {
      title: 'Total Value',
      value: `$${(metrics.totalValue || 0).toLocaleString()}`,
      icon: <AttachMoney />,
      color: theme.palette.success.main,
      subtitle: `Avg: $${(metrics.avgPOValue || 0).toLocaleString()}`
    },
    {
      title: 'Fulfillment Rate',
      value: `${(metrics.fulfillmentRate || 0).toFixed(1)}%`,
      icon: <CheckCircle />,
      color: theme.palette.info.main,
      subtitle: `${metrics.received || 0} completed`
    },
    {
      title: 'Avg Approval Time',
      value: metrics.avgApprovalTimeHours 
        ? `${Math.round(metrics.avgApprovalTimeHours)}h`
        : 'N/A',
      icon: <Timer />,
      color: theme.palette.warning.main,
      subtitle: `${metrics.pendingApproval || 0} pending`
    }
  ]

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card 
            sx={{ 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8]
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(card.color, 0.1),
                    color: card.color
                  }}
                >
                  {card.icon}
                </Box>
                {card.trend !== undefined && (
                  <Chip
                    icon={card.trend >= 0 ? <TrendingUp /> : <TrendingDown />}
                    label={card.trendLabel}
                    size="small"
                    color={card.trend >= 0 ? "success" : "error"}
                    variant="outlined"
                  />
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {card.title}
              </Typography>

              <Typography variant="h4" fontWeight={700} mb={0.5}>
                {card.value}
              </Typography>

              {card.subtitle && (
                <Typography variant="caption" color="text.secondary">
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