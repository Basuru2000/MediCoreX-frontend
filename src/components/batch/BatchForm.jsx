import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  InputAdornment,
  Alert
} from '@mui/material'

function BatchForm({ open, onClose, onSubmit, productId, batch }) {
  const [formData, setFormData] = useState({
    productId: productId,
    batchNumber: '',
    quantity: '',
    expiryDate: '',
    manufactureDate: '',
    supplierReference: '',
    costPerUnit: '',
    notes: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (batch) {
      setFormData({
        ...batch,
        expiryDate: batch.expiryDate || '',
        manufactureDate: batch.manufactureDate || ''
      })
    } else {
      setFormData({
        productId: productId,
        batchNumber: '',
        quantity: '',
        expiryDate: '',
        manufactureDate: '',
        supplierReference: '',
        costPerUnit: '',
        notes: ''
      })
    }
    setErrors({})
  }, [batch, productId, open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.batchNumber.trim()) {
      newErrors.batchNumber = 'Batch number is required'
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required'
    } else if (new Date(formData.expiryDate) <= new Date()) {
      newErrors.expiryDate = 'Expiry date must be in the future'
    }

    if (formData.manufactureDate && formData.expiryDate) {
      if (new Date(formData.manufactureDate) >= new Date(formData.expiryDate)) {
        newErrors.manufactureDate = 'Manufacture date must be before expiry date'
      }
    }

    if (formData.costPerUnit && formData.costPerUnit < 0) {
      newErrors.costPerUnit = 'Cost per unit cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        costPerUnit: formData.costPerUnit ? parseFloat(formData.costPerUnit) : null
      }
      onSubmit(submitData)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {batch ? 'Edit Batch' : 'Add New Batch'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Batch Number"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleChange}
              error={!!errors.batchNumber}
              helperText={errors.batchNumber}
              required
              disabled={!!batch}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              error={!!errors.quantity}
              helperText={errors.quantity}
              required
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Expiry Date"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleChange}
              error={!!errors.expiryDate}
              helperText={errors.expiryDate}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Manufacture Date"
              name="manufactureDate"
              type="date"
              value={formData.manufactureDate}
              onChange={handleChange}
              error={!!errors.manufactureDate}
              helperText={errors.manufactureDate}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Supplier Reference"
              name="supplierReference"
              value={formData.supplierReference}
              onChange={handleChange}
              placeholder="PO#, Invoice#, etc."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cost per Unit"
              name="costPerUnit"
              type="number"
              value={formData.costPerUnit}
              onChange={handleChange}
              error={!!errors.costPerUnit}
              helperText={errors.costPerUnit}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { min: 0, step: 0.01 }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={2}
              placeholder="Any additional information about this batch..."
            />
          </Grid>
        </Grid>

        {!batch && (
          <Alert severity="info" sx={{ mt: 2 }}>
            This batch will be added to the product's inventory using FIFO (First In, First Out) method for stock consumption.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {batch ? 'Update' : 'Create'} Batch
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BatchForm