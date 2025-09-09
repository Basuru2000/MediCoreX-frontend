import React, { useState, useEffect } from 'react'
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  FormControlLabel,
  Switch,
  Typography
} from '@mui/material'
import { getProducts, addProductToSupplier, updateSupplierProduct } from '../../../services/api'

function SupplierProductForm({ supplierId, product, onClose }) {
  const isEdit = !!product
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    productId: product?.productId || '',
    supplierProductCode: product?.supplierProductCode || '',
    supplierProductName: product?.supplierProductName || '',
    unitPrice: product?.unitPrice || '',
    currency: product?.currency || 'USD',
    discountPercentage: product?.discountPercentage || 0,
    bulkDiscountPercentage: product?.bulkDiscountPercentage || 0,
    bulkQuantityThreshold: product?.bulkQuantityThreshold || 0,
    leadTimeDays: product?.leadTimeDays || 0,
    minOrderQuantity: product?.minOrderQuantity || 1,
    maxOrderQuantity: product?.maxOrderQuantity || '',
    isPreferred: product?.isPreferred || false,
    isActive: product?.isActive !== undefined ? product.isActive : true,
    notes: product?.notes || ''
  })

  useEffect(() => {
    if (!isEdit) {
      fetchProducts()
    }
  }, [isEdit])

  const fetchProducts = async () => {
    try {
      const response = await getProducts({ size: 1000 })
      setProducts(response.data.content)
    } catch (error) {
      setError('Failed to load products')
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isEdit) {
        await updateSupplierProduct(product.id, formData)
      } else {
        await addProductToSupplier(supplierId, formData)
      }
      onClose(true)
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DialogTitle>
        {isEdit ? 'Edit Product in Catalog' : 'Add Product to Catalog'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2}>
            {!isEdit && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Product</InputLabel>
                  <Select
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    label="Product"
                  >
                    {products.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supplier Product Code"
                name="supplierProductCode"
                value={formData.supplierProductCode}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supplier Product Name"
                name="supplierProductName"
                value={formData.supplierProductName}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Unit Price"
                name="unitPrice"
                type="number"
                value={formData.unitPrice}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 0.01, step: 0.01 }
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Regular Discount %"
                name="discountPercentage"
                type="number"
                value={formData.discountPercentage}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { min: 0, max: 100, step: 0.1 }
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                select
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Bulk Pricing
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bulk Discount %"
                name="bulkDiscountPercentage"
                type="number"
                value={formData.bulkDiscountPercentage}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  inputProps: { min: 0, max: 100, step: 0.1 }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bulk Quantity Threshold"
                name="bulkQuantityThreshold"
                type="number"
                value={formData.bulkQuantityThreshold}
                onChange={handleChange}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Order Requirements
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Lead Time (Days)"
                name="leadTimeDays"
                type="number"
                value={formData.leadTimeDays}
                onChange={handleChange}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Min Order Quantity"
                name="minOrderQuantity"
                type="number"
                value={formData.minOrderQuantity}
                onChange={handleChange}
                required
                InputProps={{
                  inputProps: { min: 1 }
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Max Order Quantity"
                name="maxOrderQuantity"
                type="number"
                value={formData.maxOrderQuantity}
                onChange={handleChange}
                InputProps={{
                  inputProps: { min: 1 }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPreferred}
                    onChange={handleChange}
                    name="isPreferred"
                  />
                }
                label="Preferred Supplier for this Product"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleChange}
                    name="isActive"
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !formData.productId || !formData.unitPrice}
        >
          {loading ? 'Saving...' : (isEdit ? 'Update' : 'Add')}
        </Button>
      </DialogActions>
    </>
  )
}

export default SupplierProductForm