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
  Tooltip
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
        return <TrendingUp fontSize="small" color="success" />
      case 'DECLINING':
        return <TrendingDown fontSize="small" color="error" />
      default:
        return <TrendingFlat fontSize="small" color="action" />
    }
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return <EmojiEvents color="warning" fontSize="small" />
    if (rank === 2) return <EmojiEvents color="action" fontSize="small" />
    if (rank === 3) return <EmojiEvents sx={{ color: '#CD7F32' }} fontSize="small" />
    return null
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <IconButton size="small" onClick={fetchComparison}>
          <Refresh />
        </IconButton>
      }>
        {error}
      </Alert>
    )
  }

  if (suppliers.length === 0) {
    return (
      <Alert severity="info">
        No supplier metrics available for comparison
      </Alert>
    )
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Supplier Performance Comparison
          </Typography>
          <Tooltip title="Refresh comparison">
            <IconButton size="small" onClick={fetchComparison}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell align="center">Overall Score</TableCell>
                <TableCell align="center">Delivery</TableCell>
                <TableCell align="center">Quality</TableCell>
                <TableCell align="center">Compliance</TableCell>
                <TableCell align="center">Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow 
                  key={supplier.supplierId}
                  sx={{ 
                    backgroundColor: supplier.rank <= 3 ? 'action.hover' : 'inherit'
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getRankBadge(supplier.rank)}
                      <Typography variant="body2">
                        #{supplier.rank}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={supplier.rank <= 3 ? 600 : 400}>
                      {supplier.supplierName}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={supplier.overallScore?.toFixed(1) || '0'}
                      color={getScoreColor(supplier.overallScore)}
                      size="small"
                      variant={supplier.rank === 1 ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color={getScoreColor(supplier.deliveryScore) + '.main'}>
                      {supplier.deliveryScore?.toFixed(1) || '-'}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color={getScoreColor(supplier.qualityScore) + '.main'}>
                      {supplier.qualityScore?.toFixed(1) || '-'}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color={getScoreColor(supplier.complianceScore) + '.main'}>
                      {supplier.complianceScore?.toFixed(1) || '-'}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {getTrendIcon(supplier.trend)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Rankings based on current month performance. Scores are weighted: 
            Quality (35%), Delivery (30%), Compliance (20%), Cost (15%)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default SupplierComparison