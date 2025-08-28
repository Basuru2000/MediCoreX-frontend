import React, { useState, useEffect } from 'react';
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
  Tooltip
} from '@mui/material';
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
  CheckCircle
} from '@mui/icons-material';
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  parseISO
} from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { getExpiryCalendar, getExpiryCalendarRange } from '../../services/api';
import ExpiryCalendarDay from './ExpiryCalendarDay';
import ExpiryCalendarLegend from './ExpiryCalendarLegend';
import ExpiryCalendarEvent from './ExpiryCalendarEvent';
import './ExpiryCalendarStyles.css';

const ExpiryCalendarWidget = ({
  viewMode = 'month',
  compact = false,
  showSummary = true,
  dashboardView = false,
  onEventClick,
  selectedCategory,
  selectedSeverity: initialSeverity
}) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState(initialSeverity || 'all');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, viewMode, selectedCategory]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (viewMode === 'week' || dashboardView) {
        // For week view, fetch data for the current week
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 }); // Saturday
        
        const response = await getExpiryCalendarRange(
          format(weekStart, 'yyyy-MM-dd'),
          format(weekEnd, 'yyyy-MM-dd')
        );
        setCalendarData(response.data);
      } else {
        // For month view, fetch monthly data
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const response = await getExpiryCalendar(year, month);
        setCalendarData(response.data);
      }
    } catch (err) {
      console.error('Error fetching calendar data:', err);
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (viewMode === 'week' || dashboardView) {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week' || dashboardView) {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleFullCalendarView = () => {
    navigate('/expiry-calendar');
  };

  const handleRefresh = () => {
    fetchCalendarData();
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSeverityFilter = (severity) => {
    setSelectedSeverity(severity);
    handleFilterClose();
  };

  const handleEventClick = (event, date) => {
    setSelectedEvent({ ...event, date });
    setEventDialogOpen(true);
    if (onEventClick) {
      onEventClick(event, date);
    }
  };

  const handleEventAction = (action) => {
    if (action === 'view') {
      navigate(`/products/${selectedEvent.productId}`);
    } else if (action === 'quarantine') {
      navigate('/quarantine');
    }
    setEventDialogOpen(false);
  };

  const getEventsForDate = (date) => {
    if (!calendarData?.events) return [];
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const events = calendarData.events[dateStr] || [];
    
    if (selectedSeverity === 'all') {
      return events;
    }
    
    return events.filter(event => 
      event.severity?.toLowerCase() === selectedSeverity.toLowerCase()
    );
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return <ErrorIcon fontSize="small" />;
      case 'HIGH': return <Warning fontSize="small" />;
      case 'MEDIUM': return <Info fontSize="small" />;
      case 'LOW': return <CheckCircle fontSize="small" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  const renderCalendarHeader = () => {
    const isWeekView = viewMode === 'week' || dashboardView;
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    
    return (
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton size="small" onClick={handlePrevious}>
            <ChevronLeft />
          </IconButton>
          
          <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
            {isWeekView 
              ? `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
              : format(currentDate, 'MMMM yyyy')
            }
          </Typography>
          
          <IconButton size="small" onClick={handleNext}>
            <ChevronRight />
          </IconButton>
          
          <Button 
            size="small" 
            startIcon={<Today />} 
            onClick={handleToday}
            sx={{ ml: 1 }}
          >
            Today
          </Button>
        </Box>
        
        <Box display="flex" gap={1}>
          <IconButton 
            size="small" 
            onClick={handleFilterClick}
          >
            <Badge 
              badgeContent={selectedSeverity !== 'all' ? '1' : 0} 
              color="primary"
            >
              <FilterList />
            </Badge>
          </IconButton>
          
          <IconButton size="small" onClick={handleRefresh}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return (
      <Box>
        {/* Day headers */}
        <Grid container spacing={1} mb={2}>
          {weekDays.map((day, index) => (
            <Grid item xs key={index} sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {format(day, 'EEE')}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: isToday(day) ? 'bold' : 'normal',
                  color: isToday(day) ? 'primary.main' : 'text.primary'
                }}
              >
                {format(day, 'd')}
              </Typography>
            </Grid>
          ))}
        </Grid>
        
        {/* Events for each day */}
        <Grid container spacing={1}>
          {weekDays.map((day, index) => {
            const events = getEventsForDate(day);
            const hasEvents = events.length > 0;
            
            return (
              <Grid item xs key={index}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 1, 
                    minHeight: 120,
                    cursor: hasEvents ? 'pointer' : 'default',
                    backgroundColor: isToday(day) ? 'action.hover' : 'background.paper',
                    '&:hover': hasEvents ? { backgroundColor: 'action.hover' } : {}
                  }}
                  onClick={() => hasEvents && handleEventClick(events[0], day)}
                >
                  {events.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                      No events
                    </Typography>
                  ) : (
                    <Box>
                      {/* Show severity summary */}
                      {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(severity => {
                        const severityEvents = events.filter(e => 
                          e.severity?.toUpperCase() === severity
                        );
                        if (severityEvents.length === 0) return null;
                        
                        return (
                          <Chip
                            key={severity}
                            size="small"
                            icon={getSeverityIcon(severity)}
                            label={severityEvents.length}
                            color={getSeverityColor(severity)}
                            sx={{ mb: 0.5, mr: 0.5 }}
                          />
                        );
                      })}
                      
                      {/* Show total count if multiple items */}
                      {events.length > 1 && (
                        <Typography variant="caption" display="block" mt={1}>
                          {events.length} total items
                        </Typography>
                      )}
                    </Box>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
        
        {/* Week summary */}
        {calendarData?.summary && !compact && (
          <Box mt={2} p={2} bgcolor="background.default" borderRadius={1}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  This Week Total
                </Typography>
                <Typography variant="h6">
                  {calendarData.summary.thisWeekCount || 0}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Critical Items
                </Typography>
                <Typography variant="h6" color="error">
                  {calendarData.summary.criticalCount || 0}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Value at Risk
                </Typography>
                <Typography variant="h6">
                  ${(calendarData.summary.weekValueAtRisk || 0).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Next Week
                </Typography>
                <Typography variant="h6">
                  {calendarData.summary.nextWeekCount || 0} items
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    );
  };

  const renderMonthView = () => {
    // Existing month view logic remains the same
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks = [];
    
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return (
      <Box>
        {/* Day headers */}
        <Grid container spacing={0.5} mb={1}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Grid item xs key={day} sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>
        
        {/* Calendar weeks */}
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
    );
  };

  return (
    <Paper className="expiry-calendar-widget" sx={{ p: compact ? 2 : 3 }}>
      {!dashboardView && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant={compact ? "h6" : "h5"}>
            {viewMode === 'week' ? 'Expiry Calendar - Week View' : 'Expiry Calendar'}
          </Typography>
          {!compact && (
            <Button
              variant="outlined"
              startIcon={<CalendarMonth />}
              onClick={handleFullCalendarView}
            >
              Full View
            </Button>
          )}
        </Box>
      )}
      
      {renderCalendarHeader()}
      
      {!compact && <Divider sx={{ my: 2 }} />}
      
      {/* Render based on view mode */}
      {(viewMode === 'week' || dashboardView) ? renderWeekView() : renderMonthView()}
      
      {!compact && !dashboardView && <ExpiryCalendarLegend />}
      
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
          setEventDialogOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        date={selectedEvent?.date}
        onActionClick={handleEventAction}
      />
    </Paper>
  );
};

export default ExpiryCalendarWidget;