import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Paper,
  useTheme
} from '@mui/material'
import {
  LocalShipping,
  CheckCircle,
  Shield,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Refresh,
  Info
} from '@mui/icons-material'
import { getSupplierMetrics } from '../../../services/api'

function SupplierScorecard({ supplierId, supplierName, onRefresh }) {
  const theme = useTheme()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMetrics()
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
    if (!score) return 'text.secondary'
    if (score >= 80) return 'success.main'
    if (score >= 60) return 'warning.main'
    return 'error.main'
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'IMPROVING':
        return <TrendingUp sx={{ fontSize: 20, color: 'success.main' }} />
      case 'DECLINING':
        return <TrendingDown sx={{ fontSize: 20, color: 'error.main' }} />
      default:
        return <TrendingFlat sx={{ fontSize: 20, color: 'text.secondary' }} />
    }
  }

  const MetricCard = ({ title, value, icon, color, subtitle }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '12px',
        border: `1px solid ${theme.palette.divider}`,
        height: '100%',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[2]
        }
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Box 
          sx={{ 
            width: 40,
            height: 40,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: theme.palette.mode === 'light' ? `${color}.lighter` : `${color}.darker`
          }}
        >
          {icon}
        </Box>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            fontSize: '2rem',
            color: `${color}.main`
          }}
        >
          {value !== null && value !== undefined ? value.toFixed(1) : '-'}
        </Typography>
      </Box>
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: 500,
          fontSize: '0.875rem',
          color: 'text.primary',
          mb: 0.5
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            fontSize: '0.75rem'
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Paper>
  )

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
          Loading performance metrics...
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
            onClick={fetchMetrics}
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

  if (!metrics) {
    return (
      <Alert severity="info" sx={{ borderRadius: '8px' }}>
        No metrics available for this supplier yet
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                fontSize: '1.125rem',
                mb: 0.5
              }}
            >
              Performance Scorecard
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.875rem'
              }}
            >
              Current performance metrics for {supplierName}
            </Typography>
          </Box>
          <Tooltip title="Refresh Metrics" arrow>
            <IconButton 
              onClick={() => {
                fetchMetrics()
                if (onRefresh) onRefresh()
              }}
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

        {/* Overall Score */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '12px',
            textAlign: 'center',
            border: `2px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={1}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700,
                fontSize: '3.5rem',
                color: getScoreColor(metrics.overallScore)
              }}
            >
              {metrics.overallScore ? metrics.overallScore.toFixed(1) : '0'}
            </Typography>
            <Box>
              {getTrendIcon(metrics.performanceTrend)}
              <Chip
                label={metrics.performanceTrend || 'STABLE'}
                size="small"
                sx={{
                  mt: 0.5,
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  borderRadius: '6px'
                }}
              />
            </Box>
          </Box>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            Overall Performance Score
          </Typography>
        </Paper>

        {/* Metric Cards */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <MetricCard
              title="Delivery Performance"
              value={metrics.deliveryPerformanceScore}
              icon={<LocalShipping sx={{ color: 'primary.main', fontSize: 22 }} />}
              color="primary"
              subtitle={`${metrics.onTimeDeliveries || 0}/${metrics.totalDeliveries || 0} on-time deliveries`}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <MetricCard
              title="Quality Score"
              value={metrics.qualityScore}
              icon={<CheckCircle sx={{ color: 'success.main', fontSize: 22 }} />}
              color="success"
              subtitle={`${metrics.acceptedItems || 0}/${metrics.totalItemsReceived || 0} items accepted`}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <MetricCard
              title="Compliance Score"
              value={metrics.complianceScore}
              icon={<Shield sx={{ color: 'info.main', fontSize: 22 }} />}
              color="info"
              subtitle="Documentation & regulatory compliance"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '12px',
                border: `1px solid ${theme.palette.divider}`,
                height: '100%',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[2]
                }
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Box 
                  sx={{ 
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: theme.palette.mode === 'light' ? 'warning.lighter' : 'warning.darker'
                  }}
                >
                  <AttachMoney sx={{ color: 'warning.main', fontSize: 22 }} />
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '2rem',
                    color: metrics.averagePriceVariance >= 0 ? 'error.main' : 'success.main'
                  }}
                >
                  {metrics.averagePriceVariance ? 
                    `${metrics.averagePriceVariance > 0 ? '+' : ''}${metrics.averagePriceVariance.toFixed(1)}%` 
                    : '-'}
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  mb: 1
                }}
              >
                Cost Performance
              </Typography>
              <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={0.5}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: '0.75rem'
                  }}
                >
                  Total: ${(metrics.totalSpend || 0).toLocaleString()}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'success.main',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  Saved: ${(metrics.costSavings || 0).toLocaleString()}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Additional Info */}
        <Box 
          sx={{ 
            mt: 3, 
            pt: 2, 
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Info sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.75rem'
              }}
            >
              Last calculated: {metrics.calculatedAt ? 
                new Date(metrics.calculatedAt).toLocaleString() : 
                'Never'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default SupplierScorecard