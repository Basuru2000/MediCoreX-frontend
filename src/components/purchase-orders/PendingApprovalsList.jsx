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
  Button
} from '@mui/material'
import { Visibility, CheckCircle, Cancel } from '@mui/icons-material'
import { getPendingApprovals } from '../../services/api'

function PendingApprovalsList({ onView, onApprove, refreshTrigger }) {
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
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  if (orders.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No pending approvals at the moment
        </Typography>
      </Paper>
    )
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>PO Number</strong></TableCell>
              <TableCell><strong>Supplier</strong></TableCell>
              <TableCell><strong>Created By</strong></TableCell>
              <TableCell><strong>Order Date</strong></TableCell>
              <TableCell align="right"><strong>Total Amount</strong></TableCell>
              <TableCell align="center"><strong>Items</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {order.poNumber}
                  </Typography>
                </TableCell>
                <TableCell>{order.supplierName}</TableCell>
                <TableCell>{order.createdByName}</TableCell>
                <TableCell>{formatDate(order.orderDate)}</TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {formatCurrency(order.totalAmount)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip label={order.totalItems} size="small" />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => onView(order)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Approve/Reject">
                    <IconButton 
                      size="small" 
                      color="success"
                      onClick={() => onApprove(order)}
                    >
                      <CheckCircle fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
      />
    </Box>
  )
}

export default PendingApprovalsList