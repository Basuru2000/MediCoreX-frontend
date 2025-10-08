import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material'
import {
  Error,
  Warning,
  Info,
  CheckCircle
} from '@mui/icons-material'
import { getExpirySummary, getExpiringBatches } from '../../services/api'

function ExpiryMonitoringDashboard({ lastCheckResult, onRefresh }) {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [alertsError, setAlertsError] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [lastCheckResult])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch summary data
      try {
        const summaryResponse = await getExpirySummary()
        setSummary(summaryResponse.data)
      } catch (summaryError) {
        console.error('Summary fetch failed:', summaryError)
      }

      // Fetch alerts
      try {
        const alertsResponse = await getExpiringBatches({
          page: 0,
          size: 10,
          daysUntilExpiry: 30,
          sortBy: 'expiryDate',
          sortDirection: 'ASC'
        })

        const transformedAlerts = alertsResponse.data.content.map(batch => ({
          id: batch.id,
          productName: batch.productName,
          batchNumber: batch.batchNumber,
          severity: batch.daysUntilExpiry <= 7 ? 'CRITICAL' : 
                   batch.daysUntilExpiry <= 30 ? 'WARNING' : 'INFO',
          expiryDate: batch.expiryDate,
          daysUntilExpiry: batch.daysUntilExpiry || 0,
          quantityAffected: batch.quantity || 0
        }))
        setAlerts(transformedAlerts)
        setAlertsError(false)
      } catch (alertError) {
        console.error('Alerts fetch failed:', alertError)
        setAlertsError(true)
        setAlerts([])
      }
      
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const summaryData = summary || {
    expiredCount: 0,
    expiringThisWeekCount: 0,
    expiringThisMonthCount: 0,
    pendingAlertsCount: 0
  }

  const getSeverityColor = (severity) => {
    const colors = {
      CRITICAL: theme.palette.error.main,
      WARNING: theme.palette.warning.main,
      INFO: theme.palette.info.main,
      LOW: theme.palette.success.main
    }
    return colors[severity] || theme.palette.info.main
  }

  const getSeverityIcon = (severity) => {
    const icons = {
      CRITICAL: <Error fontSize="small" />,
      WARNING: <Warning fontSize="small" />,
      INFO: <Info fontSize="small" />,
      LOW: <CheckCircle fontSize="small" />
    }
    return icons[severity] || <Info fontSize="small" />
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
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
                      {summaryData.expiredCount || 0}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      p: 1,
                      borderRadius: '8px',
                      bgcolor: alpha(theme.palette.error.main, 0.1)
                    }}
                  >
                    <Error sx={{ color: theme.palette.error.main }} />
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: theme.palette.error.main, fontWeight: 500 }}>
                  Value at risk: ${summaryData.expiredValue?.toFixed(2) || '0.00'}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                      {summaryData.expiringThisWeekCount || 0}
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
                <Typography variant="caption" color="text.secondary">
                  Immediate action required
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                      {summaryData.pendingAlertsCount || 0}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      p: 1,
                      borderRadius: '8px',
                      bgcolor: alpha(theme.palette.info.main, 0.1)
                    }}
                  >
                    <Info sx={{ color: theme.palette.info.main }} />
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Awaiting acknowledgment
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                      Expiring This Month
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                      {summaryData.expiringThisMonthCount || 0}
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
                <Typography variant="caption" color="text.secondary">
                  Monitor closely
                </Typography>
              </Stack>
            </CardContent>
          </Card>
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
            Recent Expiry Alerts
          </Typography>
          <Button
            size="small"
            onClick={onRefresh}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: '8px'
            }}
          >
            Refresh
          </Button>
        </Box>
        
        {alerts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No alerts found
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {alerts.map((alert) => (
              <Paper
                key={alert.id}
                sx={{
                  p: 2,
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: alpha(getSeverityColor(alert.severity), 0.02),
                  '&:hover': {
                    bgcolor: alpha(getSeverityColor(alert.severity), 0.05),
                    borderColor: getSeverityColor(alert.severity)
                  },
                  transition: 'all 0.2s'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        icon={getSeverityIcon(alert.severity)}
                        label={alert.severity}
                        size="small"
                        sx={{
                          bgcolor: alpha(getSeverityColor(alert.severity), 0.1),
                          color: getSeverityColor(alert.severity),
                          fontWeight: 600,
                          borderRadius: '6px',
                          '& .MuiChip-icon': {
                            color: 'inherit'
                          }
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {alert.productName}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Batch: {alert.batchNumber} • Expires: {new Date(alert.expiryDate).toLocaleDateString()} • Quantity: {alert.quantityAffected}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        color: getSeverityColor(alert.severity)
                      }}
                    >
                      {alert.daysUntilExpiry}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      days left
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  )
}

export default ExpiryMonitoringDashboard