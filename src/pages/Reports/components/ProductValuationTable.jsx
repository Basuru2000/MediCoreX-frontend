import React, { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  LinearProgress,
  Typography,
  CircularProgress
} from '@mui/material'
import { Search, Warning, CheckCircle, Cancel } from '@mui/icons-material'
import { getProductValuation } from '../../../services/api'

function ProductValuationTable({ products, showPagination = false, showFilters = false }) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  const [allProducts, setAllProducts] = useState(products || [])
  const [filteredProducts, setFilteredProducts] = useState(products || [])
  const [filters, setFilters] = useState({
    search: '',
    stockStatus: 'ALL',
    sortBy: 'totalValue',
    sortDirection: 'DESC'
  })

  useEffect(() => {
    if (!products && showFilters) {
      fetchAllProducts()
    } else if (products) {
      setAllProducts(products)
      setFilteredProducts(products)
    }
  }, [products, showFilters])

  useEffect(() => {
    applyFilters()
  }, [filters, allProducts])

  const fetchAllProducts = async () => {
    try {
      setLoading(true)
      const response = await getProductValuation({
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection
      })
      setAllProducts(response.data)
    } catch (error) {
      console.error('Failed to fetch products', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...allProducts]

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (product.code && product.code.toLowerCase().includes(filters.search.toLowerCase()))
      )
    }

    // Stock status filter
    if (filters.stockStatus !== 'ALL') {
      filtered = filtered.filter(product => product.stockStatus === filters.stockStatus)
    }

    setFilteredProducts(filtered)
    setPage(0)
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))

    if (field === 'sortBy' || field === 'sortDirection') {
      fetchAllProducts()
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0)
  }

  const getStockStatusChip = (status) => {
    const config = {
      'NORMAL': { color: 'success', icon: <CheckCircle fontSize="small" />, label: 'In Stock' },
      'LOW': { color: 'warning', icon: <Warning fontSize="small" />, label: 'Low Stock' },
      'OUT_OF_STOCK': { color: 'error', icon: <Cancel fontSize="small" />, label: 'Out of Stock' }
    }
    const statusConfig = config[status] || config['NORMAL']
    
    return (
      <Chip
        size="small"
        color={statusConfig.color}
        icon={statusConfig.icon}
        label={statusConfig.label}
      />
    )
  }

  const displayedProducts = showPagination
    ? filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : filteredProducts

  const maxValue = Math.max(...(allProducts.map(p => parseFloat(p.totalValue)) || [1]))

  return (
    <Box>
      {showFilters && (
        <Box display="flex" gap={2} mb={2}>
          <TextField
            size="small"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
            sx={{ flexGrow: 1, maxWidth: 300 }}
          />
          <TextField
            select
            size="small"
            label="Stock Status"
            value={filters.stockStatus}
            onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="ALL">All Status</MenuItem>
            <MenuItem value="NORMAL">In Stock</MenuItem>
            <MenuItem value="LOW">Low Stock</MenuItem>
            <MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Sort By"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="totalValue">Total Value</MenuItem>
            <MenuItem value="name">Product Name</MenuItem>
            <MenuItem value="quantity">Quantity</MenuItem>
            <MenuItem value="unitPrice">Unit Price</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Order"
            value={filters.sortDirection}
            onChange={(e) => handleFilterChange('sortDirection', e.target.value)}
            sx={{ minWidth: 100 }}
          >
            <MenuItem value="ASC">Ascending</MenuItem>
            <MenuItem value="DESC">Descending</MenuItem>
          </TextField>
        </Box>
      )}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">Total Value</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell>Expiry</TableCell>
              <TableCell>Value Distribution</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : displayedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No products found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              displayedProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{product.name}</Typography>
                      {product.code && (
                        <Typography variant="caption" color="text.secondary">
                          Code: {product.code}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{product.categoryName}</TableCell>
                  <TableCell align="right">{product.quantity.toLocaleString()}</TableCell>
                  <TableCell align="right">{formatCurrency(product.unitPrice)}</TableCell>
                  <TableCell align="right">
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(product.totalValue)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.percentageOfTotalValue?.toFixed(2)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {getStockStatusChip(product.stockStatus)}
                  </TableCell>
                  <TableCell>
                    {product.expiryDate ? (
                      <Box>
                        <Typography 
                          variant="caption" 
                          color={product.isExpiringSoon ? 'error' : 'text.primary'}
                        >
                          {new Date(product.expiryDate).toLocaleDateString()}
                        </Typography>
                        {product.isExpiringSoon && (
                          <Typography variant="caption" color="error" display="block">
                            Expiring Soon
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No expiry
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: 100 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(parseFloat(product.totalValue) / maxValue) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'grey.200'
                        }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && (
        <TablePagination
          component="div"
          count={filteredProducts.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      )}
    </Box>
  )
}

export default ProductValuationTable