import React, { useState, useEffect, forwardRef } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  Button,
  useTheme,
  alpha,
  DialogActions,
  ListItemIcon,
  CircularProgress
} from '@mui/material'
import {
  ChevronLeft,
  ChevronRight,
  Warning,
  Schedule,
  ErrorOutline,
  Info,
  CalendarToday,
  Close,
  Circle
} from '@mui/icons-material'
import { getExpiringBatches } from '../../services/api'

// Use forwardRef to fix the Fade ref error
const BatchExpiryCalendar = forwardRef((props, ref) => {
  const theme = useTheme()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [batches, setBatches] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [hoveredDate, setHoveredDate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExpiringBatches()
  }, [])

  const fetchExpiringBatches = async () => {
    try {
      setLoading(true)
      const response = await getExpiringBatches(90)
      setBatches(response.data)
    } catch (error) {
      console.error('Failed to fetch expiring batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getBatchesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return batches.filter(batch => batch.expiryDate === dateStr)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDateClick = (date) => {
    const batchesForDate = getBatchesForDate(date)
    if (batchesForDate.length > 0) {
      setSelectedDate(date)
      setDialogOpen(true)
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const getSeverityColor = (daysUntilExpiry) => {
    if (daysUntilExpiry <= 7) return theme.palette.error.main
    if (daysUntilExpiry <= 30) return theme.palette.warning.main
    return theme.palette.success.main
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <Grid item key={`empty-${i}`} sx={{ aspectRatio: '1/1', minHeight: 60 }} />
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dateForComparison = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      dateForComparison.setHours(0, 0, 0, 0)
      
      const batchesForDate = getBatchesForDate(date)
      const isToday = dateForComparison.getTime() === today.getTime()
      const isPast = dateForComparison < today
      const hasCritical = batchesForDate.some(b => b.daysUntilExpiry <= 7)
      const hasWarning = batchesForDate.some(b => b.daysUntilExpiry > 7 && b.daysUntilExpiry <= 30)

      days.push(
        <Grid item key={day}>
          <Paper
            elevation={0}
            onMouseEnter={() => setHoveredDate(day)}
            onMouseLeave={() => setHoveredDate(null)}
            sx={{
              aspectRatio: '1/1',
              minHeight: 60,
              p: 0.5,
              position: 'relative',
              cursor: batchesForDate.length > 0 ? 'pointer' : 'default',
              border: `1px solid ${
                isToday ? theme.palette.primary.main :
                hoveredDate === day && batchesForDate.length > 0 ? theme.palette.primary.light :
                theme.palette.divider
              }`,
              bgcolor: isToday ? alpha(theme.palette.primary.main, 0.05) :
                       isPast ? alpha(theme.palette.action.disabled, 0.02) :
                       'background.paper',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              '&:hover': batchesForDate.length > 0 ? {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.02)
              } : {}
            }}
            onClick={() => handleDateClick(date)}
          >
            <Box height="100%" display="flex" flexDirection="column">
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: isToday ? 600 : 400,
                  color: isToday ? theme.palette.primary.main :
                         isPast ? 'text.disabled' : 'text.primary'
                }}
              >
                {day}
              </Typography>
              
              {batchesForDate.length > 0 && (
                <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                  <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mb: 0.5 }}>
                    {hasCritical && (
                      <Circle sx={{ fontSize: 6, color: theme.palette.error.main }} />
                    )}
                    {hasWarning && (
                      <Circle sx={{ fontSize: 6, color: theme.palette.warning.main }} />
                    )}
                    {!hasCritical && !hasWarning && (
                      <Circle sx={{ fontSize: 6, color: theme.palette.success.main }} />
                    )}
                  </Stack>
                  <Chip
                    size="small"
                    label={batchesForDate.length}
                    sx={{ 
                      height: 16,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      '& .MuiChip-label': { px: 0.5 }
                    }}
                    color={hasCritical ? 'error' : hasWarning ? 'warning' : 'success'}
                  />
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      )
    }

    return days
  }

  if (loading) {
    return (
      <Paper 
        ref={ref}
        sx={{ 
          p: 4,
          borderRadius: '8px',
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400
        }}
      >
        <CircularProgress />
      </Paper>
    )
  }

  return (
    <Box ref={ref}>
      <Paper 
        sx={{ 
          p: 3,
          borderRadius: '8px',
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        {/* Calendar Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton 
              onClick={handlePrevMonth}
              size="small"
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                  borderColor: theme.palette.primary.main
                }
              }}
            >
              <ChevronLeft fontSize="small" />
            </IconButton>
            <IconButton 
              onClick={handleNextMonth}
              size="small"
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  bgcolor: theme.palette.action.hover,
                  borderColor: theme.palette.primary.main
                }
              }}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </Stack>

          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600
            }}
          >
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Typography>

          <Button
            variant="outlined"
            size="small"
            startIcon={<CalendarToday fontSize="small" />}
            onClick={handleToday}
            sx={{
              borderRadius: '6px',
              textTransform: 'none',
              fontWeight: 500,
              borderColor: theme.palette.divider,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
          >
            Today
          </Button>
        </Box>

        {/* Weekday Headers */}
        <Grid container spacing={1} sx={{ mb: 1 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Grid item key={day} sx={{ flex: 1 }}>
              <Typography 
                variant="caption" 
                align="center" 
                display="block"
                sx={{ 
                  fontWeight: 600,
                  color: 'text.secondary',
                  fontSize: '0.7rem'
                }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Calendar Grid */}
        <Grid container spacing={1}>
          {renderCalendarDays()}
        </Grid>

        {/* Legend */}
        <Box mt={3} p={1.5} sx={{ bgcolor: 'background.default', borderRadius: '6px' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Legend:
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Circle sx={{ fontSize: 8, color: theme.palette.error.main }} />
              <Typography variant="caption" color="text.secondary">
                Critical (≤7 days)
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Circle sx={{ fontSize: 8, color: theme.palette.warning.main }} />
              <Typography variant="caption" color="text.secondary">
                Warning (8-30 days)
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Circle sx={{ fontSize: 8, color: theme.palette.success.main }} />
              <Typography variant="caption" color="text.secondary">
                Normal (&gt;30 days)
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Paper>

      {/* Date Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: '8px' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Batch Expiry Details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedDate?.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </Box>
            <IconButton onClick={() => setDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0 }}>
          <List sx={{ py: 0 }}>
            {selectedDate && getBatchesForDate(selectedDate).map((batch, index) => (
              <React.Fragment key={batch.id}>
                {index > 0 && <Divider />}
                <ListItem sx={{ py: 2, px: 3 }}>
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(getSeverityColor(batch.daysUntilExpiry), 0.1),
                        color: getSeverityColor(batch.daysUntilExpiry)
                      }}
                    >
                      {batch.daysUntilExpiry <= 7 ? <ErrorOutline fontSize="small" /> :
                       batch.daysUntilExpiry <= 30 ? <Warning fontSize="small" /> : 
                       <Info fontSize="small" />}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {batch.productName}
                      </Typography>
                    }
                    secondary={
                      <Stack spacing={0.5} mt={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Batch: {batch.batchNumber} • Quantity: {batch.quantity}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${batch.daysUntilExpiry} days`}
                          color={
                            batch.daysUntilExpiry <= 7 ? 'error' :
                            batch.daysUntilExpiry <= 30 ? 'warning' : 'success'
                          }
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}
                        />
                      </Stack>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            variant="contained"
            sx={{ 
              borderRadius: '6px',
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
})

// Add display name for debugging
BatchExpiryCalendar.displayName = 'BatchExpiryCalendar'

export default BatchExpiryCalendar