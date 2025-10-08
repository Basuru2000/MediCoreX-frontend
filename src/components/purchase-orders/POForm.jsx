import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  TextField,
  Button,
  Paper,
  Typography,
  Autocomplete,
  CircularProgress,
  Stack,
  useTheme,
  alpha,
  Divider
} from '@mui/material'
import { Save, Cancel, ShoppingCart } from '@mui/icons-material'
import { getSuppliers } from '../../services/api'
import POLineItemsTable from './POLineItemsTable'

function POForm({ order, onSubmit, onCancel, loading }) {
  const theme = useTheme()
  const [formData, setFormData] = useState({
    supplierId: null,
    expectedDeliveryDate: '',
    taxAmount: 0,
    discountAmount: 0,
    notes: '',
    lines: []
  })
  const [suppliers, setSuppliers] = useState([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchSuppliers()
    if (order) {
      setFormData({
        supplierId: order.supplierId,
        expectedDeliveryDate: order.expectedDeliveryDate || '',
        taxAmount: order.taxAmount || 0,
        discountAmount: order.discountAmount || 0,
        notes: order.notes || '',
        lines: order.lines || []
      })
    }
  }, [order])

  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true)
      const response = await getSuppliers()
      setSuppliers(response.data.content || response.data)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setLoadingSuppliers(false)
    }
  }

  const handleLineItemsChange = (lines) => {
    setFormData(prev => ({ ...prev, lines }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    const newErrors = {}
    if (!formData.supplierId) {
      newErrors.supplier = 'Supplier is required'
    }
    if (formData.lines.length === 0) {
      newErrors.lines = 'At least one line item is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Form Header */}
        <Grid item xs={12}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }}
            >
              <ShoppingCart fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Order Information
            </Typography>
          </Box>
          <Divider sx={{ mt: 2 }} />
        </Grid>

        {/* Supplier Selection */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={suppliers}
            getOptionLabel={(option) => option.name || ''}
            value={suppliers.find(s => s.id === formData.supplierId) || null}
            onChange={(e, newValue) => {
              setFormData(prev => ({ 
                ...prev, 
                supplierId: newValue ? newValue.id : null 
              }))
              setErrors(prev => ({ ...prev, supplier: '' }))
            }}
            loading={loadingSuppliers}
            disabled={!!order}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Supplier *"
                placeholder="Select supplier"
                error={!!errors.supplier}
                helperText={errors.supplier}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingSuppliers ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
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
              shrink: true
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
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
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
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
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
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
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
          />
        </Grid>

        {/* Line Items Section */}
        <Grid item xs={12}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              bgcolor: alpha(theme.palette.primary.main, 0.02)
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Line Items *
              </Typography>
              {errors.lines && (
                <Typography variant="caption" color="error">
                  {errors.lines}
                </Typography>
              )}
            </Box>
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
          <Divider sx={{ mb: 2 }} />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={onCancel}
              disabled={loading}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
                '&:hover': {
                  borderColor: theme.palette.error.main,
                  color: theme.palette.error.main,
                  bgcolor: alpha(theme.palette.error.main, 0.05)
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              disabled={loading || !formData.supplierId || formData.lines.length === 0}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: theme.palette.primary.main,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
                }
              }}
            >
              {loading ? 'Saving...' : 'Save Purchase Order'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default POForm