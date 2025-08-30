import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Grid,
  Badge,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
  Stack,
  useTheme,
  alpha
} from '@mui/material'
import {
  ChevronLeft,
  ChevronRight,
  Today,
  CalendarMonth,
  FilterList,
  Refresh,
  Warning,
  Error as ErrorIcon,
  Info,
  CheckCircle,
  Inventory,
  Block
} from '@mui/icons-material'
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  parseISO
} from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { getExpiryCalendar, getExpiryCalendarRange } from '../../services/api'
import ExpiryCalendarDay from './ExpiryCalendarDay'
import ExpiryCalendarLegend from './ExpiryCalendarLegend'
import ExpiryCalendarEvent from './ExpiryCalendarEvent'

const ExpiryCalendarWidget = ({
  viewMode = 'month',
  compact = false,
  showSummary = true,
  dashboardView = false,
  onEventClick,
  selectedCategory,
  selectedSeverity: initialSeverity
}) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSeverity, setSelectedSeverity] = useState(initialSeverity || 'all')
  const [filterAnchorEl, setFilterAnchorEl] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)

  useEffect(() => {
    fetchCalendarData()
  }, [currentDate, viewMode, selectedCategory])

  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (viewMode === 'week' || dashboardView) {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
        
        const response = await getExpiryCalendarRange(
          format(weekStart, 'yyyy-MM-dd'),
          format(weekEnd, 'yyyy-MM-dd')
        )
        setCalendarData(response.data)
      } else {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1
        const response = await getExpiryCalendar(year, month)
        setCalendarData(response.data)
      }
    } catch (err) {
      console.error('Error fetching calendar data:', err)
      setError('Failed to load calendar data')
    } finally {
      setLoading(false)
    }
  }

  const handlePrevious = () => {
    if (viewMode === 'day') {
      setCurrentDate(subDays(currentDate, 1))
    } else if (viewMode === 'week' || dashboardView) {
      setCurrentDate(subWeeks(currentDate, 1))
    } else {
      setCurrentDate(subMonths(currentDate, 1))
    }
  }

  const handleNext = () => {
    if (viewMode === 'day') {
      setCurrentDate(addDays(currentDate, 1))
    } else if (viewMode === 'week' || dashboardView) {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleFullCalendarView = () => {
    navigate('/expiry-calendar')
  }

  const handleRefresh = () => {
    fetchCalendarData()
  }

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget)
  }

  const handleFilterClose = () => {
    setFilterAnchorEl(null)
  }

  const handleSeverityFilter = (severity) => {
    setSelectedSeverity(severity)
    handleFilterClose()
  }

  const handleEventClick = (event, date) => {
    setSelectedEvent({ ...event, date })
    setEventDialogOpen(true)
    if (onEventClick) {
      onEventClick(event, date)
    }
  }

  const handleEventAction = (action) => {
    if (action === 'view') {
      navigate(`/products/${selectedEvent.productId}`)
    } else if (action === 'quarantine') {
      navigate('/quarantine')
    }
    setEventDialogOpen(false)
  }

  const getEventsForDate = (date) => {
    if (!calendarData?.events) return []
    
    const dateStr = format(date, 'yyyy-MM-dd')
    const events = calendarData.events[dateStr] || []
    
    if (selectedSeverity === 'all') {
      return events
    }
    
    return events.filter(event => 
      event.severity?.toLowerCase() === selectedSeverity.toLowerCase()
    )
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return theme.palette.error.main
      case 'high': return theme.palette.warning.main
      case 'medium': return theme.palette.info.main
      case 'low': return theme.palette.success.main
      default: return theme.palette.grey[500]
    }
  }

  const renderCalendarHeader = () => {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton 
            onClick={handlePrevious}
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
            onClick={handleNext}
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
          <Button
            variant="outlined"
            size="small"
            startIcon={<Today fontSize="small" />}
            onClick={handleToday}
            sx={{
              borderRadius: '6px',
              textTransform: 'none',
              fontWeight: 500,
              borderColor: theme.palette.divider,
              ml: 1,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
          >
            Today
          </Button>
        </Stack>

        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            flex: 1,
            textAlign: 'center'
          }}
        >
          {viewMode === 'day' 
            ? format(currentDate, 'EEEE, MMMM d, yyyy')
            : viewMode === 'week' 
            ? `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`
            : format(currentDate, 'MMMM yyyy')
          }
        </Typography>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Filter" arrow>
            <IconButton 
              size="small" 
              onClick={handleFilterClick}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': { 
                  bgcolor: theme.palette.action.hover,
                  borderColor: theme.palette.primary.main
                }
              }}
            >
              <Badge 
                badgeContent={selectedSeverity !== 'all' ? '1' : 0} 
                color="primary"
              >
                <FilterList fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Refresh" arrow>
            <IconButton 
              size="small" 
              onClick={handleRefresh}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': { 
                  bgcolor: theme.palette.action.hover,
                  borderColor: theme.palette.primary.main
                }
              }}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    )
  }

  const renderDayView = () => {
    const events = getEventsForDate(currentDate)
    
    return (
      <Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            mb: 3,
            textAlign: 'center'
          }}
        >
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </Typography>
        
        {events.length === 0 ? (
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              bgcolor: 'background.default',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No expiry events scheduled for this day
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {events.map((event, index) => (
              <Paper
                key={index}
                sx={{
                  p: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  borderLeft: `4px solid ${getSeverityColor(event.severity)}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    borderColor: theme.palette.primary.main
                  }
                }}
                onClick={() => handleEventClick(event, currentDate)}
              >
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '8px',
                      bgcolor: alpha(getSeverityColor(event.severity), 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {event.type === 'BATCH_EXPIRY' ? <Inventory /> :
                     event.type === 'ALERT' ? <Warning /> :
                     event.type === 'QUARANTINE' ? <Block /> :
                     <Info />}
                  </Box>
                  <Box flex={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {event.title || 'Expiry Event'}
                    </Typography>
                    {event.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {event.description}
                      </Typography>
                    )}
                    <Box display="flex" gap={2} mt={1}>
                      <Chip
                        label={event.severity || 'Normal'}
                        size="small"
                        sx={{
                          bgcolor: alpha(getSeverityColor(event.severity), 0.1),
                          color: getSeverityColor(event.severity),
                          fontWeight: 600
                        }}
                      />
                      {event.itemCount && (
                        <Typography variant="caption" color="text.secondary">
                          {event.itemCount} items affected
                        </Typography>
                      )}
                      {event.totalQuantity && (
                        <Typography variant="caption" color="text.secondary">
                          {event.totalQuantity} units
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    )
  }

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    
    return (
      <Box>
        <Grid container spacing={1} mb={2}>
          {weekDays.map((day, index) => (
            <Grid item xs key={index} sx={{ textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                display="block"
                sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.875rem' }}
              >
                {format(day, 'EEE')}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: isToday(day) ? 700 : 500,
                  color: isToday(day) ? theme.palette.primary.main : 'text.primary',
                  fontSize: '1.1rem'
                }}
              >
                {format(day, 'd')}
              </Typography>
            </Grid>
          ))}
        </Grid>
        
        <Grid container spacing={1}>
          {weekDays.map((day, index) => {
            const events = getEventsForDate(day)
            const hasEvents = events.length > 0
            
            return (
              <Grid item xs key={index}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1.5, 
                    minHeight: 120,
                    cursor: hasEvents ? 'pointer' : 'default',
                    backgroundColor: isToday(day) ? alpha(theme.palette.primary.main, 0.02) : 'background.paper',
                    borderColor: isToday(day) ? theme.palette.primary.main : theme.palette.divider,
                    transition: 'all 0.2s ease',
                    '&:hover': hasEvents ? { 
                      backgroundColor: theme.palette.action.hover,
                      borderColor: theme.palette.primary.main
                    } : {}
                  }}
                  onClick={() => hasEvents && handleEventClick(events[0], day)}
                >
                  {events.length === 0 ? (
                    <Typography variant="body2" color="text.disabled" align="center" display="block">
                      No events
                    </Typography>
                  ) : (
                    <Stack spacing={0.5}>
                      {events.slice(0, 3).map((event, idx) => (
                        <Chip
                          key={idx}
                          label={event.itemCount || 1}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            bgcolor: alpha(getSeverityColor(event.severity), 0.1),
                            color: getSeverityColor(event.severity),
                            border: `1px solid ${alpha(getSeverityColor(event.severity), 0.3)}`
                          }}
                        />
                      ))}
                      {events.length > 3 && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          +{events.length - 3} more
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Paper>
              </Grid>
            )
          })}
        </Grid>
      </Box>
    )
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const weeks = []
    
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }
    
    return (
      <Box>
        <Grid container spacing={0.5} mb={1}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Grid item xs key={day} sx={{ textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontWeight: 600, fontSize: '0.875rem' }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>
        
        {weeks.map((week, weekIndex) => (
          <Grid container spacing={0.5} key={weekIndex} mb={0.5}>
            {week.map(day => (
              <Grid item xs key={day.toString()}>
                <ExpiryCalendarDay
                  date={day}
                  events={getEventsForDate(day)}
                  isCurrentMonth={isSameMonth(day, currentDate)}
                  isToday={isToday(day)}
                  compact={compact}
                  onClick={(event) => handleEventClick(event, day)}
                />
              </Grid>
            ))}
          </Grid>
        ))}
      </Box>
    )
  }

  if (loading) {
    return (
      <Paper 
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

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ borderRadius: '8px' }}
      >
        {error}
      </Alert>
    )
  }

  return (
    <Paper 
      sx={{ 
        p: 3,
        borderRadius: '8px',
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      {!dashboardView && !compact && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {viewMode === 'day' ? 'Day View' : viewMode === 'week' ? 'Week View' : 'Month View'}
          </Typography>
        </Box>
      )}
      
      {dashboardView && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Week View
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CalendarMonth fontSize="small" />}
            onClick={handleFullCalendarView}
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
            Full View
          </Button>
        </Box>
      )}
      
      {renderCalendarHeader()}
      
      {!compact && <Divider sx={{ my: 2 }} />}
      
      {viewMode === 'day' ? renderDayView() :
       viewMode === 'week' || dashboardView ? renderWeekView() : 
       renderMonthView()}
      
      {!compact && !dashboardView && viewMode !== 'day' && <ExpiryCalendarLegend />}
      
      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={() => handleSeverityFilter('all')}>
          All Severities
        </MenuItem>
        <MenuItem onClick={() => handleSeverityFilter('critical')}>
          <ErrorIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
          Critical Only
        </MenuItem>
        <MenuItem onClick={() => handleSeverityFilter('high')}>
          <Warning fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
          High Priority
        </MenuItem>
        <MenuItem onClick={() => handleSeverityFilter('medium')}>
          <Info fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
          Medium Priority
        </MenuItem>
        <MenuItem onClick={() => handleSeverityFilter('low')}>
          <CheckCircle fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
          Low Priority
        </MenuItem>
      </Menu>

      {/* Event Dialog */}
      <ExpiryCalendarEvent
        open={eventDialogOpen}
        onClose={() => {
          setEventDialogOpen(false)
          setSelectedEvent(null)
        }}
        event={selectedEvent}
        date={selectedEvent?.date}
        onActionClick={handleEventAction}
      />
    </Paper>
  )
}

export default ExpiryCalendarWidget