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
  CircularProgress,
  Stack,
  useTheme,
  alpha
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
  const theme = useTheme()
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
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search by PO number or supplier..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
              </InputAdornment>
            )
          }}
          sx={{ 
            flexGrow: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px'
            }
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            sx={{
              borderRadius: '8px'
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="DRAFT">Draft</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="SENT">Sent</MenuItem>
            <MenuItem value="PARTIALLY_RECEIVED">Partially Received</MenuItem>
            <MenuItem value="RECEIVED">Received</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Table */}
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
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>PO Number</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Supplier</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Order Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Expected Delivery</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: 'text.primary' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: 'text.primary' }}>Fulfillment</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>Total Amount</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: 'text.primary' }}>Items</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, color: 'text.primary' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={40} thickness={4} />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No purchase orders found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow 
                  key={order.id}
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.02)
                    }
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight={600}>
                        {order.poNumber}
                      </Typography>
                      {order.autoGenerated && (
                        <Tooltip title="Auto-generated">
                          <AutoAwesome sx={{ fontSize: 16, color: 'primary.main' }} />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{order.supplierName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.supplierCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDate(order.orderDate)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell align="center">
                    <ReceiptProgressIndicator 
                      totalItems={order.totalItems}
                      receivedItems={order.totalReceived}
                    />
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
                      {canEdit && order.status === 'DRAFT' && (
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => onEdit(order)}
                            sx={{
                              '&:hover': {
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                color: 'info.main'
                              }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDelete && order.status === 'DRAFT' && (
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(order.id)}
                            sx={{
                              '&:hover': {
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                color: 'error.main'
                              }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(order.status === 'APPROVED' || order.status === 'SENT') && (
                        <Tooltip title="Update Status">
                          <IconButton 
                            size="small" 
                            onClick={() => onStatusUpdate && onStatusUpdate(order)}
                            sx={{
                              '&:hover': {
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                color: 'success.main'
                              }
                            }}
                          >
                            <Send fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
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
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          '.MuiTablePagination-select': {
            borderRadius: '6px'
          }
        }}
      />
    </Box>
  )
}

export default POList