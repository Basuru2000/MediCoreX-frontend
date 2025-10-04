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
  IconButton,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip
} from '@mui/material'
import { Visibility, Search } from '@mui/icons-material'
import { searchGoodsReceipts } from '../../services/api'

function GoodsReceiptList({ onView, refreshTrigger }) {
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
    return new Date(dateString).toLocaleString()
  }

  return (
    <Box>
      {/* Search Filter */}
      <Box mb={2}>
        <TextField
          size="small"
          placeholder="Search by receipt number or PO number..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
          sx={{ width: '100%', maxWidth: 400 }}
        />
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Receipt Number</strong></TableCell>
              <TableCell><strong>PO Number</strong></TableCell>
              <TableCell><strong>Supplier</strong></TableCell>
              <TableCell><strong>Receipt Date</strong></TableCell>
              <TableCell><strong>Received By</strong></TableCell>
              <TableCell align="center"><strong>Items</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Quality</strong></TableCell>
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
            ) : receipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="text.secondary">No receipts found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              receipts.map((receipt) => (
                <TableRow hover key={receipt.id}>
                  <TableCell>{receipt.receiptNumber}</TableCell>
                  <TableCell>{receipt.poNumber}</TableCell>
                  <TableCell>{receipt.supplierName}</TableCell>
                  <TableCell>{formatDateTime(receipt.receiptDate)}</TableCell>
                  <TableCell>{receipt.receivedByName}</TableCell>
                  <TableCell align="center">{receipt.lines?.length || 0}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={receipt.status}
                      size="small"
                      color={receipt.status === 'RECEIVED' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={receipt.acceptanceStatus}
                      size="small"
                      color={
                        receipt.acceptanceStatus === 'ACCEPTED' ? 'success' :
                        receipt.acceptanceStatus === 'PENDING_APPROVAL' ? 'warning' :
                        'error'
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => onView(receipt)}>
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
      />
    </Box>
  )
}

export default GoodsReceiptList