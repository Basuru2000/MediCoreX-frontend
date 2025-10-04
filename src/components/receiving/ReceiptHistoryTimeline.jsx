import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material'
import { LocalShipping, CheckCircle, Schedule } from '@mui/icons-material'
import { getReceiptHistoryForPO } from '../../services/api'

function ReceiptHistoryTimeline({ poId }) {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReceiptHistory()
  }, [poId])

  const fetchReceiptHistory = async () => {
    try {
      setLoading(true)
      const response = await getReceiptHistoryForPO(poId)
      setReceipts(response.data)
    } catch (error) {
      console.error('Error fetching receipt history:', error)
      setError('Failed to load receipt history')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'success'
      case 'PENDING_APPROVAL': return 'warning'
      case 'REJECTED': return 'error'
      default: return 'default'
    }
  }

  if (loading) return <CircularProgress size={24} />
  if (error) return <Alert severity="error">{error}</Alert>
  if (receipts.length === 0) return <Typography variant="body2" color="text.secondary">No receipts yet</Typography>

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Receipt History
      </Typography>
      
      <Timeline>
        {receipts.map((receipt, index) => (
          <TimelineItem key={receipt.id}>
            <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
              <Typography variant="caption">
                {formatDateTime(receipt.receiptDate)}
              </Typography>
            </TimelineOppositeContent>
            
            <TimelineSeparator>
              <TimelineDot color={getStatusColor(receipt.acceptanceStatus)}>
                {receipt.acceptanceStatus === 'ACCEPTED' ? <CheckCircle /> : <Schedule />}
              </TimelineDot>
              {index < receipts.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            
            <TimelineContent>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2">
                    {receipt.receiptNumber}
                  </Typography>
                  <Chip
                    label={receipt.acceptanceStatus}
                    size="small"
                    color={getStatusColor(receipt.acceptanceStatus)}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Received by: {receipt.receivedByName}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Items: {receipt.lines?.length || 0} line(s)
                </Typography>
                
                {receipt.notes && (
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    Notes: {receipt.notes}
                  </Typography>
                )}
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  )
}

export default ReceiptHistoryTimeline