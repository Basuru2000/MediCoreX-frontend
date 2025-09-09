import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert
} from '@mui/material'
import { LocalShipping, Star, TrendingDown } from '@mui/icons-material'
import { getProductSuppliers } from '../../services/api'
import { useNavigate } from 'react-router-dom'

function ProductSupplierOptions({ productId, productName }) {
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (productId) {
      fetchSuppliers()
    }
  }, [productId])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const response = await getProductSuppliers(productId)
      setSuppliers(response.data)
    } catch (error) {
      setError('Failed to load supplier options')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (suppliers.length === 0) {
    return (
      <Alert 
        severity="info" 
        action={
          <Button 
            color="inherit" 
            size="small"
            onClick={() => navigate('/suppliers')}
          >
            Manage Suppliers
          </Button>
        }
      >
        No suppliers configured for this product
      </Alert>
    )
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <LocalShipping color="primary" />
        <Typography variant="h6">
          Supplier Options ({suppliers.length})
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Supplier</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="center">Lead Time</TableCell>
              <TableCell align="center">MOQ</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow 
                key={supplier.id}
                sx={{ 
                  backgroundColor: supplier.isPreferred ? 'action.hover' : 'inherit',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
                onClick={() => navigate(`/suppliers?view=${supplier.supplierId}`)}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2">
                      {supplier.supplierName}
                    </Typography>
                    {supplier.isPreferred && (
                      <Star color="warning" fontSize="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box>
                    <Typography variant="body2">
                      {formatCurrency(supplier.unitPrice, supplier.currency)}
                    </Typography>
                    {supplier.discountPercentage > 0 && (
                      <Typography variant="caption" color="success.main">
                        -{supplier.discountPercentage}%
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    size="small" 
                    label={`${supplier.leadTimeDays}d`}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  {supplier.minOrderQuantity}
                </TableCell>
                <TableCell align="center">
                  {supplier.isPreferred && (
                    <Chip
                      size="small"
                      label="Preferred"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

export default ProductSupplierOptions