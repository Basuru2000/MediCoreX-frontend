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
  Alert
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
import PreferredSupplierBadge from './PreferredSupplierBadge'
import { 
  getSupplierCatalog, 
  removeProductFromCatalog,
  setPreferredSupplier 
} from '../../../services/api'

function SupplierProductCatalog({ supplierId, canEdit }) {
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
        setError('Failed to remove product')
      }
    }
  }

  const handleSetPreferred = async (productId) => {
    try {
      await setPreferredSupplier(supplierId, productId)
      fetchCatalog()
    } catch (error) {
      setError('Failed to set preferred supplier')
    }
  }

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {canEdit && (
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
          >
            Add Product
          </Button>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Supplier Code</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">Discounts</TableCell>
              <TableCell align="center">Lead Time</TableCell>
              <TableCell align="center">MOQ</TableCell>
              <TableCell align="center">Status</TableCell>
              {canEdit && <TableCell align="center">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {item.productName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.productCode}
                    </Typography>
                    {item.isPreferred && <PreferredSupplierBadge />}
                  </Box>
                </TableCell>
                <TableCell>{item.supplierProductCode || '-'}</TableCell>
                <TableCell align="right">
                  <Box>
                    <Typography variant="body2">
                      {formatCurrency(item.unitPrice, item.currency)}
                    </Typography>
                    {item.effectivePrice < item.unitPrice && (
                      <Typography variant="caption" color="success.main">
                        Effective: {formatCurrency(item.effectivePrice)}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box>
                    {item.discountPercentage > 0 && (
                      <Chip
                        size="small"
                        label={`${item.discountPercentage}% off`}
                        color="success"
                        variant="outlined"
                        sx={{ mb: 0.5 }}
                      />
                    )}
                    {item.bulkDiscountPercentage > 0 && (
                      <Chip
                        size="small"
                        label={`Bulk: ${item.bulkDiscountPercentage}%`}
                        icon={<TrendingDown />}
                        variant="outlined"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  {item.leadTimeDays} days
                </TableCell>
                <TableCell align="center">
                  {item.minOrderQuantity}
                  {item.maxOrderQuantity && ` - ${item.maxOrderQuantity}`}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={item.isActive ? 'Active' : 'Inactive'}
                    color={item.isActive ? 'success' : 'default'}
                  />
                </TableCell>
                {canEdit && (
                  <TableCell align="center">
                    <Tooltip title={item.isPreferred ? 'Preferred' : 'Set as Preferred'}>
                      <IconButton
                        size="small"
                        onClick={() => handleSetPreferred(item.productId)}
                        color={item.isPreferred ? 'warning' : 'default'}
                      >
                        {item.isPreferred ? <Star /> : <StarBorder />}
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(item.id)}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
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
      />

      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
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