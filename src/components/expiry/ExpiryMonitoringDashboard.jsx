import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  Paper,
  Divider,
  useTheme,
  alpha,
  Button
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  ErrorOutline,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  InfoOutlined,
  AccessTime,
  LocalShipping,
  Category
} from '@mui/icons-material'
import { getExpirySummary, getExpiryAlerts, getExpiringBatches } from '../../services/api'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'

function ExpiryMonitoringDashboard({ lastCheckResult, onRefresh }) {
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [error, setError] = useState(null)
  const [alertsError, setAlertsError] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [lastCheckResult])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      setAlertsError(false)
      
      // Fetch summary data first (this works)
      try {
        const summaryRes = await getExpirySummary()
        setSummary(summaryRes.data)
      } catch (summaryError) {
        console.error('Failed to fetch summary:', summaryError)
        // Continue even if summary fails
      }

      // Try to fetch alerts, but don't fail the entire dashboard if it doesn't work
      try {
        const alertsRes = await getExpiryAlerts({ status: 'PENDING', page: 0, size: 5 })
        setAlerts(alertsRes.data.content || [])
      } catch (alertError) {
        console.warn('Failed to fetch alerts, trying alternative endpoint:', alertError)
        setAlertsError(true)
        
        // Try alternative: fetch expiring batches as a fallback
        try {
          const expiringRes = await getExpiringBatches(30)
          // Transform expiring batches to alert-like format
          const transformedAlerts = (expiringRes.data || []).slice(0, 5).map((batch, index) => ({
            id: batch.id || index,
            productName: batch.productName || 'Unknown Product',
            productCode: batch.productCode || '',
            batchNumber: batch.batchNumber || 'N/A',
            severity: batch.daysUntilExpiry <= 7 ? 'CRITICAL' : 
                     batch.daysUntilExpiry <= 30 ? 'WARNING' : 'INFO',
            expiryDate: batch.expiryDate,
            daysUntilExpiry: batch.daysUntilExpiry || 0,
            quantityAffected: batch.quantity || 0
          }))
          setAlerts(transformedAlerts)
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError)
          setAlerts([])
        }
      }
      
    } catch (err) {
      setError('Failed to load some dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Use default values if summary is null
  const summaryData = summary || {
    expiredProducts: 0,
    expiring7Days: 0,
    expiring30Days: 0,
    expiring60Days: 0,
    expiring90Days: 0,
    expiringBeyond90Days: 0,
    safeProducts: 0,
    warningProducts: 0,
    criticalProducts: 0,
    pendingAlerts: 0,
    expiredValue: 0
  }

  const pieData = [
    { name: 'Safe', value: summaryData.safeProducts || 0, color: theme.palette.success.main },
    { name: 'Warning', value: summaryData.warningProducts || 0, color: theme.palette.warning.main },
    { name: 'Critical', value: summaryData.criticalProducts || 0, color: theme.palette.error.main },
    { name: 'Expired', value: summaryData.expiredProducts || 0, color: theme.palette.grey[600] }
  ].filter(item => item.value > 0) // Only show non-zero values

  const barData = [
    { range: '0-7 days', count: summaryData.expiring7Days || 0 },
    { range: '8-30 days', count: summaryData.expiring30Days || 0 },
    { range: '31-60 days', count: summaryData.expiring60Days || 0 },
    { range: '61-90 days', count: summaryData.expiring90Days || 0 },
    { range: '90+ days', count: summaryData.expiringBeyond90Days || 0 }
  ]

  const getSeverityColor = (severity) => {
    const colors = {
      CRITICAL: theme.palette.error.main,
      WARNING: theme.palette.warning.main,
      INFO: theme.palette.info.main,
      LOW: theme.palette.success.main
    }
    return colors[severity] || theme.palette.grey[500]
  }

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    )
  }

  return (
    <Box>
      {error && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3,
            borderRadius: '8px'
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none',
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.02)} 100%)`
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Expired Products
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                      {summaryData.expiredProducts}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      p: 1,
                      borderRadius: '8px',
                      bgcolor: alpha(theme.palette.error.main, 0.1)
                    }}
                  >
                    <ErrorOutline sx={{ color: theme.palette.error.main }} />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Value at risk:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                    ${summaryData.expiredValue?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none',
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Expiring Soon (7 days)
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
                      {summaryData.expiring7Days}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      p: 1,
                      borderRadius: '8px',
                      bgcolor: alpha(theme.palette.warning.main, 0.1)
                    }}
                  >
                    <Warning sx={{ color: theme.palette.warning.main }} />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Immediate action required
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none',
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Pending Alerts
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                      {summaryData.pendingAlerts}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      p: 1,
                      borderRadius: '8px',
                      bgcolor: alpha(theme.palette.info.main, 0.1)
                    }}
                  >
                    <AccessTime sx={{ color: theme.palette.info.main }} />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Awaiting acknowledgment
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none',
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Safe Products
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                      {summaryData.safeProducts}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      p: 1,
                      borderRadius: '8px',
                      bgcolor: alpha(theme.palette.success.main, 0.1)
                    }}
                  >
                    <CheckCircle sx={{ color: theme.palette.success.main }} />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    No action needed
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Product Status Distribution
            </Typography>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Expiry Timeline Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Alerts */}
      <Paper 
        sx={{ 
          p: 3,
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {alertsError ? 'Expiring Products' : 'Recent Expiry Alerts'}
          </Typography>
          <Button
            size="small"
            onClick={onRefresh}
            sx={{
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Refresh
          </Button>
        </Box>
        
        {alerts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No {alertsError ? 'expiring products' : 'pending alerts'} to display
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {alerts.map((alert, index) => (
              <Box
                key={alert.id || index}
                sx={{
                  p: 2,
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {alert.productName}
                      </Typography>
                      <Chip
                        label={alert.severity}
                        size="small"
                        sx={{
                          bgcolor: alpha(getSeverityColor(alert.severity), 0.1),
                          color: getSeverityColor(alert.severity),
                          fontWeight: 500,
                          borderRadius: '6px'
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Batch: {alert.batchNumber} • Expires: {new Date(alert.expiryDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {alert.daysUntilExpiry} days
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  )
}

export default ExpiryMonitoringDashboard