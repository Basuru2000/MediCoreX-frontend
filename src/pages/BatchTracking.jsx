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
  DialogActions
} from '@mui/material'
import {
  Refresh,
  Warning,
  Schedule,
  Block,
  TrendingUp,
  CalendarMonth,
  Close
} from '@mui/icons-material'
import { getBatchExpiryReport, markExpiredBatches } from '../services/api'
import { useAuth } from '../context/AuthContext'
import BatchExpiryCalendar from '../components/batch/BatchExpiryCalendar'

function BatchTracking() {
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

  // Add this effect to handle navigation from Critical Alerts
  useEffect(() => {
    // Check if we navigated here with a specific batch ID
    if (location.state?.selectedBatchId && report) {
      const batchId = location.state.selectedBatchId
      
      // Handle batch selection
      handleSelectBatch(batchId)
      
      // Clear the location state after handling it
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

  // Function to handle batch selection
  const handleSelectBatch = (batchId) => {
    // Find the batch in critical batches first
    let batch = report?.criticalBatches?.find(b => b.id === batchId)
    
    // If not found in critical batches, search in all expiry ranges
    if (!batch && report?.batchesByExpiryRange) {
      for (const [range, batches] of Object.entries(report.batchesByExpiryRange)) {
        batch = batches.find(b => b.batchId === batchId)
        if (batch) break
      }
    }
    
    if (batch) {
      setSelectedBatch(batch)
      setOpenBatchDialog(true)
      // Switch to Critical Batches tab if the batch is critical
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

  if (loading) {
    return (
      <Box p={4}>
        <LinearProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Batch-wise Expiry Tracking
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and manage product batches by expiry date
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchBatchReport} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
          {isManager && (
            <Button
              variant="outlined"
              color="warning"
              onClick={handleMarkExpired}
              startIcon={<Warning />}
            >
              Mark Expired Batches
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Batches
                  </Typography>
                  <Typography variant="h4">
                    {report?.totalBatches || 0}
                  </Typography>
                </Box>
                <TrendingUp color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active Batches
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {report?.activeBatches || 0}
                  </Typography>
                </Box>
                <TrendingUp color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Expiring Soon
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {report?.expiringBatches || 0}
                  </Typography>
                </Box>
                <Schedule color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Expired
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {report?.expiredBatches || 0}
                  </Typography>
                </Box>
                <Block color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Value Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Inventory Value Analysis
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Inventory Value
              </Typography>
              <Typography variant="h5">
                {formatCurrency(report?.totalInventoryValue)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Expiring Inventory Value
              </Typography>
              <Typography variant="h5" color="warning.main">
                {formatCurrency(report?.expiringInventoryValue)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Expired Inventory Value
              </Typography>
              <Typography variant="h5" color="error.main">
                {formatCurrency(report?.expiredInventoryValue)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs for detailed views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab icon={<Warning />} label="Critical Batches" />
          <Tab icon={<Schedule />} label="Expiry Timeline" />
          <Tab icon={<CalendarMonth />} label="Calendar View" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && report?.criticalBatches && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Critical Batches (Expiring in 7 days)
          </Typography>
          {report.criticalBatches.length === 0 ? (
            <Alert severity="info">
              No batches expiring in the next 7 days
            </Alert>
          ) : (
            <Box>
              {/* Display critical batches list */}
              {report.criticalBatches.map(batch => (
                <Box 
                  key={batch.id} 
                  sx={{ 
                    mb: 2, 
                    p: 2, 
                    border: 1, 
                    borderColor: 'error.main', 
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'error.light',
                      opacity: 0.1
                    },
                    backgroundColor: selectedBatch?.id === batch.id ? 'error.light' : 'transparent'
                  }}
                  onClick={() => handleSelectBatch(batch.id)}
                >
                  <Typography variant="body1" fontWeight="bold">
                    {batch.productName} - Batch: {batch.batchNumber}
                  </Typography>
                  <Typography variant="body2" color="error">
                    Expires in {batch.daysUntilExpiry} days - Quantity: {batch.quantity}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      )}

      {tabValue === 1 && report?.batchesByExpiryRange && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Batches by Expiry Timeline
          </Typography>
          {Object.entries(report.batchesByExpiryRange).map(([range, batches]) => (
            <Box key={range} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {range} ({batches.length} batches)
              </Typography>
              {batches.length > 0 && (
                <Box sx={{ pl: 2 }}>
                  {batches.slice(0, 5).map(batch => (
                    <Box 
                      key={batch.batchId} 
                      sx={{ 
                        mb: 1,
                        p: 1,
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'grey.100'
                        },
                        backgroundColor: selectedBatch?.batchId === batch.batchId ? 'primary.light' : 'transparent'
                      }}
                      onClick={() => handleSelectBatch(batch.batchId)}
                    >
                      <Typography variant="body2">
                        {batch.productName} - Batch: {batch.batchNumber} 
                        (Qty: {batch.quantity}, Value: {formatCurrency(batch.value)})
                      </Typography>
                    </Box>
                  ))}
                  {batches.length > 5 && (
                    <Typography variant="body2" color="text.secondary">
                      ... and {batches.length - 5} more
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          ))}
        </Paper>
      )}

      {tabValue === 2 && (
        <BatchExpiryCalendar />
      )}

      {/* Batch Detail Dialog */}
      <Dialog 
        open={openBatchDialog} 
        onClose={() => setOpenBatchDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Batch Details
            <IconButton onClick={() => setOpenBatchDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedBatch && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedBatch.productName}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Batch Number
                  </Typography>
                  <Typography variant="body1">
                    {selectedBatch.batchNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Quantity
                  </Typography>
                  <Typography variant="body1">
                    {selectedBatch.quantity}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Days Until Expiry
                  </Typography>
                  <Typography variant="body1" color={selectedBatch.daysUntilExpiry <= 7 ? 'error.main' : 'text.primary'}>
                    {selectedBatch.daysUntilExpiry || 'N/A'} days
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Value
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(selectedBatch.value)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBatchDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BatchTracking