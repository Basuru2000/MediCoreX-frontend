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
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress
} from '@mui/material'
import {
  Edit,
  Delete,
  Visibility,
  Search,
  Send,
  AutoAwesome
} from '@mui/icons-material'
import { searchPurchaseOrders, deletePurchaseOrder } from '../../services/api'
import OrderStatusBadge from './OrderStatusBadge'
import ReceiptProgressIndicator from '../receiving/ReceiptProgressIndicator'

function POList({ onView, onEdit, canEdit, canDelete, onStatusUpdate, refreshTrigger }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0
  })
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  })

  useEffect(() => {
    fetchOrders()
  }, [pagination.page, pagination.size, filters, refreshTrigger])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await searchPurchaseOrders({
        ...filters,
        page: pagination.page,
        size: pagination.size
      })
      setOrders(response.data.content)
      setPagination(prev => ({
        ...prev,
        totalElements: response.data.totalElements
      }))
    } catch (error) {
      console.error('Error fetching purchase orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await deletePurchaseOrder(id)
        fetchOrders()
      } catch (error) {
        console.error('Error deleting PO:', error)
        alert('Failed to delete purchase order')
      }
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

  return (
    <Box>
      {/* Filters */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          size="small"
          placeholder="Search by PO number or supplier..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
          sx={{ flexGrow: 1 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="DRAFT">Draft</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="SENT">Sent</MenuItem>
            <MenuItem value="RECEIVED">Received</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>PO Number</strong></TableCell>
              <TableCell><strong>Supplier</strong></TableCell>
              <TableCell><strong>Order Date</strong></TableCell>
              <TableCell><strong>Expected Delivery</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Fulfillment</strong></TableCell>
              <TableCell align="right"><strong>Total Amount</strong></TableCell>
              <TableCell align="center"><strong>Items</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No purchase orders found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                // Calculate totals from lines
                const totalOrdered = order.lines?.reduce((sum, line) => sum + (line.quantity || 0), 0) || 0
                const totalReceived = order.lines?.reduce((sum, line) => sum + (line.receivedQuantity || 0), 0) || 0
                const totalRemaining = order.lines?.reduce((sum, line) => sum + (line.remainingQuantity || 0), 0) || 0
                
                return (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {order.autoGenerated && (
                          <Tooltip title="Auto-Generated PO">
                            <AutoAwesome fontSize="small" color="primary" />
                          </Tooltip>
                        )}
                        <Typography 
                          variant="body2" 
                          fontWeight={600}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' }
                          }}
                          onClick={() => onView && onView(order)}
                        >
                          {order.poNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{order.supplierName}</TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell>
                      {order.expectedDeliveryDate 
                        ? formatDate(order.expectedDeliveryDate)
                        : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <OrderStatusBadge status={order.status} />
                        {order.status === 'DRAFT' && (
                          <Tooltip title="Pending Approval">
                            <Chip 
                              label="!" 
                              size="small" 
                              color="warning"
                              sx={{ width: 24, minWidth: 24 }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {(order.status === 'RECEIVED' || 
                        order.status === 'PARTIALLY_RECEIVED' ||
                        order.status === 'SENT') ? (
                        <Box sx={{ width: '100%', py: 1 }}>
                          <ReceiptProgressIndicator
                            ordered={totalOrdered}
                            received={totalReceived}
                            remaining={totalRemaining}
                          />
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(order.totalAmount)}
                    </TableCell>
                    <TableCell align="center">
                      {order.totalItems}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => onView(order)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {canEdit && order.status === 'DRAFT' && (
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => onEdit(order)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDelete && order.status === 'DRAFT' && (
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDelete(order.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(order.status === 'APPROVED' || order.status === 'SENT') && (
                        <Tooltip title="Update Status">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => onStatusUpdate && onStatusUpdate(order)}
                          >
                            <Send fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
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

export default POList