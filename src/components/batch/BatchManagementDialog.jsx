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
  Alert
} from '@mui/material'
import {
  Add,
  Close,
  Warning,
  TrendingUp
} from '@mui/icons-material'
import BatchList from './BatchList'
import BatchForm from './BatchForm'
import BatchStockAdjustment from './BatchStockAdjustment'
import { getBatchesByProduct, createBatch, adjustBatchStock } from '../../services/api'

function BatchManagementDialog({ open, onClose, product, onBatchUpdate }) {
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

  const getProductSummary = () => {
    const totalQuantity = batches.reduce((sum, batch) => sum + batch.quantity, 0)
    const activeBatches = batches.filter(b => b.status === 'ACTIVE').length
    const expiringBatches = batches.filter(b => b.daysUntilExpiry <= 30 && b.status === 'ACTIVE').length

    return { totalQuantity, activeBatches, expiringBatches }
  }

  if (!product) return null

  const summary = getProductSummary()

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">
                Batch Management - {product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Product Code: {product.code || 'N/A'}
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Summary Cards */}
          <Box display="flex" gap={2} mb={3}>
            <Box sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 2, 
              borderRadius: 1,
              flex: 1
            }}>
              <Typography variant="h4">{summary.totalQuantity}</Typography>
              <Typography variant="body2">Total Units in Stock</Typography>
            </Box>
            <Box sx={{ 
              bgcolor: 'success.main', 
              color: 'white', 
              p: 2, 
              borderRadius: 1,
              flex: 1
            }}>
              <Typography variant="h4">{summary.activeBatches}</Typography>
              <Typography variant="body2">Active Batches</Typography>
            </Box>
            {summary.expiringBatches > 0 && (
              <Box sx={{ 
                bgcolor: 'warning.main', 
                color: 'white', 
                p: 2, 
                borderRadius: 1,
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Warning />
                <Box>
                  <Typography variant="h4">{summary.expiringBatches}</Typography>
                  <Typography variant="body2">Expiring Soon</Typography>
                </Box>
              </Box>
            )}
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

          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
            <Tab label="Active Batches" />
            <Tab label="All Batches" />
          </Tabs>

          {tabValue === 0 && (
            <BatchList
              batches={batches.filter(b => b.status === 'ACTIVE')}
              onEdit={handleEditBatch}
              onAdjustStock={handleAdjustBatch}
            />
          )}

          {tabValue === 1 && (
            <BatchList
              batches={batches}
              onEdit={handleEditBatch}
              onAdjustStock={handleAdjustBatch}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setBatchFormOpen(true)}
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