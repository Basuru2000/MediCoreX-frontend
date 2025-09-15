import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  LocalShipping,
  CheckCircle,
  AttachMoney,
  Shield,
  Info,
  Refresh
} from '@mui/icons-material'
import { getSupplierMetrics } from '../../../services/api'

function SupplierScorecard({ supplierId, supplierName, onRefresh }) {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (supplierId) {
      fetchMetrics()
    }
  }, [supplierId])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getSupplierMetrics(supplierId)
      setMetrics(response.data)
    } catch (error) {
      setError('Failed to load metrics')
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (!score) return 'grey'
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'IMPROVING':
        return <TrendingUp color="success" />
      case 'DECLINING':
        return <TrendingDown color="error" />
      default:
        return <TrendingFlat color="action" />
    }
  }

  const MetricCard = ({ title, value, max = 100, icon, color = 'primary', subtitle }) => (
    <Box sx={{ mb: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center" gap={1}>
          {icon}
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h6" fontWeight="bold">
          {value !== null && value !== undefined ? `${value}%` : '-'}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={value || 0}
        color={color}
        sx={{ height: 8, borderRadius: 1 }}
      />
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  )

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <IconButton size="small" onClick={fetchMetrics}>
          <Refresh />
        </IconButton>
      }>
        {error}
      </Alert>
    )
  }

  if (!metrics) {
    return (
      <Alert severity="info">
        No metrics available for this supplier yet
      </Alert>
    )
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h6">
              {supplierName} Performance Scorecard
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Month: {new Date(metrics.metricMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              icon={getTrendIcon(metrics.performanceTrend)}
              label={metrics.performanceTrend}
              size="small"
              variant="outlined"
            />
            <Tooltip title="Refresh metrics">
              <IconButton size="small" onClick={() => {
                fetchMetrics()
                onRefresh && onRefresh()
              }}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Overall Score */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h2" fontWeight="bold" color={`${getScoreColor(metrics.overallScore)}.main`}>
            {metrics.overallScore ? metrics.overallScore.toFixed(1) : '0'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Overall Performance Score
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MetricCard
              title="Delivery Performance"
              value={metrics.deliveryPerformanceScore}
              icon={<LocalShipping color="primary" fontSize="small" />}
              color={getScoreColor(metrics.deliveryPerformanceScore)}
              subtitle={`${metrics.onTimeDeliveries}/${metrics.totalDeliveries} on-time deliveries`}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <MetricCard
              title="Quality Score"
              value={metrics.qualityScore}
              icon={<CheckCircle color="success" fontSize="small" />}
              color={getScoreColor(metrics.qualityScore)}
              subtitle={`${metrics.acceptedItems}/${metrics.totalItemsReceived} items accepted`}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <MetricCard
              title="Compliance Score"
              value={metrics.complianceScore}
              icon={<Shield color="info" fontSize="small" />}
              color={getScoreColor(metrics.complianceScore)}
              subtitle="Documentation & regulatory compliance"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <AttachMoney color="warning" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Cost Performance
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight="bold">
                  {metrics.averagePriceVariance ? 
                    `${metrics.averagePriceVariance > 0 ? '+' : ''}${metrics.averagePriceVariance.toFixed(1)}%` : '-'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Total Spend: ${metrics.totalSpend?.toLocaleString() || '0'}
                </Typography>
                <Typography variant="caption" color="success.main">
                  Savings: ${metrics.costSavings?.toLocaleString() || '0'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Additional Info */}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
            <Info fontSize="small" />
            Last calculated: {metrics.calculatedAt ? 
              new Date(metrics.calculatedAt).toLocaleString() : 'Never'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default SupplierScorecard