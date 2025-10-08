import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  Stack,
  useTheme,
  alpha
} from '@mui/material'
import { Visibility, CheckCircle } from '@mui/icons-material'
import { getPendingApprovals } from '../../services/api'

function PendingApprovalsList({ onView, onApprove, refreshTrigger }) {
  const theme = useTheme()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0
  })

  useEffect(() => {
    fetchPendingApprovals()
  }, [pagination.page, pagination.size, refreshTrigger])

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true)
      const response = await getPendingApprovals({
        page: pagination.page,
        size: pagination.size
      })
      setOrders(response.data.content)
      setPagination(prev => ({
        ...prev,
        totalElements: response.data.totalElements
      }))
    } catch (error) {
      console.error('Error fetching pending approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading && orders.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={6}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    )
  }

  if (orders.length === 0) {
    return (
      <Box 
        sx={{ 
          textAlign: 'center', 
          py: 6,
          px: 3,
          bgcolor: alpha(theme.palette.success.main, 0.05),
          borderRadius: '8px',
          border: `1px dashed ${alpha(theme.palette.success.main, 0.3)}`
        }}
      >
        <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          All caught up!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No pending approvals at the moment
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <TableContainer 
        component={Paper}
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>PO Number</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Supplier</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Created By</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Order Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>Total Amount</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: 'text.primary' }}>Items</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: 'text.primary' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow 
                key={order.id}
                hover
                sx={{
                  '&:hover': {
                    bgcolor: alpha(theme.palette.warning.main, 0.03)
                  }
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {order.poNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{order.supplierName}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{order.createdByName}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{formatDate(order.orderDate)}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={600} color="primary">
                    {formatCurrency(order.totalAmount)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={order.totalItems} 
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={() => onView(order)}
                        sx={{
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main'
                          }
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Approve/Reject">
                      <IconButton 
                        size="small" 
                        onClick={() => onApprove(order)}
                        sx={{
                          '&:hover': {
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            color: 'success.main'
                          }
                        }}
                      >
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination.totalElements > pagination.size && (
        <TablePagination
          component="div"
          count={pagination.totalElements}
          page={pagination.page}
          onPageChange={(e, newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
          rowsPerPage={pagination.size}
          onRowsPerPageChange={(e) => setPagination(prev => ({ 
            ...prev, 
            size: parseInt(e.target.value, 10),
            page: 0 
          }))}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            '.MuiTablePagination-select': {
              borderRadius: '6px'
            }
          }}
        />
      )}
    </Box>
  )
}

export default PendingApprovalsList