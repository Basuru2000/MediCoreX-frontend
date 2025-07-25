import React, { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem
} from '@mui/material'
import { Print } from '@mui/icons-material'
import Barcode from 'react-barcode'

function BarcodePrintDialog({ open, onClose, products = [] }) {
  const [selectedProducts, setSelectedProducts] = React.useState(products)
  const [copiesPerProduct, setCopiesPerProduct] = React.useState(1)
  const [labelSize, setLabelSize] = React.useState('standard')
  const printRef = useRef()

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Product Barcodes',
    onAfterPrint: () => onClose()
  })

  const labelSizes = {
    small: { width: 1, height: 30, fontSize: 10 },
    standard: { width: 1.5, height: 50, fontSize: 14 },
    large: { width: 2, height: 70, fontSize: 18 }
  }

  const currentSize = labelSizes[labelSize]

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Print />
          Print Barcodes
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Label Size"
                value={labelSize}
                onChange={(e) => setLabelSize(e.target.value)}
                size="small"
              >
                <MenuItem value="small">Small (30mm x 20mm)</MenuItem>
                <MenuItem value="standard">Standard (50mm x 30mm)</MenuItem>
                <MenuItem value="large">Large (70mm x 40mm)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Copies per Product"
                value={copiesPerProduct}
                onChange={(e) => setCopiesPerProduct(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1, max: 10 }}
                size="small"
              />
            </Grid>
          </Grid>
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Preview ({selectedProducts.length} products × {copiesPerProduct} copies = {selectedProducts.length * copiesPerProduct} labels)
        </Typography>

        <Box
          sx={{
            border: '1px solid #ccc',
            borderRadius: 1,
            p: 2,
            bgcolor: 'background.paper',
            maxHeight: '400px',
            overflow: 'auto'
          }}
        >
          <div ref={printRef}>
            <style>
              {`
                @media print {
                  .barcode-label {
                    page-break-inside: avoid;
                    margin: 10px;
                    padding: 10px;
                    border: 1px dashed #ccc;
                    display: inline-block;
                  }
                  @page {
                    margin: 10mm;
                  }
                }
                .barcode-label {
                  margin: 10px;
                  padding: 10px;
                  border: 1px dashed #ccc;
                  display: inline-block;
                  text-align: center;
                }
              `}
            </style>
            
            <Box display="flex" flexWrap="wrap">
              {selectedProducts.map((product) =>
                Array.from({ length: copiesPerProduct }, (_, copyIndex) => (
                  <div key={`${product.id}-${copyIndex}`} className="barcode-label">
                    {product.barcode ? (
                      <>
                        <Barcode
                          value={product.barcode}
                          format="CODE128"
                          width={currentSize.width}
                          height={currentSize.height}
                          displayValue={true}
                          fontSize={currentSize.fontSize}
                          margin={5}
                        />
                        <Typography variant="caption" display="block" style={{ marginTop: 5 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" display="block">
                          ${product.unitPrice}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No barcode for {product.name}
                      </Typography>
                    )}
                  </div>
                ))
              )}
            </Box>
          </div>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handlePrint}
          startIcon={<Print />}
        >
          Print
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BarcodePrintDialog