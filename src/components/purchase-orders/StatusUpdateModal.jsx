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
  Typography,
  Paper,
  Stack,
  useTheme,
  alpha
} from '@mui/material'
import { Save, Cancel, TrendingFlat } from '@mui/icons-material'
import OrderStatusBadge from './OrderStatusBadge'

function StatusUpdateModal({ order, open, onClose, onUpdate, loading }) {
  const theme = useTheme()
  const [newStatus, setNewStatus] = useState(order?.status || '')
  const [comments, setComments] = useState('')
  const [error, setError] = useState('')

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
        return ['PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED']
      case 'PARTIALLY_RECEIVED':
        return ['RECEIVED', 'CANCELLED']
      case 'RECEIVED':
        return []
      case 'CANCELLED':
        return []
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
      await onUpdate({
        status: newStatus,
        comments: comments
      })
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
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px'
        }
      }}
    >
      <DialogTitle sx={{
        pb: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.primary.main, 0.02)
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Update Purchase Order Status
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: '8px'
            }}
          >
            {error}
          </Alert>
        )}

        {/* Order Info */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: '8px',
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.grey[500], 0.02)
          }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                PO Number
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5 }}>
                {order.poNumber}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Supplier
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                {order.supplierName}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Current Status */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
            Current Status
          </Typography>
          <OrderStatusBadge status={order.status} size="medium" />
        </Box>

        {!canChangeStatus ? (
          <Alert
            severity="info"
            sx={{
              borderRadius: '8px'
            }}
          >
            This purchase order cannot be changed from its current status.
          </Alert>
        ) : (
          <>
            {/* Status Transition Indicator */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mb: 3,
                p: 2,
                borderRadius: '8px',
                bgcolor: alpha(theme.palette.info.main, 0.05)
              }}
            >
              <OrderStatusBadge status={order.status} />
              <TrendingFlat sx={{ color: 'text.secondary' }} />
              <OrderStatusBadge status={newStatus || order.status} />
            </Box>

            {/* New Status Selection */}
            <FormControl
              fullWidth
              sx={{ mb: 3 }}
            >
              <InputLabel>New Status</InputLabel>
              <Select
                value={newStatus}
                label="New Status"
                onChange={(e) => setNewStatus(e.target.value)}
                sx={{
                  borderRadius: '8px'
                }}
              >
                {availableStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Comments */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comments (Optional)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any comments about this status change..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{
        px: 3,
        py: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.grey[500], 0.02)
      }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        {canChangeStatus && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !newStatus || newStatus === order.status}
            startIcon={<Save />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
              }
            }}
          >
            {loading ? 'Updating...' : 'Update Status'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default StatusUpdateModal