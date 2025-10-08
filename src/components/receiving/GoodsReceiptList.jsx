import React, { useState, useEffect } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Paper,
  Stack,
  useTheme,
  alpha
} from '@mui/material'
import { Visibility, Search, CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material'
import { searchGoodsReceipts } from '../../services/api'

function GoodsReceiptList({ onView, refreshTrigger }) {
  const theme = useTheme()
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0
  })
  const [filters, setFilters] = useState({
    search: ''
  })

  useEffect(() => {
    fetchReceipts()
  }, [pagination.page, pagination.size, filters, refreshTrigger])

  const fetchReceipts = async () => {
    try {
      setLoading(true)
      const response = await searchGoodsReceipts({
        ...filters,
        page: pagination.page,
        size: pagination.size
      })
      setReceipts(response.data.content)
      setPagination(prev => ({
        ...prev,
        totalElements: response.data.totalElements
      }))
    } catch (error) {
      console.error('Error fetching goods receipts:', error)
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

  const getStatusChip = (status) => {
    const configs = {
      RECEIVED: {
        label: 'Received',
        color: 'success',
        icon: <CheckCircle sx={{ fontSize: 16 }} />
      },
      CANCELLED: {
        label: 'Cancelled',
        color: 'error',
        icon: <Cancel sx={{ fontSize: 16 }} />
      }
    }
    
    const config = configs[status] || { label: status, color: 'default' }
    
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        size="small"
        color={config.color}
        sx={{ 
          fontWeight: 500,
          fontSize: '0.75rem',
          height: 24
        }}
      />
    )
  }

  const getAcceptanceChip = (acceptanceStatus) => {
    const configs = {
      ACCEPTED: {
        label: 'Accepted',
        color: 'success',
        bgcolor: alpha(theme.palette.success.main, 0.1),
        textColor: theme.palette.success.dark,
        icon: <CheckCircle sx={{ fontSize: 14 }} />
      },
      REJECTED: {
        label: 'Rejected',
        color: 'error',
        bgcolor: alpha(theme.palette.error.main, 0.1),
        textColor: theme.palette.error.dark,
        icon: <Cancel sx={{ fontSize: 14 }} />
      },
      PENDING_APPROVAL: {
        label: 'Pending QC',
        color: 'warning',
        bgcolor: alpha(theme.palette.warning.main, 0.1),
        textColor: theme.palette.warning.dark,
        icon: <HourglassEmpty sx={{ fontSize: 14 }} />
      }
    }
    
    const config = configs[acceptanceStatus] || { 
      label: acceptanceStatus, 
      bgcolor: alpha(theme.palette.grey[500], 0.1),
      textColor: theme.palette.text.secondary
    }
    
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        size="small"
        sx={{ 
          fontWeight: 500,
          fontSize: '0.75rem',
          height: 24,
          backgroundColor: config.bgcolor,
          color: config.textColor,
          border: 'none',
          '& .MuiChip-icon': {
            color: config.textColor
          }
        }}
      />
    )
  }

  return (
    <Box>
      {/* Search Filter */}
      <Box sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search by receipt number or PO number..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
              </InputAdornment>
            )
          }}
          sx={{ 
            width: '100%', 
            maxWidth: 400,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04)
              },
              '&.Mui-focused': {
                backgroundColor: 'white'
              }
            }
          }}
        />
      </Box>

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
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.03) }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Receipt Number</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>PO Number</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Supplier</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Receipt Date</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Received By</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Items</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Quality Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                  <Stack alignItems="center" spacing={2}>
                    <CircularProgress size={40} thickness={4} />
                    <Typography variant="body2" color="text.secondary">
                      Loading receipts...
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : receipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    {filters.search ? 'No receipts found matching your search' : 'No receipts found'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              receipts.map((receipt) => (
                <TableRow 
                  hover 
                  key={receipt.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => onView(receipt)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      {receipt.receiptNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {receipt.poNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {receipt.supplierName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: theme.palette.text.secondary }}>
                      {formatDateTime(receipt.receiptDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {receipt.receivedByName}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={receipt.lines?.length || 0}
                      size="small"
                      sx={{ 
                        minWidth: 32,
                        height: 24,
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {getStatusChip(receipt.status)}
                  </TableCell>
                  <TableCell align="center">
                    {getAcceptanceChip(receipt.acceptanceStatus)}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details" arrow>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation()
                          onView(receipt)
                        }}
                        sx={{
                          color: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          mt: 2
        }}
      >
        <TablePagination
          component="div"
          count={pagination.totalElements}
          page={pagination.page}
          onPageChange={(e, newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
          rowsPerPage={pagination.size}
          onRowsPerPageChange={(e) => setPagination(prev => ({ 
            ...prev, 
            size: parseInt(e.target.value), 
            page: 0 
          }))}
          sx={{
            '& .MuiTablePagination-select': {
              borderRadius: '8px'
            }
          }}
        />
      </Box>
    </Box>
  )
}

export default GoodsReceiptList