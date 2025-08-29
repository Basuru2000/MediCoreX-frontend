import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Alert,
  Stack,
  Chip,
  Divider,
  useTheme,
  alpha,
  Paper,
  LinearProgress,
  Badge
} from '@mui/material'
import {
  Add,
  Close,
  Warning,
  TrendingUp,
  Layers,
  Edit,
  Inventory,
  Info,
  CheckCircle,
  Error
} from '@mui/icons-material'
import BatchList from './BatchList'
import BatchForm from './BatchForm'
import BatchStockAdjustment from './BatchStockAdjustment'
import { getBatchesByProduct, createBatch, adjustBatchStock } from '../../services/api'

function BatchManagementDialog({ open, onClose, product, onBatchUpdate }) {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [batchFormOpen, setBatchFormOpen] = useState(false)
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (open && product) {
      fetchBatches()
    }
  }, [open, product])

  const fetchBatches = async () => {
    try {
      setLoading(true)
      const response = await getBatchesByProduct(product.id)
      setBatches(response.data)
    } catch (err) {
      setError('Failed to fetch batches')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBatch = async (batchData) => {
    try {
      await createBatch(batchData)
      setSuccess('Batch created successfully')
      setBatchFormOpen(false)
      fetchBatches()
      if (onBatchUpdate) onBatchUpdate()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create batch')
    }
  }

  const handleAdjustStock = async (adjustmentData) => {
    try {
      await adjustBatchStock(adjustmentData)
      setSuccess('Stock adjusted successfully')
      setAdjustmentDialogOpen(false)
      fetchBatches()
      if (onBatchUpdate) onBatchUpdate()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to adjust stock')
    }
  }

  const handleEditBatch = (batch) => {
    setSelectedBatch(batch)
    setBatchFormOpen(true)
  }

  const handleAdjustBatch = (batch) => {
    setSelectedBatch(batch)
    setAdjustmentDialogOpen(true)
  }

  const getActiveBatches = () => batches.filter(b => b.status === 'ACTIVE')
  const getExpiringBatches = () => batches.filter(b => {
    if (!b.expiryDate) return false
    const daysUntilExpiry = Math.ceil(
      (new Date(b.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    )
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  })

  const getTotalStock = () => batches.reduce((sum, batch) => sum + batch.quantity, 0)

  const TabPanel = ({ children, value, index }) => (
    <Box hidden={value !== index} sx={{ mt: 3 }}>
      {value === index && children}
    </Box>
  )

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              p: 3,
              bgcolor: theme.palette.grey[50],
              borderBottom: `1px solid ${theme.palette.divider}`
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Batch Management
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {product?.name} - {product?.code}
              </Typography>
            </Box>
            <IconButton 
              onClick={onClose}
              sx={{ 
                color: theme.palette.text.secondary,
                '&:hover': {
                  bgcolor: alpha(theme.palette.text.secondary, 0.1)
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* Summary Cards */}
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Paper 
              sx={{ 
                flex: 1, 
                p: 2, 
                borderRadius: '12px',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Batches
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {batches.length}
                  </Typography>
                </Box>
                <Layers sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
              </Stack>
            </Paper>

            <Paper 
              sx={{ 
                flex: 1, 
                p: 2, 
                borderRadius: '12px',
                bgcolor: alpha(theme.palette.success.main, 0.05),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Active Batches
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="success.main">
                    {getActiveBatches().length}
                  </Typography>
                </Box>
                <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 32 }} />
              </Stack>
            </Paper>

            <Paper 
              sx={{ 
                flex: 1, 
                p: 2, 
                borderRadius: '12px',
                bgcolor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Stock
                  </Typography>
                  <Typography variant="h5" fontWeight={600} color="info.main">
                    {getTotalStock()}
                  </Typography>
                </Box>
                <Inventory sx={{ color: theme.palette.info.main, fontSize: 32 }} />
              </Stack>
            </Paper>

            {getExpiringBatches().length > 0 && (
              <Paper 
                sx={{ 
                  flex: 1, 
                  p: 2, 
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.warning.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Expiring Soon
                    </Typography>
                    <Typography variant="h5" fontWeight={600} color="warning.main">
                      {getExpiringBatches().length}
                    </Typography>
                  </Box>
                  <Warning sx={{ color: theme.palette.warning.main, fontSize: 32 }} />
                </Stack>
              </Paper>
            )}
          </Stack>

          {/* Alerts */}
          {error && (
            <Alert 
              severity="error" 
              onClose={() => setError(null)}
              sx={{ mb: 2, borderRadius: '8px' }}
              icon={<Error />}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              onClose={() => setSuccess(null)}
              sx={{ mb: 2, borderRadius: '8px' }}
              icon={<CheckCircle />}
            >
              {success}
            </Alert>
          )}

          {/* Tabs */}
          <Paper 
            elevation={0}
            sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={(e, v) => setTabValue(v)}
              sx={{ 
                px: 2,
                bgcolor: theme.palette.grey[50],
                borderBottom: `1px solid ${theme.palette.divider}`,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  minHeight: 48
                }
              }}
            >
              <Tab 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    Active Batches
                    <Badge 
                      badgeContent={getActiveBatches().length} 
                      color="success"
                      sx={{ '& .MuiBadge-badge': { position: 'relative', transform: 'none' } }}
                    />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    All Batches
                    <Badge 
                      badgeContent={batches.length} 
                      color="default"
                      sx={{ '& .MuiBadge-badge': { position: 'relative', transform: 'none' } }}
                    />
                  </Box>
                } 
              />
            </Tabs>

            {loading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <LinearProgress sx={{ mb: 2, borderRadius: '4px' }} />
                <Typography variant="body2" color="text.secondary">
                  Loading batches...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ p: 2 }}>
                <TabPanel value={tabValue} index={0}>
                  <BatchList
                    batches={getActiveBatches()}
                    onEdit={handleEditBatch}
                    onAdjustStock={handleAdjustBatch}
                  />
                  {getActiveBatches().length === 0 && (
                    <Paper 
                      sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        bgcolor: theme.palette.grey[50],
                        borderRadius: '8px'
                      }}
                    >
                      <Info sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No active batches found
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Create a new batch to start tracking inventory
                      </Typography>
                    </Paper>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <BatchList
                    batches={batches}
                    onEdit={handleEditBatch}
                    onAdjustStock={handleAdjustBatch}
                  />
                  {batches.length === 0 && (
                    <Paper 
                      sx={{ 
                        p: 4, 
                        textAlign: 'center',
                        bgcolor: theme.palette.grey[50],
                        borderRadius: '8px'
                      }}
                    >
                      <Info sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No batches found
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Create your first batch to get started
                      </Typography>
                    </Paper>
                  )}
                </TabPanel>
              </Box>
            )}
          </Paper>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={onClose}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              px: 3
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setBatchFormOpen(true)}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              px: 4,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}
          >
            Add New Batch
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch Form Dialog */}
      <BatchForm
        open={batchFormOpen}
        onClose={() => {
          setBatchFormOpen(false)
          setSelectedBatch(null)
        }}
        onSubmit={handleCreateBatch}
        productId={product?.id}
        batch={selectedBatch}
      />

      {/* Stock Adjustment Dialog */}
      <BatchStockAdjustment
        open={adjustmentDialogOpen}
        onClose={() => {
          setAdjustmentDialogOpen(false)
          setSelectedBatch(null)
        }}
        onSubmit={handleAdjustStock}
        batch={selectedBatch}
      />
    </>
  )
}

export default BatchManagementDialog