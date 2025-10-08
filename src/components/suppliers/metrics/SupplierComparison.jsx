import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  useTheme
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  EmojiEvents,
  Refresh
} from '@mui/icons-material'
import { getSupplierComparison } from '../../../services/api'

function SupplierComparison() {
  const theme = useTheme()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchComparison()
  }, [])

  const fetchComparison = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getSupplierComparison()
      setSuppliers(response.data)
    } catch (error) {
      setError('Failed to load supplier comparison')
      console.error('Error fetching comparison:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (!score) return 'default'
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'IMPROVING':
        return <TrendingUp sx={{ fontSize: 18, color: 'success.main' }} />
      case 'DECLINING':
        return <TrendingDown sx={{ fontSize: 18, color: 'error.main' }} />
      default:
        return <TrendingFlat sx={{ fontSize: 18, color: 'text.secondary' }} />
    }
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return <EmojiEvents sx={{ color: '#FFD700', fontSize: 20 }} />
    if (rank === 2) return <EmojiEvents sx={{ color: '#C0C0C0', fontSize: 20 }} />
    if (rank === 3) return <EmojiEvents sx={{ color: '#CD7F32', fontSize: 20 }} />
    return null
  }

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center"
        minHeight="400px"
        gap={2}
      >
        <CircularProgress size={40} thickness={4} />
        <Typography variant="body2" color="text.secondary">
          Loading comparison data...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert 
        severity="error"
        action={
          <IconButton 
            size="small" 
            onClick={fetchComparison}
            sx={{ color: 'error.main' }}
          >
            <Refresh />
          </IconButton>
        }
        sx={{ borderRadius: '8px' }}
      >
        {error}
      </Alert>
    )
  }

  if (suppliers.length === 0) {
    return (
      <Alert severity="info" sx={{ borderRadius: '8px' }}>
        No supplier metrics available for comparison
      </Alert>
    )
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '12px',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                fontSize: '1.125rem',
                mb: 0.5
              }}
            >
              Supplier Performance Comparison
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.875rem'
              }}
            >
              Compare supplier performance metrics
            </Typography>
          </Box>
          <Tooltip title="Refresh" arrow>
            <IconButton 
              onClick={fetchComparison}
              sx={{
                width: 36,
                height: 36,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderColor: theme.palette.primary.main
                }
              }}
            >
              <Refresh sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <TableContainer 
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '8px',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
                }}
              >
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Supplier</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Overall Score</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Delivery</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Quality</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Compliance</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map((supplier, index) => (
                <TableRow 
                  key={supplier.supplierId}
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'light' ? 'action.hover' : 'action.selected'
                    }
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getRankBadge(supplier.rank)}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}
                      >
                        #{supplier.rank}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        fontSize: '0.875rem'
                      }}
                    >
                      {supplier.supplierName}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={supplier.overallScore ? supplier.overallScore.toFixed(1) : '-'}
                      color={getScoreColor(supplier.overallScore)}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: '6px',
                        minWidth: 48
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}
                    >
                      {supplier.deliveryScore ? supplier.deliveryScore.toFixed(1) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}
                    >
                      {supplier.qualityScore ? supplier.qualityScore.toFixed(1) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}
                    >
                      {supplier.complianceScore ? supplier.complianceScore.toFixed(1) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center">
                      <Tooltip title={supplier.performanceTrend || 'Stable'} arrow>
                        {getTrendIcon(supplier.performanceTrend)}
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box 
          sx={{ 
            mt: 2,
            p: 2,
            borderRadius: '8px',
            bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.75rem'
            }}
          >
            <strong>Note:</strong> Scores are calculated based on delivery performance, quality metrics, and compliance factors.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default SupplierComparison