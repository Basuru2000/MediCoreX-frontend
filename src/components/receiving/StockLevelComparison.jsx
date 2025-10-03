import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  LinearProgress
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Inventory,
  NewReleases,
  Update
} from '@mui/icons-material'

function StockLevelComparison({ comparisons }) {
  if (!comparisons || comparisons.length === 0) {
    return null
  }

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'LOW': return 'error'
      case 'ADEQUATE': return 'success'
      case 'OVERSTOCKED': return 'warning'
      default: return 'default'
    }
  }

  const getStockStatusIcon = (status) => {
    switch (status) {
      case 'LOW': return <TrendingDown />
      case 'ADEQUATE': return <TrendingFlat />
      case 'OVERSTOCKED': return <TrendingUp />
      default: return <Inventory />
    }
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Inventory color="primary" />
        Inventory Impact Preview
      </Typography>

      <Grid container spacing={2}>
        {comparisons.map((item, index) => (
          <Grid item xs={12} key={index}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Grid container spacing={2} alignItems="center">
                {/* Product Info */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {item.productName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Code: {item.productCode}
                  </Typography>
                </Grid>

                {/* Stock Levels */}
                <Grid item xs={12} md={4}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary">
                        Current
                      </Typography>
                      <Typography variant="h6">
                        {item.currentStock}
                      </Typography>
                    </Box>

                    <Typography variant="h6" color="primary">→</Typography>

                    <Box textAlign="center">
                      <Typography variant="caption" color="text.secondary">
                        After
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {item.projectedStock}
                      </Typography>
                    </Box>

                    <Chip
                      label={`+${item.incomingQuantity}`}
                      color="success"
                      size="small"
                      icon={<TrendingUp />}
                    />
                  </Box>

                  {/* Progress Bar */}
                  <Box mt={1}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((item.projectedStock / (item.reorderLevel * 2)) * 100, 100)}
                      color={item.stockStatus === 'LOW' ? 'error' : 'success'}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </Grid>

                {/* Batch & Status Info */}
                <Grid item xs={12} md={4}>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Chip
                      icon={item.willCreateNewBatch ? <NewReleases /> : <Update />}
                      label={item.willCreateNewBatch ? 'New Batch' : 'Update Existing'}
                      color={item.willCreateNewBatch ? 'primary' : 'info'}
                      size="small"
                    />
                    <Typography variant="caption">
                      Batch: <strong>{item.batchNumber}</strong>
                    </Typography>
                    <Chip
                      icon={getStockStatusIcon(item.stockStatus)}
                      label={item.stockStatus}
                      color={getStockStatusColor(item.stockStatus)}
                      size="small"
                    />
                  </Box>
                </Grid>

                {/* Cost Info */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Unit Cost: <strong>${item.unitCost?.toFixed(2)}</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Line Total: <strong>${item.totalValue?.toFixed(2)}</strong>
                    </Typography>
                    {item.reorderLevel && (
                      <Typography variant="caption" color="text.secondary">
                        Reorder Level: {item.reorderLevel} units
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Summary Stats */}
      <Paper sx={{ p: 2, mt: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="caption">Total Items</Typography>
            <Typography variant="h6">
              {comparisons.reduce((sum, item) => sum + item.incomingQuantity, 0)} units
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption">Unique Products</Typography>
            <Typography variant="h6">{comparisons.length}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption">Total Value</Typography>
            <Typography variant="h6">
              ${comparisons.reduce((sum, item) => sum + (item.totalValue || 0), 0).toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default StockLevelComparison