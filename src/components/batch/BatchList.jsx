import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
  LinearProgress
} from '@mui/material'
import {
  Edit,
  Inventory,
  Warning,
  CheckCircle,
  Block,
  Schedule
} from '@mui/icons-material'

function BatchList({ batches, onEdit, onAdjustStock }) {
  const getStatusChip = (status) => {
    const statusConfig = {
      'ACTIVE': { color: 'success', icon: <CheckCircle fontSize="small" />, label: 'Active' },
      'DEPLETED': { color: 'default', icon: <Block fontSize="small" />, label: 'Depleted' },
      'EXPIRED': { color: 'error', icon: <Warning fontSize="small" />, label: 'Expired' },
      'QUARANTINED': { color: 'warning', icon: <Schedule fontSize="small" />, label: 'Quarantined' }
    }
    const config = statusConfig[status] || statusConfig['ACTIVE']
    
    return (
      <Chip
        size="small"
        color={config.color}
        icon={config.icon}
        label={config.label}
      />
    )
  }

  const getExpiryColor = (daysUntilExpiry) => {
    if (daysUntilExpiry <= 0) return 'error'
    if (daysUntilExpiry <= 7) return 'error'
    if (daysUntilExpiry <= 30) return 'warning'
    return 'inherit'
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0)
  }

  if (batches.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="text.secondary">
          No batches found for this product
        </Typography>
      </Box>
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Batch Number</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell>Expiry Date</TableCell>
            <TableCell>Days Until Expiry</TableCell>
            <TableCell>Utilization</TableCell>
            <TableCell align="right">Value</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {batches.map((batch) => (
            <TableRow key={batch.id} hover>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">
                  {batch.batchNumber}
                </Typography>
                {batch.supplierReference && (
                  <Typography variant="caption" color="text.secondary">
                    Ref: {batch.supplierReference}
                  </Typography>
                )}
              </TableCell>
              <TableCell align="right">
                <Box>
                  <Typography variant="body2">
                    {batch.quantity} / {batch.initialQuantity}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(batch.quantity / batch.initialQuantity) * 100}
                    sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                  />
                </Box>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  color={getExpiryColor(batch.daysUntilExpiry)}
                >
                  {new Date(batch.expiryDate).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  color={getExpiryColor(batch.daysUntilExpiry)}
                  fontWeight={batch.daysUntilExpiry <= 30 ? 'bold' : 'normal'}
                >
                  {batch.daysUntilExpiry} days
                  {batch.daysUntilExpiry <= 0 && ' (EXPIRED)'}
                </Typography>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">
                    {batch.utilizationPercentage.toFixed(1)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={batch.utilizationPercentage}
                    sx={{ width: 60, height: 6, borderRadius: 3 }}
                    color={batch.utilizationPercentage > 80 ? 'success' : 'primary'}
                  />
                </Box>
              </TableCell>
              <TableCell align="right">
                {formatCurrency(batch.totalValue)}
              </TableCell>
              <TableCell>
                {getStatusChip(batch.status)}
              </TableCell>
              <TableCell>
                <Tooltip title="Adjust Stock">
                  <IconButton
                    size="small"
                    onClick={() => onAdjustStock(batch)}
                    disabled={batch.status === 'DEPLETED' || batch.status === 'EXPIRED'}
                  >
                    <Inventory />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Batch">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(batch)}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default BatchList