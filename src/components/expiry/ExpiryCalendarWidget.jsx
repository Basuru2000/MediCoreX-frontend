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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ExpiryCalendarDay from './ExpiryCalendarDay';
import ExpiryCalendarEvent from './ExpiryCalendarEvent';
import ExpiryCalendarLegend from './ExpiryCalendarLegend';
import { getExpiryCalendar } from '../../services/api';
import './ExpiryCalendarStyles.css';

const ExpiryCalendarWidget = ({ compact = false, onEventClick }) => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('month');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [viewInfoDialog, setViewInfoDialog] = useState(false);

  useEffect(() => {
    fetchCalendarData();
  }, [currentMonth]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      const response = await getExpiryCalendar(year, month);
      setCalendarData(response.data);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
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
  };

  const handleEventAction = (event) => {
    setEventDialogOpen(false);
    
    // Navigate based on event type
    switch (event.type) {
      case 'BATCH_EXPIRY':
        navigate('/batch-tracking', { 
          state: { 
            highlightBatchId: event.id,
            batchNumber: event.details?.[0]?.batchNumber 
          } 
        });
        break;
      case 'ALERT':
        navigate('/expiry-monitoring', { 
          state: { 
            highlightAlertId: event.id 
          } 
        });
        break;
      case 'QUARANTINE':
        navigate('/quarantine', { 
          state: { 
            highlightRecordId: event.id 
          } 
        });
        break;
      default:
        console.log('Unknown event type:', event.type);
    }
  };

  const handleFullCalendarView = () => {
    navigate('/expiry-calendar');
  };

  const getEventsForDate = (date) => {
    if (!calendarData || !calendarData.events) return [];
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const events = calendarData.events[dateStr] || [];
    
    if (selectedSeverity === 'all') {
      return events;
    }
    
    return events.filter(event => 
      event.severity.toLowerCase() === selectedSeverity.toLowerCase()
    );
  };

  const renderCalendarHeader = () => (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton size="small" onClick={handlePreviousMonth}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6" sx={{ minWidth: 150, textAlign: 'center' }}>
          {format(currentMonth, 'MMMM yyyy')}
        </Typography>
        <IconButton size="small" onClick={handleNextMonth}>
          <ChevronRight />
        </IconButton>
        <IconButton size="small" onClick={handleToday} color="primary">
          <Today />
        </IconButton>
      </Box>
      
      <Box display="flex" gap={1}>
        {calendarData?.metadata?.criticalEvents > 0 && (
          <Chip
            icon={<Error />}
            label={`${calendarData.metadata.criticalEvents} Critical`}
            color="error"
            size="small"
          />
        )}
        
        <IconButton size="small" onClick={handleFilterClick}>
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
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
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
        
        {/* Calendar days */}
        {weeks.map((week, weekIndex) => (
          <Grid container spacing={0.5} key={weekIndex} mb={0.5}>
            {week.map(day => (
              <Grid item xs key={day.toString()}>
                <ExpiryCalendarDay
                  date={day}
                  events={getEventsForDate(day)}
                  isCurrentMonth={isSameMonth(day, currentMonth)}
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

  const renderSummary = () => {
    if (!calendarData?.summary) return null;
    
    const { summary } = calendarData;
    
    return (
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
              {summary.totalExpiringItems || 0}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Value at Risk
            </Typography>
            <Typography variant="h6">
              ${summary.totalValueAtRisk?.toLocaleString() || '0'}
            </Typography>
          </Grid>
          {summary.thisWeek && (
            <>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  This Week
                </Typography>
                <Typography variant="body1">
                  {summary.thisWeek.itemCount} items
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Next Week
                </Typography>
                <Typography variant="body1">
                  {summary.nextWeek.itemCount} items
                </Typography>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    );
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper className="expiry-calendar-widget" sx={{ p: compact ? 2 : 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant={compact ? "h6" : "h5"}>
          Expiry Calendar
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
      
      {!compact && renderSummary()}
      
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

      {/* Info Dialog */}
      <Dialog open={viewInfoDialog} onClose={() => setViewInfoDialog(false)}>
        <DialogTitle>
          About Expiry Calendar
        </DialogTitle>
        <DialogContent>
          <Typography paragraph>
            The Expiry Calendar helps you track important dates related to product expiry and inventory management.
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            Event Types:
          </Typography>
          <ul>
            <li><strong>Batch Expiry:</strong> When a batch of products expires</li>
            <li><strong>Alerts:</strong> System-generated warnings</li>
            <li><strong>Quarantine:</strong> Items moved to quarantine</li>
          </ul>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Severity Levels:
          </Typography>
          <ul>
            <li><strong>Critical (Red):</strong> Expires in ≤7 days</li>
            <li><strong>High (Orange):</strong> Expires in 8-30 days</li>
            <li><strong>Medium (Yellow):</strong> Expires in 31-60 days</li>
            <li><strong>Low (Green):</strong> Expires in 61+ days</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewInfoDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ExpiryCalendarWidget;