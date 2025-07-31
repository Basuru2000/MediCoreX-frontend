import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Box,
  Alert,
  Typography
} from '@mui/material'

function BatchStockAdjustment({ open, onClose, onSubmit, batch }) {
  const [formData, setFormData] = useState({
    batchId: batch?.id,
    adjustmentType: 'CONSUME',
    quantity: '',
    reason: ''
  })

  const [errors, setErrors] = useState({})

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

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }

    if (formData.adjustmentType === 'CONSUME' && parseInt(formData.quantity) > batch.quantity) {
      newErrors.quantity = `Cannot consume more than available (${batch.quantity})`
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        ...formData,
        batchId: batch.id,
        quantity: parseInt(formData.quantity)
      })
    }
  }

  if (!batch) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Adjust Batch Stock - {batch.batchNumber}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Current Stock: {batch.quantity} units
          </Alert>

          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">Adjustment Type</FormLabel>
            <RadioGroup
              name="adjustmentType"
              value={formData.adjustmentType}
              onChange={handleChange}
            >
              <FormControlLabel 
                value="ADD" 
                control={<Radio />} 
                label="Add to Stock (Received)" 
              />
              <FormControlLabel 
                value="CONSUME" 
                control={<Radio />} 
                label="Consume from Stock (Dispensed/Sold)" 
              />
              <FormControlLabel 
                value="ADJUST" 
                control={<Radio />} 
                label="Set Exact Quantity (Inventory Adjustment)" 
              />
              <FormControlLabel 
                value="QUARANTINE" 
                control={<Radio />} 
                label="Quarantine Batch" 
                disabled={batch.status === 'QUARANTINED'}
              />
            </RadioGroup>
          </FormControl>

          <TextField
            fullWidth
            label={
              formData.adjustmentType === 'ADJUST' 
                ? 'New Quantity' 
                : 'Quantity to ' + (formData.adjustmentType === 'ADD' ? 'Add' : 'Remove')
            }
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            error={!!errors.quantity}
            helperText={errors.quantity}
            required
            sx={{ mb: 2 }}
            InputProps={{ inputProps: { min: 1 } }}
            disabled={formData.adjustmentType === 'QUARANTINE'}
          />

          <TextField
            fullWidth
            label="Reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            error={!!errors.reason}
            helperText={errors.reason}
            required
            multiline
            rows={2}
            placeholder="Provide a reason for this adjustment..."
          />

          {formData.adjustmentType !== 'QUARANTINE' && formData.quantity && (
            <Alert severity="success" sx={{ mt: 2 }}>
              New Stock Level: {
                formData.adjustmentType === 'ADD' 
                  ? batch.quantity + parseInt(formData.quantity || 0)
                  : formData.adjustmentType === 'CONSUME'
                  ? batch.quantity - parseInt(formData.quantity || 0)
                  : parseInt(formData.quantity || 0)
              } units
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          color={formData.adjustmentType === 'QUARANTINE' ? 'warning' : 'primary'}
        >
          Confirm Adjustment
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BatchStockAdjustment