import React, { useState, useEffect } from 'react'
import {
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Snackbar,
  Alert as MuiAlert,
  Stack,
  Avatar,
  CircularProgress,
  useTheme,
  alpha,
  Skeleton,
  TableSortLabel
} from '@mui/material'
import {
  Visibility,
  Delete,
  AssignmentReturn,
  CheckCircle,
  Cancel,
  Schedule,
  Warning,
  ArrowForward
} from '@mui/icons-material'
import { format } from 'date-fns'
import { 
  getQuarantineRecords,
  processQuarantineAction 
} from '../../services/api'
import QuarantineDetails from './QuarantineDetails'

const QuarantineList = ({ status, onRefresh }) => {
  const theme = useTheme()
  const [records, setRecords] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [actionDialog, setActionDialog] = useState({ open: false, record: null, action: '' })
  const [actionData, setActionData] = useState({
    comments: '',
    disposalMethod: '',
    disposalCertificate: '',
    returnReference: ''
  })
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })
  const [orderBy, setOrderBy] = useState('quarantineDate')
  const [order, setOrder] = useState('desc')

  useEffect(() => {
    loadRecords()
  }, [page, rowsPerPage, status])

  const loadRecords = async () => {
    try {
      setLoading(true)
      const response = await getQuarantineRecords({
        status,
        page,
        size: rowsPerPage
      })
      setRecords(response.data.content || [])
      setTotalElements(response.data.totalElements || 0)
    } catch (error) {
      console.error('Failed to load quarantine records:', error)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    try {
      await processQuarantineAction({
        quarantineRecordId: actionDialog.record.id,
        action: actionDialog.action,
        ...actionData
      })
      
      let successMessage = ''
      switch(actionDialog.action) {
        case 'REVIEW':
          successMessage = 'Item moved to Under Review'
          break
        case 'APPROVE_DISPOSAL':
          successMessage = 'Item approved for disposal'
          break
        case 'APPROVE_RETURN':
          successMessage = 'Item approved for return'
          break
        case 'DISPOSE':
          successMessage = 'Item successfully disposed'
          break
        case 'RETURN':
          successMessage = 'Item successfully returned'
          break
        default:
          successMessage = 'Action completed successfully'
      }

      setSnackbar({
        open: true,
        message: successMessage,
        severity: 'success'
      })

      setActionDialog({ open: false, record: null, action: '' })
      setActionData({
        comments: '',
        disposalMethod: '',
        disposalCertificate: '',
        returnReference: ''
      })
      
      loadRecords()
      if (onRefresh) onRefresh()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to process action',
        severity: 'error'
      })
    }
  }

  const getStatusChip = (status) => {
    const statusConfig = {
      PENDING_REVIEW: { 
        label: 'Pending Review', 
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.1),
        icon: <Schedule sx={{ fontSize: 14 }} />
      },
      UNDER_REVIEW: { 
        label: 'Under Review', 
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.1),
        icon: <Schedule sx={{ fontSize: 14 }} />
      },
      APPROVED_FOR_DISPOSAL: { 
        label: 'For Disposal', 
        color: theme.palette.error.main,
        bgColor: alpha(theme.palette.error.main, 0.1),
        icon: <Delete sx={{ fontSize: 14 }} />
      },
      APPROVED_FOR_RETURN: { 
        label: 'For Return', 
        color: theme.palette.secondary.main,
        bgColor: alpha(theme.palette.secondary.main, 0.1),
        icon: <AssignmentReturn sx={{ fontSize: 14 }} />
      },
      DISPOSED: { 
        label: 'Disposed', 
        color: theme.palette.grey[600],
        bgColor: alpha(theme.palette.grey[600], 0.1),
        icon: <Cancel sx={{ fontSize: 14 }} />
      },
      RETURNED: { 
        label: 'Returned', 
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1),
        icon: <CheckCircle sx={{ fontSize: 14 }} />
      }
    }

    const config = statusConfig[status] || { 
      label: status, 
      color: theme.palette.grey[600],
      bgColor: alpha(theme.palette.grey[600], 0.1)
    }

    return (
      <Chip
        label={config.label}
        size="small"
        icon={config.icon}
        sx={{
          backgroundColor: config.bgColor,
          color: config.color,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 26,
          '& .MuiChip-icon': {
            color: config.color,
            marginLeft: '6px'
          }
        }}
      />
    )
  }

  const getActionButtons = (record) => {
    const buttons = []
    
    if (record.status === 'PENDING_REVIEW') {
      buttons.push(
        <Tooltip title="Start Review" key="review">
          <IconButton
            size="small"
            onClick={() => setActionDialog({ open: true, record, action: 'REVIEW' })}
            sx={{
              color: theme.palette.info.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.info.main, 0.1)
              }
            }}
          >
            <Schedule fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    }

    if (record.status === 'UNDER_REVIEW') {
      buttons.push(
        <Tooltip title="Approve Disposal" key="dispose">
          <IconButton
            size="small"
            onClick={() => setActionDialog({ open: true, record, action: 'APPROVE_DISPOSAL' })}
            sx={{
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.1)
              }
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      )
      buttons.push(
        <Tooltip title="Approve Return" key="return">
          <IconButton
            size="small"
            onClick={() => setActionDialog({ open: true, record, action: 'APPROVE_RETURN' })}
            sx={{
              color: theme.palette.success.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.success.main, 0.1)
              }
            }}
          >
            <AssignmentReturn fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    }

    if (record.status === 'APPROVED_FOR_DISPOSAL') {
      buttons.push(
        <Tooltip title="Confirm Disposal" key="confirm-dispose">
          <IconButton
            size="small"
            onClick={() => setActionDialog({ open: true, record, action: 'DISPOSE' })}
            sx={{
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.1)
              }
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    }

    if (record.status === 'APPROVED_FOR_RETURN') {
      buttons.push(
        <Tooltip title="Confirm Return" key="confirm-return">
          <IconButton
            size="small"
            onClick={() => setActionDialog({ open: true, record, action: 'RETURN' })}
            sx={{
              color: theme.palette.success.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.success.main, 0.1)
              }
            }}
          >
            <AssignmentReturn fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    }

    return buttons
  }

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  if (loading && records.length === 0) {
    return (
      <Paper elevation={0} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <TableCell key={i}>
                    <Skeleton animation="wave" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map(i => (
                <TableRow key={i}>
                  {[1, 2, 3, 4, 5, 6, 7].map(j => (
                    <TableCell key={j}>
                      <Skeleton animation="wave" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    )
  }

  return (
    <>
      <TableContainer 
        component={Paper} 
        elevation={0}
        sx={{ 
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.grey[50], 0.5) }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                Product Details
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                Batch
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                Quantity
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'quarantineDate'}
                  direction={orderBy === 'quarantineDate' ? order : 'asc'}
                  onClick={() => handleRequestSort('quarantineDate')}
                  sx={{ fontWeight: 600, fontSize: '0.875rem', color: theme.palette.text.secondary }}
                >
                  Quarantine Date
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                Duration
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                Status
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                Est. Loss
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Warning sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 2 }} />
                    <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                      No quarantine records found
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
                      {status ? `No records with status: ${status}` : 'Start by quarantining expired or damaged items'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow
                  key={record.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.02)
                    },
                    '&:last-child td, &:last-child th': {
                      border: 0
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: theme.palette.error.main
                        }}
                      >
                        {record.productName?.charAt(0) || 'P'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                          {record.productName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {record.productCode}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {record.batchNumber}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${record.quantityQuarantined} units`}
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {record.quarantineDate 
                        ? format(new Date(record.quarantineDate), 'MMM dd, yyyy')
                        : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        color: record.daysInQuarantine > 7 
                          ? theme.palette.error.main 
                          : theme.palette.text.primary
                      }}
                    >
                      {record.daysInQuarantine || 0} days
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {getStatusChip(record.status)}
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.error.main
                      }}
                    >
                      ${record.estimatedLoss ? record.estimatedLoss.toFixed(2) : '0.00'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => setSelectedRecord(record)}
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
                      {getActionButtons(record)}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            '.MuiTablePagination-toolbar': {
              paddingLeft: 2,
              paddingRight: 2
            }
          }}
        />
      </TableContainer>

      {/* Details Dialog */}
      {selectedRecord && (
        <QuarantineDetails
          record={selectedRecord}
          open={Boolean(selectedRecord)}
          onClose={() => setSelectedRecord(null)}
          onAction={(action) => {
            setActionDialog({ open: true, record: selectedRecord, action })
            setSelectedRecord(null)
          }}
        />
      )}

      {/* Action Dialog */}
      <Dialog 
        open={actionDialog.open} 
        onClose={() => setActionDialog({ open: false, record: null, action: '' })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Confirm Action: {actionDialog.action?.replace(/_/g, ' ')}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Comments"
            value={actionData.comments}
            onChange={(e) => setActionData({ ...actionData, comments: e.target.value })}
            placeholder="Add any relevant notes or comments..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
          />
          
          {actionDialog.action === 'DISPOSE' && (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel>Disposal Method</InputLabel>
                <Select
                  value={actionData.disposalMethod}
                  onChange={(e) => setActionData({ ...actionData, disposalMethod: e.target.value })}
                  label="Disposal Method"
                  sx={{
                    borderRadius: '8px'
                  }}
                >
                  <MenuItem value="Incineration">Incineration</MenuItem>
                  <MenuItem value="Chemical Treatment">Chemical Treatment</MenuItem>
                  <MenuItem value="Return to Supplier">Return to Supplier</MenuItem>
                  <MenuItem value="Donation">Donation</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Disposal Certificate Number"
                value={actionData.disposalCertificate}
                onChange={(e) => setActionData({ ...actionData, disposalCertificate: e.target.value })}
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </>
          )}
          
          {actionDialog.action === 'RETURN' && (
            <TextField
              fullWidth
              label="Return Reference Number"
              value={actionData.returnReference}
              onChange={(e) => setActionData({ ...actionData, returnReference: e.target.value })}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button 
            onClick={() => setActionDialog({ open: false, record: null, action: '' })}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAction} 
            variant="contained" 
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ 
            borderRadius: '8px',
            boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`
          }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </>
  )
}

export default QuarantineList