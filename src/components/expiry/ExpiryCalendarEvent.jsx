import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Chip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Alert,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Stack,
  useTheme,
  alpha
} from '@mui/material'
import {
  Close,
  Warning,
  Error,
  Info,
  Inventory,
  Block,
  LocalShipping,
  Category,
  AttachMoney,
  Schedule,
  NavigateNext,
  Print,
  Share,
  Circle
} from '@mui/icons-material'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

const ExpiryCalendarEvent = ({ 
  open, 
  onClose, 
  event, 
  date,
  onActionClick 
}) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [expandedDetails, setExpandedDetails] = useState(false)
  
  if (!event) return null
  
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return theme.palette.error.main
      case 'high': return theme.palette.warning.main
      case 'medium': return theme.palette.info.main
      case 'low': return theme.palette.success.main
      default: return theme.palette.grey[500]
    }
  }
  
  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return <Error fontSize="small" />
      case 'high': return <Warning fontSize="small" />
      case 'medium': return <Info fontSize="small" />
      default: return <Info fontSize="small" />
    }
  }
  
  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'BATCH_EXPIRY': return <Inventory fontSize="small" />
      case 'PRODUCT_EXPIRY': return <LocalShipping fontSize="small" />
      case 'ALERT': return <Warning fontSize="small" />
      case 'QUARANTINE': return <Block fontSize="small" />
      default: return <Info fontSize="small" />
    }
  }
  
  const handleNavigate = (url) => {
    if (url) {
      navigate(url)
      onClose()
    }
  }
  
  const handlePrint = () => {
    window.print()
  }
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      })
    }
  }
  
  const renderEventHeader = () => (
    <Box display="flex" alignItems="center" gap={2}>
      <Box 
        sx={{ 
          p: 1,
          borderRadius: '8px',
          bgcolor: alpha(getSeverityColor(event.severity), 0.1),
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {getEventTypeIcon(event.type)}
      </Box>
      <Box flex={1}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {event.title || 'Expiry Event'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {format(new Date(date || event.date), 'EEEE, MMMM d, yyyy')}
        </Typography>
      </Box>
      <Chip
        icon={<Circle sx={{ fontSize: 8 }} />}
        label={event.severity || 'Normal'}
        size="small"
        sx={{
          fontWeight: 600,
          bgcolor: alpha(getSeverityColor(event.severity), 0.1),
          color: getSeverityColor(event.severity),
          border: `1px solid ${alpha(getSeverityColor(event.severity), 0.3)}`
        }}
      />
    </Box>
  )
  
  const renderEventSummary = () => (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={6} sm={3}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            TYPE
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
            {event.type?.replace('_', ' ') || 'Unknown'}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            ITEMS AFFECTED
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
            {event.itemCount || 0}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            TOTAL QUANTITY
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
            {event.totalQuantity || 0} units
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            VALUE AT RISK
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5, color: theme.palette.warning.main }}>
            ${event.totalValue?.toLocaleString() || '0'}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  )
  
  const renderEventDetails = () => {
    if (!event.details || event.details.length === 0) return null
    
    return (
      <Box sx={{ mt: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Affected Items ({event.details.length})
          </Typography>
          {event.details.length > 3 && (
            <Button
              size="small"
              onClick={() => setExpandedDetails(!expandedDetails)}
              sx={{ textTransform: 'none', fontWeight: 500 }}
            >
              {expandedDetails ? 'Show Less' : 'Show All'}
            </Button>
          )}
        </Box>
        
        <List dense sx={{ p: 0 }}>
          {event.details.slice(0, expandedDetails ? undefined : 3).map((detail, index) => (
            <ListItem
              key={index}
              secondaryAction={
                detail.actionUrl && (
                  <IconButton 
                    edge="end" 
                    size="small"
                    onClick={() => handleNavigate(detail.actionUrl)}
                  >
                    <NavigateNext fontSize="small" />
                  </IconButton>
                )
              }
              sx={{
                bgcolor: 'background.default',
                mb: 1,
                borderRadius: '6px',
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.02)
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {detail.itemType === 'BATCH' ? 
                  <Inventory fontSize="small" /> : 
                  <Category fontSize="small" />
                }
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {detail.itemName}
                    </Typography>
                    {detail.batchNumber && (
                      <Chip 
                        label={detail.batchNumber} 
                        size="small" 
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Qty: {detail.quantity}
                    </Typography>
                    {detail.value && (
                      <Typography variant="caption" color="text.secondary">
                        Value: ${detail.value.toLocaleString()}
                      </Typography>
                    )}
                    {detail.category && (
                      <Typography variant="caption" color="text.secondary">
                        {detail.category}
                      </Typography>
                    )}
                  </Stack>
                }
              />
            </ListItem>
          ))}
        </List>
        
        {!expandedDetails && event.details.length > 3 && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ ml: 2, fontStyle: 'italic' }}
          >
            +{event.details.length - 3} more items
          </Typography>
        )}
      </Box>
    )
  }
  
  const renderAlertMessage = () => {
    if (event.severity?.toLowerCase() === 'critical' && event.daysUntil <= 0) {
      return (
        <Alert severity="error" sx={{ mt: 2, borderRadius: '8px' }}>
          This item has already expired and requires immediate attention!
        </Alert>
      )
    }
    
    if (event.severity?.toLowerCase() === 'critical' && event.daysUntil <= 7) {
      return (
        <Alert severity="warning" sx={{ mt: 2, borderRadius: '8px' }}>
          Critical expiry alert! This item expires in {event.daysUntil} days.
        </Alert>
      )
    }
    
    return null
  }
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px'
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box flex={1}>{renderEventHeader()}</Box>
          <IconButton
            edge="end"
            onClick={onClose}
            size="small"
            sx={{ ml: 2 }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 3 }}>
        {renderAlertMessage()}
        {renderEventSummary()}
        
        {event.description && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: '6px' }}>
            <Typography variant="body2">
              {event.description}
            </Typography>
          </Box>
        )}
        
        {renderEventDetails()}
        
        {event.daysUntil !== undefined && (
          <Box sx={{ mt: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Schedule fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Days until expiry:
              </Typography>
              <Chip
                label={
                  event.daysUntil < 0 
                    ? `${Math.abs(event.daysUntil)} days ago`
                    : event.daysUntil === 0 
                    ? 'Today'
                    : `${event.daysUntil} days`
                }
                size="small"
                color={event.daysUntil <= 7 ? 'error' : 'default'}
                sx={{ fontWeight: 600 }}
              />
            </Stack>
          </Box>
        )}
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Print">
            <IconButton onClick={handlePrint} size="small">
              <Print fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton onClick={handleShare} size="small">
              <Share fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        
        <Stack direction="row" spacing={1}>
          <Button 
            onClick={onClose}
            sx={{ textTransform: 'none' }}
          >
            Close
          </Button>
          {event.actionUrl && (
            <Button
              variant="contained"
              onClick={() => handleNavigate(event.actionUrl)}
              endIcon={<NavigateNext fontSize="small" />}
              sx={{ 
                textTransform: 'none',
                borderRadius: '6px',
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' }
              }}
            >
              View Details
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  )
}

export default ExpiryCalendarEvent