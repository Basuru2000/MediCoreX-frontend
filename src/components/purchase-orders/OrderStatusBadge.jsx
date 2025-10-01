import React from 'react'
import { Chip } from '@mui/material'
import {
  Edit,
  CheckCircle,
  Send,
  LocalShipping,
  Cancel
} from '@mui/icons-material'

function OrderStatusBadge({ status, size = 'small' }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'DRAFT':
        return {
          label: 'Draft',
          color: 'default',
          icon: <Edit fontSize="small" />
        }
      case 'APPROVED':
        return {
          label: 'Approved',
          color: 'info',
          icon: <CheckCircle fontSize="small" />
        }
      case 'SENT':
        return {
          label: 'Sent',
          color: 'primary',
          icon: <Send fontSize="small" />
        }
      case 'RECEIVED':
        return {
          label: 'Received',
          color: 'success',
          icon: <LocalShipping fontSize="small" />
        }
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: 'error',
          icon: <Cancel fontSize="small" />
        }
      default:
        return {
          label: status || 'Unknown',
          color: 'default',
          icon: null
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={config.icon}
      sx={{ fontWeight: 500 }}
    />
  )
}

export default OrderStatusBadge