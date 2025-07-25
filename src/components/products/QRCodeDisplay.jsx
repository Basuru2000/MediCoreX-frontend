import React from 'react'
import { Box, Paper, Typography } from '@mui/material'

function QRCodeDisplay({ qrCode, productName }) {
  if (!qrCode) {
    return (
      <Box sx={{ textAlign: 'center', p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          QR Code not available
        </Typography>
      </Box>
    )
  }

  return (
    <Paper sx={{ p: 2, textAlign: 'center' }}>
      <img 
        src={qrCode} 
        alt={`QR Code for ${productName}`}
        style={{ maxWidth: '200px', height: 'auto' }}
      />
      {productName && (
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          {productName}
        </Typography>
      )}
    </Paper>
  )
}

export default QRCodeDisplay