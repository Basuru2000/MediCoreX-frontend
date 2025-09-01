import React, { useState, useEffect } from 'react'
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
  Chip,
  Fade,
  Grow,
  useTheme,
  alpha,
  Divider,
  Snackbar,
  Stack,
  LinearProgress
} from '@mui/material'
import {
  Download,
  Refresh,
  Print,
  Category,
  Assessment,
  TrendingUp,
  PieChart as PieChartIcon,
  TableChart,
  CompareArrows
} from '@mui/icons-material'
import {
  getCategoryValuation,
  exportCategoryValuationCSV
} from '../../services/api'
import CategoryValuationChart from './components/CategoryValuationChart'

function CategoryValuation() {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [categoryData, setCategoryData] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  const [exporting, setExporting] = useState(false)

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
      setExporting(true)
      const response = await exportCategoryValuationCSV()
      
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `category_valuation_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      setSuccess('Report exported successfully')
    } catch (err) {
      setError('Failed to export report')
    } finally {
      setExporting(false)
    }
  }

  const handlePrint = () => {
    window.print()
    setSuccess('Print dialog opened')
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)
  }

  // Calculate summary statistics
  const activeCategories = categoryData?.filter(cat => cat.productCount > 0).length || 0
  const totalCategories = categoryData?.length || 0 // This might be only categories with products from API
  const totalValue = categoryData?.reduce((sum, cat) => sum + (cat.totalValue || 0), 0) || 0
  const totalProducts = categoryData?.reduce((sum, cat) => sum + (cat.productCount || 0), 0) || 0
  const topCategory = categoryData?.sort((a, b) => b.totalValue - a.totalValue)[0]
  const avgCategoryValue = activeCategories > 0 ? totalValue / activeCategories : 0

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Fade in={true}>
      <Box>
        {/* Page Header */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 4
          }}
        >
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.5
              }}
            >
              Category Valuation Report
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: 'text.secondary' }}
            >
              Analyze inventory value distribution across categories
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh" arrow>
              <IconButton 
                onClick={fetchCategoryData}
                sx={{
                  bgcolor: 'background.paper',
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': { 
                    bgcolor: theme.palette.action.hover,
                    borderColor: theme.palette.primary.main
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print Report" arrow>
              <IconButton 
                onClick={handlePrint}
                sx={{
                  bgcolor: 'background.paper',
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': { 
                    bgcolor: theme.palette.action.hover,
                    borderColor: theme.palette.primary.main
                  }
                }}
              >
                <Print />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExportCSV}
              disabled={exporting}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: 'none',
                px: 3,
                '&:hover': {
                  boxShadow: 'none'
                }
              }}
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          </Box>
        </Box>

        {/* Alerts */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Snackbar>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Grow in={true} timeout={500}>
              <Card 
                sx={{ 
                  height: '100%',
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: theme.palette.primary.main
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          mb: 1,
                          fontSize: '0.875rem'
                        }}
                      >
                        Active Categories
                      </Typography>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700,
                          color: 'text.primary'
                        }}
                      >
                        {activeCategories}
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        width: 48,
                        height: 48,
                        borderRadius: '8px',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Category sx={{ color: 'primary.main', fontSize: 24 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Grow in={true} timeout={600}>
              <Card 
                sx={{ 
                  height: '100%',
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: theme.palette.secondary.main
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          mb: 1,
                          fontSize: '0.875rem'
                        }}
                      >
                        Total Products
                      </Typography>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700,
                          color: 'text.primary'
                        }}
                      >
                        {totalProducts}
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        width: 48,
                        height: 48,
                        borderRadius: '8px',
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Assessment sx={{ color: 'secondary.main', fontSize: 24 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Grow in={true} timeout={700}>
              <Card 
                sx={{ 
                  height: '100%',
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: theme.palette.success.main
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          mb: 1,
                          fontSize: '0.875rem'
                        }}
                      >
                        Total Value
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 700,
                          color: 'text.primary'
                        }}
                      >
                        {formatCurrency(totalValue)}
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        width: 48,
                        height: 48,
                        borderRadius: '8px',
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <TrendingUp sx={{ color: 'success.main', fontSize: 24 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Grow in={true} timeout={800}>
              <Card 
                sx={{ 
                  height: '100%',
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: theme.palette.info.main
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        mb: 1,
                        fontSize: '0.875rem'
                      }}
                    >
                      Top Category
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 0.5,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {topCategory?.categoryName || 'N/A'}
                    </Typography>
                    {topCategory && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'success.main',
                          fontWeight: 500
                        }}
                      >
                        {formatCurrency(topCategory.totalValue)}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>

        {/* Main Content with Tabs */}
        <Paper 
          sx={{ 
            borderRadius: '8px',
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={(e, v) => setTabValue(v)}
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 48
              }
            }}
          >
            <Tab icon={<PieChartIcon fontSize="small" />} iconPosition="start" label="Visual Analysis" />
            <Tab icon={<TableChart fontSize="small" />} iconPosition="start" label="Detailed Table" />
            <Tab icon={<CompareArrows fontSize="small" />} iconPosition="start" label="Comparison" />
          </Tabs>

          {/* Visual Analysis Tab */}
          {tabValue === 0 && categoryData && (
            <Box sx={{ p: 3 }}>
              <CategoryValuationChart 
                categories={categoryData}
                totalValue={totalValue}
              />
            </Box>
          )}

          {/* Detailed Table Tab */}
          {tabValue === 1 && categoryData && (
            <Box sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ fontWeight: 600, mb: 3 }}
              >
                Category Details
              </Typography>
              <TableContainer 
                component={Paper} 
                variant="outlined"
                sx={{ 
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Category Name</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Products</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Total Quantity</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Total Value</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>% of Total</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Avg Value/Product</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryData
                      .sort((a, b) => b.totalValue - a.totalValue)
                      .map((category) => {
                        const percentage = ((category.totalValue / totalValue) * 100).toFixed(1)
                        const avgValue = category.productCount > 0 
                          ? category.totalValue / category.productCount 
                          : 0
                        
                        return (
                          <TableRow 
                            key={category.categoryId}
                            sx={{ 
                              '&:hover': { 
                                bgcolor: alpha(theme.palette.primary.main, 0.02) 
                              }
                            }}
                          >
                            <TableCell align="center">
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {category.categoryName}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">{category.productCount}</TableCell>
                            <TableCell align="center">{category.totalQuantity.toLocaleString()}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>
                              {formatCurrency(category.totalValue)}
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={parseFloat(percentage)}
                                  sx={{
                                    width: 60,
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 3,
                                      bgcolor: theme.palette.primary.main
                                    }
                                  }}
                                />
                                <Typography variant="body2">{percentage}%</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">{formatCurrency(avgValue)}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={category.productCount > 0 ? 'Active' : 'Empty'}
                                size="small"
                                color={category.productCount > 0 ? 'success' : 'default'}
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Comparison Tab */}
          {tabValue === 2 && categoryData && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Top 5 by Value */}
                <Grid item xs={12} md={6}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      minHeight: 400,
                      boxShadow: 'none',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '8px'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ fontWeight: 600, mb: 3 }}
                      >
                        Top 5 Categories by Value
                      </Typography>
                      <Stack spacing={2}>
                        {categoryData
                          .sort((a, b) => b.totalValue - a.totalValue)
                          .slice(0, 5)
                          .map((cat, index) => (
                            <Box key={cat.categoryId}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip 
                                    label={`#${index + 1}`} 
                                    size="small"
                                    sx={{ 
                                      fontWeight: 600,
                                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                                      color: 'primary.main'
                                    }}
                                  />
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {cat.categoryName}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {formatCurrency(cat.totalValue)}
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={(cat.totalValue / categoryData[0].totalValue) * 100}
                                sx={{
                                  height: 4,
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 2,
                                    bgcolor: theme.palette.primary.main
                                  }
                                }}
                              />
                            </Box>
                          ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Top 5 by Product Count */}
                <Grid item xs={12} md={6}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      minHeight: 400,
                      boxShadow: 'none',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '8px'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ fontWeight: 600, mb: 3 }}
                      >
                        Top 5 Categories by Product Count
                      </Typography>
                      <Stack spacing={2}>
                        {categoryData
                          .sort((a, b) => b.productCount - a.productCount)
                          .slice(0, 5)
                          .map((cat, index) => (
                            <Box key={cat.categoryId}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip 
                                    label={`#${index + 1}`} 
                                    size="small"
                                    sx={{ 
                                      fontWeight: 600,
                                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                      color: 'secondary.main'
                                    }}
                                  />
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {cat.categoryName}
                                  </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {cat.productCount} products
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Avg: {formatCurrency(cat.totalValue / cat.productCount)}
                                  </Typography>
                                </Box>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={(cat.productCount / categoryData[0].productCount) * 100}
                                sx={{
                                  height: 4,
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 2,
                                    bgcolor: theme.palette.secondary.main
                                  }
                                }}
                              />
                            </Box>
                          ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Quick Stats */}
                <Grid item xs={12}>
                  <Card 
                    sx={{ 
                      boxShadow: 'none',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '8px'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ fontWeight: 600, mb: 3 }}
                      >
                        Quick Statistics
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Average Category Value
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {formatCurrency(avgCategoryValue)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Active Categories
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {activeCategories} / {totalCategories}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Avg Products per Active Category
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {activeCategories > 0 ? Math.round(totalProducts / activeCategories) : 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Empty Categories
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'warning.main' }}>
                              {categoryData.filter(c => c.productCount === 0).length}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>
    </Fade>
  )
}

export default CategoryValuation