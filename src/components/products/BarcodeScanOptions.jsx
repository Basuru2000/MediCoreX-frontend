// This component provides users with a choice to either use camera or upload an image for barcode scanning
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
  LinearProgress
} from '@mui/material'
import {
  Close,
  CameraAlt,
  CloudUpload,
  QrCodeScanner
} from '@mui/icons-material'

function BarcodeScanOptions({ open, onClose, onCameraSelect, onImageUpload }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

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
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image file')
      return
    }

    setUploading(true)
    try {
      await onImageUpload(selectedFile)
      handleClose()
    } catch (err) {
      setError('Failed to process image. Please ensure it contains a clear barcode.')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setError('')
    onClose()
  }

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

        {selectedFile && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="info" onClose={() => setSelectedFile(null)}>
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </Alert>
          </Box>
        )}

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
        <Button onClick={handleClose}>Cancel</Button>
        {selectedFile && (
          <Button 
            variant="contained" 
            onClick={handleUpload}
            disabled={uploading}
            startIcon={uploading ? <LinearProgress size={20} /> : <CloudUpload />}
          >
            Process Image
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default BarcodeScanOptions