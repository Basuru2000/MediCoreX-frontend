import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Stack,
  useTheme,
  alpha,
  Autocomplete
} from '@mui/material'
import {
  Add,
  Remove,
  Cancel,
  Save,
  CheckCircle,
  LocalShipping
} from '@mui/icons-material'
import { getApprovedPurchaseOrders } from '../../services/api'

function GoodsReceiptForm({ onSubmit, onCancel, loading: parentLoading }) {
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [selectedPO, setSelectedPO] = useState(null)
  const [formData, setFormData] = useState({
    poId: null,
    notes: '',
    lines: []
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPurchaseOrders()
  }, [])

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true)
      const response = await getApprovedPurchaseOrders()
      setPurchaseOrders(response.data)
    } catch (error) {
      console.error('Error fetching purchase orders:', error)
      setError('Failed to load purchase orders')
    } finally {
      setLoading(false)
    }
  }

  const handlePOSelect = (event, value) => {
    setSelectedPO(value)
    if (value) {
      setFormData({
        poId: value.id,
        notes: '',
        lines: value.lines.map(line => ({
          poLineId: line.id,
          productId: line.productId,
          productName: line.productName,
          productCode: line.productCode,
          orderedQuantity: line.quantity,
          receivedQuantity: line.receivedQuantity || 0,
          remainingQuantity: line.remainingQuantity || line.quantity,
          receivingNow: line.remainingQuantity || line.quantity,
          batchNumber: '',
          expiryDate: '',
          manufactureDate: '',
          unitCost: line.unitPrice
        }))
      })
      setError('')
    } else {
      setFormData({
        poId: null,
        notes: '',
        lines: []
      })
    }
  }

  const handleQuantityChange = (index, quantity) => {
    const newLines = [...formData.lines]
    const line = newLines[index]
    const qty = Math.max(0, Math.min(parseInt(quantity) || 0, line.remainingQuantity))
    line.receivingNow = qty
    setFormData({ ...formData, lines: newLines })
  }

  const handleBatchChange = (index, field, value) => {
    const newLines = [...formData.lines]
    newLines[index][field] = value
    setFormData({ ...formData, lines: newLines })
  }

  const handleReceiveRemaining = (index) => {
    const newLines = [...formData.lines]
    newLines[index].receivingNow = newLines[index].remainingQuantity
    setFormData({ ...formData, lines: newLines })
  }

  const handleReceiveAll = () => {
    const newLines = formData.lines.map(line => ({
      ...line,
      receivingNow: line.remainingQuantity
    }))
    setFormData({ ...formData, lines: newLines })
  }

  const validateForm = () => {
    if (!formData.poId) {
      setError('Please select a purchase order')
      return false
    }

    const hasItemsToReceive = formData.lines.some(line => line.receivingNow > 0)
    if (!hasItemsToReceive) {
      setError('Please enter quantities to receive')
      return false
    }

    for (const line of formData.lines) {
      if (line.receivingNow > 0) {
        if (!line.batchNumber) {
          setError(`Please enter batch number for ${line.productName}`)
          return false
        }
        if (!line.expiryDate) {
          setError(`Please enter expiry date for ${line.productName}`)
          return false
        }
      }
    }

    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const submitData = {
      poId: formData.poId,
      notes: formData.notes,
      lines: formData.lines
        .filter(line => line.receivingNow > 0)
        .map(line => ({
          poLineId: line.poLineId,
          productId: line.productId,
          receivedQuantity: line.receivingNow,
          batchNumber: line.batchNumber,
          expiryDate: line.expiryDate,
          manufactureDate: line.manufactureDate || null,
          unitCost: line.unitCost
        }))
    }

    onSubmit(submitData)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={48} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Loading purchase orders...
          </Typography>
        </Stack>
      </Box>
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* PO Selection */}
        <Grid item xs={12}>
          <Autocomplete
            value={selectedPO}
            onChange={handlePOSelect}
            options={purchaseOrders}
            getOptionLabel={(option) => `${option.poNumber} - ${option.supplierName}`}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Purchase Order"
                placeholder="Search by PO number or supplier..."
                required
                InputProps={{
                  ...params.InputProps,
                  sx: {
                    borderRadius: '8px'
                  }
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Stack direction="row" spacing={2} alignItems="center" width="100%">
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={600}>
                      {option.poNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.supplierName}
                    </Typography>
                  </Box>
                  <Chip
                    label={option.status === 'PARTIALLY_RECEIVED' ? 'Partial' : 'Ready'}
                    size="small"
                    color={option.status === 'PARTIALLY_RECEIVED' ? 'warning' : 'success'}
                    sx={{ fontSize: '0.75rem' }}
                  />
                </Stack>
              </Box>
            )}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
          />
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert 
              severity="error" 
              onClose={() => setError('')}
              sx={{ borderRadius: '8px' }}
            >
              {error}
            </Alert>
          </Grid>
        )}

        {selectedPO && (
          <>
            {/* PO Info Summary */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02)
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      PO Number
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="primary">
                      {selectedPO.poNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Supplier
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedPO.supplierName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Status
                    </Typography>
                    <Box mt={0.5}>
                      <Chip
                        label={selectedPO.status === 'PARTIALLY_RECEIVED' ? 'Partially Received' : 'Sent'}
                        size="small"
                        color={selectedPO.status === 'PARTIALLY_RECEIVED' ? 'warning' : 'success'}
                        sx={{ fontSize: '0.75rem', height: 24 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Total Amount
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="success.main">
                      ${selectedPO.totalAmount.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Alert 
                      severity={selectedPO.status === 'PARTIALLY_RECEIVED' ? 'warning' : 'info'}
                      icon={selectedPO.status === 'PARTIALLY_RECEIVED' ? <LocalShipping /> : <CheckCircle />}
                      sx={{ borderRadius: '8px' }}
                    >
                      {selectedPO.status === 'PARTIALLY_RECEIVED'
                        ? 'This order has been partially received. You can receive the remaining items.'
                        : 'This order is ready for receiving.'}
                    </Alert>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Receipt Items Table */}
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.125rem' }}>
                  Items to Receive
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleReceiveAll}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Receive All Remaining
                </Button>
              </Stack>

              <TableContainer 
                component={Paper} 
                elevation={0}
                sx={{ 
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.03) }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Product</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Ordered</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Previously Received</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Remaining</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Receiving Now</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Batch Number</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Expiry Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Mfg Date</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.lines.map((line, index) => (
                      <TableRow key={line.poLineId} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>
                            {line.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {line.productCode}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {line.orderedQuantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={line.receivedQuantity}
                            size="small"
                            color={line.receivedQuantity > 0 ? 'info' : 'default'}
                            sx={{ minWidth: 40, fontSize: '0.75rem', height: 24 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={line.remainingQuantity}
                            size="small"
                            color="warning"
                            sx={{ minWidth: 40, fontSize: '0.75rem', height: 24, fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={line.receivingNow}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            inputProps={{ 
                              min: 0, 
                              max: line.remainingQuantity,
                              style: { textAlign: 'center' }
                            }}
                            sx={{ 
                              width: 80,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '6px'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="Batch #"
                            value={line.batchNumber}
                            onChange={(e) => handleBatchChange(index, 'batchNumber', e.target.value)}
                            required={line.receivingNow > 0}
                            sx={{ 
                              width: 120,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '6px'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="date"
                            size="small"
                            value={line.expiryDate}
                            onChange={(e) => handleBatchChange(index, 'expiryDate', e.target.value)}
                            required={line.receivingNow > 0}
                            InputLabelProps={{ shrink: true }}
                            sx={{ 
                              width: 140,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '6px'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="date"
                            size="small"
                            value={line.manufactureDate}
                            onChange={(e) => handleBatchChange(index, 'manufactureDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ 
                              width: 140,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '6px'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Receive All Remaining" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleReceiveRemaining(index)}
                              color="primary"
                              sx={{
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                }
                              }}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes about this receipt..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
          </>
        )}

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={parentLoading}
              startIcon={<Cancel />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                px: 3
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={parentLoading || !selectedPO}
              startIcon={parentLoading ? <CircularProgress size={16} /> : <Save />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`
                }
              }}
            >
              {parentLoading ? 'Creating...' : 'Create Receipt'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default GoodsReceiptForm