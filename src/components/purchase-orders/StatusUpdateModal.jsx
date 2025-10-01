import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Box,
  Typography
} from '@mui/material'
import { Save, Cancel } from '@mui/icons-material'
import OrderStatusBadge from './OrderStatusBadge'

function StatusUpdateModal({ order, open, onClose, onUpdate, loading }) {
  const [newStatus, setNewStatus] = useState(order?.status || '')
  const [comments, setComments] = useState('')
  const [error, setError] = useState('')

  // Reset when dialog opens/closes
  React.useEffect(() => {
    if (open && order) {
      setNewStatus(order.status)
      setComments('')
      setError('')
    }
  }, [open, order])

  const getAvailableStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'DRAFT':
        return ['APPROVED', 'CANCELLED']
      case 'APPROVED':
        return ['SENT', 'CANCELLED']
      case 'SENT':
        return ['RECEIVED', 'CANCELLED']
      case 'RECEIVED':
        return [] // No transitions allowed
      case 'CANCELLED':
        return [] // No transitions allowed
      default:
        return []
    }
  }

  const handleSubmit = async () => {
    if (!newStatus || newStatus === order.status) {
      setError('Please select a different status')
      return
    }

    try {
      await onUpdate(order.id, newStatus, comments)
      handleClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status')
    }
  }

  const handleClose = () => {
    setNewStatus(order?.status || '')
    setComments('')
    setError('')
    onClose()
  }

  if (!order) return null

  const availableStatuses = getAvailableStatuses(order.status)
  const canChangeStatus = availableStatuses.length > 0

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Purchase Order Status</DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            PO Number
          </Typography>
          <Typography variant="h6">{order.poNumber}</Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current Status
          </Typography>
          <OrderStatusBadge status={order.status} size="medium" />
        </Box>

        {!canChangeStatus ? (
          <Alert severity="info">
            This purchase order cannot be changed from its current status.
          </Alert>
        ) : (
          <>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>New Status *</InputLabel>
              <Select
                value={newStatus}
                label="New Status *"
                onChange={(e) => setNewStatus(e.target.value)}
                disabled={loading}
              >
                <MenuItem value={order.status} disabled>
                  {order.status} (Current)
                </MenuItem>
                {availableStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comments (Optional)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any notes about this status change..."
              disabled={loading}
            />
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        {canChangeStatus && (
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSubmit}
            disabled={loading || !newStatus || newStatus === order.status}
          >
            {loading ? 'Updating...' : 'Update Status'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default StatusUpdateModal