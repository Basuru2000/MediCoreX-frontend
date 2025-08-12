import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../../services/api';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadNotificationCount();
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getNotifications({ 
        status: 'UNREAD', 
        page: 0, 
        size: 5 
      });
      setNotifications(response.data.content || []);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (event) => {
    setAnchorEl(event.currentTarget);
    if (!open) {
      await fetchNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      await markNotificationAsRead(notification.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notification.id 
          ? { ...n, status: 'READ' } 
          : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Navigate if action URL exists
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
        handleClose();
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, status: 'READ' }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <ErrorIcon color="error" fontSize="small" />;
      case 'HIGH':
        return <WarningIcon color="warning" fontSize="small" />;
      case 'MEDIUM':
        return <InfoIcon color="info" fontSize="small" />;
      default:
        return <CheckCircleIcon color="success" fontSize="small" />;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      QUARANTINE: 'error',
      STOCK: 'warning',
      EXPIRY: 'error',
      BATCH: 'info',
      USER: 'primary',
      SYSTEM: 'default',
      APPROVAL: 'secondary',
      REPORT: 'success'
    };
    return colors[category] || 'default';
  };

  const formatTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours = Math.abs(now - notificationDate) / 36e5;
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return format(notificationDate, 'h:mm a');
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(notificationDate, 'MMM dd');
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label={`${unreadCount} unread notifications`}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </Box>
        
        <Divider />

        {loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsNoneIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography color="text.secondary">
              No new notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  borderLeft: notification.status === 'UNREAD' ? 4 : 0,
                  borderColor: 'primary.main',
                  bgcolor: notification.status === 'UNREAD' ? 'action.hover' : 'transparent',
                  '&:hover': {
                    bgcolor: 'action.selected'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getPriorityIcon(notification.priority)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.category}
                        size="small"
                        color={getCategoryColor(notification.category)}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {formatTime(notification.createdAt)}
                      </Typography>
                    </>
                  }
                />
                <IconButton
                  size="small"
                  onClick={(e) => handleDelete(e, notification.id)}
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}

        <Divider />
        
        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            onClick={() => {
              navigate('/notifications');
              handleClose();
            }}
          >
            View all notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationBell;