import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme
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

function POTrendChart({ data, loading }) {
  const theme = useTheme()

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2">Loading trend data...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Purchase Order Trends</Typography>
          <Typography variant="body2" color="text.secondary">
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

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Purchase Order Trends
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Monthly PO activity and value trends
        </Typography>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              stroke={theme.palette.text.secondary}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12 }}
              stroke={theme.palette.text.secondary}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              tick={{ fontSize: 12 }}
              stroke={theme.palette.text.secondary}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8
              }}
              formatter={(value, name) => {
                if (name === 'Total Value') {
                  return [`$${value}K`, name]
                }
                return [value, name]
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="PO Count"
              stroke={theme.palette.primary.main}
              strokeWidth={3}
              dot={{ fill: theme.palette.primary.main, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Approved"
              stroke={theme.palette.success.main}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: theme.palette.success.main, r: 3 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Received"
              stroke={theme.palette.info.main}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: theme.palette.info.main, r: 3 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Total Value"
              stroke={theme.palette.warning.main}
              strokeWidth={2}
              dot={{ fill: theme.palette.warning.main, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default POTrendChart