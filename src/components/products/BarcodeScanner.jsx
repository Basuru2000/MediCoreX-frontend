import React, { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  Typography,
  LinearProgress,
  IconButton
} from '@mui/material'
import { CameraAlt, Close, ArrowBack } from '@mui/icons-material'

function BarcodeScanner({ open, onClose, onScan, onBack }) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)
  const html5QrcodeScannerRef = useRef(null)

  useEffect(() => {
    if (open && !html5QrcodeScannerRef.current) {
      // Add a small delay to ensure the dialog is rendered
      const timer = setTimeout(() => {
        const element = document.getElementById("barcode-scanner")
        if (element) {
          startScanner()
        }
      }, 100)

      return () => clearTimeout(timer)
    }

    return () => {
      if (html5QrcodeScannerRef.current) {
        stopScanner()
      }
    }
  }, [open])

  const startScanner = () => {
    try {
      setScanning(true)
      setError('')

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        rememberLastUsedCamera: true
      }

      html5QrcodeScannerRef.current = new Html5QrcodeScanner(
        "barcode-scanner",
        config,
        false
      )

      html5QrcodeScannerRef.current.render(
        (decodedText) => {
          // Success callback
          stopScanner()
          onScan(decodedText)
          onClose()
        },
        (error) => {
          // Error callback - we can ignore most errors as they're just "no barcode found"
          if (error && !error.includes("NotFoundException")) {
            console.log(`Scan error: ${error}`)
          }
        }
      )
      
      setIsInitialized(true)
    } catch (err) {
      console.error('Failed to start scanner:', err)
      setError('Failed to start camera. Please ensure camera permissions are granted.')
      setScanning(false)
    }
  }

  const stopScanner = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear()
        .then(() => {
          html5QrcodeScannerRef.current = null
          setScanning(false)
          setIsInitialized(false)
        })
        .catch((error) => {
          console.error('Failed to clear scanner', error)
          // Force cleanup even if clear fails
          html5QrcodeScannerRef.current = null
          setScanning(false)
          setIsInitialized(false)
        })
    }
  }

  const handleClose = () => {
    stopScanner()
    setError('')
    onClose()
  }

  const handleBack = () => {
    stopScanner()
    setError('')
    if (onBack) {
      onBack()
    } else {
      onClose()
    }
  }

  // Handle dialog enter/exit transitions
  const handleEntered = () => {
    // Dialog has fully entered, safe to initialize scanner
    if (!html5QrcodeScannerRef.current && open) {
      const element = document.getElementById("barcode-scanner")
      if (element) {
        startScanner()
      }
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      TransitionProps={{
        onEntered: handleEntered
      }}
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            {onBack && (
              <IconButton onClick={handleBack} size="small">
                <ArrowBack />
              </IconButton>
            )}
            <CameraAlt />
            <Typography>Scan Barcode/QR Code</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ position: 'relative', minHeight: '350px' }}>
          {scanning && !isInitialized && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                Initializing camera...
              </Typography>
            </Box>
          )}

          <Box 
            id="barcode-scanner" 
            sx={{ 
              width: '100%',
              '& #html5-qrcode-button-camera-permission': {
                marginBottom: '10px'
              },
              '& video': {
                width: '100% !important',
                borderRadius: '8px'
              }
            }}
          />
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            • Position the barcode/QR code within the frame
            <br />
            • Ensure good lighting for better scanning
            <br />
            • The scanner will automatically detect the code
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions>
        {onBack && (
          <Button onClick={handleBack} variant="outlined">
            Back
          </Button>
        )}
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BarcodeScanner