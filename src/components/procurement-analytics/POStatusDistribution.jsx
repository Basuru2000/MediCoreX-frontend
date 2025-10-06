import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  Grid
} from '@mui/material'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts'

function POStatusDistribution({ data, loading }) {
  const theme = useTheme()

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2">Loading status distribution...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Status Distribution</Typography>
          <Typography variant="body2" color="text.secondary">
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
    'PARTIALLY_RECEIVED': theme.palette.orange?.main || '#FF9800',
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
            bgcolor: 'background.paper',
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 2
          }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            {data.name}
          </Typography>
          <Typography variant="body2">
            Count: {data.value}
          </Typography>
          <Typography variant="body2">
            Percentage: {data.percentage.toFixed(1)}%
          </Typography>
          <Typography variant="body2">
            Value: ${data.totalValue.toLocaleString()}
          </Typography>
        </Box>
      )
    }
    return null
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          PO Status Distribution
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Current status breakdown of all purchase orders
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={STATUS_COLORS[entry.status] || theme.palette.grey[500]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Status Legend with Details */}
        <Grid container spacing={2} mt={2}>
          {data.map((item, index) => (
            <Grid item xs={6} sm={4} key={index}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: STATUS_COLORS[item.status] || theme.palette.grey[500]
                  }}
                />
                <Box>
                  <Typography variant="caption" display="block" fontWeight={500}>
                    {STATUS_LABELS[item.status] || item.status}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.count} ({item.percentage.toFixed(0)}%)
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default POStatusDistribution