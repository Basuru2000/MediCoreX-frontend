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
  Typography,
  Box,
  Chip,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
  Skeleton,
  useTheme,
  alpha,
  Stack,
  LinearProgress,
  CircularProgress
} from '@mui/material'
import {
  Search,
  Clear,
  CheckCircle,
  Warning,
  Cancel,
  TrendingUp,
  TrendingDown,
  Remove
} from '@mui/icons-material'
import { getProductValuation } from '../../../services/api'

function ProductValuationTable({ 
  products = null, 
  showPagination = true, 
  showFilters = false,
  displayMode = 'full' // 'full' or 'compact' 
}) {
  const theme = useTheme()
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'totalValue',
    sortDirection: 'DESC',
    stockStatus: 'ALL'
  })

  useEffect(() => {
    if (!products && showPagination) {
      fetchAllProducts()
    } else if (products) {
      setAllProducts(products)
    }
  }, [products, showPagination])

  const fetchAllProducts = async () => {
    try {
      setLoading(true)
      const response = await getProductValuation({
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection
      })
      setAllProducts(response.data || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setAllProducts([])
    } finally {
      setLoading(false)
    }
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
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0)
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value || 0)
  }

  const getStockStatusChip = (status) => {
    const config = {
      'NORMAL': { 
        color: 'success', 
        icon: <CheckCircle sx={{ fontSize: 14 }} />, 
        label: 'In Stock',
        bgcolor: alpha(theme.palette.success.main, 0.1)
      },
      'LOW': { 
        color: 'warning', 
        icon: <Warning sx={{ fontSize: 14 }} />, 
        label: 'Low Stock',
        bgcolor: alpha(theme.palette.warning.main, 0.1)
      },
      'OUT_OF_STOCK': { 
        color: 'error', 
        icon: <Cancel sx={{ fontSize: 14 }} />, 
        label: 'Out of Stock',
        bgcolor: alpha(theme.palette.error.main, 0.1)
      }
    }
    const statusConfig = config[status] || config['NORMAL']
    
    return (
      <Chip
        size="small"
        icon={statusConfig.icon}
        label={statusConfig.label}
        sx={{
          fontWeight: 500,
          bgcolor: statusConfig.bgcolor,
          color: theme.palette[statusConfig.color].main,
          border: `1px solid ${alpha(theme.palette[statusConfig.color].main, 0.3)}`,
          '& .MuiChip-icon': {
            color: theme.palette[statusConfig.color].main
          }
        }}
      />
    )
  }

  // Use products prop or allProducts from state
  let dataSource = products || allProducts || []

  // Apply filters
  let filteredProducts = [...dataSource]
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filteredProducts = filteredProducts.filter(product =>
      product.name?.toLowerCase().includes(searchLower) ||
      product.code?.toLowerCase().includes(searchLower) ||
      product.categoryName?.toLowerCase().includes(searchLower)
    )
  }

  if (filters.stockStatus !== 'ALL') {
    filteredProducts = filteredProducts.filter(product => 
      product.stockStatus === filters.stockStatus
    )
  }

  // Pagination
  const displayedProducts = showPagination
    ? filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : filteredProducts

  const isCompactMode = displayMode === 'compact'

  // Calculate max value for distribution bars
  const maxValue = Math.max(...(dataSource.map(p => parseFloat(p.totalValue || 0)) || [1]))

  return (
    <Box>
      {/* Filters */}
      {showFilters && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              sx={{ 
                flex: 1, 
                maxWidth: 300,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={() => handleFilterChange('search', '')}
                    >
                      <Clear sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              select
              size="small"
              label="Stock Status"
              value={filters.stockStatus}
              onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
              sx={{ 
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
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
              sx={{ 
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            >
              <MenuItem value="totalValue">Total Value</MenuItem>
              <MenuItem value="quantity">Quantity</MenuItem>
              <MenuItem value="name">Product Name</MenuItem>
              <MenuItem value="unitPrice">Unit Price</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              label="Order"
              value={filters.sortDirection}
              onChange={(e) => handleFilterChange('sortDirection', e.target.value)}
              sx={{ 
                minWidth: 120,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            >
              <MenuItem value="DESC">High to Low</MenuItem>
              <MenuItem value="ASC">Low to High</MenuItem>
            </TextField>
          </Stack>
        </Box>
      )}

      {/* Table */}
      <TableContainer 
        component={Paper} 
        variant="outlined"
        sx={{ 
          borderRadius: '8px',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none'
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <TableCell align="center" sx={{ fontWeight: 600, width: '15%' }}>Product</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: '15%' }}>Category</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: '10%' }}>Quantity</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: '12%' }}>Unit Price</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: '15%' }}>Total Value</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: '12%' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: '12%' }}>Expiry</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: '15%' }}>Value Distribution</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  {[...Array(8)].map((_, cellIndex) => (
                    <TableCell key={cellIndex} align="center">
                      {cellIndex === 0 ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Skeleton variant="text" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : displayedProducts.length > 0 ? (
              displayedProducts.map((product) => (
                <TableRow 
                  key={product.id || product.productId}
                  sx={{ 
                    '&:hover': { 
                      bgcolor: alpha(theme.palette.primary.main, 0.02) 
                    },
                    '&:last-child td, &:last-child th': { 
                      border: 0 
                    }
                  }}
                >
                  {/* Same format for both tables */}
                  <TableCell align="center">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {product.name || 'Unnamed Product'}
                      </Typography>
                      {product.code && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Code: {product.code}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={product.categoryName || 'Uncategorized'}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: '6px' }}
                    />
                  </TableCell>
                  <TableCell align="center">{formatNumber(product.quantity || 0)}</TableCell>
                  <TableCell align="center">{formatCurrency(product.unitPrice || 0)}</TableCell>
                  <TableCell align="center">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {formatCurrency(product.totalValue || 0)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {product.percentageOfTotalValue?.toFixed(2) || '0.00'}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">{getStockStatusChip(product.stockStatus || 'NORMAL')}</TableCell>
                  <TableCell align="center">
                    {product.expiryDate ? (
                      <Box>
                        <Typography variant="caption">
                          {new Date(product.expiryDate).toLocaleDateString()}
                        </Typography>
                        {product.isExpiringSoon && (
                          <Typography variant="caption" sx={{ color: 'error.main', display: 'block' }}>
                            Expiring Soon
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        No expiry
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <LinearProgress
                      variant="determinate"
                      value={(parseFloat(product.totalValue || 0) / maxValue) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor: theme.palette.primary.main
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No products found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {showPagination && (
        <TablePagination
          component="div"
          count={filteredProducts.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            '.MuiTablePagination-toolbar': {
              minHeight: 56
            }
          }}
        />
      )}
    </Box>
  )
}

export default ProductValuationTable