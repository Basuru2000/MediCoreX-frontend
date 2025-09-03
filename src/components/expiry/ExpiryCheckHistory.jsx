import React, { useState } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  alpha
} from '@mui/material'
import {
  CheckCircle,
  Error,
  Schedule,
  Visibility,
  AccessTime,
  Speed,
  Computer,
  Person
} from '@mui/icons-material'
import { format } from 'date-fns'

function ExpiryCheckHistory({ history = [], onRefresh }) {
  const theme = useTheme()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const getStatusChip = (status) => {
    const config = {
      COMPLETED: {
        icon: <CheckCircle sx={{ fontSize: 16 }} />,
        color: 'success',
        label: 'Completed'
      },
      FAILED: {
        icon: <Error sx={{ fontSize: 16 }} />,
        color: 'error',
        label: 'Failed'
      },
      RUNNING: {
        icon: <Schedule sx={{ fontSize: 16 }} />,
        color: 'info',
        label: 'Running'
      }
    }

    const statusConfig = config[status] || config.COMPLETED

    return (
      <Chip
        size="small"
        icon={statusConfig.icon}
        label={statusConfig.label}
        color={statusConfig.color}
        sx={{
          fontWeight: 500,
          borderRadius: '6px'
        }}
      />
    )
  }

  const getScheduleTypeChip = (check) => {
    // Determine if it's scheduled based on multiple factors:
    // 1. Check if createdBy field indicates system/scheduled
    // 2. Check if there's a scheduleType field
    // 3. Check if the start time is at the scheduled time (02:00:00)
    // 4. Check if executionType field exists
    
    let isScheduled = false;
    
    // Check various possible indicators
    if (check.createdBy) {
      const createdByLower = check.createdBy.toLowerCase();
      isScheduled = createdByLower === 'system' || 
                    createdByLower === 'scheduled' || 
                    createdByLower === 'scheduler' ||
                    createdByLower === 'cron';
    }
    
    // Check if there's a specific scheduleType or type field
    if (!isScheduled && check.scheduleType) {
      isScheduled = check.scheduleType.toLowerCase() === 'scheduled';
    }
    
    if (!isScheduled && check.type) {
      isScheduled = check.type.toLowerCase() === 'scheduled';
    }
    
    if (!isScheduled && check.executionType) {
      isScheduled = check.executionType.toLowerCase() === 'scheduled';
    }
    
    // Check if start time matches the scheduled cron time (02:00:00)
    if (!isScheduled && check.startTime) {
      const startTimeStr = check.startTime.toString();
      // Check if it starts with 02:00 (2 AM scheduled task)
      if (startTimeStr.includes('02:00:00') || startTimeStr.includes('T02:00')) {
        isScheduled = true;
      }
    }
    
    // If still not determined and createdBy is null/undefined, check the time pattern
    if (!isScheduled && !check.createdBy && check.startTime) {
      const hour = new Date(check.startTime).getHours();
      // Scheduled tasks typically run at 2 AM
      if (hour === 2) {
        isScheduled = true;
      }
    }
    
    return (
      <Chip
        size="small"
        icon={isScheduled ? <Computer sx={{ fontSize: 16 }} /> : <Person sx={{ fontSize: 16 }} />}
        label={isScheduled ? 'Scheduled' : 'Manual'}
        color={isScheduled ? 'primary' : 'default'}
        variant={isScheduled ? 'filled' : 'outlined'}
        sx={{
          fontWeight: 500,
          borderRadius: '6px'
        }}
      />
    )
  }

  const formatDuration = (ms) => {
    if (!ms) return 'N/A'
    const seconds = (ms / 1000).toFixed(2)
    return `${seconds}s`
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Expiry Check History
      </Typography>

      <TableContainer 
        component={Paper} 
        variant="outlined"
        sx={{ 
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <TableCell sx={{ fontWeight: 600 }}>Check Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Schedule Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Products</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Alerts</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Start Time</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>End Time</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((check) => (
                <TableRow 
                  key={check.id}
                  sx={{ 
                    '&:hover': { 
                      bgcolor: alpha(theme.palette.primary.main, 0.02) 
                    }
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {format(new Date(check.checkDate), 'MMM dd, yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getScheduleTypeChip(check)}
                  </TableCell>
                  <TableCell>{getStatusChip(check.status)}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                      <Typography variant="body2">
                        {check.productsChecked || 0}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={check.alertsGenerated || 0}
                      size="small"
                      sx={{
                        bgcolor: check.alertsGenerated > 0 
                          ? alpha(theme.palette.warning.main, 0.1)
                          : alpha(theme.palette.success.main, 0.1),
                        color: check.alertsGenerated > 0 
                          ? theme.palette.warning.main
                          : theme.palette.success.main,
                        fontWeight: 600,
                        minWidth: 40
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                      <Speed sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {formatDuration(check.executionTimeMs)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {check.startTime ? format(new Date(check.startTime), 'HH:mm:ss') : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {check.endTime ? format(new Date(check.endTime), 'HH:mm:ss') : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details" arrow>
                      <IconButton 
                        size="small"
                        sx={{
                          color: theme.palette.primary.main,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        <Visibility fontSize="small" />
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
        count={history.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ 
          borderTop: `1px solid ${theme.palette.divider}`,
          '.MuiTablePagination-toolbar': { 
            minHeight: 56 
          }
        }}
      />
    </Box>
  )
}

export default ExpiryCheckHistory