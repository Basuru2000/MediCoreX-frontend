import React from 'react'
import {
  Box,
  LinearProgress,
  Typography,
  Chip,
  Tooltip
} from '@mui/material'
import { CheckCircle, Schedule, Warning } from '@mui/icons-material'

function ReceiptProgressIndicator({ ordered, received, remaining }) {
  const percentage = ordered > 0 ? Math.round((received / ordered) * 100) : 0
  
  const getStatusColor = () => {
    if (percentage === 100) return 'success'
    if (percentage > 0) return 'warning'
    return 'primary'  // ✅ FIXED: Changed from 'default' to 'primary'
  }

  const getStatusIcon = () => {
    if (percentage === 100) return <CheckCircle fontSize="small" />
    if (percentage > 0) return <Schedule fontSize="small" />
    return <Warning fontSize="small" />
  }

  const getStatusText = () => {
    if (percentage === 100) return 'Fully Received'
    if (percentage > 0) return 'Partially Received'
    return 'Pending Receipt'
  }

  const getChipColor = () => {
    if (percentage === 100) return 'success'
    if (percentage > 0) return 'warning'
    return 'default'  // Chip accepts 'default', but LinearProgress doesn't
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
        <Typography variant="caption" color="text.secondary">
          {received} of {ordered} items received
        </Typography>
        <Chip
          icon={getStatusIcon()}
          label={`${percentage}%`}
          size="small"
          color={getChipColor()}
        />
      </Box>
      
      <Tooltip title={getStatusText()}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          color={getStatusColor()}  // ✅ Now uses valid color
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Tooltip>
      
      {remaining > 0 && (
        <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
          {remaining} items remaining
        </Typography>
      )}
    </Box>
  )
}

export default ReceiptProgressIndicator