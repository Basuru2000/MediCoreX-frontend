import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment
} from '@mui/material'
import { adjustStock } from '../services/api'

function StockAdjustment({ open, onClose, product }) {
  const [adjustmentType, setAdjustmentType] = useState('add')
  const [formData, setFormData] = useState({
    quantity: '',
    type: 'PURCHASE',
    reason: '',
    reference: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const adjustmentTypes = [
    { value: 'PURCHASE', label: 'Purchase', add: true },
    { value: 'SALE', label: 'Sale', add: false },
    { value: 'ADJUSTMENT', label: 'Adjustment', add: null },
    { value: 'DAMAGE', label: 'Damage', add: false },
    { value: 'EXPIRY', label: 'Expiry', add: false }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleTypeChange = (e) => {
    const newType = e.target.value
    setFormData(prev => ({ ...prev, type: newType }))
    
    // Determine if this is an addition or reduction
    const typeConfig = adjustmentTypes.find(t => t.value === newType)
    if (typeConfig.add !== null) {
      setAdjustmentType(typeConfig.add ? 'add' : 'reduce')
    }
  }

  const handleSubmit = async () => {
    if (!formData.quantity || formData.quantity <= 0) {
      setError('Please enter a valid quantity')
      return
    }

    if (!formData.reason.trim()) {
      setError('Please provide a reason for the adjustment')
      return
    }

    const quantity = parseInt(formData.quantity)
    const finalQuantity = adjustmentType === 'reduce' ? -quantity : quantity

    // Check if reduction would result in negative stock
    if (adjustmentType === 'reduce' && product.quantity < quantity) {
      setError(`Cannot reduce stock by ${quantity}. Current stock is ${product.quantity}`)
      return
    }

    try {
      setLoading(true)
      await adjustStock({
        productId: product.id,
        quantity: finalQuantity,
        type: formData.type,
        reason: formData.reason,
        reference: formData.reference
      })
      onClose()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to adjust stock')
    } finally {
      setLoading(false)
    }
  }

  const getNewStockLevel = () => {
    if (!formData.quantity || isNaN(formData.quantity)) return product.quantity
    const quantity = parseInt(formData.quantity)
    return adjustmentType === 'reduce' 
      ? product.quantity - quantity 
      : product.quantity + quantity
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adjust Stock - {product?.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Current Stock: {product?.quantity} {product?.unit}
          </Alert>

          <TextField
            fullWidth
            select
            label="Adjustment Type"
            name="type"
            value={formData.type}
            onChange={handleTypeChange}
            sx={{ mb: 2 }}
          >
            {adjustmentTypes.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>

          {formData.type === 'ADJUSTMENT' && (
            <RadioGroup
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value)}
              sx={{ mb: 2 }}
            >
              <FormControlLabel value="add" control={<Radio />} label="Add to stock" />
              <FormControlLabel value="reduce" control={<Radio />} label="Reduce from stock" />
            </RadioGroup>
          )}

          <TextField
            fullWidth
            label="Quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {adjustmentType === 'reduce' ? '-' : '+'}
                </InputAdornment>
              ),
              inputProps: { min: 1 }
            }}
          />

          <TextField
            fullWidth
            label="Reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            multiline
            rows={2}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="Reference Number (Optional)"
            name="reference"
            value={formData.reference}
            onChange={handleChange}
            placeholder="e.g., PO number, invoice number"
            sx={{ mb: 2 }}
          />

          {formData.quantity && (
            <Alert 
              severity={getNewStockLevel() < 0 ? 'error' : 'success'} 
              sx={{ mb: 2 }}
            >
              New Stock Level: {getNewStockLevel()} {product?.unit}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || getNewStockLevel() < 0}
        >
          Confirm Adjustment
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default StockAdjustment