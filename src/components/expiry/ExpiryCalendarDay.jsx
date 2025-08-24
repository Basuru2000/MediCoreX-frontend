import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Tooltip,
  Badge,
  Chip
} from '@mui/material';
import { 
  Warning, 
  Error, 
  Info,
  Inventory,
  Block
} from '@mui/icons-material';
import { format } from 'date-fns';

const ExpiryCalendarDay = ({ 
  date, 
  events = [], 
  isCurrentMonth, 
  isToday, 
  compact = false,
  onClick 
}) => {
  
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return '#d32f2f';
      case 'high': return '#ff9800';
      case 'medium': return '#ffc107';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };
  
  const getEventIcon = (type) => {
    switch (type) {
      case 'BATCH_EXPIRY': return <Inventory fontSize="small" />;
      case 'ALERT': return <Warning fontSize="small" />;
      case 'QUARANTINE': return <Block fontSize="small" />;
      default: return <Info fontSize="small" />;
    }
  };
  
  const criticalCount = events.filter(e => e.severity === 'CRITICAL').length;
  const hasEvents = events.length > 0;
  
  const dayStyles = {
    minHeight: compact ? 40 : 80,
    p: compact ? 0.5 : 1,
    cursor: hasEvents ? 'pointer' : 'default',
    bgcolor: isToday ? 'primary.light' : 'background.paper',
    opacity: isCurrentMonth ? 1 : 0.5,
    border: isToday ? '2px solid' : '1px solid',
    borderColor: isToday ? 'primary.main' : 'divider',
    '&:hover': hasEvents ? {
      bgcolor: 'action.hover',
      transform: 'scale(1.02)',
      transition: 'all 0.2s'
    } : {}
  };
  
  const renderCompactView = () => (
    <Badge
      badgeContent={events.length}
      color={criticalCount > 0 ? "error" : "primary"}
      invisible={events.length === 0}
    >
      <Typography variant="body2">
        {format(date, 'd')}
      </Typography>
    </Badge>
  );
  
  const renderFullView = () => (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
        <Typography variant="body2" fontWeight={isToday ? 'bold' : 'normal'}>
          {format(date, 'd')}
        </Typography>
        {criticalCount > 0 && (
          <Error sx={{ fontSize: 16, color: 'error.main' }} />
        )}
      </Box>
      
      {events.slice(0, 2).map((event, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 0.5
          }}
        >
          {getEventIcon(event.type)}
          <Typography
            variant="caption"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: getSeverityColor(event.severity)
            }}
          >
            {event.title}
          </Typography>
        </Box>
      ))}
      
      {events.length > 2 && (
        <Typography variant="caption" color="text.secondary">
          +{events.length - 2} more
        </Typography>
      )}
    </>
  );
  
  const tooltipContent = events.length > 0 ? (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {format(date, 'EEEE, MMMM d, yyyy')}
      </Typography>
      {events.map((event, index) => (
        <Box key={index} mb={1}>
          <Typography variant="caption" display="block">
            {event.title}
          </Typography>
          {event.description && (
            <Typography variant="caption" color="text.secondary" display="block">
              {event.description}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  ) : null;
  
  const dayContent = (
    <Paper
      sx={dayStyles}
      onClick={() => hasEvents && onClick && onClick(events[0])}
    >
      {compact ? renderCompactView() : renderFullView()}
    </Paper>
  );
  
  return events.length > 0 && tooltipContent ? (
    <Tooltip title={tooltipContent} arrow>
      {dayContent}
    </Tooltip>
  ) : dayContent;
};

export default ExpiryCalendarDay;