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
  IconButton
} from '@mui/material'
import { Save, Cancel, Add, Delete } from '@mui/icons-material'
import { getApprovedPurchaseOrders, getPurchaseOrderById } from '../../services/api'

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
      // Get POs with status APPROVED or SENT
      const response = await getApprovedPurchaseOrders()
      setPurchaseOrders(response.data.content || response.data)
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

      // Initialize lines with remaining quantities
      const lines = poDetails.lines
        .filter(line => line.receivedQuantity < line.quantity)
        .map(line => ({
          poLineId: line.id,
          productName: line.productName,
          productCode: line.productCode,
          orderedQuantity: line.quantity,
          alreadyReceived: line.receivedQuantity,
          remainingQuantity: line.quantity - line.receivedQuantity,
          receivedQuantity: line.quantity - line.receivedQuantity, // Default to remaining
          batchNumber: `BATCH-${line.productCode}-${Date.now()}`,
          expiryDate: '',
          manufactureDate: '',
          qualityNotes: ''
        }))

      setSelectedPO(poDetails)
      setFormData({
        poId: po.id,
        notes: '',
        lines: lines
      })
    } catch (error) {
      console.error('Error fetching PO details:', error)
      setError('Failed to load purchase order details')
    }
  }

  const handleLineChange = (index, field, value) => {
    const newLines = [...formData.lines]
    newLines[index][field] = value
    setFormData(prev => ({ ...prev, lines: newLines }))
  }

  const handleReceiveAll = () => {
    const newLines = formData.lines.map(line => ({
      ...line,
      receivedQuantity: line.remainingQuantity
    }))
    setFormData(prev => ({ ...prev, lines: newLines }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.poId) {
      setError('Please select a purchase order')
      return
    }

    if (formData.lines.length === 0) {
      setError('No items to receive')
      return
    }

    // Validate all lines have required fields
    for (let line of formData.lines) {
      if (!line.receivedQuantity || line.receivedQuantity <= 0) {
        setError('All items must have a received quantity greater than 0')
        return
      }
      if (line.receivedQuantity > line.remainingQuantity) {
        setError(`Cannot receive more than remaining quantity for ${line.productName}`)
        return
      }
      if (!line.batchNumber) {
        setError('All items must have a batch number')
        return
      }
      if (!line.expiryDate) {
        setError('All items must have an expiry date')
        return
      }
    }

    setError('')
    onSubmit(formData)
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* PO Selection */}
        <Grid item xs={12}>
          <Autocomplete
            options={purchaseOrders}
            getOptionLabel={(option) => 
              `${option.poNumber} - ${option.supplierName} (${option.totalItems} items)`
            }
            value={selectedPO}
            onChange={(e, newValue) => handlePOSelect(newValue)}
            loading={loadingPOs}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Purchase Order *"
                placeholder="Choose a PO to receive goods"
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
                      <TableCell align="center"><strong>Already Received</strong></TableCell>
                      <TableCell align="center"><strong>Remaining</strong></TableCell>
                      <TableCell align="center"><strong>Receiving Now *</strong></TableCell>
                      <TableCell><strong>Batch Number *</strong></TableCell>
                      <TableCell><strong>Expiry Date *</strong></TableCell>
                      <TableCell><strong>Mfg Date</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.lines.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {line.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {line.productCode}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{line.orderedQuantity}</TableCell>
                        <TableCell align="center">{line.alreadyReceived}</TableCell>
                        <TableCell align="center">
                          <Typography fontWeight={600} color="primary">
                            {line.remainingQuantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={line.receivedQuantity}
                            onChange={(e) => handleLineChange(
                              index, 'receivedQuantity', parseInt(e.target.value) || 0
                            )}
                            inputProps={{ min: 1, max: line.remainingQuantity }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={line.batchNumber}
                            onChange={(e) => handleLineChange(index, 'batchNumber', e.target.value)}
                            sx={{ width: 150 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="date"
                            size="small"
                            value={line.expiryDate}
                            onChange={(e) => handleLineChange(index, 'expiryDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 150 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="date"
                            size="small"
                            value={line.manufactureDate}
                            onChange={(e) => handleLineChange(index, 'manufactureDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 150 }}
                          />
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
                label="Receipt Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
          </>
        )}

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={loading || !selectedPO || formData.lines.length === 0}
            >
              {loading ? 'Processing...' : 'Receive Goods'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default GoodsReceiptForm