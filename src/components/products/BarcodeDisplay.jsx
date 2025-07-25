import React from 'react'
import Barcode from 'react-barcode'
import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material'
import { Print, Download } from '@mui/icons-material'

function BarcodeDisplay({ barcode, productName, showActions = true, onPrint, onDownload }) {
  if (!barcode) {
    return (
      <Box sx={{ textAlign: 'center', p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No barcode available
        </Typography>
      </Box>
    )
  }

  return (
    <Paper sx={{ p: 2, textAlign: 'center' }}>
      <Box id={`barcode-${barcode}`}>
        <Barcode 
          value={barcode}
          format="CODE128"
          width={1.5}
          height={50}
          displayValue={true}
          fontSize={14}
          margin={10}
        />
        {productName && (
          <Typography variant="caption" display="block" sx={{ mt: -1 }}>
            {productName}
          </Typography>
        )}
      </Box>
      
      {showActions && (
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Tooltip title="Print Barcode">
            <IconButton size="small" onClick={onPrint}>
              <Print />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Barcode">
            <IconButton size="small" onClick={onDownload}>
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Paper>
  )
}

export default BarcodeDisplay