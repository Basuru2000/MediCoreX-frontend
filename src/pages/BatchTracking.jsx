import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Fade,
  Grow,
  useTheme,
  alpha,
  Divider,
  Badge,
  Snackbar
} from '@mui/material'
import {
  Refresh,
  Warning,
  Schedule,
  Block,
  TrendingUp,
  CalendarMonth,
  Close,
  AttachMoney,
  ErrorOutline,
  CheckCircle,
  Inventory2
} from '@mui/icons-material'
import { getBatchExpiryReport, markExpiredBatches } from '../services/api'
import { useAuth } from '../context/AuthContext'
import BatchExpiryCalendar from '../components/batch/BatchExpiryCalendar'
import ExpiryTimeline from '../components/batch/ExpiryTimeline'

function BatchTracking() {
  const theme = useTheme()
  const { isManager } = useAuth()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [openBatchDialog, setOpenBatchDialog] = useState(false)

  useEffect(() => {
    fetchBatchReport()
  }, [])

  useEffect(() => {
    if (location.state?.selectedBatchId && report) {
      const batchId = location.state.selectedBatchId
      handleSelectBatch(batchId)
      window.history.replaceState({}, document.title)
    }
  }, [location.state, report])

  const fetchBatchReport = async () => {
    try {
      setLoading(true)
      const response = await getBatchExpiryReport()
      setReport(response.data)
    } catch (err) {
      setError('Failed to load batch expiry report')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkExpired = async () => {
    try {
      await markExpiredBatches()
      setSuccess('Expired batches have been marked')
      fetchBatchReport()
    } catch (err) {
      setError('Failed to mark expired batches')
    }
  }

  const handleSelectBatch = (batchId) => {
    let batch = report?.criticalBatches?.find(b => b.id === batchId)
    
    if (!batch && report?.batchesByExpiryRange) {
      for (const [range, batches] of Object.entries(report.batchesByExpiryRange)) {
        batch = batches.find(b => b.batchId === batchId)
        if (batch) break
      }
    }
    
    if (batch) {
      setSelectedBatch(batch)
      setOpenBatchDialog(true)
      if (report?.criticalBatches?.some(b => b.id === batchId)) {
        setTabValue(0)
      }
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0)
  }

  const metricsData = [
    {
      title: 'Total Batches',
      value: report?.totalBatches || 0,
      icon: <Inventory2 />,
      color: 'primary'
    },
    {
      title: 'Active Batches',
      value: report?.activeBatches || 0,
      icon: <CheckCircle />,
      color: 'success'
    },
    {
      title: 'Expiring Soon',
      value: report?.expiringBatches || 0,
      icon: <Schedule />,
      color: 'warning'
    },
    {
      title: 'Expired',
      value: report?.expiredBatches || 0,
      icon: <ErrorOutline />,
      color: 'error'
    }
  ]

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    )
  }

  return (
    <Fade in={true}>
      <Box>
        {/* Page Header - Matching Users/Products/Categories style */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 4
          }}
        >
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.5
              }}
            >
              Batch-wise Expiry Tracking
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: 'text.secondary' }}
            >
              Monitor and manage product batches by expiry date
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh" arrow>
              <IconButton 
                onClick={fetchBatchReport}
                sx={{
                  bgcolor: 'background.paper',
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': { 
                    bgcolor: theme.palette.action.hover,
                    borderColor: theme.palette.primary.main
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            {isManager && (
              <Button
                variant="contained"
                color="warning"
                onClick={handleMarkExpired}
                startIcon={<Warning />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none'
                  }
                }}
              >
                Mark Expired
              </Button>
            )}
          </Box>
        </Box>

        {/* Alerts */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Snackbar>

        {/* Metrics Cards - Smaller size matching other pages */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {metricsData.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: '8px',
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: theme.palette[metric.color].main,
                    bgcolor: alpha(theme.palette[metric.color].main, 0.02)
                  }
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette[metric.color].main, 0.1),
                        color: theme.palette[metric.color].main
                      }}
                    >
                      {React.cloneElement(metric.icon, { fontSize: 'small' })}
                    </Box>
                  </Box>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette[metric.color].main,
                      mb: 0.5
                    }}
                  >
                    {metric.value}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary'
                    }}
                  >
                    {metric.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Value Analysis Card */}
        <Paper 
          sx={{ 
            p: 3,
            mb: 3,
            borderRadius: '8px',
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Inventory Value Analysis
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Inventory Value
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {formatCurrency(report?.totalInventoryValue)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Expiring Inventory Value
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
                  {formatCurrency(report?.expiringInventoryValue)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Expired Inventory Value
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                  {formatCurrency(report?.expiredInventoryValue)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper 
          sx={{ 
            mb: 3,
            borderRadius: '8px',
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={(e, v) => setTabValue(v)}
            sx={{
              bgcolor: 'background.default',
              '& .MuiTabs-indicator': {
                height: 2
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                '&.Mui-selected': {
                  fontWeight: 600
                }
              }
            }}
          >
            <Tab 
              icon={<Badge badgeContent={report?.criticalBatches?.length || 0} color="error">
                <Warning fontSize="small" />
              </Badge>} 
              label="Critical Batches" 
              iconPosition="start"
            />
            <Tab 
              icon={<Schedule fontSize="small" />} 
              label="Expiry Timeline" 
              iconPosition="start"
            />
            <Tab 
              icon={<CalendarMonth fontSize="small" />} 
              label="Calendar View" 
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {tabValue === 0 && report?.criticalBatches && (
          <Paper 
            sx={{ 
              p: 3,
              borderRadius: '8px',
              boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Critical Batches (Expiring in 7 days)
            </Typography>
            {report.criticalBatches.length === 0 ? (
              <Alert 
                severity="info" 
                icon={<CheckCircle />}
                sx={{ borderRadius: '8px' }}
              >
                No batches expiring in the next 7 days
              </Alert>
            ) : (
              <Stack spacing={2}>
                {report.criticalBatches.map((batch) => (
                  <Box 
                    key={batch.id}
                    sx={{ 
                      p: 2,
                      borderRadius: '8px',
                      border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                      bgcolor: selectedBatch?.id === batch.id ? 
                        alpha(theme.palette.error.main, 0.05) : 'background.paper',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.error.main, 0.05),
                        borderColor: theme.palette.error.main
                      }
                    }}
                    onClick={() => handleSelectBatch(batch.id)}
                  >
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {batch.productName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Batch: {batch.batchNumber} • Quantity: {batch.quantity}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Chip
                          label={`${batch.daysUntilExpiry} days`}
                          color="error"
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        )}

        {tabValue === 1 && <ExpiryTimeline report={report} onBatchSelect={handleSelectBatch} />}

        {tabValue === 2 && <BatchExpiryCalendar />}

        {/* Batch Detail Dialog */}
        <Dialog 
          open={openBatchDialog} 
          onClose={() => setOpenBatchDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '8px' }
          }}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Batch Details
              </Typography>
              <IconButton onClick={() => setOpenBatchDialog(false)} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 2 }}>
            {selectedBatch && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {selectedBatch.productName}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Batch Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedBatch.batchNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Quantity
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedBatch.quantity}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Days Until Expiry
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 500,
                        color: selectedBatch.daysUntilExpiry <= 7 ? 'error.main' : 
                               selectedBatch.daysUntilExpiry <= 30 ? 'warning.main' : 'success.main'
                      }}
                    >
                      {selectedBatch.daysUntilExpiry} days
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Value
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatCurrency(selectedBatch.value)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setOpenBatchDialog(false)}
              sx={{ textTransform: 'none' }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  )
}

export default BatchTracking