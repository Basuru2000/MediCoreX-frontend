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
  CircularProgress,
  Typography,
  useTheme
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
  const theme = useTheme()

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
      case 'ACTIVE': return <CheckCircle sx={{ fontSize: 16 }} />
      case 'INACTIVE': return <Warning sx={{ fontSize: 16 }} />
      case 'BLOCKED': return <Block sx={{ fontSize: 16 }} />
      default: return null
    }
  }

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center"
        minHeight="400px"
        gap={2}
      >
        <CircularProgress size={40} thickness={4} />
        <Typography variant="body2" color="text.secondary">
          Loading suppliers...
        </Typography>
      </Box>
    )
  }

  if (suppliers.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="400px"
        sx={{ textAlign: 'center' }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No suppliers found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start by adding your first supplier
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
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
              }}
            >
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>City</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier, index) => (
              <TableRow 
                key={supplier.id} 
                hover
                sx={{
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'light' ? 'action.hover' : 'action.selected'
                  },
                  bgcolor: index % 2 === 0 ? 'transparent' : 
                    (theme.palette.mode === 'light' ? 'grey.50' : 'grey.900')
                }}
              >
                <TableCell sx={{ fontSize: '0.875rem' }}>
                  <Typography variant="body2" fontWeight={500}>
                    {supplier.code}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>
                  <Typography variant="body2" fontWeight={500}>
                    {supplier.name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  {supplier.email || '-'}
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  {supplier.phone || '-'}
                </TableCell>
                <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  {supplier.city || '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(supplier.status)}
                    label={supplier.status}
                    color={getStatusColor(supplier.status)}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      borderRadius: '6px'
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" gap={0.5} justifyContent="center">
                    <Tooltip title="View Details" arrow>
                      <IconButton 
                        size="small" 
                        onClick={() => onView(supplier)}
                        sx={{
                          width: 32,
                          height: 32,
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.lighter'
                          }
                        }}
                      >
                        <Visibility sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    {canEdit && (
                      <Tooltip title="Edit" arrow>
                        <IconButton 
                          size="small" 
                          onClick={() => onEdit(supplier)}
                          sx={{
                            width: 32,
                            height: 32,
                            color: 'info.main',
                            '&:hover': {
                              bgcolor: 'info.lighter'
                            }
                          }}
                        >
                          <Edit sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canDelete && (
                      <Tooltip title="Delete" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onDelete(supplier.id)}
                          sx={{
                            width: 32,
                            height: 32,
                            color: 'error.main',
                            '&:hover': {
                              bgcolor: 'error.lighter'
                            }
                          }}
                        >
                          <Delete sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
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
        sx={{
          mt: 2,
          '.MuiTablePagination-toolbar': {
            fontSize: '0.875rem'
          },
          '.MuiTablePagination-select': {
            borderRadius: '6px'
          }
        }}
      />
    </Box>
  )
}

export default SupplierList