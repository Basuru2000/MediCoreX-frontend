import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert
} from '@mui/material'
import { Add, Delete, Edit } from '@mui/icons-material'
import { getProducts, getProductSuppliers } from '../../services/api'

function POLineItemsTable({ lines, supplierId, onChange, taxAmount, discountAmount }) {
  const [products, setProducts] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [currentLine, setCurrentLine] = useState({
    productId: null,
    quantity: 1,
    unitPrice: 0,
    discountPercentage: 0,
    taxPercentage: 0,
    notes: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await getProducts({ page: 0, size: 1000 })
      setProducts(response.data.content)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleAddClick = () => {
    setEditingIndex(null)
    setCurrentLine({
      productId: null,
      quantity: 1,
      unitPrice: 0,
      discountPercentage: 0,
      taxPercentage: 0,
      notes: ''
    })
    setOpenDialog(true)
  }

  const handleEditClick = (index) => {
    setEditingIndex(index)
    const line = lines[index]
    setCurrentLine({
      productId: line.productId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      discountPercentage: line.discountPercentage || 0,
      taxPercentage: line.taxPercentage || 0,
      notes: line.notes || ''
    })
    setOpenDialog(true)
  }

  const handleDeleteClick = (index) => {
    const newLines = lines.filter((_, i) => i !== index)
    onChange(newLines)
  }

  const handleSaveLine = () => {
    const selectedProduct = products.find(p => p.id === currentLine.productId)
    
    if (!selectedProduct) {
      alert('Please select a product')
      return
    }

    const lineData = {
      productId: currentLine.productId,
      quantity: parseInt(currentLine.quantity),
      unitPrice: parseFloat(currentLine.unitPrice),
      discountPercentage: parseFloat(currentLine.discountPercentage) || 0,
      taxPercentage: parseFloat(currentLine.taxPercentage) || 0,
      notes: currentLine.notes,
      // Additional fields for display
      productName: selectedProduct.name,
      productCode: selectedProduct.code
    }

    if (editingIndex !== null) {
      // Update existing line
      const newLines = [...lines]
      newLines[editingIndex] = lineData
      onChange(newLines)
    } else {
      // Add new line
      onChange([...lines, lineData])
    }

    setOpenDialog(false)
  }

  const handleProductChange = async (product) => {
    if (!product) return

    setCurrentLine(prev => ({ ...prev, productId: product.id }))

    // Try to get supplier-specific pricing if supplier is selected
    if (supplierId) {
      try {
        const response = await getProductSuppliers(product.id)
        const supplierProduct = response.data.find(sp => sp.supplierId === supplierId)
        
        if (supplierProduct) {
          setCurrentLine(prev => ({
            ...prev,
            unitPrice: supplierProduct.unitPrice,
            discountPercentage: supplierProduct.discountPercentage || 0
          }))
        } else {
          setCurrentLine(prev => ({ ...prev, unitPrice: product.unitPrice }))
        }
      } catch (error) {
        console.error('Error fetching supplier pricing:', error)
        setCurrentLine(prev => ({ ...prev, unitPrice: product.unitPrice }))
      }
    } else {
      setCurrentLine(prev => ({ ...prev, unitPrice: product.unitPrice }))
    }
  }

  const calculateLineTotal = (line) => {
    const subtotal = line.quantity * line.unitPrice
    const discount = subtotal * (line.discountPercentage / 100)
    const afterDiscount = subtotal - discount
    const tax = afterDiscount * (line.taxPercentage / 100)
    return afterDiscount + tax
  }

  const calculateTotals = () => {
    const subtotal = lines.reduce((sum, line) => sum + calculateLineTotal(line), 0)
    const total = subtotal + (taxAmount || 0) - (discountAmount || 0)
    return { subtotal, total }
  }

  const totals = calculateTotals()

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={<Add />}
        onClick={handleAddClick}
        sx={{ mb: 2 }}
      >
        Add Line Item
      </Button>

      {lines.length === 0 ? (
        <Alert severity="info">No line items added yet. Click "Add Line Item" to get started.</Alert>
      ) : (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Product</strong></TableCell>
                  <TableCell align="right"><strong>Quantity</strong></TableCell>
                  <TableCell align="right"><strong>Unit Price</strong></TableCell>
                  <TableCell align="right"><strong>Discount %</strong></TableCell>
                  <TableCell align="right"><strong>Tax %</strong></TableCell>
                  <TableCell align="right"><strong>Line Total</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lines.map((line, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {line.productName}
                      <Typography variant="caption" display="block" color="text.secondary">
                        {line.productCode}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{line.quantity}</TableCell>
                    <TableCell align="right">${line.unitPrice.toFixed(2)}</TableCell>
                    <TableCell align="right">{line.discountPercentage}%</TableCell>
                    <TableCell align="right">{line.taxPercentage}%</TableCell>
                    <TableCell align="right">
                      <strong>${calculateLineTotal(line).toFixed(2)}</strong>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleEditClick(index)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClick(index)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Totals Row */}
                <TableRow>
                  <TableCell colSpan={5} align="right">
                    <strong>Subtotal:</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>${totals.subtotal.toFixed(2)}</strong>
                  </TableCell>
                  <TableCell />
                </TableRow>
                {taxAmount > 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="right">
                      Additional Tax:
                    </TableCell>
                    <TableCell align="right">
                      ${taxAmount.toFixed(2)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                )}
                {discountAmount > 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="right">
                      Additional Discount:
                    </TableCell>
                    <TableCell align="right">
                      -${discountAmount.toFixed(2)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={5} align="right">
                    <Typography variant="h6">Total:</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6">${totals.total.toFixed(2)}</Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Add/Edit Line Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIndex !== null ? 'Edit Line Item' : 'Add Line Item'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Autocomplete
              options={products}
              getOptionLabel={(option) => `${option.name} (${option.code})`}
              value={products.find(p => p.id === currentLine.productId) || null}
              onChange={(e, newValue) => handleProductChange(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Product *" margin="normal" />
              )}
              fullWidth
            />

            <TextField
              fullWidth
              label="Quantity *"
              type="number"
              value={currentLine.quantity}
              onChange={(e) => setCurrentLine(prev => ({ 
                ...prev, 
                quantity: parseInt(e.target.value) || 0 
              }))}
              margin="normal"
              inputProps={{ min: 1 }}
            />

            <TextField
              fullWidth
              label="Unit Price *"
              type="number"
              value={currentLine.unitPrice}
              onChange={(e) => setCurrentLine(prev => ({ 
                ...prev, 
                unitPrice: parseFloat(e.target.value) || 0 
              }))}
              margin="normal"
              inputProps={{ step: 0.01, min: 0 }}
            />

            <TextField
              fullWidth
              label="Discount %"
              type="number"
              value={currentLine.discountPercentage}
              onChange={(e) => setCurrentLine(prev => ({ 
                ...prev, 
                discountPercentage: parseFloat(e.target.value) || 0 
              }))}
              margin="normal"
              inputProps={{ step: 0.01, min: 0, max: 100 }}
            />

            <TextField
              fullWidth
              label="Tax %"
              type="number"
              value={currentLine.taxPercentage}
              onChange={(e) => setCurrentLine(prev => ({ 
                ...prev, 
                taxPercentage: parseFloat(e.target.value) || 0 
              }))}
              margin="normal"
              inputProps={{ step: 0.01, min: 0, max: 100 }}
            />

            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={2}
              value={currentLine.notes}
              onChange={(e) => setCurrentLine(prev => ({ 
                ...prev, 
                notes: e.target.value 
              }))}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveLine} 
            variant="contained"
            disabled={!currentLine.productId || currentLine.quantity < 1}
          >
            {editingIndex !== null ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default POLineItemsTable