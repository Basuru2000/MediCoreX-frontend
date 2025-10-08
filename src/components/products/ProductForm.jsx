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
  CircularProgress,
  Tab,
  Tabs,
  Stack,
  Divider,
  Chip,
  useTheme,
  alpha,
  Paper,
  Fade
} from '@mui/material'
import { 
  Upload, 
  Close, 
  QrCodeScanner, 
  Refresh,
  Image,
  Info,
  Inventory,
  AttachMoney,
  Category,
  CalendarMonth
} from '@mui/icons-material'
import { uploadProductImage } from '../../services/api'
import BarcodeDisplay from './BarcodeDisplay'
import BarcodeScanner from './BarcodeScanner'
import BarcodeScanOptions from './BarcodeScanOptions'

// Move TabPanel outside component to prevent re-renders
const TabPanel = ({ children, value, index }) => (
  <Box hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
)

function ProductForm({ open, onClose, onSubmit, product, categories }) {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    barcode: '',
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
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanOptionsOpen, setScanOptionsOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const units = ['tablets', 'bottles', 'boxes', 'pieces', 'packets', 'vials', 'strips']

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        code: product.code || '',
        barcode: product.barcode || '',
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
      // Fix: Prepend backend URL for existing images
      setImagePreview(product.imageUrl ? `http://localhost:8080${product.imageUrl}` : null)
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image size should be less than 5MB' })
      return
    }

    setUploadingImage(true)
    
    try {
      // Pass the file directly to uploadProductImage
      // The api.js function will create the FormData
      const response = await uploadProductImage(file)
      const imageUrl = response.data.imageUrl
      
      setFormData(prev => ({ ...prev, imageUrl }))
      setImagePreview(URL.createObjectURL(file))
      setErrors({ ...errors, image: '' })
    } catch (error) {
      console.error('Image upload error:', error)
      setErrors({ ...errors, image: 'Failed to upload image' })
    } finally {
      setUploadingImage(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name) newErrors.name = 'Product name is required'
    if (!formData.categoryId) newErrors.categoryId = 'Category is required'
    if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative'
    if (formData.minStockLevel < 0) newErrors.minStockLevel = 'Minimum stock cannot be negative'
    if (!formData.unit) newErrors.unit = 'Unit is required'
    if (formData.unitPrice < 0) newErrors.unitPrice = 'Price cannot be negative'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

const handleSubmit = () => {
  if (validateForm()) {
    // Clean the form data
    const cleanedData = {
      ...formData,
      // Remove expiryDate if it's empty or in the past (to avoid @Future validation)
      expiryDate: formData.expiryDate && new Date(formData.expiryDate) > new Date() 
        ? formData.expiryDate 
        : null
    }
    
    onSubmit(cleanedData)
  }
}

  const generateBarcode = () => {
    const randomBarcode = 'PRD' + Date.now().toString().slice(-10)
    setFormData(prev => ({ ...prev, barcode: randomBarcode }))
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 3,
            bgcolor: theme.palette.grey[50],
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={600}>
              {product ? 'Edit Product' : 'Add New Product'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {product ? 'Update product information' : 'Fill in the product details below'}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: theme.palette.text.secondary,
              '&:hover': {
                bgcolor: alpha(theme.palette.text.secondary, 0.1)
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)}
          sx={{ 
            px: 3,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              minHeight: 48
            }
          }}
        >
          <Tab label="Basic Information" icon={<Info fontSize="small" />} iconPosition="start" />
          <Tab label="Stock & Pricing" icon={<AttachMoney fontSize="small" />} iconPosition="start" />
          <Tab label="Additional Details" icon={<Category fontSize="small" />} iconPosition="start" />
        </Tabs>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* Product Image */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  src={imagePreview}
                  variant="rounded"
                  sx={{ 
                    width: 100, 
                    height: 100,
                    border: `2px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.grey[100]
                  }}
                >
                  <Image sx={{ fontSize: 40, color: theme.palette.text.secondary }} />
                </Avatar>
                <Stack spacing={1}>
                  <Typography variant="body2" fontWeight={500}>
                    Product Image
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Upload a product image (Max 5MB)
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={uploadingImage ? <CircularProgress size={16} /> : <Upload />}
                    disabled={uploadingImage}
                    sx={{ 
                      borderRadius: '8px',
                      textTransform: 'none',
                      borderColor: theme.palette.divider
                    }}
                  >
                    {uploadingImage ? 'Uploading...' : 'Choose Image'}
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  </Button>
                  {errors.image && (
                    <Typography variant="caption" color="error">
                      {errors.image}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Grid>

            {/* Product Name */}
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
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              />
            </Grid>

            {/* Category */}
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
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              >
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip 
                        label={category.name} 
                        size="small"
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main
                        }}
                      />
                      {category.productCount > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          ({category.productCount} products)
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Product Code */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g., MED-001"
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              />
            </Grid>

            {/* Barcode */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="Enter or scan barcode"
                InputProps={{
                  sx: { borderRadius: '8px' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <Stack direction="row" spacing={0.5}>
                        <IconButton 
                          size="small" 
                          onClick={() => setScanOptionsOpen(true)}
                          sx={{ color: theme.palette.primary.main }}
                        >
                          <QrCodeScanner fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={generateBarcode}
                          sx={{ color: theme.palette.success.main }}
                        >
                          <Refresh fontSize="small" />
                        </IconButton>
                      </Stack>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Enter product description..."
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            {/* Current Stock */}
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
                InputProps={{ 
                  inputProps: { min: 0 },
                  sx: { borderRadius: '8px' },
                  startAdornment: (
                    <InputAdornment position="start">
                      <Inventory fontSize="small" color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Minimum Stock Level */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Minimum Stock Level"
                name="minStockLevel"
                type="number"
                value={formData.minStockLevel}
                onChange={handleChange}
                error={!!errors.minStockLevel}
                helperText={errors.minStockLevel || "Alert when stock falls below this level"}
                required
                InputProps={{ 
                  inputProps: { min: 0 },
                  sx: { borderRadius: '8px' }
                }}
              />
            </Grid>

            {/* Unit */}
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
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              >
                {units.map(unit => (
                  <MenuItem key={unit} value={unit}>
                    {unit.charAt(0).toUpperCase() + unit.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Unit Price */}
            <Grid item xs={12} sm={6}>
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
                  inputProps: { min: 0, step: 0.01 },
                  sx: { borderRadius: '8px' },
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney fontSize="small" color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Total Value Display */}
            <Grid item xs={12} sm={6}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  borderRadius: '8px',
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                  borderColor: theme.palette.success.main
                }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Stock Value
                </Typography>
                <Typography variant="h5" fontWeight={600} color="success.main">
                  ${(formData.quantity * formData.unitPrice).toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            {/* Expiry Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  sx: { borderRadius: '8px' },
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonth fontSize="small" color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Batch Number */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Batch Number"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                placeholder="e.g., BATCH-2024-001"
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              />
            </Grid>

            {/* Manufacturer */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                placeholder="Enter manufacturer name"
                InputProps={{
                  sx: { borderRadius: '8px' }
                }}
              />
            </Grid>

            {/* Barcode Preview */}
            {formData.barcode && (
              <Grid item xs={12}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: '8px',
                    bgcolor: theme.palette.grey[50]
                  }}
                >
                  <Typography variant="body2" fontWeight={500} gutterBottom>
                    Barcode Preview
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <BarcodeDisplay value={formData.barcode} />
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            borderRadius: '8px',
            textTransform: 'none',
            px: 3
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          sx={{ 
            borderRadius: '8px',
            textTransform: 'none',
            px: 4,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: theme.shadows[4]
            }
          }}
        >
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </DialogActions>

      {/* Scanner Options Dialog */}
      {scanOptionsOpen && (
        <BarcodeScanOptions
          open={scanOptionsOpen}
          onClose={() => setScanOptionsOpen(false)}
          onCameraSelect={() => {
            setScanOptionsOpen(false)
            setScannerOpen(true)
          }}
          onImageUpload={(barcode) => {
            // Handle the decoded barcode
            setFormData(prev => ({ ...prev, barcode }))
            setScanOptionsOpen(false)
            setSnackbar({
              open: true,
              message: `Barcode detected: ${barcode}`,
              severity: 'success'
            })
          }}
        />
      )}

      {/* Barcode Scanner Dialog */}
      {scannerOpen && (
        <BarcodeScanner
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onScan={(barcode) => {
            setFormData(prev => ({ ...prev, barcode }))
            setScannerOpen(false)
          }}
        />
      )}
    </Dialog>
  )
}

export default ProductForm