import React, { useRef, useState, useEffect } from 'react'
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
  MenuItem,
  Paper,
  Alert
} from '@mui/material'
import { Print } from '@mui/icons-material'
import Barcode from 'react-barcode'

// Separate component for printable content to ensure proper rendering
const PrintableContent = React.forwardRef(({ products, copiesPerProduct, labelSize }, ref) => {
  const labelSizes = {
    small: { width: 1, height: 30, fontSize: 10 },
    standard: { width: 1.5, height: 50, fontSize: 14 },
    large: { width: 2, height: 70, fontSize: 18 }
  }

  const currentSize = labelSizes[labelSize]

  return (
    <div ref={ref} style={{ backgroundColor: 'white', padding: '10mm' }}>
      <style type="text/css" media="print">
        {`
          @page {
            size: auto;
            margin: 10mm;
          }
          
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .barcode-label {
              page-break-inside: avoid;
              break-inside: avoid;
              display: inline-block !important;
              margin: 5mm !important;
              padding: 5mm !important;
              border: 1px solid #ccc !important;
              background-color: white !important;
              text-align: center !important;
            }
            
            .barcode-container {
              display: flex !important;
              flex-wrap: wrap !important;
              justify-content: flex-start !important;
            }
            
            .product-name {
              font-size: 12px !important;
              margin-top: 5px !important;
              font-weight: bold !important;
            }
            
            .product-price {
              font-size: 11px !important;
              color: #333 !important;
            }
            
            svg {
              max-width: 100% !important;
              height: auto !important;
            }
          }
        `}
      </style>
      
      <div className="barcode-container" style={{ display: 'flex', flexWrap: 'wrap' }}>
        {products.map((product) =>
          Array.from({ length: copiesPerProduct }, (_, copyIndex) => (
            <div 
              key={`${product.id}-${copyIndex}`} 
              className="barcode-label"
              style={{
                margin: '5mm',
                padding: '5mm',
                border: '1px solid #ccc',
                display: 'inline-block',
                textAlign: 'center',
                backgroundColor: 'white',
                breakInside: 'avoid',
                pageBreakInside: 'avoid'
              }}
            >
              {product.barcode ? (
                <div>
                  <Barcode
                    value={product.barcode}
                    format="CODE128"
                    width={currentSize.width}
                    height={currentSize.height}
                    displayValue={true}
                    fontSize={currentSize.fontSize}
                    margin={5}
                    background="#ffffff"
                    lineColor="#000000"
                    renderer="svg"
                  />
                  <div className="product-name" style={{ 
                    marginTop: '5px', 
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#000'
                  }}>
                    {product.name}
                  </div>
                  <div className="product-price" style={{ 
                    fontSize: '11px',
                    color: '#333' 
                  }}>
                    ${product.unitPrice}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px', color: '#666' }}>
                  No barcode for {product.name}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
})

PrintableContent.displayName = 'PrintableContent'

function BarcodePrintDialog({ open, onClose, products = [] }) {
  const [copiesPerProduct, setCopiesPerProduct] = useState(1)
  const [labelSize, setLabelSize] = useState('standard')
  const [isPrintReady, setIsPrintReady] = useState(false)
  const printRef = useRef()

  // Debug logging
  useEffect(() => {
    console.log('BarcodePrintDialog - products received:', products)
    console.log('BarcodePrintDialog - products length:', products.length)
  }, [products])

  // Ensure component is ready before allowing print
  useEffect(() => {
    if (open && products.length > 0) {
      // Small delay to ensure barcodes are rendered
      const timer = setTimeout(() => {
        setIsPrintReady(true)
        console.log('Print is now ready')
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setIsPrintReady(false)
    }
  }, [open, products.length])

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Product Barcodes',
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        // Ensure all barcodes are rendered before printing
        setTimeout(() => {
          resolve()
        }, 1000)
      })
    },
    onAfterPrint: () => {
      console.log('Print completed')
      onClose()
    },
    onPrintError: (error) => {
      console.error('Print error:', error)
      alert('Failed to print. Please try again.')
    },
    pageStyle: `
      @page {
        size: auto;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `
  })

  const labelSizes = {
    small: { width: 1, height: 30, fontSize: 10 },
    standard: { width: 1.5, height: 50, fontSize: 14 },
    large: { width: 2, height: 70, fontSize: 18 }
  }

  const currentSize = labelSizes[labelSize]

  // Filter products that have barcodes
  const productsWithBarcodes = products.filter(p => p.barcode)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Print />
          Print Barcodes
        </Box>
      </DialogTitle>

      <DialogContent>
        {productsWithBarcodes.length === 0 ? (
          <Alert severity="warning" sx={{ mb: 3 }}>
            No products with barcodes available to print. Please ensure products have barcodes assigned.
          </Alert>
        ) : (
          <>
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
              Preview ({productsWithBarcodes.length} products × {copiesPerProduct} copies = {productsWithBarcodes.length * copiesPerProduct} labels)
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                maxHeight: '400px',
                overflow: 'auto',
                border: '1px solid #ccc'
              }}
            >
              <Box display="flex" flexWrap="wrap">
                {productsWithBarcodes.slice(0, 3).map((product) => (
                  <Box
                    key={product.id}
                    sx={{
                      m: 1,
                      p: 1,
                      border: '1px dashed #ccc',
                      display: 'inline-block',
                      textAlign: 'center'
                    }}
                  >
                    <Barcode
                      value={product.barcode}
                      format="CODE128"
                      width={currentSize.width}
                      height={currentSize.height}
                      displayValue={true}
                      fontSize={currentSize.fontSize}
                      margin={5}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="caption" display="block">
                      ${product.unitPrice}
                    </Typography>
                  </Box>
                ))}
                {productsWithBarcodes.length > 3 && (
                  <Box
                    sx={{
                      m: 1,
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      ... and {productsWithBarcodes.length - 3} more
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* Hidden printable content */}
            <Box sx={{ display: 'none' }}>
              <PrintableContent
                ref={printRef}
                products={productsWithBarcodes}
                copiesPerProduct={copiesPerProduct}
                labelSize={labelSize}
              />
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handlePrint}
          startIcon={<Print />}
          disabled={!isPrintReady || productsWithBarcodes.length === 0}
        >
          {!isPrintReady ? 'Preparing...' : `Print ${productsWithBarcodes.length} Labels`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BarcodePrintDialog