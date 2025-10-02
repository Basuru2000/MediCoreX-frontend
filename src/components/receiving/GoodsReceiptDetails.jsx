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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Alert
} from '@mui/material'
import { Close, CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material'
import AcceptRejectDialog from './AcceptRejectDialog'
import { acceptGoodsReceipt, rejectGoodsReceipt } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

function GoodsReceiptDetails({ receipt, open, onClose, onUpdate }) {
  const { user } = useAuth()
  const [openDecision, setOpenDecision] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canMakeDecision = 
    (user?.role === 'HOSPITAL_MANAGER' || user?.role === 'PROCUREMENT_OFFICER') &&
    receipt?.acceptanceStatus === 'PENDING_APPROVAL'

  const handleDecisionSubmit = async (decision, data) => {
    try {
      setLoading(true)
      setError('')

      if (decision === 'accept') {
        await acceptGoodsReceipt(receipt.id, data)
      } else {
        await rejectGoodsReceipt(receipt.id, data)
      }

      setOpenDecision(false)
      
      // Notify parent to refresh
      if (onUpdate) {
        onUpdate()
      }
      
      onClose()
    } catch (err) {
      console.error('Decision error:', err)
      setError(err.response?.data?.message || 'Failed to process decision')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getAcceptanceStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED': return 'success'
      case 'REJECTED': return 'error'
      case 'PENDING_APPROVAL': return 'warning'
      default: return 'default'
    }
  }

  const getAcceptanceStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED': return <CheckCircle />
      case 'REJECTED': return <Cancel />
      case 'PENDING_APPROVAL': return <HourglassEmpty />
      default: return null
    }
  }

  if (!receipt) return null

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Goods Receipt Details</Typography>
            <Button onClick={onClose} color="inherit">
              <Close />
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Acceptance Status Alert */}
          {receipt.acceptanceStatus === 'PENDING_APPROVAL' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              ⏳ This receipt is awaiting quality control decision. Review the items and accept or reject.
            </Alert>
          )}
          
          {receipt.acceptanceStatus === 'REJECTED' && receipt.rejectionReason && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <strong>Rejected:</strong> {receipt.rejectionReason}
            </Alert>
          )}

          {/* Receipt Information */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Receipt Number
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {receipt.receiptNumber}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  PO Number
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {receipt.poNumber}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Supplier
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {receipt.supplierName}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Receipt Date
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(receipt.receiptDate)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Received By
                </Typography>
                <Typography variant="body1">
                  {receipt.receivedByName}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip 
                  label={receipt.status} 
                  color="success" 
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              {/* ✨ NEW: Acceptance Status Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Quality Status
                </Typography>
                <Chip 
                  icon={getAcceptanceStatusIcon(receipt.acceptanceStatus)}
                  label={receipt.acceptanceStatus?.replace('_', ' ')} 
                  color={getAcceptanceStatusColor(receipt.acceptanceStatus)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              
              {receipt.qualityCheckedByName && (
                <>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Checked By
                    </Typography>
                    <Typography variant="body1">
                      {receipt.qualityCheckedByName}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Checked At
                    </Typography>
                    <Typography variant="body1">
                      {formatDateTime(receipt.qualityCheckedAt)}
                    </Typography>
                  </Grid>
                </>
              )}

              {receipt.notes && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body1">
                    {receipt.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Line Items */}
          <Typography variant="h6" gutterBottom>
            Received Items
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Product</strong></TableCell>
                  <TableCell align="center"><strong>Ordered</strong></TableCell>
                  <TableCell align="center"><strong>Received</strong></TableCell>
                  <TableCell><strong>Batch Number</strong></TableCell>
                  <TableCell><strong>Expiry Date</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receipt.lines?.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {line.productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {line.productCode}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{line.orderedQuantity}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={line.receivedQuantity} 
                        color="primary" 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{line.batchNumber}</TableCell>
                    <TableCell>
                      {new Date(line.expiryDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Close</Button>
          
          {/* ✨ NEW: Accept/Reject Buttons */}
          {canMakeDecision && (
            <Button
              variant="contained"
              color="warning"
              onClick={() => setOpenDecision(true)}
              startIcon={<HourglassEmpty />}
            >
              Make Quality Decision
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ✨ Accept/Reject Dialog */}
      <AcceptRejectDialog
        receipt={receipt}
        open={openDecision}
        onClose={() => setOpenDecision(false)}
        onSubmit={handleDecisionSubmit}
        loading={loading}
      />
    </>
  )
}

export default GoodsReceiptDetails