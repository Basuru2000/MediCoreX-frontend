import { useState } from 'react'
import {
  Box,
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
  Typography
} from '@mui/material'
import {
  CheckCircle,
  Error,
  Schedule,
  Visibility,
  Refresh
} from '@mui/icons-material'

function ExpiryCheckHistory({ history, onRefresh }) {
  const getStatusChip = (status) => {
    const config = {
      'COMPLETED': { color: 'success', icon: <CheckCircle fontSize="small" /> },
      'FAILED': { color: 'error', icon: <Error fontSize="small" /> },
      'RUNNING': { color: 'primary', icon: <Schedule fontSize="small" /> }
    }
    
    const statusConfig = config[status] || config['COMPLETED']
    
    return (
      <Chip
        label={status}
        color={statusConfig.color}
        icon={statusConfig.icon}
        size="small"
      />
    )
  }

  const formatDuration = (ms) => {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}min`
  }

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '-'
    const date = new Date(dateTimeStr)
    return date.toLocaleString()
  }

  if (history.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Typography color="text.secondary">
          No expiry checks have been performed yet.
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Check History</Typography>
        <IconButton onClick={onRefresh} size="small">
          <Refresh />
        </IconButton>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Check Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Products</TableCell>
              <TableCell align="right">Alerts</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((check) => (
              <TableRow key={check.checkLogId}>
                <TableCell>
                  {new Date(check.checkDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {getStatusChip(check.status)}
                </TableCell>
                <TableCell align="right">
                  {check.productsChecked || 0}
                </TableCell>
                <TableCell align="right">
                  <Typography
                    color={check.alertsGenerated > 0 ? 'warning.main' : 'text.primary'}
                    fontWeight={check.alertsGenerated > 0 ? 'bold' : 'normal'}
                  >
                    {check.alertsGenerated || 0}
                  </Typography>
                </TableCell>
                <TableCell>
                  {formatDateTime(check.startTime)}
                </TableCell>
                <TableCell>
                  {formatDuration(check.executionTimeMs)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={check.startTime?.includes('02:00') ? 'Scheduled' : 'Manual'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default ExpiryCheckHistory