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
  Alert,
  Paper,
  Stack,
  Divider,
  useTheme,
  alpha
} from '@mui/material'
import { Add, Delete, Edit, ShoppingCart } from '@mui/icons-material'
import { getProducts, getProductSuppliers } from '../../services/api'

function POLineItemsTable({ lines, supplierId, onChange, taxAmount, discountAmount }) {
  const theme = useTheme()
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
      productName: selectedProduct.name,
      productCode: selectedProduct.code
    }

    if (editingIndex !== null) {
      const newLines = [...lines]
      newLines[editingIndex] = lineData
      onChange(newLines)
    } else {
      onChange([...lines, lineData])
    }

    setOpenDialog(false)
  }

  const handleProductChange = async (product) => {
    if (!product) return

    setCurrentLine(prev => ({ ...prev, productId: product.id }))

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
        sx={{
          mb: 2,
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          borderColor: theme.palette.divider,
          color: theme.palette.text.primary,
          '&:hover': {
            borderColor: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.05)
          }
        }}
      >
        Add Line Item
      </Button>

      {lines.length === 0 ? (
        <Alert
          severity="info"
          sx={{
            borderRadius: '8px'
          }}
        >
          No line items added yet. Click "Add Line Item" to get started.
        </Alert>
      ) : (
        <>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Product</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>Quantity</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>Unit Price</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>Discount %</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>Tax %</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>Line Total</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: 'text.primary' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lines.map((line, index) => (
                  <TableRow
                    key={index}
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {line.productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {line.productCode}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{line.quantity}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">${line.unitPrice.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{line.discountPercentage}%</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{line.taxPercentage}%</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        ${calculateLineTotal(line).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(index)}
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: 'info.main'
                            }
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(index)}
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              color: 'error.main'
                            }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Totals Summary */}
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 2,
              borderRadius: '8px',
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.primary.main, 0.02)
            }}
          >
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Subtotal:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ${totals.subtotal.toFixed(2)}
                </Typography>
              </Box>
              {taxAmount > 0 && (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Tax:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ${taxAmount.toFixed(2)}
                  </Typography>
                </Box>
              )}
              {discountAmount > 0 && (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Discount:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                    -${discountAmount.toFixed(2)}
                  </Typography>
                </Box>
              )}
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Total:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  ${totals.total.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px'
          }
        }}
      >
        <DialogTitle sx={{
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.primary.main, 0.02)
        }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }}
            >
              <ShoppingCart fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {editingIndex !== null ? 'Edit Line Item' : 'Add Line Item'}
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Autocomplete
              options={products}
              getOptionLabel={(option) => `${option.name} (${option.code})`}
              value={products.find(p => p.id === currentLine.productId) || null}
              onChange={(e, newValue) => handleProductChange(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Product *"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px'
                    }
                  }}
                />
              )}
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
              inputProps={{ min: 1 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
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
              inputProps={{ step: 0.01, min: 0 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
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
              inputProps={{ step: 0.01, min: 0, max: 100 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
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
              inputProps={{ step: 0.01, min: 0, max: 100 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.grey[500], 0.02)
        }}>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveLine}
            variant="contained"
            disabled={!currentLine.productId || currentLine.quantity < 1}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
              }
            }}
          >
            {editingIndex !== null ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default POLineItemsTable