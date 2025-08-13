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
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material'
import {
  Download,
  Refresh,
  Print,
  Category,
  Assessment,
  TrendingUp
} from '@mui/icons-material'
import {
  getCategoryValuation,
  exportCategoryValuationCSV
} from '../../services/api'
import CategoryValuationChart from './components/CategoryValuationChart'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts'

function CategoryValuation() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categoryData, setCategoryData] = useState(null)
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    fetchCategoryData()
  }, [])

  const fetchCategoryData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getCategoryValuation()
      setCategoryData(response.data)
    } catch (err) {
      setError('Failed to load category valuation data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await exportCategoryValuationCSV()
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `category_valuation_${new Date().toISOString().split('T')[0]}.csv`
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
        <Button onClick={fetchCategoryData} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    )
  }

  // Calculate summary statistics
  const totalCategories = categoryData?.length || 0
  const totalValue = categoryData?.reduce((sum, cat) => sum + (cat.totalValue || 0), 0) || 0
  const totalProducts = categoryData?.reduce((sum, cat) => sum + (cat.productCount || 0), 0) || 0
  const topCategory = categoryData?.sort((a, b) => b.totalValue - a.totalValue)[0]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Category Valuation Report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analyze inventory value distribution across categories
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchCategoryData} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print Report">
            <IconButton onClick={handlePrint} color="primary">
              <Print />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Categories
                  </Typography>
                  <Typography variant="h4">
                    {totalCategories}
                  </Typography>
                </Box>
                <Category color="primary" sx={{ fontSize: 40 }} />
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
                    Total Products
                  </Typography>
                  <Typography variant="h4">
                    {totalProducts}
                  </Typography>
                </Box>
                <Assessment color="secondary" sx={{ fontSize: 40 }} />
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
                    Total Value
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(totalValue)}
                  </Typography>
                </Box>
                <TrendingUp color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Top Category
                </Typography>
                <Typography variant="h6" noWrap>
                  {topCategory?.categoryName || 'N/A'}
                </Typography>
                <Typography variant="body2" color="success.main">
                  {topCategory ? formatCurrency(topCategory.totalValue) : '-'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Visual Analysis" />
          <Tab label="Detailed Table" />
          <Tab label="Comparison" />
        </Tabs>

        {/* Visual Analysis Tab */}
        {tabValue === 0 && categoryData && (
          <Box p={3}>
            <CategoryValuationChart 
              categories={categoryData}
              totalValue={totalValue}
            />
          </Box>
        )}

        {/* Detailed Table Tab */}
        {tabValue === 1 && categoryData && (
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Category Details
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Category Name</TableCell>
                    <TableCell align="right">Products</TableCell>
                    <TableCell align="right">Total Quantity</TableCell>
                    <TableCell align="right">Total Value</TableCell>
                    <TableCell align="right">% of Total</TableCell>
                    <TableCell align="right">Avg Value/Product</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoryData
                    .sort((a, b) => b.totalValue - a.totalValue)
                    .map((category, index) => (
                      <TableRow key={category.categoryId} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                bgcolor: COLORS[index % COLORS.length],
                                borderRadius: '50%',
                                mr: 1
                              }}
                            />
                            {category.categoryName}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{category.productCount}</TableCell>
                        <TableCell align="right">{category.totalQuantity?.toLocaleString()}</TableCell>
                        <TableCell align="right">{formatCurrency(category.totalValue)}</TableCell>
                        <TableCell align="right">
                          {category.percentageOfTotal?.toFixed(1)}%
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(category.averageProductValue)}
                        </TableCell>
                        <TableCell>
                          {category.percentageOfTotal > 30 ? (
                            <Chip label="High Value" color="success" size="small" />
                          ) : category.percentageOfTotal > 10 ? (
                            <Chip label="Medium Value" color="warning" size="small" />
                          ) : (
                            <Chip label="Low Value" color="default" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Comparison Tab */}
        {tabValue === 2 && categoryData && (
          <Box p={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Top 5 Categories by Value
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Value</TableCell>
                        <TableCell align="right">%</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categoryData
                        .sort((a, b) => b.totalValue - a.totalValue)
                        .slice(0, 5)
                        .map((cat) => (
                          <TableRow key={cat.categoryId}>
                            <TableCell>{cat.categoryName}</TableCell>
                            <TableCell align="right">{formatCurrency(cat.totalValue)}</TableCell>
                            <TableCell align="right">{cat.percentageOfTotal?.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Top 5 Categories by Product Count
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Products</TableCell>
                        <TableCell align="right">Avg Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categoryData
                        .sort((a, b) => b.productCount - a.productCount)
                        .slice(0, 5)
                        .map((cat) => (
                          <TableRow key={cat.categoryId}>
                            <TableCell>{cat.categoryName}</TableCell>
                            <TableCell align="right">{cat.productCount}</TableCell>
                            <TableCell align="right">{formatCurrency(cat.averageProductValue)}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Value Distribution Chart
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData.map(cat => ({
                        name: cat.categoryName,
                        value: cat.totalValue
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default CategoryValuation