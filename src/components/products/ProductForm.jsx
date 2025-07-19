import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Grid,
  InputAdornment,
  Box,
  Typography,
  IconButton,
  Avatar,
  CircularProgress
} from '@mui/material'
import { Upload, Close } from '@mui/icons-material'
import { uploadProductImage } from '../../services/api'

function ProductForm({ open, onClose, onSubmit, product, categories }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    categoryId: '',
    quantity: 0,
    minStockLevel: 0,
    unit: '',
    unitPrice: 0,
    expiryDate: '',
    batchNumber: '',
    manufacturer: '',
    imageUrl: ''
  })

  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        code: product.code || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        quantity: product.quantity || 0,
        minStockLevel: product.minStockLevel || 0,
        unit: product.unit || '',
        unitPrice: product.unitPrice || 0,
        expiryDate: product.expiryDate || '',
        batchNumber: product.batchNumber || '',
        manufacturer: product.manufacturer || '',
        imageUrl: product.imageUrl || ''
      })
      setImagePreview(product.imageUrl ? `http://localhost:8080${product.imageUrl}` : null)
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        categoryId: '',
        quantity: 0,
        minStockLevel: 0,
        unit: '',
        unitPrice: 0,
        expiryDate: '',
        batchNumber: '',
        manufacturer: '',
        imageUrl: ''
      })
      setImagePreview(null)
    }
    setErrors({})
  }, [product, open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, image: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)' })
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image size must be less than 5MB' })
      return
    }

    setUploadingImage(true)
    setErrors({ ...errors, image: '' })

    try {
      const response = await uploadProductImage(file)
      const imageUrl = response.data.imageUrl
      
      setFormData(prev => ({ ...prev, imageUrl }))
      setImagePreview(`http://localhost:8080${imageUrl}`)
    } catch (error) {
      setErrors({ ...errors, image: 'Failed to upload image' })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }))
    setImagePreview(null)
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required'
    }
    
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative'
    }
    
    if (formData.minStockLevel < 0) {
      newErrors.minStockLevel = 'Minimum stock level cannot be negative'
    }
    
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required'
    }
    
    if (formData.unitPrice < 0) {
      newErrors.unitPrice = 'Unit price cannot be negative'
    }
    
    if (formData.expiryDate && new Date(formData.expiryDate) <= new Date()) {
      newErrors.expiryDate = 'Expiry date must be in the future'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      // Convert numeric fields
      const submitData = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        quantity: parseInt(formData.quantity),
        minStockLevel: parseInt(formData.minStockLevel),
        unitPrice: parseFloat(formData.unitPrice)
      }
      
      // Remove empty optional fields
      if (!submitData.code) delete submitData.code
      if (!submitData.description) delete submitData.description
      if (!submitData.expiryDate) delete submitData.expiryDate
      if (!submitData.batchNumber) delete submitData.batchNumber
      if (!submitData.manufacturer) delete submitData.manufacturer
      
      onSubmit(submitData)
    }
  }

  const commonUnits = ['Tablets', 'Bottles', 'Boxes', 'Packs', 'Vials', 'Tubes', 'Strips', 'Pieces', 'Liters', 'Kilograms']

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Product Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="SKU or Barcode"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Category"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              error={!!errors.categoryId}
              helperText={errors.categoryId}
              required
            >
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Current Stock"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              error={!!errors.quantity}
              helperText={errors.quantity}
              required
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Minimum Stock Level"
              name="minStockLevel"
              type="number"
              value={formData.minStockLevel}
              onChange={handleChange}
              error={!!errors.minStockLevel}
              helperText={errors.minStockLevel}
              required
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              error={!!errors.unit}
              helperText={errors.unit}
              required
            >
              {commonUnits.map(unit => (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              ))}
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Unit Price"
              name="unitPrice"
              type="number"
              value={formData.unitPrice}
              onChange={handleChange}
              error={!!errors.unitPrice}
              helperText={errors.unitPrice}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { min: 0, step: 0.01 }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Expiry Date"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleChange}
              error={!!errors.expiryDate}
              helperText={errors.expiryDate}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Batch Number"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ border: '1px dashed #ccc', borderRadius: 1, p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>
                Product Image
              </Typography>
              
              {imagePreview ? (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={imagePreview}
                    variant="rounded"
                    sx={{ width: 150, height: 150, mb: 1 }}
                  />
                  <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: -8, right: -8 }}
                    onClick={handleRemoveImage}
                  >
                    <Close />
                  </IconButton>
                </Box>
              ) : (
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={uploadingImage ? <CircularProgress size={20} /> : <Upload />}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </Button>
                  </label>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Max size: 5MB. Formats: JPEG, PNG, GIF, WebP
                  </Typography>
                </Box>
              )}
              
              {errors.image && (
                <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
                  {errors.image}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {product ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProductForm