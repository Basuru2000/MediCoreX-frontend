import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  Box
} from '@mui/material'
import { Close } from '@mui/icons-material'

function PODetails({ order, open, onClose }) {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'default'
      case 'APPROVED': return 'info'
      case 'SENT': return 'primary'
      case 'RECEIVED': return 'success'
      case 'CANCELLED': return 'error'
      default: return 'default'
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Purchase Order Details</Typography>
          <Chip 
            label={order.status} 
            color={getStatusColor(order.status)}
          />
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Header Information */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">PO Number</Typography>
            <Typography variant="h6" gutterBottom>{order.poNumber}</Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Supplier</Typography>
            <Typography variant="body1" gutterBottom>
              {order.supplierName} ({order.supplierCode})
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Order Date</Typography>
            <Typography variant="body1" gutterBottom>
              {formatDate(order.orderDate)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">Expected Delivery</Typography>
            <Typography variant="body1" gutterBottom>
              {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : 'Not specified'}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary">Created By</Typography>
            <Typography variant="body1" gutterBottom>
              {order.createdByName}
            </Typography>
            
            {order.approvedByName && (
              <>
                <Typography variant="subtitle2" color="text.secondary">Approved By</Typography>
                <Typography variant="body1" gutterBottom>
                  {order.approvedByName} on {formatDate(order.approvedDate)}
                </Typography>
              </>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Line Items */}
        <Typography variant="h6" gutterBottom>Line Items</Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell align="right"><strong>Quantity</strong></TableCell>
                <TableCell align="right"><strong>Unit Price</strong></TableCell>
                <TableCell align="right"><strong>Discount</strong></TableCell>
                <TableCell align="right"><strong>Tax</strong></TableCell>
                <TableCell align="right"><strong>Line Total</strong></TableCell>
                <TableCell align="right"><strong>Received</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    {line.productName}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {line.productCode}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{line.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(line.unitPrice)}</TableCell>
                  <TableCell align="right">{line.discountPercentage}%</TableCell>
                  <TableCell align="right">{line.taxPercentage}%</TableCell>
                  <TableCell align="right">{formatCurrency(line.lineTotal)}</TableCell>
                  <TableCell align="right">{line.receivedQuantity || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 3 }} />

        {/* Totals */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            {order.notes && (
              <>
                <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                <Typography variant="body2">{order.notes}</Typography>
              </>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Subtotal:</Typography>
              <Typography>{formatCurrency(order.subtotal)}</Typography>
            </Box>
            {order.taxAmount > 0 && (
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Tax:</Typography>
                <Typography>{formatCurrency(order.taxAmount)}</Typography>
              </Box>
            )}
            {order.discountAmount > 0 && (
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Discount:</Typography>
                <Typography>-{formatCurrency(order.discountAmount)}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">{formatCurrency(order.totalAmount)}</Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} startIcon={<Close />}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PODetails