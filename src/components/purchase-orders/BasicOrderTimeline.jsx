import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip
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
  AccessTime
} from '@mui/icons-material'
import { getStatusHistory } from '../../services/api'

function BasicOrderTimeline({ orderId }) {
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
    switch (status) {
      case 'DRAFT':
        return <Edit />
      case 'APPROVED':
        return <CheckCircle />
      case 'SENT':
        return <Send />
      case 'RECEIVED':
        return <LocalShipping />
      case 'CANCELLED':
        return <Cancel />
      default:
        return <AccessTime />
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
      case 'RECEIVED':
        return 'success'
      case 'CANCELLED':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  if (history.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No status history available for this order.
      </Alert>
    )
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Order Status Timeline
      </Typography>
      
      <Timeline sx={{ px: 0 }}>
        {history.map((item, index) => (
          <TimelineItem key={item.id}>
            <TimelineOppositeContent
              sx={{ py: 2, px: 2, minWidth: 120 }}
              color="text.secondary"
            >
              <Typography variant="body2" fontWeight="medium">
                {formatDateTime(item.changedAt)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTime(item.changedAt)}
              </Typography>
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot color={getStatusColor(item.newStatus)} variant="outlined">
                {getStatusIcon(item.newStatus)}
              </TimelineDot>
              {index < history.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent sx={{ py: 2, px: 2 }}>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {item.statusChangeDescription}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Changed by: {item.changedByName}
                </Typography>
                {item.comments && (
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 1.5, 
                      mt: 1, 
                      bgcolor: 'grey.50',
                      borderLeft: 3,
                      borderColor: getStatusColor(item.newStatus) + '.main'
                    }}
                  >
                    <Typography variant="body2" fontStyle="italic">
                      "{item.comments}"
                    </Typography>
                  </Paper>
                )}
              </Box>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  )
}

export default BasicOrderTimeline