import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Fade,
  useTheme,
  alpha,
  Stack
} from '@mui/material'
import {
  ViewModule,
  ViewWeek,
  ViewDay,
  Print,
  Download,
  Info,
  CalendarMonth
} from '@mui/icons-material'
import ExpiryCalendarWidget from '../components/expiry/ExpiryCalendarWidget'
import { useNavigate } from 'react-router-dom'
import { exportExpiryTrendReport } from '../services/api'
import { format } from 'date-fns'

const ExpiryCalendar = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('month')
  const [exportLoading, setExportLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView)
    }
  }
  
  const handleExport = async () => {
    try {
      setExportLoading(true)
      
      const currentDate = new Date()
      const startDate = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), 'yyyy-MM-dd')
      const endDate = format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), 'yyyy-MM-dd')
      
      const response = await exportExpiryTrendReport(startDate, endDate)
      
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `expiry_calendar_${format(currentDate, 'yyyy_MM')}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      setSnackbar({
        open: true,
        message: 'Calendar data exported successfully',
        severity: 'success'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to export calendar data',
        severity: 'error'
      })
    } finally {
      setExportLoading(false)
    }
  }
  
  const handlePrint = () => {
    const elementsToHide = document.querySelectorAll('.no-print')
    elementsToHide.forEach(el => el.style.display = 'none')
    
    window.print()
    
    elementsToHide.forEach(el => el.style.display = '')
    
    setSnackbar({
      open: true,
      message: 'Print dialog opened',
      severity: 'info'
    })
  }
  
  const handleInfo = () => {
    setSnackbar({
      open: true,
      message: 'Calendar shows product expiry events. Red=Critical (≤7 days), Orange=Warning (8-30 days), Blue=Medium (31-60 days), Green=Normal (61+ days)',
      severity: 'info'
    })
  }
  
  return (
    <Fade in={true}>
      <Box>
        {/* Page Header - Matching other pages style */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 4
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 0.5
                }}
              >
                Expiry Calendar
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ color: 'text.secondary' }}
              >
                Track product expiry dates and manage inventory lifecycle
              </Typography>
            </Box>
            <Tooltip title="Information" arrow>
              <IconButton 
                onClick={handleInfo} 
                size="small"
                sx={{
                  ml: 1,
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                <Info fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Stack direction="row" spacing={2} className="no-print">
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  borderRadius: '6px',
                  px: 2,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.15)
                    }
                  }
                }
              }}
            >
              <ToggleButton value="day">
                <Tooltip title="Day view">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ViewDay fontSize="small" />
                    <Typography variant="body2">Day</Typography>
                  </Box>
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="week">
                <Tooltip title="Week view">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ViewWeek fontSize="small" />
                    <Typography variant="body2">Week</Typography>
                  </Box>
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="month">
                <Tooltip title="Month view">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ViewModule fontSize="small" />
                    <Typography variant="body2">Month</Typography>
                  </Box>
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Button
              variant="outlined"
              startIcon={<Download fontSize="small" />}
              onClick={handleExport}
              disabled={exportLoading}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              {exportLoading ? 'Exporting...' : 'Export'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Print fontSize="small" />}
              onClick={handlePrint}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              Print
            </Button>
          </Stack>
        </Box>
        
        {/* Main Calendar Widget */}
        <ExpiryCalendarWidget
          compact={false}
          viewMode={viewMode}
          onEventClick={(event, date) => {
            console.log('Event clicked:', event, date)
          }}
        />
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ borderRadius: '8px' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  )
}

export default ExpiryCalendar