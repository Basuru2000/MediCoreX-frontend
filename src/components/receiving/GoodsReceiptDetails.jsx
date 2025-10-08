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
  CalendarToday,
  ShoppingCart
} from '@mui/icons-material'
import AcceptRejectDialog from './AcceptRejectDialog'
import QualityChecklistDialog from './QualityChecklistDialog'
import InventoryUpdateSummary from './InventoryUpdateSummary'
import ChecklistSummary from './ChecklistSummary'
import { acceptGoodsReceipt, rejectGoodsReceipt, checkChecklistExists } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

function GoodsReceiptDetails({ receipt, open, onClose, onUpdate }) {
  const theme = useTheme()
  const { user } = useAuth()
  const [openDecision, setOpenDecision] = useState(false)
  const [openChecklist, setOpenChecklist] = useState(false) // ✅ NEW
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

  // ✅ NEW: Handle the Make Quality Decision button click
  const handleMakeDecision = () => {
    if (hasChecklist) {
      // Checklist already completed, go directly to decision
      setOpenDecision(true)
    } else {
      // No checklist yet, open checklist dialog first
      setOpenChecklist(true)
    }
  }

  // ✅ NEW: Handle checklist completion
  const handleChecklistComplete = (checklistData) => {
    setOpenChecklist(false)
    setHasChecklist(true)
    // After checklist is submitted, automatically open accept/reject dialog
    setOpenDecision(true)
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

          {/* Acceptance Status Badge */}
          <Box sx={{ mb: 3 }}>
            <Chip
              icon={statusConfig.icon}
              label={statusConfig.label}
              sx={{
                bgcolor: statusConfig.bgcolor,
                color: statusConfig.textColor,
                fontWeight: 600,
                fontSize: '0.875rem',
                height: 32,
                '& .MuiChip-icon': {
                  color: statusConfig.textColor
                }
              }}
            />
          </Box>

          {/* Receipt Information Grid */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Stack spacing={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <ShoppingCart sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Purchase Order
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem' }}>
                    {receipt.poNumber}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: alpha(theme.palette.info.main, 0.04),
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Stack spacing={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Business sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Supplier
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem' }}>
                    {receipt.supplierName}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: alpha(theme.palette.success.main, 0.04),
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Stack spacing={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Receipt Date
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {formatDateTime(receipt.receiptDate)}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: alpha(theme.palette.warning.main, 0.04),
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Stack spacing={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Person sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Received By
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {receipt.receivedByName}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Received Items Table */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, fontSize: '1.125rem' }}>
            Received Items
          </Typography>

          <TableContainer 
            component={Paper} 
            elevation={0}
            sx={{ 
              mb: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.813rem' }}>Product</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.813rem' }}>Ordered</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.813rem' }}>Received</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.813rem' }}>Batch Number</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.813rem' }}>Expiry Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receipt.lines?.map((line, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                        {line.productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {line.productCode}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={line.orderedQuantity} 
                        size="small"
                        sx={{ 
                          height: 24,
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={line.receivedQuantity} 
                        size="small"
                        color="primary"
                        sx={{ 
                          height: 24,
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
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

          {/* Inventory Update Summary (only show if accepted) */}
          {receipt.acceptanceStatus === 'ACCEPTED' && (
            <Box>
              <Divider sx={{ my: 3 }} />
              <InventoryUpdateSummary receipt={receipt} />
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
              onClick={handleMakeDecision} // ✅ CHANGED: Now uses new handler
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

      {/* ✅ NEW: Quality Checklist Dialog */}
      <QualityChecklistDialog
        open={openChecklist}
        onClose={() => setOpenChecklist(false)}
        receipt={receipt}
        onChecklistComplete={handleChecklistComplete}
      />

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