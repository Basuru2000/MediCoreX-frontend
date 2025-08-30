import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  InputAdornment,
  Tab,
  Tabs,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Fade,
  Grow,
  TextField,
  useTheme,
  alpha,
  Stack,
  Divider,
  Avatar,
  LinearProgress
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import {
  Add,
  Edit,
  Delete,
  Search,
  Warning,
  Inventory,
  LocalOffer,
  CalendarMonth,
  TrendingDown,
  Upload,
  QrCode,
  Print,
  QrCodeScanner,
  Layers,
  TrendingUp,
  ErrorOutline,
  CheckCircle,
  Close
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { 
  getProducts, 
  getLowStockProducts,
  getExpiringProducts,
  createProduct, 
  updateProduct, 
  deleteProduct,
  getCategories,
  searchProducts,
  getProductByBarcode,
  scanBarcode
} from '../services/api'
import ProductForm from '../components/products/ProductForm'
import ProductImportExport from '../components/products/ProductImportExport'
import StockAdjustment from './StockAdjustment'
import BarcodeDisplay from '../components/products/BarcodeDisplay'
import QRCodeDisplay from '../components/products/QRCodeDisplay'
import BarcodeScanner from '../components/products/BarcodeScanner'
import BarcodePrintDialog from '../components/products/BarcodePrintDialog'
import BarcodeScanOptions from '../components/products/BarcodeScanOptions'
import BatchManagementDialog from '../components/batch/BatchManagementDialog'

function Products() {
  const theme = useTheme()
  const { isManager, isStaff } = useAuth()
  const [products, setProducts] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [expiringProducts, setExpiringProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openImportExport, setOpenImportExport] = useState(false)
  const [openStockDialog, setOpenStockDialog] = useState(false)
  const [openBarcodeDialog, setOpenBarcodeDialog] = useState(false)
  const [openPrintDialog, setOpenPrintDialog] = useState(false)
  const [openScanner, setOpenScanner] = useState(false)
  const [openScanOptions, setOpenScanOptions] = useState(false)
  const [batchDialogOpen, setBatchDialogOpen] = useState(false)
  const [selectedProductForBatch, setSelectedProductForBatch] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(100)  // Changed from 10 to 100
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [outOfStockProducts, setOutOfStockProducts] = useState([])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchLowStockProducts()
    fetchExpiringProducts()
    fetchOutOfStockProducts()
  }, [page, pageSize])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await getProducts({ 
        page: page,  // Use current page state
        size: pageSize,  // Use current pageSize state
        sortBy: 'id',
        sortDirection: 'DESC'
      })
      
      if (response.data) {
        setProducts(response.data.content)
        setTotalElements(response.data.totalElements)
        setTotalPages(response.data.totalPages)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      showSnackbar('Failed to fetch products', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await getCategories()
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchLowStockProducts = async () => {
    try {
      const response = await getLowStockProducts()
      setLowStockProducts(response.data)
    } catch (error) {
      console.error('Error fetching low stock products:', error)
    }
  }

  const fetchExpiringProducts = async () => {
    try {
      const response = await getExpiringProducts()
      setExpiringProducts(response.data)
    } catch (error) {
      console.error('Error fetching expiring products:', error)
    }
  }

  const fetchOutOfStockProducts = async () => {
    try {
      const response = await getProducts({ page: 0, size: 1000 })
      const outOfStock = response.data.content.filter(product => product.quantity === 0)
      setOutOfStockProducts(outOfStock)
    } catch (error) {
      console.error('Error fetching out of stock products:', error)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    setPage(0)  // Reset to first page when changing tabs
    
    // For different tabs, use different pagination modes
    if (newValue === 0) {
      // All Products - already fetched with server pagination
      fetchProducts()
    } else if (newValue === 1) {
      // Low Stock - client-side data
      fetchLowStockProducts()
    } else if (newValue === 2) {
      // Expiring Soon - client-side data
      fetchExpiringProducts()
    } else if (newValue === 3) {
      // Out of Stock - filter from products
      const outOfStock = products.filter(p => p.quantity === 0)
      setOutOfStockProducts(outOfStock)
    }
  }

  const handleOpenDialog = (product = null) => {
    setEditingProduct(product)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingProduct(null)
  }

  const handleSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData)
        showSnackbar('Product updated successfully', 'success')
      } else {
        await createProduct(formData)
        showSnackbar('Product created successfully', 'success')
      }
      fetchProducts()
      handleCloseDialog()
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error saving product', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id)
        showSnackbar('Product deleted successfully', 'success')
        fetchProducts()
      } catch (error) {
        showSnackbar(error.response?.data?.message || 'Error deleting product', 'error')
      }
    }
  }

  const handleStockAdjustment = (product) => {
    setSelectedProduct(product)
    setOpenStockDialog(true)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchProducts()
      return
    }

    try {
      setLoading(true)
      const response = await searchProducts(searchQuery)
      
      // Apply the search to the current tab
      if (tabValue === 0) {
        setProducts(response.data)
      } else if (tabValue === 1) {
        const filtered = response.data.filter(p => p.quantity <= p.minStockLevel)
        setLowStockProducts(filtered)
      } else if (tabValue === 2) {
        const filtered = response.data.filter(p => {
          if (!p.expiryDate) return false
          const daysUntilExpiry = Math.ceil(
            (new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
          )
          return daysUntilExpiry <= 30 && daysUntilExpiry > 0
        })
        setExpiringProducts(filtered)
      } else {
        const filtered = response.data.filter(p => p.quantity === 0)
        setOutOfStockProducts(filtered)
      }
    } catch (error) {
      showSnackbar('Error searching products', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Add debounced search for auto-suggest
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch()
      } else {
        // Reset to original data when search is cleared
        fetchProducts()
        fetchLowStockProducts()
        fetchExpiringProducts()
        fetchOutOfStockProducts()
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handlePrintBarcodes = () => {
    // Get current visible products based on active tab
    const currentProducts = tabValue === 0 ? products : 
                           tabValue === 1 ? lowStockProducts : 
                           tabValue === 2 ? expiringProducts : 
                           outOfStockProducts
    
    if (currentProducts.length === 0) {
      showSnackbar('No products available to print', 'warning')
      return
    }
    setOpenPrintDialog(true)
  }

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity })
  }

  const getStockStatusColor = (status) => {
    switch(status) {
      case 'LOW': return 'warning'
      case 'OUT_OF_STOCK': return 'error'
      default: return 'success'
    }
  }

  const getStockStatusIcon = (status) => {
    switch(status) {
      case 'LOW': return <Warning />
      case 'OUT_OF_STOCK': return <ErrorOutline />
      default: return <CheckCircle />
    }
  }

  const columns = [
    {
      field: 'imageUrl',
      headerName: '',
      width: 50,
      sortable: false,
      renderCell: (params) => (
        <Avatar
          src={params.value ? `http://localhost:8080${params.value}` : null}
          variant="rounded"
          sx={{ width: 36, height: 36 }}
        >
          <Inventory sx={{ fontSize: 16 }} />
        </Avatar>
      )
    },
    {
      field: 'id',
      headerName: 'ID',
      width: 60,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          #{params.value}
        </Typography>
      )
    },
    {
      field: 'code',
      headerName: 'Code',
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'N/A'} 
          size="small" 
          variant="outlined"
          sx={{ fontSize: '0.75rem' }}
        />
      )
    },
    {
      field: 'name',
      headerName: 'Product Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.barcode}
          </Typography>
        </Box>
      )
    },
    {
      field: 'categoryName',
      headerName: 'Category',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small"
          sx={{ 
            borderRadius: '8px',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            fontSize: '0.75rem'
          }}
        />
      )
    },
    {
      field: 'quantity',
      headerName: 'Stock',
      width: 100,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.unit}
          </Typography>
        </Box>
      )
    },
    {
      field: 'stockStatus',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={getStockStatusIcon(params.value)}
          label={params.value?.replace('_', ' ')}
          size="small"
          color={getStockStatusColor(params.value)}
          sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
        />
      )
    },
    {
      field: 'unitPrice',
      headerName: 'Price',
      width: 90,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          ${params.value?.toFixed(2)}
        </Typography>
      )
    },
    {
      field: 'expiryDate',
      headerName: 'Expiry',
      width: 110,
      renderCell: (params) => params.value ? (
        <Box>
          <Typography variant="caption" color={params.row.isExpiringSoon ? 'error' : 'text.secondary'}>
            {new Date(params.value).toLocaleDateString()}
          </Typography>
          {params.row.isExpiringSoon && (
            <Chip 
              label="Soon" 
              size="small" 
              color="error"
              sx={{ ml: 0.5, height: 18, fontSize: '0.7rem' }}
            />
          )}
        </Box>
      ) : '-'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Batches">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedProductForBatch(params.row)
                setBatchDialogOpen(true)
              }}
              sx={{ 
                color: theme.palette.primary.main,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
              }}
            >
              <Layers sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Stock">
            <IconButton
              size="small"
              onClick={() => handleStockAdjustment(params.row)}
              sx={{ 
                color: theme.palette.info.main,
                '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.1) }
              }}
            >
              <Inventory sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(params.row)}
              sx={{ 
                color: theme.palette.success.main,
                '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1) }
              }}
            >
              <Edit sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          {isManager && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => handleDelete(params.row.id)}
                sx={{ 
                  color: theme.palette.error.main,
                  '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                }}
              >
                <Delete sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      )
    }
  ]

  const renderSummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card 
          elevation={0}
          sx={{ 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '12px',
            height: '140px',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[4]
            }
          }}
          onClick={() => setTabValue(0)}
        >
          <CardContent sx={{ height: '100%', p: 3 }}>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Inventory sx={{ color: theme.palette.primary.main }} />
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {totalElements}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Total Products
                </Typography>
                <Typography variant="caption" color="success.main">
                  All inventory items
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card 
          elevation={0}
          sx={{ 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '12px',
            height: '140px',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[4]
            }
          }}
          onClick={() => setTabValue(1)}
        >
          <CardContent sx={{ height: '100%', p: 3 }}>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <TrendingDown sx={{ color: theme.palette.warning.main }} />
                </Box>
                <Typography variant="h4" fontWeight={600} color="warning.main">
                  {lowStockProducts.length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Low Stock Items
                </Typography>
                <Typography variant="caption" color="warning.main">
                  Requires attention
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card 
          elevation={0}
          sx={{ 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '12px',
            height: '140px',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[4]
            }
          }}
          onClick={() => setTabValue(2)}
        >
          <CardContent sx={{ height: '100%', p: 3 }}>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CalendarMonth sx={{ color: theme.palette.error.main }} />
                </Box>
                <Typography variant="h4" fontWeight={600} color="error.main">
                  {expiringProducts.length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Expiring Soon
                </Typography>
                <Typography variant="caption" color="error.main">
                  Within 30 days
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card 
          elevation={0}
          sx={{ 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '12px',
            height: '140px',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[4]
            }
          }}
          onClick={() => setTabValue(3)}
        >
          <CardContent sx={{ height: '100%', p: 3 }}>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ErrorOutline sx={{ color: theme.palette.error.main }} />
                </Box>
                <Typography variant="h4" fontWeight={600} color="error.main">
                  {outOfStockProducts.length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Out of Stock
                </Typography>
                <Typography variant="caption" color="error.main">
                  Immediate action needed
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  return (
    <Fade in timeout={300}>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Product Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your inventory, track stock levels, and monitor expiring products
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button
              variant="outlined"
              startIcon={<QrCodeScanner />}
              onClick={() => setOpenScanOptions(true)}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              Scan
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={handlePrintBarcodes}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              Print
            </Button>
            <Button
              variant="outlined"
              startIcon={<Upload />}
              onClick={() => setOpenImportExport(true)}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              Import/Export
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              Add Product
            </Button>
          </Stack>
        </Box>

        {/* Summary Cards */}
        {renderSummaryCards()}

        {/* Search and Tabs Section */}
        <Paper 
          elevation={0}
          sx={{ 
            mb: 3,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 2, bgcolor: theme.palette.grey[50] }}>
            <TextField
              fullWidth
              placeholder="Search products by name, code, barcode or manufacturer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => { setSearchQuery(''); }}>
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: 'background.paper',
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.divider
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main
                  }
                }
              }}
            />
          </Box>
          <Divider />
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              px: 2,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
                minHeight: 48
              }
            }}
          >
            <Tab label={`All Products (${totalElements})`} />
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  Low Stock
                  <Chip 
                    label={lowStockProducts.length} 
                    size="small" 
                    color="warning"
                    sx={{ height: 20 }}
                  />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  Expiring Soon
                  <Chip 
                    label={expiringProducts.length} 
                    size="small" 
                    color="error"
                    sx={{ height: 20 }}
                  />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  Out of Stock
                  <Chip 
                    label={outOfStockProducts.length} 
                    size="small" 
                    color="error"
                    sx={{ height: 20 }}
                  />
                </Box>
              } 
            />
          </Tabs>
        </Paper>

        {/* Data Grid */}
        <Grow in timeout={400}>
          <Paper 
            elevation={0}
            sx={{ 
              height: '70vh',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            <DataGrid
              rows={(() => {
                switch(tabValue) {
                  case 0: return products  // All Products
                  case 1: return lowStockProducts  // Low Stock
                  case 2: return expiringProducts  // Expiring Soon
                  case 3: return outOfStockProducts  // Out of Stock
                  default: return products
                }
              })()}
              columns={columns}
              pageSize={pageSize}
              rowsPerPageOptions={[10, 25, 50, 100]}  // Add 100 as an option
              loading={loading}
              pagination
              paginationMode={tabValue === 0 ? "server" : "client"}  // Server for All Products, client for others
              rowCount={(() => {
                switch(tabValue) {
                  case 0: return totalElements  // Server-side total
                  case 1: return lowStockProducts.length
                  case 2: return expiringProducts.length
                  case 3: return outOfStockProducts.length
                  default: return 0
                }
              })()}
              page={page}
              onPageChange={(newPage) => {
                setPage(newPage)
              }}
              onPageSizeChange={(newPageSize) => {
                setPageSize(newPageSize)
                setPage(0)  // Reset to first page
              }}
              disableSelectionOnClick
              getRowId={(row) => row.id}  // Ensure unique row IDs
              autoHeight={false}
              sx={{
                height: '70vh',  // Set a specific height
                minHeight: 500,
                maxHeight: 800,
                '& .MuiDataGrid-virtualScroller': {
                  minHeight: 400
                },
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: theme.palette.grey[50],
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  fontSize: '0.875rem',
                  fontWeight: 600
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  fontSize: '0.875rem'
                },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.02)
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.grey[50]
                }
              }}
            />
          </Paper>
        </Grow>

        {/* Dialogs */}
        {openDialog && (
          <ProductForm
            open={openDialog}
            onClose={handleCloseDialog}
            onSubmit={handleSubmit}
            product={editingProduct}
            categories={categories}
          />
        )}

        {openImportExport && (
          <ProductImportExport
            open={openImportExport}
            onClose={() => setOpenImportExport(false)}
            currentFilter={tabValue === 0 ? 'all' : tabValue === 1 ? 'low-stock' : tabValue === 2 ? 'expiring' : 'out-of-stock'}
            onImportSuccess={() => {
              // Close the dialog first
              setOpenImportExport(false)
              
              // Reset to first page and fetch
              setPage(0)
              setTabValue(0)  // Switch to "All Products" tab
              
              // Fetch products after a short delay to ensure backend processing is complete
              setTimeout(() => {
                fetchProducts()
                fetchLowStockProducts()
                fetchExpiringProducts()
                
                setSnackbar({
                  open: true,
                  message: 'Products imported successfully',
                  severity: 'success'
                })
              }, 500)
            }}
          />
        )}

        {openStockDialog && selectedProduct && (
          <StockAdjustment
            open={openStockDialog}
            onClose={() => {
              setOpenStockDialog(false)
              setSelectedProduct(null)
            }}
            product={selectedProduct}
            onSuccess={fetchProducts}
          />
        )}

        {openBarcodeDialog && selectedProduct && (
          <BarcodeDisplay
            open={openBarcodeDialog}
            onClose={() => setOpenBarcodeDialog(false)}
            product={selectedProduct}
          />
        )}

        {openScanner && (
          <BarcodeScanner
            open={openScanner}
            onClose={() => setOpenScanner(false)}
            onScan={async (barcode) => {
              try {
                const response = await getProductByBarcode(barcode)
                handleOpenDialog(response.data)
                setOpenScanner(false)
              } catch (error) {
                showSnackbar('Product not found', 'error')
              }
            }}
          />
        )}

        {openScanOptions && (
          <BarcodeScanOptions
            open={openScanOptions}
            onClose={() => setOpenScanOptions(false)}
            onCameraSelect={() => {
              setOpenScanOptions(false)
              setOpenScanner(true)
            }}
            onImageUpload={async (file) => {
              // Handle barcode image upload
              setOpenScanOptions(false)
              showSnackbar('Processing image for barcode...', 'info')
              // In a real implementation, you would process the image here
            }}
          />
        )}

        {openPrintDialog && (
          <BarcodePrintDialog
            open={openPrintDialog}
            onClose={() => setOpenPrintDialog(false)}
            products={tabValue === 0 ? products : tabValue === 1 ? lowStockProducts : tabValue === 2 ? expiringProducts : outOfStockProducts}
          />
        )}

        {batchDialogOpen && (
          <BatchManagementDialog
            open={batchDialogOpen}
            onClose={() => {
              setBatchDialogOpen(false)
              setSelectedProductForBatch(null)
            }}
            product={selectedProductForBatch}
            onBatchUpdate={fetchProducts}
          />
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ borderRadius: '8px' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  )
}

export default Products