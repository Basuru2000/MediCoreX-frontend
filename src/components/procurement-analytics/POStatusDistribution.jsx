import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Skeleton,
  useTheme,
  alpha,
  Stack
} from '@mui/material'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { DonutLarge } from '@mui/icons-material'

function POStatusDistribution({ data, loading }) {
  const theme = useTheme()

  if (loading) {
    return (
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={250} height={20} sx={{ mb: 3 }} />
          <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto', mb: 3 }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map(i => (
              <Grid item xs={6} key={i}>
                <Skeleton variant="rectangular" height={40} sx={{ borderRadius: '8px' }} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main
              }}
            >
              <DonutLarge fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Status Distribution
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            No status data available
          </Typography>
        </CardContent>
      </Card>
    )
  }

  // Status colors mapping
  const STATUS_COLORS = {
    'DRAFT': theme.palette.grey[400],
    'APPROVED': theme.palette.info.main,
    'SENT': theme.palette.warning.main,
    'PARTIALLY_RECEIVED': '#FF9800',
    'RECEIVED': theme.palette.success.main,
    'CANCELLED': theme.palette.error.main
  }

  // Status labels mapping
  const STATUS_LABELS = {
    'DRAFT': 'Draft',
    'APPROVED': 'Approved',
    'SENT': 'Sent',
    'PARTIALLY_RECEIVED': 'Partially Received',
    'RECEIVED': 'Received',
    'CANCELLED': 'Cancelled'
  }

  // Format data for pie chart
  const chartData = data.map(item => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    percentage: item.percentage,
    totalValue: item.totalValue,
    status: item.status
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <Box
          sx={{
            bgcolor: theme.palette.background.paper,
            p: 2,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
            minWidth: 180
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {data.name}
          </Typography>
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Count:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {data.value}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Percentage:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {data.percentage.toFixed(1)}%
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Value:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                ${data.totalValue.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      )
    }
    return null
  }

  return (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: '12px',
        border: `1px solid ${theme.palette.divider}`,
        height: '100%'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.info.main, 0.1),
              color: theme.palette.info.main
            }}
          >
            <DonutLarge fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Status Distribution
          </Typography>
        </Stack>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 3, ml: { xs: 0, sm: 5.5 } }}
        >
          Current status breakdown
        </Typography>

        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={STATUS_COLORS[entry.status] || theme.palette.grey[500]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Status Legend with Details */}
        <Grid container spacing={1.5} sx={{ mt: 2 }} justifyContent="center">
          {data.map((item, index) => (
            <Grid item xs={6} sm={4} md={2} key={index}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  bgcolor: alpha(STATUS_COLORS[item.status] || theme.palette.grey[500], 0.08),
                  border: `1px solid ${alpha(STATUS_COLORS[item.status] || theme.palette.grey[500], 0.2)}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: alpha(STATUS_COLORS[item.status] || theme.palette.grey[500], 0.12),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 8px ${alpha(STATUS_COLORS[item.status] || theme.palette.grey[500], 0.15)}`
                  }
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: STATUS_COLORS[item.status] || theme.palette.grey[500],
                      flexShrink: 0
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      color: theme.palette.text.primary
                    }}
                  >
                    {STATUS_LABELS[item.status] || item.status}
                  </Typography>
                </Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: '0.7rem',
                    display: 'block',
                    ml: 2.5
                  }}
                >
                  {item.count} ({item.percentage.toFixed(0)}%)
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default POStatusDistribution