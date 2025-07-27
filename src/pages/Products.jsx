import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  InputAdornment,
  Tab,
  Tabs,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Avatar
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
  QrCodeScanner
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

function Products() {
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
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [tabValue, setTabValue] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchLowStockProducts()
    fetchExpiringProducts()
  }, [page, pageSize])

  const fetchProducts = async () => {
    try {
      const response = await getProducts({ page, size: pageSize })
      setProducts(response.data.content)
      setTotalElements(response.data.totalElements)
    } catch (error) {
      showSnackbar('Failed to fetch products', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchLowStockProducts = async () => {
    try {
      const response = await getLowStockProducts()
      setLowStockProducts(response.data)
    } catch (error) {
      console.error('Failed to fetch low stock products', error)
    }
  }

  const fetchExpiringProducts = async () => {
    try {
      const response = await getExpiringProducts(30)
      setExpiringProducts(response.data)
    } catch (error) {
      console.error('Failed to fetch expiring products', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await getCategories()
      setCategories(response.data)
    } catch (error) {
      showSnackbar('Failed to fetch categories', 'error')
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchProducts()
      return
    }
    
    try {
      setLoading(true)
      const response = await searchProducts(searchQuery)
      setProducts(response.data)
    } catch (error) {
      showSnackbar('Failed to search products', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleBarcodeScan = async (barcode) => {
    try {
      const response = await getProductByBarcode(barcode)
      // Navigate to the product or show product details
      showSnackbar(`Found product: ${response.data.name}`, 'success')
      setSearchQuery(barcode)
      handleSearch()
    } catch (error) {
      showSnackbar('Product not found with this barcode', 'error')
    }
  }

  const handleCameraSelect = () => {
    setOpenScanner(true)
  }

  const handleImageUpload = async (file) => {
    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result
        
        try {
          // Send to backend for decoding
          const response = await scanBarcode({
            barcodeImage: base64
          })
          
          if (response.data) {
            // Navigate to the product or show product details
            showSnackbar(`Found product: ${response.data.name}`, 'success')
            setSearchQuery(response.data.barcode || response.data.code || response.data.name)
            handleSearch()
          }
        } catch (error) {
          if (error.response?.status === 404) {
            showSnackbar('No product found with this barcode', 'warning')
          } else {
            showSnackbar('Failed to decode barcode from image. Please ensure the image is clear and contains a valid barcode.', 'error')
          }
        }
      }
      reader.onerror = () => {
        throw new Error('Failed to read file')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      throw error
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
      handleCloseDialog()
      fetchProducts()
      fetchLowStockProducts()
      fetchExpiringProducts()
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Operation failed', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id)
        showSnackbar('Product deleted successfully', 'success')
        fetchProducts()
        fetchLowStockProducts()
        fetchExpiringProducts()
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           'Failed to delete product'
        showSnackbar(errorMessage, 'error')
      }
    }
  }

  const handleStockAdjustment = (product) => {
    setSelectedProduct(product)
    setOpenStockDialog(true)
  }

  const handleViewBarcode = (product) => {
    setSelectedProduct(product)
    setOpenBarcodeDialog(true)
  }

  const handlePrintBarcodes = () => {
    const productsWithBarcodes = products.filter(p => p.barcode)
    if (productsWithBarcodes.length === 0) {
      showSnackbar('No products with barcodes to print', 'warning')
      return
    }
    setSelectedProducts(productsWithBarcodes)
    setOpenPrintDialog(true)
  }

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity })
  }

  const getStockStatusChip = (status) => {
    const statusConfig = {
      'NORMAL': { color: 'success', label: 'In Stock' },
      'LOW': { color: 'warning', label: 'Low Stock' },
      'OUT_OF_STOCK': { color: 'error', label: 'Out of Stock' }
    }
    const config = statusConfig[status] || statusConfig['NORMAL']
    return <Chip label={config.label} color={config.color} size="small" />
  }

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'imageUrl',
      headerName: 'Image',
      width: 80,
      renderCell: (params) => (
        <Avatar
          src={params.value ? `http://localhost:8080${params.value}` : null}
          variant="rounded"
          sx={{ width: 40, height: 40 }}
        >
          {!params.value && params.row.name?.[0]}
        </Avatar>
      )
    },
    { field: 'code', headerName: 'Code', width: 100 },
    { 
      field: 'barcode', 
      headerName: 'Barcode', 
      width: 130,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2">{params.value || '-'}</Typography>
          {params.value && (
            <IconButton 
              size="small" 
              onClick={() => handleViewBarcode(params.row)}
            >
              <QrCode fontSize="small" />
            </IconButton>
          )}
        </Box>
      )
    },
    { field: 'name', headerName: 'Product Name', width: 200 },
    { field: 'categoryName', headerName: 'Category', width: 130 },
    { 
      field: 'quantity', 
      headerName: 'Stock', 
      width: 100,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          {params.value}
          {params.row.quantity <= params.row.minStockLevel && (
            <Warning color="warning" fontSize="small" sx={{ ml: 1 }} />
          )}
        </Box>
      )
    },
    { field: 'minStockLevel', headerName: 'Min Stock', width: 100 },
    { field: 'unit', headerName: 'Unit', width: 80 },
    { 
      field: 'unitPrice', 
      headerName: 'Price', 
      width: 100,
      valueFormatter: (params) => `$${params.value}`
    },
    {
      field: 'stockStatus',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => getStockStatusChip(params.value)
    },
    {
      field: 'expiryDate',
      headerName: 'Expiry Date',
      width: 120,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : '-'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <>
          <Tooltip title="Adjust Stock">
            <IconButton
              size="small"
              onClick={() => handleStockAdjustment(params.row)}
              color="primary"
            >
              <Inventory />
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog(params.row)}
            color="primary"
          >
            <Edit />
          </IconButton>
          {isManager && (
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.id)}
              color="error"
            >
              <Delete />
            </IconButton>
          )}
        </>
      )
    }
  ]

  const renderSummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Products
                </Typography>
                <Typography variant="h4">
                  {totalElements}
                </Typography>
              </Box>
              <Inventory color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Low Stock Items
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {lowStockProducts.length}
                </Typography>
              </Box>
              <TrendingDown color="warning" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Expiring Soon
                </Typography>
                <Typography variant="h4" color="error.main">
                  {expiringProducts.length}
                </Typography>
              </Box>
              <CalendarMonth color="error" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Categories
                </Typography>
                <Typography variant="h4">
                  {categories.length}
                </Typography>
              </Box>
              <LocalOffer color="secondary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Product Management</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<QrCodeScanner />}
            onClick={() => setOpenScanOptions(true)}
          >
            Scan Barcode
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrintBarcodes}
          >
            Print Barcodes
          </Button>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => setOpenImportExport(true)}
          >
            Import/Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {renderSummaryCards()}

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="All Products" />
          <Tab label="Low Stock" />
          <Tab label="Expiring Soon" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by name, code, barcode or manufacturer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch}>
                  <Search />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Paper>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={tabValue === 0 ? products : tabValue === 1 ? lowStockProducts : expiringProducts}
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={[10, 25, 50]}
          loading={loading}
          pagination
          paginationMode="server"
          rowCount={tabValue === 0 ? totalElements : tabValue === 1 ? lowStockProducts.length : expiringProducts.length}
          page={page}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          disableSelectionOnClick
        />
      </Paper>

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
          currentFilter={tabValue === 0 ? 'all' : tabValue === 1 ? 'lowstock' : 'expiring'}
          onImportSuccess={() => {
            setOpenImportExport(false)
            fetchProducts()
            fetchLowStockProducts()
            fetchExpiringProducts()
            showSnackbar('Products imported successfully', 'success')
          }}
        />
      )}

      {openStockDialog && (
        <StockAdjustment
          open={openStockDialog}
          onClose={() => {
            setOpenStockDialog(false)
            setSelectedProduct(null)
            fetchProducts()
          }}
          product={selectedProduct}
        />
      )}

      {/* Barcode Display Dialog */}
      <Dialog 
        open={openBarcodeDialog} 
        onClose={() => setOpenBarcodeDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Product Codes - {selectedProduct?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Barcode
              </Typography>
              <BarcodeDisplay
                barcode={selectedProduct?.barcode}
                productName={selectedProduct?.name}
                showActions={true}
                onPrint={() => {
                  setSelectedProducts([selectedProduct])
                  setOpenPrintDialog(true)
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                QR Code
              </Typography>
              <QRCodeDisplay
                qrCode={selectedProduct?.qrCode}
                productName={selectedProduct?.name}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBarcodeDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Barcode Scan Options Dialog */}
      <BarcodeScanOptions
        open={openScanOptions}
        onClose={() => setOpenScanOptions(false)}
        onCameraSelect={handleCameraSelect}
        onImageUpload={handleImageUpload}
      />

      {/* Barcode Scanner */}
      <BarcodeScanner
        open={openScanner}
        onClose={() => setOpenScanner(false)}
        onScan={handleBarcodeScan}
      />

      {/* Print Dialog */}
      <BarcodePrintDialog
        open={openPrintDialog}
        onClose={() => setOpenPrintDialog(false)}
        products={selectedProducts}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Products