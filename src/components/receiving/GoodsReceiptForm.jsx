import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  LinearProgress,
  Tooltip
} from '@mui/material'
import { Save, Cancel, Add, Delete, Info } from '@mui/icons-material'
import { getApprovedPurchaseOrders, getPurchaseOrderById } from '../../services/api'
import ReceiptProgressIndicator from './ReceiptProgressIndicator'

function GoodsReceiptForm({ onSubmit, onCancel, loading }) {
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [selectedPO, setSelectedPO] = useState(null)
  const [loadingPOs, setLoadingPOs] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    poId: null,
    notes: '',
    lines: []
  })

  useEffect(() => {
    fetchApprovedPOs()
  }, [])

  const fetchApprovedPOs = async () => {
    try {
      setLoadingPOs(true)
      // Get POs with status SENT or PARTIALLY_RECEIVED
      const response = await getApprovedPurchaseOrders()
      
      // Filter to only show POs that can receive items
      const eligiblePOs = (response.data.content || response.data).filter(po => 
        po.status === 'SENT' || po.status === 'PARTIALLY_RECEIVED'
      )
      
      setPurchaseOrders(eligiblePOs)
    } catch (error) {
      console.error('Error fetching purchase orders:', error)
      setError('Failed to load purchase orders')
    } finally {
      setLoadingPOs(false)
    }
  }

  const handlePOSelect = async (po) => {
    if (!po) {
      setSelectedPO(null)
      setFormData({ poId: null, notes: '', lines: [] })
      return
    }

    try {
      // Fetch full PO details
      const response = await getPurchaseOrderById(po.id)
      const poDetails = response.data

      // ✨ ENHANCED: Initialize lines with remaining quantities
      const lines = poDetails.lines
        .filter(line => line.remainingQuantity > 0) // Only show lines with remaining items
        .map(line => ({
          poLineId: line.id,
          productId: line.productId,
          productName: line.productName,
          productCode: line.productCode,
          orderedQuantity: line.quantity,
          receivedQuantity: line.receivedQuantity || 0,
          remainingQuantity: line.remainingQuantity || line.quantity, // ✨ NEW
          receivingQuantity: line.remainingQuantity || 0, // Default to remaining qty
          batchNumber: '',
          expiryDate: '',
          manufactureDate: '',
          qualityNotes: ''
        }))

      setSelectedPO(poDetails)
      setFormData({
        poId: poDetails.id,
        notes: '',
        lines: lines
      })
    } catch (error) {
      console.error('Error fetching PO details:', error)
      setError('Failed to load purchase order details')
    }
  }

  const handleLineChange = (index, field, value) => {
    const updatedLines = [...formData.lines]
    updatedLines[index][field] = value

    // ✨ VALIDATION: Cannot receive more than remaining
    if (field === 'receivingQuantity') {
      const remainingQty = updatedLines[index].remainingQuantity
      if (parseInt(value) > remainingQty) {
        setError(`Cannot receive more than ${remainingQty} items for ${updatedLines[index].productName}`)
        return
      }
      setError('') // Clear error if valid
    }

    setFormData({ ...formData, lines: updatedLines })
  }

  const handleReceiveAll = () => {
    const updatedLines = formData.lines.map(line => ({
      ...line,
      receivingQuantity: line.remainingQuantity // Set to remaining quantity
    }))
    setFormData({ ...formData, lines: updatedLines })
  }

  const handleReceiveRemaining = (index) => {
    const updatedLines = [...formData.lines]
    updatedLines[index].receivingQuantity = updatedLines[index].remainingQuantity
    setFormData({ ...formData, lines: updatedLines })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation
    if (!formData.poId) {
      setError('Please select a purchase order')
      return
    }

    const linesToReceive = formData.lines.filter(line => 
      line.receivingQuantity > 0 && 
      line.batchNumber && 
      line.expiryDate
    )

    if (linesToReceive.length === 0) {
      setError('Please enter receiving details for at least one item')
      return
    }

    // ✅ NEW: Validate unique batch numbers per product
    const batchNumbers = new Set()
    for (const line of linesToReceive) {
      const key = `${line.productId}-${line.batchNumber}`
      if (batchNumbers.has(key)) {
        setError(`Duplicate batch number '${line.batchNumber}' for product ${line.productName}`)
        return
      }
      batchNumbers.add(key)
      
      if (line.receivingQuantity > line.remainingQuantity) {
        setError(`Cannot receive ${line.receivingQuantity} of ${line.productName}. Only ${line.remainingQuantity} remaining.`)
        return
      }
    }

    // Transform data for API
    const receiptData = {
      poId: formData.poId,
      notes: formData.notes,
      lines: linesToReceive.map(line => ({
        poLineId: line.poLineId,
        receivedQuantity: parseInt(line.receivingQuantity), // ✨ Only send the qty being received NOW
        batchNumber: line.batchNumber,
        expiryDate: line.expiryDate,
        manufactureDate: line.manufactureDate || null,
        qualityNotes: line.qualityNotes || null
      }))
    }

    onSubmit(receiptData)
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Purchase Order Selection */}
        <Grid item xs={12}>
          <Autocomplete
            options={purchaseOrders}
            getOptionLabel={(option) => `${option.poNumber} - ${option.supplierName}`}
            value={selectedPO}
            onChange={(_, newValue) => handlePOSelect(newValue)}
            loading={loadingPOs}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Purchase Order"
                required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingPOs ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box sx={{ width: '100%' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      {option.poNumber} - {option.supplierName}
                    </Typography>
                    <Chip
                      label={option.status}
                      size="small"
                      color={option.status === 'PARTIALLY_RECEIVED' ? 'warning' : 'primary'}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(option.orderDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            )}
          />
        </Grid>

        {/* Show PO Details if selected */}
        {selectedPO && (
          <>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Supplier
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedPO.supplierName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Order Date
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {new Date(selectedPO.orderDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Info fontSize="small" color="info" />
                      <Typography variant="caption" color="text.secondary">
                        {selectedPO.status === 'PARTIALLY_RECEIVED' 
                          ? 'This order has been partially received. You can receive the remaining items.'
                          : 'This order is ready for receiving.'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Receipt Items Table */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Items to Receive
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleReceiveAll}
                >
                  Receive All Remaining
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Product</strong></TableCell>
                      <TableCell align="center"><strong>Ordered</strong></TableCell>
                      <TableCell align="center"><strong>Previously Received</strong></TableCell>
                      <TableCell align="center"><strong>Remaining</strong></TableCell>
                      <TableCell align="center"><strong>Receiving Now</strong></TableCell>
                      <TableCell><strong>Batch Number</strong></TableCell>
                      <TableCell><strong>Expiry Date</strong></TableCell>
                      <TableCell><strong>Mfg Date</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.lines.map((line, index) => (
                      <TableRow key={line.poLineId}>
                        <TableCell>
                          <Typography variant="body2">{line.productName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {line.productCode}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{line.orderedQuantity}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={line.receivedQuantity}
                            size="small"
                            color={line.receivedQuantity > 0 ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={line.remainingQuantity}
                            size="small"
                            color="warning"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={line.receivingQuantity}
                            onChange={(e) => handleLineChange(index, 'receivingQuantity', e.target.value)}
                            inputProps={{ min: 0, max: line.remainingQuantity }}
                            sx={{ width: 80 }}
                            error={parseInt(line.receivingQuantity) > line.remainingQuantity}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={line.batchNumber}
                            onChange={(e) => handleLineChange(index, 'batchNumber', e.target.value)}
                            placeholder="Batch #"
                            required={line.receivingQuantity > 0}
                            sx={{ width: 120 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="date"
                            size="small"
                            value={line.expiryDate}
                            onChange={(e) => handleLineChange(index, 'expiryDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required={line.receivingQuantity > 0}
                            sx={{ width: 140 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="date"
                            size="small"
                            value={line.manufactureDate}
                            onChange={(e) => handleLineChange(index, 'manufactureDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 140 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Receive all remaining">
                            <IconButton
                              size="small"
                              onClick={() => handleReceiveRemaining(index)}
                              color="primary"
                            >
                              <Add />
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
              />
            </Grid>
          </>
        )}

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
            >
              <Cancel sx={{ mr: 1 }} />
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !selectedPO}
            >
              {loading ? <CircularProgress size={20} /> : <Save sx={{ mr: 1 }} />}
              Create Receipt
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default GoodsReceiptForm