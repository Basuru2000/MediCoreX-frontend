import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Grid  
} from '@mui/material'
import {
  CheckCircle,
  AddCircle,
  Update,
  Inventory2
} from '@mui/icons-material'

function InventoryUpdateSummary({ receipt }) {
  if (!receipt || !receipt.lines) {
    return null
  }

  // Calculate summary stats
  const totalQuantity = receipt.lines.reduce((sum, line) => sum + line.receivedQuantity, 0)
  const totalValue = receipt.lines.reduce((sum, line) => sum + (line.lineTotal || 0), 0)

  return (
    <Box>
      <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
        <strong>Inventory Successfully Updated!</strong> All items have been added to stock.
      </Alert>

      {/* Summary Stats */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'success.lighter' }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              Total Items Added
            </Typography>
            <Typography variant="h5" color="success.main">
              {totalQuantity}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              Products Updated
            </Typography>
            <Typography variant="h5" color="success.main">
              {receipt.lines.length}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              Total Value
            </Typography>
            <Typography variant="h5" color="success.main">
              ${totalValue.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Detailed Breakdown */}
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Inventory2 />
        Batch Details
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Product</strong></TableCell>
              <TableCell><strong>Batch Number</strong></TableCell>
              <TableCell align="center"><strong>Quantity</strong></TableCell>
              <TableCell align="center"><strong>Unit Cost</strong></TableCell>
              <TableCell align="right"><strong>Total</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {receipt.lines.map((line, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Typography variant="body2">{line.productName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {line.productCode}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {line.batchNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Exp: {new Date(line.expiryDate).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={line.receivedQuantity} 
                    color="success" 
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  ${line.unitCost?.toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  <strong>${line.lineTotal?.toFixed(2)}</strong>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    icon={line.batchId ? <Update /> : <AddCircle />}
                    label={line.batchId ? 'Updated' : 'New Batch'}
                    color={line.batchId ? 'info' : 'primary'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Confirmation */}
      <Alert severity="info" sx={{ mt: 2 }}>
        ✅ Stock transactions logged for audit trail<br/>
        ✅ Product quantities updated<br/>
        ✅ Supplier performance metrics updated<br/>
        ✅ Purchase prices recalculated
      </Alert>
    </Box>
  )
}

export default InventoryUpdateSummary