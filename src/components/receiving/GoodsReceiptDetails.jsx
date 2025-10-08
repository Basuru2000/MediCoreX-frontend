import React, { useState, useEffect } from 'react'
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
  Alert,
  Stack,
  useTheme,
  alpha,
  IconButton
} from '@mui/material'
import {
  Close,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Description,
  LocalShipping,
  Business,
  Person,
  CalendarToday
} from '@mui/icons-material'
import AcceptRejectDialog from './AcceptRejectDialog'
import InventoryUpdateSummary from './InventoryUpdateSummary'
import ChecklistSummary from './ChecklistSummary'
import { acceptGoodsReceipt, rejectGoodsReceipt, checkChecklistExists } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

function GoodsReceiptDetails({ receipt, open, onClose, onUpdate }) {
  const theme = useTheme()
  const { user } = useAuth()
  const [openDecision, setOpenDecision] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasChecklist, setHasChecklist] = useState(false)

  const canMakeDecision = 
    (user?.role === 'HOSPITAL_MANAGER' || user?.role === 'PROCUREMENT_OFFICER') &&
    receipt?.acceptanceStatus === 'PENDING_APPROVAL'

  useEffect(() => {
    if (receipt?.id) {
      checkForChecklist()
    }
  }, [receipt])

  const checkForChecklist = async () => {
    try {
      const response = await checkChecklistExists(receipt.id)
      setHasChecklist(response.data.exists)
    } catch (error) {
      console.error('Error checking checklist:', error)
    }
  }

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
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAcceptanceStatusConfig = (status) => {
    const configs = {
      ACCEPTED: {
        color: 'success',
        bgcolor: alpha(theme.palette.success.main, 0.1),
        textColor: theme.palette.success.dark,
        icon: <CheckCircle sx={{ fontSize: 18 }} />,
        label: 'Accepted'
      },
      REJECTED: {
        color: 'error',
        bgcolor: alpha(theme.palette.error.main, 0.1),
        textColor: theme.palette.error.dark,
        icon: <Cancel sx={{ fontSize: 18 }} />,
        label: 'Rejected'
      },
      PENDING_APPROVAL: {
        color: 'warning',
        bgcolor: alpha(theme.palette.warning.main, 0.1),
        textColor: theme.palette.warning.dark,
        icon: <HourglassEmpty sx={{ fontSize: 18 }} />,
        label: 'Pending Quality Approval'
      }
    }
    
    return configs[status] || configs.PENDING_APPROVAL
  }

  if (!receipt) return null

  const statusConfig = getAcceptanceStatusConfig(receipt.acceptanceStatus)

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
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
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Description sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Goods Receipt Details
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {receipt.receiptNumber}
                </Typography>
              </Box>
            </Stack>
            <IconButton 
              onClick={onClose} 
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main
                }
              }}
            >
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: '8px' }} 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Status Alert */}
          {receipt.acceptanceStatus === 'PENDING_APPROVAL' && canMakeDecision && (
            <Alert 
              severity="warning" 
              sx={{ mb: 3, borderRadius: '8px' }}
              icon={<HourglassEmpty />}
            >
              This receipt is awaiting quality control decision. Review the items and make an accept or reject decision.
            </Alert>
          )}

          {/* Header Info */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: '8px',
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.02)
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Receipt Number
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    {receipt.receiptNumber}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Quality Status
                  </Typography>
                  <Chip
                    icon={statusConfig.icon}
                    label={statusConfig.label}
                    sx={{
                      backgroundColor: statusConfig.bgcolor,
                      color: statusConfig.textColor,
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      height: 28,
                      width: 'fit-content',
                      '& .MuiChip-icon': {
                        color: statusConfig.textColor
                      }
                    }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <LocalShipping sx={{ color: theme.palette.text.secondary, fontSize: 18, mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      PO Number
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {receipt.poNumber}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Business sx={{ color: theme.palette.text.secondary, fontSize: 18, mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Supplier
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {receipt.supplierName}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <CalendarToday sx={{ color: theme.palette.text.secondary, fontSize: 18, mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Receipt Date
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {formatDateTime(receipt.receiptDate)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Person sx={{ color: theme.palette.text.secondary, fontSize: 18, mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Received By
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {receipt.receivedByName}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {receipt.acceptanceStatus === 'REJECTED' && receipt.rejectionReason && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ borderRadius: '8px' }}>
                    <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>
                      Rejection Reason
                    </Typography>
                    <Typography variant="body2">
                      {receipt.rejectionReason}
                    </Typography>
                  </Alert>
                </Grid>
              )}

              {receipt.notes && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Notes
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {receipt.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Inventory Update Summary */}
          {receipt.acceptanceStatus === 'ACCEPTED' && (
            <Box mb={3}>
              <InventoryUpdateSummary receipt={receipt} />
            </Box>
          )}

          {/* Line Items */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, fontSize: '1.125rem' }}>
            Received Items
          </Typography>
          <TableContainer 
            component={Paper} 
            elevation={0}
            sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              overflow: 'hidden',
              mb: 3
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.03) }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Product</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Ordered</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Received</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Batch Number</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Expiry Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receipt.lines?.map((line) => (
                  <TableRow key={line.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>
                        {line.productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {line.productCode}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {line.orderedQuantity}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={line.receivedQuantity} 
                        color="primary" 
                        size="small"
                        sx={{ 
                          minWidth: 40,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          height: 24
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>
                        {line.batchNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {new Date(line.expiryDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Quality Inspection Section */}
          {hasChecklist && (
            <Box>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, fontSize: '1.125rem' }}>
                Quality Inspection
              </Typography>
              <ChecklistSummary receiptId={receipt.id} />
            </Box>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={onClose}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              color: theme.palette.text.secondary
            }}
          >
            Close
          </Button>
          
          {canMakeDecision && (
            <Button
              variant="contained"
              color="warning"
              onClick={() => setOpenDecision(true)}
              startIcon={<HourglassEmpty />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Make Quality Decision
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Accept/Reject Dialog */}
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