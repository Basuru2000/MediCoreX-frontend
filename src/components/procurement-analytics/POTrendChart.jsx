import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  useTheme,
  alpha,
  Stack
} from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { TrendingUp } from '@mui/icons-material'

function POTrendChart({ data, loading }) {
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
          <Skeleton variant="text" width={300} height={20} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" width="100%" height={350} sx={{ borderRadius: '8px' }} />
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
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }}
            >
              <TrendingUp fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Purchase Order Trends
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            No data available for the selected period
          </Typography>
        </CardContent>
      </Card>
    )
  }

  // Format data for chart
  const chartData = data.map(item => ({
    month: item.monthLabel,
    'PO Count': item.poCount,
    'Total Value': Math.round(item.totalValue / 1000), // Convert to thousands
    'Approved': item.approvedCount,
    'Received': item.receivedCount
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: theme.palette.background.paper,
            p: 2,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={index} display="flex" alignItems="center" justifyContent="space-between" gap={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: entry.color
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {entry.name}:
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={600}>
                {entry.name === 'Total Value' ? `$${entry.value}K` : entry.value}
              </Typography>
            </Box>
          ))}
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
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main
            }}
          >
            <TrendingUp fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Purchase Order Trends
          </Typography>
        </Stack>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 3, ml: { xs: 0, sm: 5.5 } }}
        >
          Monthly PO activity and value trends
        </Typography>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart 
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.warning.main} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={theme.palette.warning.main} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={alpha(theme.palette.divider, 0.5)}
              vertical={false}
            />
            <XAxis 
              dataKey="month" 
              tick={{ 
                fontSize: 12,
                fill: theme.palette.text.secondary
              }}
              stroke={alpha(theme.palette.text.secondary, 0.2)}
            />
            <YAxis 
              yAxisId="left"
              tick={{ 
                fontSize: 12,
                fill: theme.palette.text.secondary
              }}
              stroke={alpha(theme.palette.text.secondary, 0.2)}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              tick={{ 
                fontSize: 12,
                fill: theme.palette.text.secondary
              }}
              stroke={alpha(theme.palette.text.secondary, 0.2)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '14px'
              }}
              iconType="line"
            />
            
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="PO Count"
              stroke={theme.palette.primary.main}
              strokeWidth={3}
              dot={{ 
                fill: theme.palette.primary.main, 
                r: 4,
                strokeWidth: 0
              }}
              activeDot={{ 
                r: 6,
                strokeWidth: 2,
                stroke: theme.palette.background.paper
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Approved"
              stroke={theme.palette.success.main}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ 
                fill: theme.palette.success.main, 
                r: 3,
                strokeWidth: 0
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Received"
              stroke={theme.palette.info.main}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ 
                fill: theme.palette.info.main, 
                r: 3,
                strokeWidth: 0
              }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Total Value"
              stroke={theme.palette.warning.main}
              strokeWidth={2}
              dot={{ 
                fill: theme.palette.warning.main, 
                r: 3,
                strokeWidth: 0
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default POTrendChart