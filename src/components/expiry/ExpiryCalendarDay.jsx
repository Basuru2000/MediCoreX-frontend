import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Tooltip,
  Badge,
  Chip,
  useTheme,
  alpha
} from '@mui/material'
import { 
  Warning, 
  Error, 
  Info,
  Inventory,
  Block,
  Circle
} from '@mui/icons-material'
import { format } from 'date-fns'

const ExpiryCalendarDay = ({ 
  date, 
  events = [], 
  isCurrentMonth, 
  isToday, 
  compact = false,
  onClick 
}) => {
  const theme = useTheme()
  
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return theme.palette.error.main
      case 'high': return theme.palette.warning.main
      case 'medium': return theme.palette.info.main
      case 'low': return theme.palette.success.main
      default: return theme.palette.grey[400]
    }
  }
  
  const getEventIcon = (type) => {
    switch (type) {
      case 'BATCH_EXPIRY': return <Inventory sx={{ fontSize: 14 }} />
      case 'ALERT': return <Warning sx={{ fontSize: 14 }} />
      case 'QUARANTINE': return <Block sx={{ fontSize: 14 }} />
      default: return <Info sx={{ fontSize: 14 }} />
    }
  }
  
  const criticalCount = events.filter(e => e.severity?.toLowerCase() === 'critical').length
  const hasEvents = events.length > 0
  
  const dayStyles = {
    minHeight: compact ? 40 : 80,
    p: compact ? 0.5 : 1,
    cursor: hasEvents ? 'pointer' : 'default',
    bgcolor: isToday ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
    opacity: isCurrentMonth ? 1 : 0.4,
    border: `1px solid ${
      isToday ? theme.palette.primary.main : 
      hasEvents && criticalCount > 0 ? alpha(theme.palette.error.main, 0.3) :
      hasEvents ? alpha(theme.palette.primary.main, 0.2) :
      theme.palette.divider
    }`,
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    '&:hover': hasEvents ? {
      bgcolor: alpha(theme.palette.primary.main, 0.08),
      borderColor: theme.palette.primary.main,
      transform: 'translateY(-1px)'
    } : {}
  }
  
  const renderCompactView = () => (
    <Box sx={{ position: 'relative' }}>
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: isToday ? 600 : 400,
          color: isToday ? theme.palette.primary.main : 'text.primary',
          fontSize: '0.875rem'
        }}
      >
        {format(date, 'd')}
      </Typography>
      {hasEvents && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: -4,
            right: -4,
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: criticalCount > 0 ? 'error.main' : 'primary.main'
          }}
        />
      )}
    </Box>
  )
  
  const renderFullView = () => (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: isToday ? 700 : 600,
            color: isToday ? theme.palette.primary.main : 'text.primary',
            fontSize: '0.9rem'
          }}
        >
          {format(date, 'd')}
        </Typography>
        {criticalCount > 0 && (
          <Circle sx={{ fontSize: 8, color: 'error.main' }} />
        )}
      </Box>
      
      {events.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {events.slice(0, 2).map((event, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              {getEventIcon(event.type)}
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.75rem',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: getSeverityColor(event.severity),
                  fontWeight: 500
                }}
              >
                {event.itemCount || 1}
              </Typography>
            </Box>
          ))}
          
          {events.length > 2 && (
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '0.7rem',
                color: 'text.secondary',
                fontWeight: 500
              }}
            >
              +{events.length - 2}
            </Typography>
          )}
        </Box>
      )}
    </>
  )
  
  const tooltipContent = events.length > 0 ? (
    <Box sx={{ p: 0.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        {format(date, 'EEEE, MMMM d, yyyy')}
      </Typography>
      {events.map((event, index) => (
        <Box key={index} sx={{ mb: 0.5 }}>
          <Typography variant="caption" display="block" sx={{ fontWeight: 500 }}>
            {event.title || `${event.type} Event`}
          </Typography>
          {event.description && (
            <Typography variant="caption" color="text.secondary" display="block">
              {event.description}
            </Typography>
          )}
          <Chip
            label={event.severity || 'Normal'}
            size="small"
            sx={{
              height: 16,
              fontSize: '0.65rem',
              mt: 0.25,
              bgcolor: alpha(getSeverityColor(event.severity), 0.1),
              color: getSeverityColor(event.severity),
              border: 'none'
            }}
          />
        </Box>
      ))}
    </Box>
  ) : null
  
  const dayContent = (
    <Paper
      elevation={0}
      sx={dayStyles}
      onClick={() => hasEvents && onClick && onClick(events[0])}
    >
      {compact ? renderCompactView() : renderFullView()}
    </Paper>
  )
  
  return events.length > 0 && tooltipContent ? (
    <Tooltip title={tooltipContent} arrow placement="top">
      {dayContent}
    </Tooltip>
  ) : dayContent
}

export default ExpiryCalendarDay