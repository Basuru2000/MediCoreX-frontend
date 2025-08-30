import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Alert,
  LinearProgress,
  CardMedia
} from '@mui/material'
import {
  Close,
  CameraAlt,
  CloudUpload,
  QrCodeScanner,
  ArrowBack,
  Image as ImageIcon
} from '@mui/icons-material'
import { scanBarcode } from '../../services/api'

function BarcodeScanOptions({ open, onClose, onCameraSelect, onImageUpload }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [showUploadView, setShowUploadView] = useState(false)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setError('')
    setSelectedFile(file)
    
    // Create image preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
    
    // Show upload view
    setShowUploadView(true)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image file')
      return
    }
    setUploading(true)
    setError('')
    
    try {
      // Read file as base64
      const reader = new FileReader()
      
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result
          
          console.log('Sending image for barcode scanning...')
          
          // Send to backend for processing
          const response = await scanBarcode({ barcodeImage: base64Image })
          
          if (response.data) {
            if (response.data.barcode) {
              // Successfully decoded barcode
              console.log('Barcode detected:', response.data.barcode)
              
              // Call the onImageUpload callback with the barcode
              if (typeof onImageUpload === 'function') {
                await onImageUpload(response.data.barcode)
              }
              
              handleClose()
            } else if (response.data.id) {
              // Found a product with this barcode
              console.log('Product found with barcode:', response.data.barcode)
              
              if (typeof onImageUpload === 'function') {
                await onImageUpload(response.data.barcode || response.data.code)
              }
              
              handleClose()
            } else {
              setError('Barcode decoded but no data returned')
            }
          }
        } catch (err) {
          console.error('Barcode scan error:', err)
          
          // Extract error message from response
          let errorMessage = 'Failed to process image. ';
          
          if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          } else if (err.response?.data?.error) {
            errorMessage = err.response.data.error;
          } else if (err.message) {
            errorMessage = err.message;
          }
          
          // Provide helpful guidance
          if (errorMessage.includes('No barcode found')) {
            errorMessage += '\n\nTips:\n• Ensure the barcode is clearly visible\n• Try cropping the image to focus on the barcode\n• Use good lighting when taking the photo\n• Supported formats: Code 128, Code 39, EAN-13, QR Code';
          }
          
          setError(errorMessage)
        } finally {
          setUploading(false)
        }
      }
      
      reader.onerror = () => {
        setError('Failed to read the image file')
        setUploading(false)
      }
      
      reader.readAsDataURL(selectedFile)
    } catch (err) {
      console.error('File read error:', err)
      setError('Failed to read image file')
      setUploading(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setImagePreview(null)
    setError('')
    setShowUploadView(false)
    onClose()
  }

  const handleBack = () => {
    setSelectedFile(null)
    setImagePreview(null)
    setError('')
    setShowUploadView(false)
  }

  // Main options view
  if (!showUploadView) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <QrCodeScanner />
              <Typography>Scan Barcode/QR Code</Typography>
            </Box>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose how you want to scan the barcode or QR code:
          </Typography>

          <Grid container spacing={2}>
            {/* Camera Option */}
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardActionArea 
                  onClick={() => {
                    onCameraSelect()
                    handleClose()
                  }}
                  sx={{ height: '100%' }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <CameraAlt sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Use Camera
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Scan barcode directly using your device camera
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            {/* Upload Option */}
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardActionArea 
                  component="label"
                  sx={{ height: '100%' }}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <CloudUpload sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Upload Image
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Select an image containing the barcode
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    )
  }

  // Upload view with preview
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={handleBack} size="small">
              <ArrowBack />
            </IconButton>
            <ImageIcon />
            <Typography>Upload Barcode Image</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {imagePreview && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Image Preview:
            </Typography>
            <Card variant="outlined">
              <CardMedia
                component="img"
                image={imagePreview}
                alt="Selected image"
                sx={{ 
                  maxHeight: 300,
                  objectFit: 'contain',
                  backgroundColor: '#f5f5f5'
                }}
              />
            </Card>
          </Box>
        )}

        {selectedFile && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>File:</strong> {selectedFile.name}
              <br />
              <strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB
              <br />
              <strong>Type:</strong> {selectedFile.type}
            </Typography>
          </Alert>
        )}

        <Alert severity="info">
          <Typography variant="subtitle2" gutterBottom>
            Tips for better scanning:
          </Typography>
          <Typography variant="body2">
            • Ensure the barcode is clearly visible and not blurry
            <br />
            • Avoid shadows or glare on the barcode
            <br />
            • Try to capture the barcode straight-on, not at an angle
            <br />
            • Make sure the entire barcode is visible in the image
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              Processing image...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleBack}>Back</Button>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          startIcon={uploading ? null : <CloudUpload />}
        >
          {uploading ? 'Processing...' : 'Process Image'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BarcodeScanOptions