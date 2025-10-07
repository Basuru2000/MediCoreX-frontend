import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Stack,
  useTheme,
  alpha
} from '@mui/material'
import {
  Refresh,
  FileDownload,
  Assessment,
  TrendingUp
} from '@mui/icons-material'
import MetricsCards from '../components/procurement-analytics/MetricsCards'
import POTrendChart from '../components/procurement-analytics/POTrendChart'
import TopSuppliersChart from '../components/procurement-analytics/TopSuppliersChart'
import POStatusDistribution from '../components/procurement-analytics/POStatusDistribution'
import {
  getProcurementMetrics,
  getPOTrends,
  getTopSuppliers,
  getStatusDistribution
} from '../services/api'

function ProcurementAnalytics() {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Data state
  const [metrics, setMetrics] = useState(null)
  const [trends, setTrends] = useState([])
  const [topSuppliers, setTopSuppliers] = useState([])
  const [statusDistribution, setStatusDistribution] = useState([])

  // Filter state
  const [dateRange, setDateRange] = useState('12months')
  const [supplierSortBy, setSupplierSortBy] = useState('value')
  const [supplierLimit, setSupplierLimit] = useState(10)

  useEffect(() => {
    fetchAllData()
  }, [dateRange, supplierSortBy, supplierLimit])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError('')

      // Calculate date range
      const endDate = new Date().toISOString().split('T')[0]
      let startDate
      switch(dateRange) {
        case '3months':
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          break
        case '6months':
          startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          break
        case '12months':
        default:
          startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }

      // Fetch metrics
      const metricsResponse = await getProcurementMetrics(startDate, endDate)
      setMetrics(metricsResponse.data)

      // Fetch trends
      const months = dateRange === '3months' ? 3 : dateRange === '6months' ? 6 : 12
      const trendsResponse = await getPOTrends(months)
      setTrends(trendsResponse.data)

      // Fetch top suppliers
      const suppliersResponse = await getTopSuppliers(supplierLimit, supplierSortBy)
      setTopSuppliers(suppliersResponse.data)

      // Fetch status distribution
      const statusResponse = await getStatusDistribution(startDate, endDate)
      setStatusDistribution(statusResponse.data)

    } catch (error) {
      console.error('Error fetching analytics data:', error)
      setError(error.response?.data?.message || 'Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchAllData()
  }

  const handleExport = () => {
    // Export functionality
    console.log('Export data')
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2rem' },
              color: theme.palette.text.primary,
              mb: 0.5
            }}
          >
            Procurement Analytics
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary
            }}
          >
            Comprehensive insights into purchase orders and supplier performance
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={handleExport}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
              }
            }}
          >
            Export
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Date Range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            >
              <MenuItem value="3months">Last 3 Months</MenuItem>
              <MenuItem value="6months">Last 6 Months</MenuItem>
              <MenuItem value="12months">Last 12 Months</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Supplier Sort By"
              value={supplierSortBy}
              onChange={(e) => setSupplierSortBy(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            >
              <MenuItem value="value">Total Value</MenuItem>
              <MenuItem value="volume">PO Count</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Top Suppliers"
              value={supplierLimit}
              onChange={(e) => setSupplierLimit(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            >
              <MenuItem value={5}>Top 5</MenuItem>
              <MenuItem value={10}>Top 10</MenuItem>
              <MenuItem value={15}>Top 15</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{ 
            mb: 3,
            borderRadius: '8px'
          }}
        >
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && !metrics && (
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="400px"
          gap={2}
        >
          <CircularProgress size={48} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Loading analytics data...
          </Typography>
        </Box>
      )}

      {/* Analytics Content */}
      {!loading || metrics ? (
        <Box>
          {/* Metrics Cards */}
          <Box sx={{ mb: 3 }}>
            <MetricsCards metrics={metrics} loading={loading} />
          </Box>

          {/* Charts Grid */}
          <Grid container spacing={3}>
            {/* PO Trend Chart - Full Width */}
            <Grid item xs={12}>
              <POTrendChart data={trends} loading={loading} />
            </Grid>

            {/* Top Suppliers - Full Width */}
            <Grid item xs={12}>
              <TopSuppliersChart 
                data={topSuppliers} 
                loading={loading}
                sortBy={supplierSortBy}
              />
            </Grid>

            {/* Status Distribution - Full Width */}
            <Grid item xs={12}>
              <POStatusDistribution 
                data={statusDistribution} 
                loading={loading}
              />
            </Grid>
          </Grid>
        </Box>
      ) : null}
    </Box>
  )
}

export default ProcurementAnalytics