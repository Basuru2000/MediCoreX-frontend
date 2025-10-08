import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  Divider,
  Chip,
  Alert,
  Switch,
  Stack,
  useTheme,
  alpha,
  Paper
} from '@mui/material'
import {
  Warning,
  CheckCircle,
  Cancel,
  Send
} from '@mui/icons-material'

function AcceptRejectDialog({ receipt, open, onClose, onSubmit, loading }) {
  const theme = useTheme()
  const [decision, setDecision] = useState('accept')
  const [rejectionReason, setRejectionReason] = useState('')
  const [qualityNotes, setQualityNotes] = useState('')
  const [notifySupplier, setNotifySupplier] = useState(true)
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (decision === 'reject' && !rejectionReason.trim()) {
      setError('Please provide a rejection reason')
      return
    }

    const data = decision === 'accept'
      ? { qualityNotes, notifySupplier }
      : { rejectionReason, notifySupplier }

    onSubmit(decision, data)
  }

  const handleClose = () => {
    setDecision('accept')
    setRejectionReason('')
    setQualityNotes('')
    setNotifySupplier(true)
    setError('')
    onClose()
  }

  if (!receipt) return null

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: theme.shadows[24]
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2, 
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              backgroundColor: alpha(theme.palette.warning.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Warning sx={{ color: theme.palette.warning.main, fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Quality Control Decision
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Review and approve or reject this receipt
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Receipt Summary */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: '8px',
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.02)
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Receipt Number
              </Typography>
              <Typography variant="body1" fontWeight={600} color="primary">
                {receipt.receiptNumber}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                PO Number
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {receipt.poNumber}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Supplier
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '0.875rem' }}>
                {receipt.supplierName}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Total Items
              </Typography>
              <Chip 
                label={`${receipt.totalQuantity} units`} 
                color="primary" 
                size="small"
                sx={{ 
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  height: 24,
                  mt: 0.5
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ my: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Decision Selection */}
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, fontSize: '1rem' }}>
          Quality Decision
        </Typography>
        
        <RadioGroup value={decision} onChange={(e) => setDecision(e.target.value)}>
          <Paper
            elevation={0}
            sx={{
              mb: 2,
              p: 2,
              border: `2px solid ${decision === 'accept' ? theme.palette.success.main : theme.palette.divider}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: decision === 'accept' ? alpha(theme.palette.success.main, 0.04) : 'transparent',
              '&:hover': {
                borderColor: decision === 'accept' ? theme.palette.success.dark : theme.palette.primary.main,
                backgroundColor: decision === 'accept' ? alpha(theme.palette.success.main, 0.06) : alpha(theme.palette.primary.main, 0.02)
              }
            }}
            onClick={() => setDecision('accept')}
          >
            <FormControlLabel
              value="accept"
              control={<Radio />}
              label={
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CheckCircle 
                    sx={{ 
                      fontSize: 20,
                      color: decision === 'accept' ? theme.palette.success.main : theme.palette.text.secondary
                    }} 
                  />
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Accept Receipt
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Items meet quality standards and will be added to inventory
                    </Typography>
                  </Box>
                </Stack>
              }
            />
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: `2px solid ${decision === 'reject' ? theme.palette.error.main : theme.palette.divider}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: decision === 'reject' ? alpha(theme.palette.error.main, 0.04) : 'transparent',
              '&:hover': {
                borderColor: decision === 'reject' ? theme.palette.error.dark : theme.palette.primary.main,
                backgroundColor: decision === 'reject' ? alpha(theme.palette.error.main, 0.06) : alpha(theme.palette.primary.main, 0.02)
              }
            }}
            onClick={() => setDecision('reject')}
          >
            <FormControlLabel
              value="reject"
              control={<Radio />}
              label={
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Cancel 
                    sx={{ 
                      fontSize: 20,
                      color: decision === 'reject' ? theme.palette.error.main : theme.palette.text.secondary
                    }} 
                  />
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Reject Receipt
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Items fail quality standards and will not be added to inventory
                    </Typography>
                  </Box>
                </Stack>
              }
            />
          </Paper>
        </RadioGroup>

        <Divider sx={{ my: 3 }} />

        {/* Accept Fields */}
        {decision === 'accept' && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
              Quality Notes (Optional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={qualityNotes}
              onChange={(e) => setQualityNotes(e.target.value)}
              placeholder="Add any quality inspection notes or observations..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
          </Box>
        )}

        {/* Reject Fields */}
        {decision === 'reject' && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
              Rejection Reason <span style={{ color: theme.palette.error.main }}>*</span>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why the items are being rejected (e.g., damage, wrong items, quality issues)..."
              required
              error={Boolean(error)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
            <Alert severity="warning" sx={{ mt: 2, borderRadius: '8px' }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Important
              </Typography>
              <Typography variant="body2">
                Rejected items will NOT be added to inventory. Make sure to coordinate with the supplier for replacement or return.
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Notification Option */}
        <Box sx={{ mt: 3, p: 2, borderRadius: '8px', border: `1px solid ${theme.palette.divider}` }}>
          <FormControlLabel
            control={
              <Switch
                checked={notifySupplier}
                onChange={(e) => setNotifySupplier(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Notify Supplier
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {decision === 'accept'
                    ? 'Send confirmation email to supplier about successful receipt'
                    : 'Send rejection notification to supplier with reason'}
                </Typography>
              </Box>
            }
          />
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            color: theme.palette.text.secondary
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          color={decision === 'accept' ? 'success' : 'error'}
          startIcon={decision === 'accept' ? <CheckCircle /> : <Cancel />}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3
          }}
        >
          {loading ? 'Processing...' : decision === 'accept' ? 'Accept Receipt' : 'Reject Receipt'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AcceptRejectDialog