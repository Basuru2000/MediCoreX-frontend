import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert
} from '@mui/material'
import { CheckCircle, Cancel } from '@mui/icons-material'

function POApproval({ order, open, onClose, onApprove, onReject, loading }) {
  const [comments, setComments] = useState('')
  const [action, setAction] = useState(null) // 'approve' or 'reject'
  const [error, setError] = useState('')

  const handleApprove = () => {
    setAction('approve')
    setError('')
  }

  const handleReject = () => {
    if (!comments.trim()) {
      setError('Rejection comments are required')
      return
    }
    setAction('reject')
    setError('')
  }

  const handleConfirm = async () => {
    try {
      if (action === 'approve') {
        await onApprove(order.id, comments)
      } else if (action === 'reject') {
        await onReject(order.id, comments)
      }
      handleClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed')
    }
  }

  const handleClose = () => {
    setComments('')
    setAction(null)
    setError('')
    onClose()
  }

  if (!order) return null

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {action ? 'Confirm Action' : 'Approve or Reject Purchase Order'}
      </DialogTitle>

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
          <Typography variant="body2" color="text.secondary">
            Supplier
          </Typography>
          <Typography variant="body1">{order.supplierName}</Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Total Amount
          </Typography>
          <Typography variant="h6" color="primary">
            ${order.totalAmount.toLocaleString()}
          </Typography>
        </Box>

        {!action && (
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comments (Optional for Approval, Required for Rejection)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add your comments here..."
          />
        )}

        {action && (
          <Alert severity={action === 'approve' ? 'success' : 'warning'}>
            <Typography variant="body2">
              Are you sure you want to <strong>{action}</strong> this purchase order?
              {action === 'reject' && comments && (
                <>
                  <br />
                  <strong>Reason:</strong> {comments}
                </>
              )}
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        {!action ? (
          <>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={handleReject}
              disabled={loading}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={handleApprove}
              disabled={loading}
            >
              Approve
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setAction(null)} disabled={loading}>
              Back
            </Button>
            <Button
              variant="contained"
              color={action === 'approve' ? 'success' : 'error'}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Confirm ${action === 'approve' ? 'Approval' : 'Rejection'}`}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default POApproval