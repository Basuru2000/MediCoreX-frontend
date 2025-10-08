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
  Alert,
  Stack,
  Paper,
  Divider,
  useTheme,
  alpha
} from '@mui/material'
import { CheckCircle, Cancel, Info } from '@mui/icons-material'

function POApproval({ order, open, onClose, onApprove, onReject, loading }) {
  const theme = useTheme()
  const [comments, setComments] = useState('')
  const [action, setAction] = useState(null)
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
          {action ? 'Confirm Action' : 'Approve or Reject Purchase Order'}
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

        {/* Order Information */}
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
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                PO Number
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5 }}>
                {order.poNumber}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Supplier
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                {order.supplierName}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Total Amount
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mt: 0.5 }}>
                ${order.totalAmount.toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {!action && (
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add your comments here... (Required for rejection)"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
          />
        )}

        {action && (
          <Alert 
            severity={action === 'approve' ? 'success' : 'warning'}
            icon={action === 'approve' ? <CheckCircle /> : <Cancel />}
            sx={{
              borderRadius: '8px',
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Are you sure you want to <strong>{action}</strong> this purchase order?
            </Typography>
            {action === 'reject' && comments && (
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Reason:
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {comments}
                </Typography>
              </Box>
            )}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.grey[500], 0.02)
      }}>
        {!action ? (
          <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
            <Button 
              onClick={handleClose} 
              disabled={loading}
              fullWidth
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={handleReject}
              disabled={loading}
              fullWidth
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={handleApprove}
              disabled={loading}
              fullWidth
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 6px 16px ${alpha(theme.palette.success.main, 0.4)}`
                }
              }}
            >
              Approve
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
            <Button 
              onClick={() => setAction(null)} 
              disabled={loading}
              fullWidth
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color={action === 'approve' ? 'success' : 'error'}
              onClick={handleConfirm}
              disabled={loading}
              fullWidth
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: `0 4px 12px ${alpha(theme.palette[action === 'approve' ? 'success' : 'error'].main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 6px 16px ${alpha(theme.palette[action === 'approve' ? 'success' : 'error'].main, 0.4)}`
                }
              }}
            >
              {loading ? 'Processing...' : `Confirm ${action === 'approve' ? 'Approval' : 'Rejection'}`}
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default POApproval