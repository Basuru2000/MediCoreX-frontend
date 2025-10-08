import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  useTheme,
  alpha
} from '@mui/material'
import {
  Close,
  CheckCircle,
  Cancel,
  ShoppingCart,
  Business,
  CalendarToday,
  LocalShipping,
  AttachMoney
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import OrderStatusBadge from './OrderStatusBadge'
import BasicOrderTimeline from './BasicOrderTimeline'

function PODetails({ order, open, onClose, onApprove, onReject }) {
  const theme = useTheme()
  const { user } = useAuth()

  if (!order) return null

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const infoItems = [
    {
      icon: <ShoppingCart sx={{ fontSize: 20 }} />,
      label: 'PO Number',
      value: order.poNumber,
      color: 'primary'
    },
    {
      icon: <Business sx={{ fontSize: 20 }} />,
      label: 'Supplier',
      value: order.supplierName,
      color: 'info'
    },
    {
      icon: <CalendarToday sx={{ fontSize: 20 }} />,
      label: 'Order Date',
      value: formatDate(order.orderDate),
      color: 'success'
    },
    {
      icon: <LocalShipping sx={{ fontSize: 20 }} />,
      label: 'Expected Delivery',
      value: order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : 'Not specified',
      color: 'warning'
    }
  ]

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
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
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }}
            >
              <ShoppingCart fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Purchase Order Details
            </Typography>
          </Box>
          <OrderStatusBadge status={order.status} />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* Info Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {infoItems.map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '8px',
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: alpha(theme.palette[item.color].main, 0.02)
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(theme.palette[item.color].main, 0.1),
                          color: theme.palette[item.color].main
                        }}
                      >
                        {item.icon}
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {item.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Created By & Approval Info */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '8px',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.grey[500], 0.02)
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Created By
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {order.createdByName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(order.createdAt)}
                  </Typography>
                </Grid>
                {order.approvedByName && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Approved By
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {order.approvedByName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(order.approvedDate)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>

          {/* Line Items */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Order Items
            </Typography>
            <TableContainer 
              component={Paper}
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Quantity</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Unit Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Received</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.lines?.map((line, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {line.productName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {line.productCode}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{line.quantity}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{formatCurrency(line.unitPrice)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(line.lineTotal)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${line.receivedQuantity || 0} / ${line.quantity}`}
                          size="small"
                          color={line.receivedQuantity >= line.quantity ? 'success' : 'default'}
                          sx={{
                            height: 24,
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={6} sx={{ ml: 'auto' }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '8px',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.primary.main, 0.02)
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Order Summary
              </Typography>
              <Stack spacing={1.5}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(order.subtotal)}
                  </Typography>
                </Box>
                {order.taxAmount > 0 && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Tax:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(order.taxAmount)}
                    </Typography>
                  </Box>
                )}
                {order.discountAmount > 0 && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Discount:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                      -{formatCurrency(order.discountAmount)}
                    </Typography>
                  </Box>
                )}
                <Divider />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Total:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {formatCurrency(order.totalAmount)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Notes */}
          {order.notes && (
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: alpha(theme.palette.grey[500], 0.02)
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Notes
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {order.notes}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Status Timeline */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Order Timeline
            </Typography>
            <BasicOrderTimeline orderId={order.id} />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ 
        px: 3, 
        py: 2, 
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.grey[500], 0.02)
      }}>
        {order.status === 'DRAFT' && user?.role === 'HOSPITAL_MANAGER' && (
          <Stack direction="row" spacing={1.5} sx={{ mr: 'auto' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => onReject && onReject(order)}
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
              onClick={() => onApprove && onApprove(order)}
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
        )}
        <Button 
          onClick={onClose} 
          startIcon={<Close />}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PODetails