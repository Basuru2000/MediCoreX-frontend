import React from 'react'
import { Chip, useTheme, alpha } from '@mui/material'
import {
  Edit,
  CheckCircle,
  Send,
  LocalShipping,
  Cancel,
  HourglassEmpty
} from '@mui/icons-material'

function OrderStatusBadge({ status, size = 'small' }) {
  const theme = useTheme()

  const getStatusConfig = (status) => {
    switch (status) {
      case 'DRAFT':
        return {
          label: 'Draft',
          color: theme.palette.grey[600],
          bgColor: alpha(theme.palette.grey[500], 0.1),
          icon: <Edit sx={{ fontSize: size === 'small' ? 16 : 18 }} />
        }
      case 'APPROVED':
        return {
          label: 'Approved',
          color: theme.palette.info.main,
          bgColor: alpha(theme.palette.info.main, 0.1),
          icon: <CheckCircle sx={{ fontSize: size === 'small' ? 16 : 18 }} />
        }
      case 'SENT':
        return {
          label: 'Sent',
          color: theme.palette.primary.main,
          bgColor: alpha(theme.palette.primary.main, 0.1),
          icon: <Send sx={{ fontSize: size === 'small' ? 16 : 18 }} />
        }
      case 'PARTIALLY_RECEIVED':
        return {
          label: 'Partially Received',
          color: theme.palette.warning.main,
          bgColor: alpha(theme.palette.warning.main, 0.1),
          icon: <HourglassEmpty sx={{ fontSize: size === 'small' ? 16 : 18 }} />
        }
      case 'RECEIVED':
        return {
          label: 'Received',
          color: theme.palette.success.main,
          bgColor: alpha(theme.palette.success.main, 0.1),
          icon: <LocalShipping sx={{ fontSize: size === 'small' ? 16 : 18 }} />
        }
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, 0.1),
          icon: <Cancel sx={{ fontSize: size === 'small' ? 16 : 18 }} />
        }
      default:
        return {
          label: status || 'Unknown',
          color: theme.palette.grey[600],
          bgColor: alpha(theme.palette.grey[500], 0.1),
          icon: null
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Chip
      label={config.label}
      icon={config.icon}
      size={size}
      sx={{
        height: size === 'small' ? 24 : 28,
        fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
        fontWeight: 600,
        bgcolor: config.bgColor,
        color: config.color,
        border: `1px solid ${alpha(config.color, 0.3)}`,
        '& .MuiChip-icon': {
          color: config.color
        }
      }}
    />
  )
}

export default OrderStatusBadge