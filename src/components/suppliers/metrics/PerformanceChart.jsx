import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert
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
import { getSupplierMetricsHistory } from '../../../services/api'

function PerformanceChart({ supplierId, supplierName }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [months, setMonths] = useState(6)

  useEffect(() => {
    if (supplierId) {
      fetchHistoricalData()
    }
  }, [supplierId, months])

  const fetchHistoricalData = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getSupplierMetricsHistory(supplierId, months)
      
      // Transform data for recharts
      const chartData = response.data.map(metric => ({
        month: new Date(metric.metricMonth).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        overall: metric.overallScore,
        delivery: metric.deliveryPerformanceScore,
        quality: metric.qualityScore,
        compliance: metric.complianceScore
      }))
      
      setData(chartData.reverse()) // Show oldest to newest
    } catch (error) {
      setError('Failed to load historical metrics')
      console.error('Error fetching historical data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (data.length === 0) {
    return (
      <Alert severity="info">
        No historical data available for this supplier
      </Alert>
    )
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Performance Trend - {supplierName}
          </Typography>
          <FormControl size="small">
            <Select
              value={months}
              onChange={(e) => setMonths(e.target.value)}
            >
              <MenuItem value={3}>Last 3 Months</MenuItem>
              <MenuItem value={6}>Last 6 Months</MenuItem>
              <MenuItem value={12}>Last 12 Months</MenuItem>
              <MenuItem value={24}>Last 24 Months</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="overall"
              stroke="#8884d8"
              name="Overall Score"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="delivery"
              stroke="#82ca9d"
              name="Delivery"
            />
            <Line
              type="monotone"
              dataKey="quality"
              stroke="#ffc658"
              name="Quality"
            />
            <Line
              type="monotone"
              dataKey="compliance"
              stroke="#ff7c7c"
              name="Compliance"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default PerformanceChart