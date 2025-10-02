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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip
} from '@mui/material'
import { Close } from '@mui/icons-material'

function GoodsReceiptDetails({ receipt, open, onClose }) {
  if (!receipt) return null

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Goods Receipt Details</Typography>
          <Button startIcon={<Close />} onClick={onClose}>
            Close
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Header Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Receipt Number
              </Typography>
              <Typography variant="h6" color="primary">
                {receipt.receiptNumber}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                PO Number
              </Typography>
              <Typography variant="h6">
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
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip 
                label={receipt.status} 
                color="success" 
                sx={{ mt: 0.5 }}
              />
            </Grid>
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
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell align="center"><strong>Ordered</strong></TableCell>
                <TableCell align="center"><strong>Received</strong></TableCell>
                <TableCell><strong>Batch Number</strong></TableCell>
                <TableCell><strong>Expiry Date</strong></TableCell>
                <TableCell><strong>Mfg Date</strong></TableCell>
                <TableCell align="right"><strong>Unit Cost</strong></TableCell>
                <TableCell align="right"><strong>Total</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receipt.lines.map((line) => (
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
                      size="small" 
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>{line.batchNumber}</TableCell>
                  <TableCell>{formatDate(line.expiryDate)}</TableCell>
                  <TableCell>
                    {line.manufactureDate ? formatDate(line.manufactureDate) : '-'}
                  </TableCell>
                  <TableCell align="right">
                    ${line.unitCost.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>
                      ${line.lineTotal.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={7} align="right">
                  <Typography variant="h6">Total:</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" color="primary">
                    ${receipt.lines.reduce((sum, line) => sum + line.lineTotal, 0).toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default GoodsReceiptDetails