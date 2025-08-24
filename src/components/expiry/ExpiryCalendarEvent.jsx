import React, { useState } from 'react';
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
  Tooltip
} from '@mui/material';
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
  Share
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ExpiryCalendarEvent = ({ 
  open, 
  onClose, 
  event, 
  date,
  onActionClick 
}) => {
  const navigate = useNavigate();
  const [expandedDetails, setExpandedDetails] = useState(false);
  
  if (!event) return null;
  
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };
  
  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return <Error />;
      case 'high': return <Warning />;
      case 'medium': return <Info />;
      default: return <Info />;
    }
  };
  
  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'BATCH_EXPIRY': return <Inventory />;
      case 'PRODUCT_EXPIRY': return <LocalShipping />;
      case 'ALERT': return <Warning />;
      case 'QUARANTINE': return <Block />;
      default: return <Info />;
    }
  };
  
  const handleNavigate = (url) => {
    if (url) {
      navigate(url);
      onClose();
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      });
    }
  };
  
  const renderEventHeader = () => (
    <Box display="flex" alignItems="center" gap={2}>
      <Box 
        sx={{ 
          p: 1, 
          borderRadius: 1, 
          bgcolor: `${getSeverityColor(event.severity)}.light`,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {getEventTypeIcon(event.type)}
      </Box>
      <Box flex={1}>
        <Typography variant="h6">
          {event.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {format(new Date(date || event.date), 'EEEE, MMMM d, yyyy')}
        </Typography>
      </Box>
      <Chip
        icon={getSeverityIcon(event.severity)}
        label={event.severity}
        color={getSeverityColor(event.severity)}
        size="small"
      />
    </Box>
  );
  
  const renderEventSummary = () => (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={6} sm={3}>
        <Typography variant="caption" color="text.secondary">
          Type
        </Typography>
        <Typography variant="body2">
          {event.type?.replace('_', ' ')}
        </Typography>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Typography variant="caption" color="text.secondary">
          Items Affected
        </Typography>
        <Typography variant="body2">
          {event.itemCount || 0}
        </Typography>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Typography variant="caption" color="text.secondary">
          Total Quantity
        </Typography>
        <Typography variant="body2">
          {event.totalQuantity || 0} units
        </Typography>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Typography variant="caption" color="text.secondary">
          Value at Risk
        </Typography>
        <Typography variant="body2">
          ${event.totalValue?.toLocaleString() || '0'}
        </Typography>
      </Grid>
    </Grid>
  );
  
  const renderEventDetails = () => {
    if (!event.details || event.details.length === 0) return null;
    
    return (
      <Box sx={{ mt: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2">
            Affected Items ({event.details.length})
          </Typography>
          <Button
            size="small"
            onClick={() => setExpandedDetails(!expandedDetails)}
          >
            {expandedDetails ? 'Show Less' : 'Show All'}
          </Button>
        </Box>
        
        <List dense>
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
                    <NavigateNext />
                  </IconButton>
                )
              }
              sx={{
                bgcolor: 'background.default',
                mb: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <ListItemIcon>
                {detail.itemType === 'BATCH' ? <Inventory /> : <Category />}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">
                      {detail.itemName}
                    </Typography>
                    {detail.batchNumber && (
                      <Chip 
                        label={detail.batchNumber} 
                        size="small" 
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box display="flex" gap={2}>
                    <Typography variant="caption">
                      Qty: {detail.quantity}
                    </Typography>
                    {detail.value && (
                      <Typography variant="caption">
                        Value: ${detail.value.toLocaleString()}
                      </Typography>
                    )}
                    {detail.category && (
                      <Typography variant="caption">
                        Category: {detail.category}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
        
        {!expandedDetails && event.details.length > 3 && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ ml: 2 }}
          >
            +{event.details.length - 3} more items
          </Typography>
        )}
      </Box>
    );
  };
  
  const renderEventMetadata = () => (
    <Table size="small" sx={{ mt: 2 }}>
      <TableBody>
        {event.daysUntil !== undefined && (
          <TableRow>
            <TableCell component="th" scope="row">
              <Box display="flex" alignItems="center" gap={1}>
                <Schedule fontSize="small" />
                <Typography variant="caption">Days Until</Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Chip
                label={
                  event.isPast 
                    ? `${Math.abs(event.daysUntil)} days ago`
                    : event.isToday 
                    ? 'Today'
                    : `${event.daysUntil} days`
                }
                size="small"
                color={event.daysUntil <= 7 ? 'error' : 'default'}
              />
            </TableCell>
          </TableRow>
        )}
        {event.description && (
          <TableRow>
            <TableCell component="th" scope="row">
              <Typography variant="caption">Description</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">
                {event.description}
              </Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
  
  const renderAlertMessage = () => {
    if (event.severity === 'CRITICAL' && event.daysUntil <= 0) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">
            This item has already expired and requires immediate attention!
          </Typography>
        </Alert>
      );
    }
    
    if (event.severity === 'CRITICAL' && event.daysUntil <= 7) {
      return (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Critical expiry alert! This item expires in {event.daysUntil} days.
          </Typography>
        </Alert>
      );
    }
    
    return null;
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderTop: `4px solid`,
          borderTopColor: event.color || '#1976d2'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>{renderEventHeader()}</Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {renderAlertMessage()}
        {renderEventSummary()}
        <Divider sx={{ my: 2 }} />
        {renderEventDetails()}
        {renderEventMetadata()}
      </DialogContent>
      
      <DialogActions>
        <Box display="flex" justifyContent="space-between" width="100%">
          <Box>
            <Tooltip title="Print">
              <IconButton onClick={handlePrint}>
                <Print />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton onClick={handleShare}>
                <Share />
              </IconButton>
            </Tooltip>
          </Box>
          <Box display="flex" gap={1}>
            <Button onClick={onClose}>
              Close
            </Button>
            {event.actionUrl && (
              <Button
                variant="contained"
                onClick={() => handleNavigate(event.actionUrl)}
                endIcon={<NavigateNext />}
              >
                View Details
              </Button>
            )}
            {onActionClick && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  onActionClick(event);
                  onClose();
                }}
              >
                Take Action
              </Button>
            )}
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ExpiryCalendarEvent;