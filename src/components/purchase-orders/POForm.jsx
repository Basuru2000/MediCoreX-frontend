import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Autocomplete,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material'
import { Save, Cancel } from '@mui/icons-material'
import { getActiveSuppliers } from '../../services/api'
import POLineItemsTable from './POLineItemsTable'

function POForm({ order, onSubmit, onCancel, loading }) {
  const [suppliers, setSuppliers] = useState([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    supplierId: order?.supplierId || null,
    expectedDeliveryDate: order?.expectedDeliveryDate || '',
    taxAmount: order?.taxAmount || 0,
    discountAmount: order?.discountAmount || 0,
    notes: order?.notes || '',
    lines: order?.lines || []
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true)
      const response = await getActiveSuppliers()
      setSuppliers(response.data)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      setError('Failed to load suppliers')
    } finally {
      setLoadingSuppliers(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.supplierId) {
      setError('Please select a supplier')
      return
    }

    if (formData.lines.length === 0) {
      setError('Please add at least one line item')
      return
    }

    setError('')
    onSubmit(formData)
  }

  const handleLineItemsChange = (lines) => {
    setFormData(prev => ({ ...prev, lines }))
  }

  const selectedSupplier = suppliers.find(s => s.id === formData.supplierId)

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Supplier Selection */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={suppliers}
            getOptionLabel={(option) => `${option.name} (${option.code})`}
            value={selectedSupplier || null}
            onChange={(e, newValue) => {
              setFormData(prev => ({ 
                ...prev, 
                supplierId: newValue ? newValue.id : null 
              }))
            }}
            loading={loadingSuppliers}
            disabled={!!order} // Disable if editing
            renderInput={(params) => (
              <TextField
                {...params}
                label="Supplier *"
                placeholder="Select supplier"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingSuppliers ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Expected Delivery Date */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Expected Delivery Date"
            type="date"
            value={formData.expectedDeliveryDate}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              expectedDeliveryDate: e.target.value 
            }))}
            InputLabelProps={{ 
              shrink: true,
              sx: { 
                backgroundColor: 'white', 
                paddingX: 0.5 
              } 
            }}
            sx={{ mt: 1 }}
          />
        </Grid>

        {/* Tax Amount */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Tax Amount"
            type="number"
            value={formData.taxAmount}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              taxAmount: parseFloat(e.target.value) || 0 
            }))}
            inputProps={{ step: 0.01, min: 0 }}
          />
        </Grid>

        {/* Discount Amount */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Discount Amount"
            type="number"
            value={formData.discountAmount}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              discountAmount: parseFloat(e.target.value) || 0 
            }))}
            inputProps={{ step: 0.01, min: 0 }}
          />
        </Grid>

        {/* Notes */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              notes: e.target.value 
            }))}
          />
        </Grid>

        {/* Line Items */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Line Items *
            </Typography>
            <POLineItemsTable
              lines={formData.lines}
              supplierId={formData.supplierId}
              onChange={handleLineItemsChange}
              taxAmount={formData.taxAmount}
              discountAmount={formData.discountAmount}
            />
          </Paper>
        </Grid>

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
              disabled={loading || !formData.supplierId || formData.lines.length === 0}
            >
              {loading ? 'Saving...' : 'Save Purchase Order'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default POForm