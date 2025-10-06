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
  useTheme
} from '@mui/material'
import {
  Refresh,
  FileDownload,
  Assessment
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
          break
      }

      // Fetch all data in parallel
      const [metricsRes, trendsRes, suppliersRes, statusRes] = await Promise.all([
        getProcurementMetrics(startDate, endDate),
        getPOTrends(parseInt(dateRange.replace('months', ''))),
        getTopSuppliers(supplierLimit, supplierSortBy),
        getStatusDistribution(startDate, endDate)
      ])

      setMetrics(metricsRes.data)
      setTrends(trendsRes.data)
      setTopSuppliers(suppliersRes.data)
      setStatusDistribution(statusRes.data)

    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err.response?.data?.message || 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchAllData()
  }

  const handleExport = () => {
    // Prepare data for export
    const exportData = {
      metrics,
      trends,
      topSuppliers,
      statusDistribution,
      generatedAt: new Date().toISOString()
    }

    // Create blob and download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `procurement-analytics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Assessment sx={{ fontSize: 40, color: theme.palette.primary.main }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Procurement Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive insights into purchase order performance
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownload />}
            onClick={handleExport}
            disabled={loading || !metrics}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Date Range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
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
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && !metrics && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Analytics Content */}
      {!loading || metrics ? (
        <Box>
          {/* Metrics Cards */}
          <Box mb={3}>
            <MetricsCards metrics={metrics} loading={loading} />
          </Box>

          {/* Charts Grid */}
          <Grid container spacing={3}>
            {/* PO Trend Chart - Full Width */}
            <Grid item xs={12}>
              <POTrendChart data={trends} loading={loading} />
            </Grid>

            {/* Top Suppliers - 8 columns */}
            <Grid item xs={12} md={8}>
              <TopSuppliersChart 
                data={topSuppliers} 
                loading={loading}
                sortBy={supplierSortBy}
              />
            </Grid>

            {/* Status Distribution - 4 columns */}
            <Grid item xs={12} md={4}>
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