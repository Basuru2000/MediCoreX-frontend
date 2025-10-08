import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  Dialog,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Star,
  StarBorder,
  TrendingDown
} from '@mui/icons-material'
import SupplierProductForm from './SupplierProductForm'
import { 
  getSupplierCatalog, 
  removeProductFromCatalog,
  setPreferredSupplier 
} from '../../../services/api'

function SupplierProductCatalog({ supplierId, canEdit }) {
  const theme = useTheme()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0
  })
  const [openForm, setOpenForm] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCatalog()
  }, [supplierId, pagination.page, pagination.size])

  const fetchCatalog = async () => {
    try {
      setLoading(true)
      const response = await getSupplierCatalog(supplierId, {
        page: pagination.page,
        size: pagination.size
      })
      setProducts(response.data.content)
      setPagination(prev => ({
        ...prev,
        totalElements: response.data.totalElements
      }))
    } catch (error) {
      setError('Failed to load catalog')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedProduct(null)
    setOpenForm(true)
  }

  const handleEdit = (product) => {
    setSelectedProduct(product)
    setOpenForm(true)
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Remove this product from the catalog?')) {
      try {
        await removeProductFromCatalog(productId)
        fetchCatalog()
      } catch (error) {
        console.error('Error removing product:', error)
      }
    }
  }

  const handleSetPreferred = async (productId) => {
    try {
      await setPreferredSupplier(supplierId, productId)
      fetchCatalog()
    } catch (error) {
      console.error('Error setting preferred supplier:', error)
    }
  }

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  if (loading && products.length === 0) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center"
        minHeight="400px"
        gap={2}
      >
        <CircularProgress size={40} thickness={4} />
        <Typography variant="body2" color="text.secondary">
          Loading catalog...
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              fontSize: '1.125rem',
              mb: 0.5
            }}
          >
            Product Catalog
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            Products available from this supplier
          </Typography>
        </Box>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
            sx={{
              height: 36,
              px: 2,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: theme.shadows[2]
              }
            }}
          >
            Add Product
          </Button>
        )}
      </Box>

      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{ 
            mb: 3,
            borderRadius: '8px'
          }}
        >
          {error}
        </Alert>
      )}

      {products.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No products in catalog yet
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer 
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Code</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Price</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Lead Time</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>MOQ</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Status</TableCell>
                  {canEdit && (
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((item, index) => (
                  <TableRow 
                    key={item.id}
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'light' ? 'action.hover' : 'action.selected'
                      },
                      bgcolor: item.isPreferred ? 
                        (theme.palette.mode === 'light' ? 'warning.lighter' : 'warning.darker') : 
                        'transparent'
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {item.isPreferred && (
                          <Star sx={{ fontSize: 18, color: 'warning.main' }} />
                        )}
                        <Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              fontSize: '0.875rem'
                            }}
                          >
                            {item.productName}
                          </Typography>
                          {item.supplierProductName && item.supplierProductName !== item.productName && (
                            <Typography 
                              variant="caption"
                              sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.75rem'
                              }}
                            >
                              {item.supplierProductName}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2"
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.875rem',
                          fontFamily: 'monospace'
                        }}
                      >
                        {item.supplierProductCode || item.productCode}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}
                        >
                          {formatCurrency(item.unitPrice, item.currency)}
                        </Typography>
                        {item.discountPercentage > 0 && (
                          <Chip
                            icon={<TrendingDown sx={{ fontSize: 12 }} />}
                            label={`${item.discountPercentage}% off`}
                            size="small"
                            color="success"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              mt: 0.5,
                              '& .MuiChip-icon': {
                                fontSize: 12
                              }
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography 
                        variant="body2"
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.875rem'
                        }}
                      >
                        {item.leadTimeDays} days
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography 
                        variant="body2"
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.875rem'
                        }}
                      >
                        {item.minOrderQuantity}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={item.isActive ? 'Active' : 'Inactive'}
                        color={item.isActive ? 'success' : 'default'}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          borderRadius: '6px'
                        }}
                      />
                    </TableCell>
                    {canEdit && (
                      <TableCell align="center">
                        <Box display="flex" gap={0.5} justifyContent="center">
                          <Tooltip 
                            title={item.isPreferred ? 'Preferred' : 'Set as Preferred'} 
                            arrow
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleSetPreferred(item.productId)}
                              sx={{
                                width: 32,
                                height: 32,
                                color: item.isPreferred ? 'warning.main' : 'text.secondary',
                                '&:hover': {
                                  bgcolor: item.isPreferred ? 'warning.lighter' : 'action.hover'
                                }
                              }}
                            >
                              {item.isPreferred ? 
                                <Star sx={{ fontSize: 18 }} /> : 
                                <StarBorder sx={{ fontSize: 18 }} />
                              }
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(item)}
                              sx={{
                                width: 32,
                                height: 32,
                                color: 'info.main',
                                '&:hover': {
                                  bgcolor: 'info.lighter'
                                }
                              }}
                            >
                              <Edit sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(item.id)}
                              sx={{
                                width: 32,
                                height: 32,
                                color: 'error.main',
                                '&:hover': {
                                  bgcolor: 'error.lighter'
                                }
                              }}
                            >
                              <Delete sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={pagination.totalElements}
            page={pagination.page}
            onPageChange={(e, newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
            rowsPerPage={pagination.size}
            onRowsPerPageChange={(e) => setPagination(prev => ({ 
              ...prev, 
              size: parseInt(e.target.value, 10),
              page: 0 
            }))}
            sx={{
              mt: 2,
              '.MuiTablePagination-toolbar': {
                fontSize: '0.875rem'
              },
              '.MuiTablePagination-select': {
                borderRadius: '6px'
              }
            }}
          />
        </>
      )}

      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px'
          }
        }}
      >
        <SupplierProductForm
          supplierId={supplierId}
          product={selectedProduct}
          onClose={(refresh) => {
            setOpenForm(false)
            if (refresh) fetchCatalog()
          }}
        />
      </Dialog>
    </Box>
  )
}

export default SupplierProductCatalog