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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  LinearProgress,
  Divider,
  Alert
} from '@mui/material'
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  TrendingUp,
  Category,
  LocalOffer
} from '@mui/icons-material'
import { getExpiryAlerts, getExpiringBatches } from '../../services/api'

function AlertGenerationReport({ checkResult, onRefresh }) {
  const theme = useTheme()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (checkResult?.checkLogId) {
      fetchAlerts()
    }
  }, [checkResult])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      try {
        // Try primary endpoint first
        const response = await getExpiryAlerts({ 
          status: 'PENDING', 
          page: 0, 
          size: 20 
        })
        setAlerts(response.data.content || [])
      } catch (primaryError) {
        console.warn('Primary alerts endpoint failed, using fallback:', primaryError)
        
        // Fallback to expiring batches
        try {
          const expiringRes = await getExpiringBatches(90)
          // Transform to alert format
          const transformedAlerts = (expiringRes.data || []).map((batch, index) => ({
            id: batch.id || index,
            productName: batch.productName || 'Unknown Product',
            productCode: batch.productCode || '',
            batchNumber: batch.batchNumber || 'N/A',
            severity: batch.daysUntilExpiry <= 7 ? 'CRITICAL' : 
                     batch.daysUntilExpiry <= 30 ? 'WARNING' : 
                     batch.daysUntilExpiry <= 60 ? 'INFO' : 'LOW',
            expiryDate: batch.expiryDate,
            daysUntilExpiry: batch.daysUntilExpiry || 0,
            quantityAffected: batch.quantity || 0
          }))
          setAlerts(transformedAlerts)
        } catch (fallbackError) {
          console.error('Both endpoints failed:', fallbackError)
          setError('Unable to load alert data')
          setAlerts([])
        }
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      setError('Failed to load alerts')
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const getSeverityIcon = (severity) => {
    const icons = {
      CRITICAL: <Error sx={{ fontSize: 16, color: theme.palette.error.main }} />,
      WARNING: <Warning sx={{ fontSize: 16, color: theme.palette.warning.main }} />,
      INFO: <Info sx={{ fontSize: 16, color: theme.palette.info.main }} />,
      LOW: <CheckCircle sx={{ fontSize: 16, color: theme.palette.success.main }} />
    }
    return icons[severity] || icons.INFO
  }

  const getSeverityColor = (severity) => {
    const colors = {
      CRITICAL: theme.palette.error.main,
      WARNING: theme.palette.warning.main,
      INFO: theme.palette.info.main,
      LOW: theme.palette.success.main
    }
    return colors[severity] || theme.palette.grey[500]
  }

  const alertStats = {
    critical: alerts.filter(a => a.severity === 'CRITICAL').length,
    warning: alerts.filter(a => a.severity === 'WARNING').length,
    info: alerts.filter(a => a.severity === 'INFO').length,
    low: alerts.filter(a => a.severity === 'LOW').length
  }

  if (!checkResult) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No check results available. Run an expiry check to generate alerts.
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Alert Generation Report
      </Typography>

      {error && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3, borderRadius: '8px' }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none',
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.02)} 100%)`
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={1} alignItems="center">
                <Error sx={{ color: theme.palette.error.main, fontSize: 28 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                  {alertStats.critical}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Critical Alerts
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none',
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={1} alignItems="center">
                <Warning sx={{ color: theme.palette.warning.main, fontSize: 28 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
                  {alertStats.warning}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Warning Alerts
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none',
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={1} alignItems="center">
                <Info sx={{ color: theme.palette.info.main, fontSize: 28 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                  {alertStats.info}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Info Alerts
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none',
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={1} alignItems="center">
                <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 28 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                  {alertStats.low}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Low Priority
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alert Details Table */}
      <Paper 
        sx={{ 
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Generated Alerts Details
          </Typography>
        </Box>

        {loading ? (
          <LinearProgress />
        ) : alerts.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No alerts to display
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                  <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Batch</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Expiry Date</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Days Until</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.slice(0, 20).map((alert, index) => (
                  <TableRow 
                    key={alert.id || index}
                    sx={{ 
                      '&:hover': { 
                        bgcolor: alpha(theme.palette.primary.main, 0.02) 
                      }
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {alert.productName}
                        </Typography>
                        {alert.productCode && (
                          <Typography variant="caption" color="text.secondary">
                            {alert.productCode}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {alert.batchNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getSeverityIcon(alert.severity)}
                        label={alert.severity}
                        size="small"
                        sx={{
                          bgcolor: alpha(getSeverityColor(alert.severity), 0.1),
                          color: getSeverityColor(alert.severity),
                          fontWeight: 500,
                          borderRadius: '6px'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(alert.expiryDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${alert.daysUntilExpiry} days`}
                        size="small"
                        color={alert.daysUntilExpiry <= 7 ? 'error' : alert.daysUntilExpiry <= 30 ? 'warning' : 'default'}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {alert.quantityAffected}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  )
}

export default AlertGenerationReport