import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  Badge,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  CalendarMonth,
  Warning,
  Error,
  Info,
  FilterList,
  Refresh,
  ViewModule,
  ViewWeek,
  ViewDay,
  Close
} from '@mui/icons-material';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks
} from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ExpiryCalendarDay from './ExpiryCalendarDay';
import ExpiryCalendarEvent from './ExpiryCalendarEvent';
import ExpiryCalendarLegend from './ExpiryCalendarLegend';
import { getExpiryCalendar, getExpiryCalendarRange } from '../../services/api';
import './ExpiryCalendarStyles.css';

const ExpiryCalendarWidget = ({ 
  compact = false, 
  viewMode = 'month', // 'week' or 'month'
  showSummary = true, // Control summary display
  onEventClick 
}) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, viewMode]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (viewMode === 'week') {
        // Fetch week data
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        const response = await getExpiryCalendarRange(
          format(weekStart, 'yyyy-MM-dd'),
          format(weekEnd, 'yyyy-MM-dd')
        );
        setCalendarData(response.data);
      } else {
        // Fetch month data
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
    if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
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

  const renderCalendarHeader = () => (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton size="small" onClick={handlePrevious}>
          <ChevronLeft />
        </IconButton>
        
        <Typography variant="h6" sx={{ minWidth: 150, textAlign: 'center' }}>
          {viewMode === 'week' 
            ? `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`
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

  const renderCalendarGrid = () => {
    let days = [];
    
    if (viewMode === 'week') {
      // Week view - show only current week
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    } else {
      // Month view - show full month with padding
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const startDate = startOfWeek(monthStart);
      const endDate = endOfWeek(monthEnd);
      days = eachDayOfInterval({ start: startDate, end: endDate });
    }
    
    // For week view, show in a single row
    if (viewMode === 'week') {
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
          
          {/* Week days in single row */}
          <Grid container spacing={0.5}>
            {days.map(day => (
              <Grid item xs key={day.toString()}>
                <ExpiryCalendarDay
                  date={day}
                  events={getEventsForDate(day)}
                  isCurrentMonth={true}
                  isToday={isToday(day)}
                  compact={compact}
                  onClick={(event) => handleEventClick(event, day)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      );
    }
    
    // Month view - show in multiple weeks
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
      
      {renderCalendarHeader()}
      
      <Divider sx={{ my: 2 }} />
      
      {renderCalendarGrid()}
      
      {!compact && <ExpiryCalendarLegend />}
      
      {/* Only show summary if showSummary is true and NOT in week view on dashboard */}
      {showSummary && viewMode !== 'week' && !compact && calendarData?.summary && (
        <Box mt={2} p={2} bgcolor="background.default" borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            Month Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Total Events
              </Typography>
              <Typography variant="h6">
                {calendarData.summary.totalExpiringItems || 0}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Value at Risk
              </Typography>
              <Typography variant="h6">
                ${calendarData.summary.totalValueAtRisk?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                This Week
              </Typography>
              <Typography variant="h6">
                {calendarData.summary.thisWeekCount || 0} items
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Next Week
              </Typography>
              <Typography variant="h6">
                {calendarData.summary.nextWeekCount || 0} items
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
      
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
          Critical Only
        </MenuItem>
        <MenuItem onClick={() => handleSeverityFilter('high')}>
          High Priority
        </MenuItem>
        <MenuItem onClick={() => handleSeverityFilter('medium')}>
          Medium Priority
        </MenuItem>
        <MenuItem onClick={() => handleSeverityFilter('low')}>
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