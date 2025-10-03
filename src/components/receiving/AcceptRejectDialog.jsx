import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography,
  Alert,
  Divider,
  Grid,
  Chip,
  FormGroup,
  Checkbox,
  CircularProgress
} from '@mui/material'
import { CheckCircle, Cancel, Warning } from '@mui/icons-material'
import StockLevelComparison from './StockLevelComparison'
import { getInventoryPreview } from '../../services/api'

function AcceptRejectDialog({ receipt, open, onClose, onSubmit, loading }) {
  const [decision, setDecision] = useState('accept')
  const [rejectionReason, setRejectionReason] = useState('')
  const [qualityNotes, setQualityNotes] = useState('')
  const [notifySupplier, setNotifySupplier] = useState(true)
  const [error, setError] = useState('')
  const [inventoryPreview, setInventoryPreview] = useState([])
  const [loadingPreview, setLoadingPreview] = useState(false)

  useEffect(() => {
    if (open && receipt && decision === 'accept') {
      fetchInventoryPreview()
    }
  }, [open, receipt, decision])

  const fetchInventoryPreview = async () => {
    try {
      setLoadingPreview(true)
      const response = await getInventoryPreview(receipt.id)
      setInventoryPreview(response.data)
    } catch (error) {
      console.error('Error fetching inventory preview:', error)
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleSubmit = () => {
    if (decision === 'reject' && !rejectionReason.trim()) {
      setError('Rejection reason is required')
      return
    }

    const data = decision === 'accept' 
      ? { qualityNotes }
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Warning color="warning" />
          <Typography variant="h6">
            Quality Control Decision
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Receipt Summary */}
        <Box mb={3} p={2} bgcolor="grey.50" borderRadius={1}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Receipt Number
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {receipt.receiptNumber}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                PO Number
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {receipt.poNumber}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Supplier
              </Typography>
              <Typography variant="body1">
                {receipt.supplierName}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Total Items
              </Typography>
              <Chip 
                label={`${receipt.totalQuantity} units`} 
                color="primary" 
                size="small"
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Decision Selection */}
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Quality Decision
        </Typography>
        
        <RadioGroup value={decision} onChange={(e) => setDecision(e.target.value)}>
          <FormControlLabel
            value="accept"
            control={<Radio />}
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <CheckCircle color="success" fontSize="small" />
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Accept Goods
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Quality approved - Add items to inventory
                  </Typography>
                </Box>
              </Box>
            }
          />
          
          <FormControlLabel
            value="reject"
            control={<Radio />}
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Cancel color="error" fontSize="small" />
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Reject Goods
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Quality issues found - Do not add to inventory
                  </Typography>
                </Box>
              </Box>
            }
          />
        </RadioGroup>

        {/* Conditional Fields */}
        {decision === 'accept' ? (
          <Box mt={3}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Quality Notes (Optional)"
              placeholder="Add any quality observations or notes..."
              value={qualityNotes}
              onChange={(e) => setQualityNotes(e.target.value)}
            />
            
            {/* Inventory Preview */}
            {loadingPreview ? (
              <Box display="flex" justifyContent="center" my={2}>
                <CircularProgress />
              </Box>
            ) : inventoryPreview.length > 0 ? (
              <Box mt={3}>
                <StockLevelComparison comparisons={inventoryPreview} />
              </Box>
            ) : null}
            
            <Alert severity="info" sx={{ mt: 2 }}>
              Accepting will add all items to inventory and update stock levels.
            </Alert>
          </Box>
        ) : (
          <Box mt={3}>
            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label="Rejection Reason"
              placeholder="Describe quality issues (damaged items, incorrect products, expired dates, etc.)"
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value)
                setError('')
              }}
              error={!!error}
              helperText={error}
            />
            
            <FormGroup sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notifySupplier}
                    onChange={(e) => setNotifySupplier(e.target.checked)}
                  />
                }
                label="Notify supplier about rejection"
              />
            </FormGroup>

            <Alert severity="warning" sx={{ mt: 2 }}>
              Rejecting will NOT add items to inventory. Consider coordinating return or replacement with supplier.
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          color={decision === 'accept' ? 'success' : 'error'}
          startIcon={decision === 'accept' ? <CheckCircle /> : <Cancel />}
        >
          {loading ? 'Processing...' : decision === 'accept' ? 'Accept Goods' : 'Reject Goods'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AcceptRejectDialog