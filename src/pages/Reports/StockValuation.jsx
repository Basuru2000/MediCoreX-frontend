import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Tab,
  Tabs
} from '@mui/material'
import {
  Download,
  Refresh,
  Print,
  TrendingUp,
  Category,
  Inventory
} from '@mui/icons-material'
import {
  getStockValuationReport,
  getValuationSummary,
  exportStockValuationCSV,
  exportCategoryValuationCSV
} from '../../services/api'
import ValuationSummaryCards from './components/ValuationSummaryCards'
import CategoryValuationChart from './components/CategoryValuationChart'
import ProductValuationTable from './components/ProductValuationTable'

function StockValuation() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  const [valuationData, setValuationData] = useState(null)
  const [summaryCards, setSummaryCards] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [reportResponse, summaryResponse] = await Promise.all([
        getStockValuationReport(),
        getValuationSummary()
      ])

      setValuationData(reportResponse.data)
      setSummaryCards(summaryResponse.data)
    } catch (err) {
      setError('Failed to load valuation data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async (type) => {
    try {
      const response = type === 'products' 
        ? await exportStockValuationCSV()
        : await exportCategoryValuationCSV()
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_valuation_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to export data')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={fetchData} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Stock Valuation Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generated at: {valuationData && new Date(valuationData.generatedAt).toLocaleString()}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchData} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print Report">
            <IconButton onClick={handlePrint} color="primary">
              <Print />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary Cards */}
      <ValuationSummaryCards summaryCards={summaryCards} />

      {/* Main Content with Tabs */}
      <Paper sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab icon={<TrendingUp />} label="Overview" />
          <Tab icon={<Category />} label="Category Analysis" />
          <Tab icon={<Inventory />} label="Product Details" />
        </Tabs>

        {/* Overview Tab */}
        {tabValue === 0 && valuationData && (
          <Box p={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Stock Status Distribution
                    </Typography>
                    <Box>
                      {Object.entries(valuationData.stockStatusCount).map(([status, count]) => (
                        <Box key={status} display="flex" justifyContent="space-between" mb={1}>
                          <Typography>{status.replace('_', ' ')}</Typography>
                          <Box>
                            <Typography component="span" fontWeight="bold">
                              {count} products
                            </Typography>
                            <Typography component="span" color="text.secondary" sx={{ ml: 2 }}>
                              ({formatCurrency(valuationData.stockStatusValue[status])})
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Key Metrics
                    </Typography>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography>Total Products</Typography>
                        <Typography fontWeight="bold">{valuationData.totalProducts}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography>Total Categories</Typography>
                        <Typography fontWeight="bold">{valuationData.totalCategories}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography>Total Quantity</Typography>
                        <Typography fontWeight="bold">{valuationData.totalQuantity.toLocaleString()}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography>Low Stock Items</Typography>
                        <Typography fontWeight="bold" color="warning.main">
                          {valuationData.lowStockProductsCount} ({formatCurrency(valuationData.lowStockProductsValue)})
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography>Expiring Soon</Typography>
                        <Typography fontWeight="bold" color="error.main">
                          {valuationData.expiringProductsCount} ({formatCurrency(valuationData.expiringProductsValue)})
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        Top 10 Products by Value
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<Download />}
                        onClick={() => handleExportCSV('products')}
                      >
                        Export All Products
                      </Button>
                    </Box>
                    <ProductValuationTable 
                      products={valuationData.topProductsByValue}
                      showPagination={false}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Category Analysis Tab */}
        {tabValue === 1 && valuationData && (
          <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                Category-wise Valuation Analysis
              </Typography>
              <Button
                size="small"
                startIcon={<Download />}
                onClick={() => handleExportCSV('categories')}
              >
                Export Category Report
              </Button>
            </Box>
            <CategoryValuationChart 
              categories={valuationData.categoryValuations}
              totalValue={valuationData.totalInventoryValue}
            />
          </Box>
        )}

        {/* Product Details Tab */}
        {tabValue === 2 && (
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              All Products Valuation
            </Typography>
            <ProductValuationTable 
              showPagination={true}
              showFilters={true}
            />
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default StockValuation