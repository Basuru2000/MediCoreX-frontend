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
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material'
import { TrendingUp, Schedule, Star } from '@mui/icons-material'
import { compareSupplierPrices } from '../../../services/api'

function PriceComparisonMatrix({ productId }) {
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [comparison, setComparison] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (productId) {
      fetchComparison()
    }
  }, [productId, quantity])

  const fetchComparison = async () => {
    try {
      setLoading(true)
      const response = await compareSupplierPrices(productId, quantity)
      setComparison(response.data)
    } catch (error) {
      setError('Failed to load price comparison')
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
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  if (!comparison) {
    return (
      <Alert severity="info">
        Select a product to compare supplier prices
      </Alert>
    )
  }

  return (
    <Box>
      <Box mb={2}>
        <Typography variant="h6" gutterBottom>
          {comparison.productName} - Price Comparison
        </Typography>
        <TextField
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          InputProps={{
            inputProps: { min: 1 },
            endAdornment: <InputAdornment position="end">units</InputAdornment>
          }}
          size="small"
        />
      </Box>

      {comparison.supplierOptions.length === 0 ? (
        <Alert severity="warning">
          No suppliers available for this product
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Supplier</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Effective Price</TableCell>
                <TableCell align="right">Total Cost</TableCell>
                <TableCell align="center">Lead Time</TableCell>
                <TableCell align="center">MOQ</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparison.supplierOptions.map((option, index) => (
                <TableRow 
                  key={option.supplierId}
                  sx={{
                    backgroundColor: index === 0 ? 'action.hover' : 'inherit'
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {option.supplierName}
                      {option.isPreferred && (
                        <Chip
                          size="small"
                          icon={<Star />}
                          label="Preferred"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(option.unitPrice, option.currency)}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      color={option.effectivePrice < option.unitPrice ? 'success.main' : 'inherit'}
                    >
                      {formatCurrency(option.effectivePrice, option.currency)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>
                      {formatCurrency(option.totalCost, option.currency)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" gap={0.5} justifyContent="center">
                      <Schedule fontSize="small" />
                      {option.leadTimeDays} days
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {option.minOrderQuantity}
                  </TableCell>
                  <TableCell align="center">
                    {index === 0 && comparison.recommendedSupplierId && (
                      <Chip
                        size="small"
                        label="Recommended"
                        color="success"
                        icon={<TrendingUp />}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {comparison.recommendationReason && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <strong>Recommendation:</strong> {comparison.recommendationReason}
        </Alert>
      )}
    </Box>
  )
}

export default PriceComparisonMatrix