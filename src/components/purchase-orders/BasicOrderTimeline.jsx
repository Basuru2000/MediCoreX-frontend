import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  useTheme,
  alpha
} from '@mui/material'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab'
import {
  Edit,
  CheckCircle,
  Send,
  LocalShipping,
  Cancel,
  AccessTime,
  HourglassEmpty
} from '@mui/icons-material'
import { getStatusHistory } from '../../services/api'

function BasicOrderTimeline({ orderId }) {
  const theme = useTheme()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [orderId])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await getStatusHistory(orderId)
      setHistory(response.data)
    } catch (err) {
      console.error('Error fetching status history:', err)
      setError('Failed to load status history')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    const iconProps = { sx: { fontSize: 18 } }
    switch (status) {
      case 'DRAFT':
        return <Edit {...iconProps} />
      case 'APPROVED':
        return <CheckCircle {...iconProps} />
      case 'SENT':
        return <Send {...iconProps} />
      case 'PARTIALLY_RECEIVED':
        return <HourglassEmpty {...iconProps} />
      case 'RECEIVED':
        return <LocalShipping {...iconProps} />
      case 'CANCELLED':
        return <Cancel {...iconProps} />
      default:
        return <AccessTime {...iconProps} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT':
        return 'grey'
      case 'APPROVED':
        return 'info'
      case 'SENT':
        return 'primary'
      case 'PARTIALLY_RECEIVED':
        return 'warning'
      case 'RECEIVED':
        return 'success'
      case 'CANCELLED':
        return 'error'
      default:
        return 'grey'
    }
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={6}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{
          borderRadius: '8px'
        }}
      >
        {error}
      </Alert>
    )
  }

  if (history.length === 0) {
    return (
      <Alert
        severity="info"
        sx={{
          borderRadius: '8px'
        }}
      >
        No status history available for this order.
      </Alert>
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '12px',
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.grey[50], 0.5)
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          mb: 3
        }}
      >
        Order Status Timeline
      </Typography>

      <Timeline
        sx={{
          px: 0,
          '& .MuiTimelineItem-root:before': {
            flex: 0,
            padding: 0
          }
        }}
      >
        {history.map((item, index) => {
          const statusColor = getStatusColor(item.newStatus)
          const colorValue = theme.palette[statusColor]?.main || theme.palette.grey[600]

          return (
            <TimelineItem key={item.id}>
              <TimelineOppositeContent
                sx={{
                  py: 2,
                  px: 2,
                  flex: 0.3,
                  minWidth: 140
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: 'text.primary'
                  }}
                >
                  {formatDateTime(item.changedAt)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary'
                  }}
                >
                  {formatTime(item.changedAt)}
                </Typography>
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineDot
                  sx={{
                    bgcolor: alpha(colorValue, 0.1),
                    border: `2px solid ${colorValue}`,
                    boxShadow: `0 0 0 4px ${alpha(colorValue, 0.1)}`,
                    color: colorValue,
                    width: 36,
                    height: 36
                  }}
                >
                  {getStatusIcon(item.newStatus)}
                </TimelineDot>
                {index < history.length - 1 && (
                  <TimelineConnector
                    sx={{
                      bgcolor: alpha(theme.palette.divider, 0.5)
                    }}
                  />
                )}
              </TimelineSeparator>

              <TimelineContent sx={{ py: 2, px: 2 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '8px',
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.background.paper
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      mb: 0.5
                    }}
                  >
                    {item.statusChangeDescription}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.875rem'
                    }}
                  >
                    Changed by: {item.changedByName}
                  </Typography>
                  {item.comments && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        mt: 1.5,
                        borderRadius: '6px',
                        bgcolor: alpha(colorValue, 0.05),
                        borderLeft: `3px solid ${colorValue}`
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontStyle: 'italic',
                          color: 'text.secondary'
                        }}
                      >
                        "{item.comments}"
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </TimelineContent>
            </TimelineItem>
          )
        })}
      </Timeline>
    </Paper>
  )
}

export default BasicOrderTimeline