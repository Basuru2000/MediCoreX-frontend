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
  Grid,
  Stack,
  useTheme,
  alpha
} from '@mui/material'
import {
  CheckCircle,
  AddCircle,
  Update,
  Inventory2,
  TrendingUp
} from '@mui/icons-material'

function InventoryUpdateSummary({ receipt }) {
  const theme = useTheme()

  if (!receipt || !receipt.lines) {
    return null
  }

  const totalQuantity = receipt.lines.reduce((sum, line) => sum + line.receivedQuantity, 0)
  const totalValue = receipt.lines.reduce((sum, line) => sum + (line.lineTotal || 0), 0)
  const uniqueProducts = receipt.lines.length

  return (
    <Box>
      {/* Success Banner */}
      <Alert 
        severity="success" 
        icon={<CheckCircle />} 
        sx={{ 
          mb: 3,
          borderRadius: '8px',
          border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
          backgroundColor: alpha(theme.palette.success.main, 0.08)
        }}
      >
        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
          Inventory Successfully Updated!
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.875rem', mt: 0.5 }}>
          All items have been added to stock and are ready for use.
        </Typography>
      </Alert>

      {/* Summary Stats */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2.5, 
          mb: 3,
          borderRadius: '8px',
          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
          backgroundColor: alpha(theme.palette.success.main, 0.04)
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '8px',
                  backgroundColor: alpha(theme.palette.success.main, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <TrendingUp sx={{ color: theme.palette.success.main, fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  Total Items Added
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight={700}>
                  {totalQuantity}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '8px',
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Inventory2 sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  Products Updated
                </Typography>
                <Typography variant="h5" color="primary.main" fontWeight={700}>
                  {uniqueProducts}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '8px',
                  backgroundColor: alpha(theme.palette.info.main, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AddCircle sx={{ color: theme.palette.info.main, fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  Total Value
                </Typography>
                <Typography variant="h5" color="info.main" fontWeight={700}>
                  ${totalValue.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Detailed Breakdown */}
      <Typography 
        variant="h6" 
        fontWeight={600} 
        sx={{ 
          mb: 2,
          fontSize: '1.125rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Inventory2 sx={{ fontSize: 22 }} />
        Batch Details
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
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.03) }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Batch Number</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Quantity</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Unit Cost</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Total Value</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {receipt.lines.map((line, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>
                    {line.productName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {line.productCode}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                      {line.batchNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Exp: {new Date(line.expiryDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={line.receivedQuantity} 
                    color="success" 
                    size="small"
                    sx={{ 
                      minWidth: 40,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      height: 24
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    ${line.unitCost?.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                    ${line.lineTotal?.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    icon={line.batchId ? <Update sx={{ fontSize: 14 }} /> : <AddCircle sx={{ fontSize: 14 }} />}
                    label={line.batchId ? 'Updated' : 'New Batch'}
                    color={line.batchId ? 'info' : 'primary'}
                    size="small"
                    sx={{ 
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      height: 24
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Confirmation */}
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 2.5,
          borderRadius: '8px',
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          backgroundColor: alpha(theme.palette.info.main, 0.04)
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              Stock transactions logged for audit trail
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              Product quantities updated
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              Supplier performance metrics updated
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              Purchase prices recalculated
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}

export default InventoryUpdateSummary