import React, { useState, useEffect, useRef } from 'react';
import { 
  IconButton, 
  Badge, 
  Menu, 
  MenuItem, 
  Typography, 
  Box,
  Divider,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton as DeleteIcon,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Delete as DeleteIconMui,
  CheckCircle,
  Warning,
  Error,
  Info,
  MarkEmailRead
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useWebSocketContext } from '../../context/WebSocketContext';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  archiveNotification,
  // getPreferences,  // COMMENTED OUT - function doesn't exist
  getNotificationPreferences,  // USE THIS INSTEAD
  sendTestNotification
} from '../../services/api';

const NotificationBell = () => {
  const navigate = useNavigate();
  const webSocket = useWebSocketContext();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [newNotification, setNewNotification] = useState(null);
  
  const open = Boolean(anchorEl);
  const audioRef = useRef(null);
  const previousCountRef = useRef(0);

  // Initialize audio - FIX: Don't create Audio in useRef directly
  useEffect(() => {
    try {
      audioRef.current = new Audio('/notification-sound.mp3');
    } catch (err) {
      console.log('Could not load notification sound');
    }
  }, []);

  /*
  // Check preferences - COMMENT OUT OR REMOVE THIS ENTIRE USEEFFECT
  useEffect(() => {
    const checkPreferences = async () => {
      try {
        const response = await getPreferences();
        // Handle preferences
      } catch (err) {
        console.error('Failed to load preferences:', err);
      }
    };
    
    checkPreferences();
  }, []);
  */

  // Replace with corrected version if preferences are needed:
  useEffect(() => {
    const checkPreferences = async () => {
      try {
        const response = await getNotificationPreferences();  // CORRECTED FUNCTION NAME
        // Handle preferences
      } catch (err) {
        console.error('Failed to load preferences:', err);
      }
    };
    
    checkPreferences();
  }, []);

  // Use WebSocket notifications when connected
  useEffect(() => {
    if (webSocket && webSocket.connected) {
      // Use WebSocket data
      if (webSocket.notifications) {
        setNotifications(webSocket.notifications);
      }
      if (webSocket.unreadCount !== undefined) {
        setUnreadCount(webSocket.unreadCount);
      }
    }
  }, [webSocket?.connected, webSocket?.notifications, webSocket?.unreadCount]);

  // Polling fallback when WebSocket is not connected
  useEffect(() => {
    if (!webSocket?.connected) {
      fetchUnreadCount();
      
      const interval = setInterval(() => {
        fetchUnreadCount();
        if (open) {
          fetchNotifications();
        }
      }, 30000);
      
      // FIX: Return cleanup function properly
      return () => clearInterval(interval);
    }
    // No cleanup needed when WebSocket is connected
    return undefined;
  }, [webSocket?.connected, open]);

  // Watch for notification count changes and play sound
  useEffect(() => {
    if (unreadCount > previousCountRef.current && previousCountRef.current > 0) {
      playNotificationSound();
      // Find the newest notification
      if (notifications.length > 0 && notifications[0].status === 'UNREAD') {
        showNotificationToast(notifications[0]);
      }
    }
    previousCountRef.current = unreadCount;
  }, [unreadCount, notifications]);

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
        size: 10 
      });
      setNotifications(response.data.content || []);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Could not play sound:', e));
    }
  };

  const showNotificationToast = (notification) => {
    setNewNotification(notification);
    setShowToast(true);
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
      if (webSocket?.connected && webSocket?.markAsRead) {
        // Use WebSocket to mark as read
        webSocket.markAsRead(notification.id);
      } else {
        // Fallback to API call
        await markNotificationAsRead(notification.id);
      }
      
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
        return <Error color="error" fontSize="small" />;
      case 'HIGH':
        return <Warning color="warning" fontSize="small" />;
      case 'MEDIUM':
        return <Info color="info" fontSize="small" />;
      case 'LOW':
      default:
        return <CheckCircle color="success" fontSize="small" />;
    }
  };

  const renderConnectionStatus = () => {
    if (!webSocket?.connected) {
      return (
        <Tooltip title="Real-time updates offline - using polling">
          <Chip 
            size="small" 
            label="Offline" 
            color="warning" 
            sx={{ ml: 1 }}
          />
        </Tooltip>
      );
    }
    return null;
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label={`${unreadCount} notifications`}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      {renderConnectionStatus()}
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 360,
            maxHeight: 480,
            overflow: 'visible',
            mt: 1.5
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box px={2} py={1.5}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Button 
                size="small" 
                onClick={handleMarkAllRead}
                startIcon={<MarkEmailRead />}
              >
                Mark all read
              </Button>
            )}
          </Box>
        </Box>
        
        <Divider />
        
        {loading && (
          <Box p={3} textAlign="center">
            <Typography>Loading...</Typography>
          </Box>
        )}
        
        {!loading && notifications.length === 0 && (
          <Box p={3} textAlign="center">
            <Typography color="textSecondary">
              No new notifications
            </Typography>
          </Box>
        )}
        
        {!loading && notifications.length > 0 && (
          <List sx={{ p: 0, maxHeight: 350, overflow: 'auto' }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  bgcolor: notification.status === 'UNREAD' ? 'action.selected' : 'transparent'
                }}
              >
                <ListItemIcon>
                  {getPriorityIcon(notification.priority)}
                </ListItemIcon>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
                <IconButton
                  size="small"
                  onClick={(e) => handleDelete(e, notification.id)}
                  edge="end"
                >
                  <DeleteIconMui fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
        
        <Divider />
        
        <Box p={1}>
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
      
      <Snackbar
        open={showToast}
        autoHideDuration={6000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowToast(false)}
          severity="info"
          sx={{ width: '100%' }}
        >
          {newNotification?.title}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationBell;