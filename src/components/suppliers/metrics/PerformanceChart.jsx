import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  useTheme
} from '@mui/material'
import {
  Refresh,
  TrendingUp
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { getSupplierMetricsHistory } from '../../../services/api'

function PerformanceChart({ supplierId, supplierName }) {
  const theme = useTheme()
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState(12)

  useEffect(() => {
    fetchHistory()
  }, [supplierId, timeRange])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getSupplierMetricsHistory(supplierId, timeRange)
      
      // Transform data for chart
      const transformed = response.data.map(item => ({
        month: new Date(item.metricMonth).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        }),
        overall: item.overallScore || 0,
        delivery: item.deliveryPerformanceScore || 0,
        quality: item.qualityScore || 0,
        compliance: item.complianceScore || 0
      }))
      
      setChartData(transformed)
    } catch (error) {
      setError('Failed to load performance history')
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTimeRangeChange = (event, newValue) => {
    if (newValue !== null) {
      setTimeRange(newValue)
    }
  }

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center"
        minHeight="300px"
        gap={2}
      >
        <CircularProgress size={40} thickness={4} />
        <Typography variant="body2" color="text.secondary">
          Loading performance history...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert 
        severity="error"
        action={
          <IconButton 
            size="small" 
            onClick={fetchHistory}
            sx={{ color: 'error.main' }}
          >
            <Refresh />
          </IconButton>
        }
        sx={{ borderRadius: '8px' }}
      >
        {error}
      </Alert>
    )
  }

  if (chartData.length === 0) {
    return (
      <Alert severity="info" sx={{ borderRadius: '8px' }}>
        No historical data available yet
      </Alert>
    )
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
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <TrendingUp sx={{ color: 'primary.main', fontSize: 24 }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '1.125rem'
                }}
              >
                Performance Trends
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.875rem'
              }}
            >
              Historical performance metrics for {supplierName}
            </Typography>
          </Box>

          <Box display="flex" gap={1.5} alignItems="center">
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 2,
                  py: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  borderRadius: '6px',
                  textTransform: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }
                }
              }}
            >
              <ToggleButton value={6}>6M</ToggleButton>
              <ToggleButton value={12}>12M</ToggleButton>
              <ToggleButton value={24}>24M</ToggleButton>
            </ToggleButtonGroup>

            <Tooltip title="Refresh Chart" arrow>
              <IconButton 
                onClick={fetchHistory}
                sx={{
                  width: 36,
                  height: 36,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderColor: theme.palette.primary.main
                  }
                }}
              >
                <Refresh sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Chart */}
        <Box 
          sx={{ 
            width: '100%', 
            height: 350,
            mt: 2
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme.palette.divider}
                vertical={false}
              />
              <XAxis 
                dataKey="month" 
                stroke={theme.palette.text.secondary}
                style={{
                  fontSize: '0.75rem',
                  fontFamily: theme.typography.fontFamily
                }}
                tickLine={false}
              />
              <YAxis 
                stroke={theme.palette.text.secondary}
                style={{
                  fontSize: '0.75rem',
                  fontFamily: theme.typography.fontFamily
                }}
                tickLine={false}
                domain={[0, 100]}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  boxShadow: theme.shadows[3],
                  fontSize: '0.875rem'
                }}
                labelStyle={{
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: theme.palette.text.primary
                }}
              />
              <Legend 
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '0.875rem'
                }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="overall" 
                name="Overall Score"
                stroke={theme.palette.primary.main}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="delivery" 
                name="Delivery"
                stroke={theme.palette.info.main}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="quality" 
                name="Quality"
                stroke={theme.palette.success.main}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="compliance" 
                name="Compliance"
                stroke={theme.palette.warning.main}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Legend Note */}
        <Box 
          sx={{ 
            mt: 2, 
            p: 2, 
            borderRadius: '8px',
            bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.75rem'
            }}
          >
            <strong>Note:</strong> Performance trends show monthly score changes across all metrics. 
            Higher scores indicate better performance.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default PerformanceChart