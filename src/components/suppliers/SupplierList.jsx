import React from 'react'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Tooltip,
  Box,
  CircularProgress
} from '@mui/material'
import {
  Edit,
  Delete,
  Visibility,
  Block,
  CheckCircle,
  Warning
} from '@mui/icons-material'

function SupplierList({
  suppliers,
  loading,
  pagination,
  onPageChange,
  onSizeChange,
  onEdit,
  onView,
  onDelete,
  onStatusChange,
  canEdit,
  canDelete
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success'
      case 'INACTIVE': return 'default'
      case 'BLOCKED': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle fontSize="small" />
      case 'INACTIVE': return <Warning fontSize="small" />
      case 'BLOCKED': return <Block fontSize="small" />
      default: return null
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Paper sx={{ borderRadius: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id} hover>
                <TableCell>{supplier.code}</TableCell>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.email || '-'}</TableCell>
                <TableCell>{supplier.phone || '-'}</TableCell>
                <TableCell>{supplier.city || '-'}</TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(supplier.status)}
                    label={supplier.status}
                    color={getStatusColor(supplier.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => onView(supplier)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {canEdit && (
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(supplier)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {canDelete && (
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(supplier.id)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
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
        onPageChange={(e, newPage) => onPageChange(newPage)}
        rowsPerPage={pagination.size}
        onRowsPerPageChange={(e) => onSizeChange(parseInt(e.target.value, 10))}
      />
    </Paper>
  )
}

export default SupplierList