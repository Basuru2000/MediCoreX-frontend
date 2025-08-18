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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
  Snackbar
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
  Archive as ArchiveIcon,
  // Category Icons
  Block as QuarantineIcon,
  Inventory as StockIcon,
  Schedule as ExpiryIcon,
  Category as BatchIcon,
  Person as UserIcon,
  Settings as SystemIcon,
  CheckCircleOutline as ApprovalIcon,
  Assessment as ReportIcon,
  LocalShipping as ProcurementIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationPreferences
} from '../../services/api';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newNotification, setNewNotification] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const previousCountRef = useRef(0);
  const audioRef = useRef(null);
  
  const open = Boolean(anchorEl);

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCZywfDkkkkMGly+7OScTgwOUKzl8bllGAYyfNn1unMZCC5+z+/Zj0kMF1y57OegWBELW7Tq7aVZEQxVru3+unMeCTl62vLCei4FIHrM8NaOPwgVZL3u7JdPDAhUpOXytWYcBjiS1/LNei8FI3fH8N+RQAoUXrTp66hVFApGnt/yvmwhBCZywfDkkkkMGly+7OScTgwOUKzl8bllGAYyfNn1unMZCC5+z+/Zj0kMF1y57OegWBELW7Tq7aVZEQxVru3+unMeCTl62vLCei4FIHrM8NaOPwgVZL3u7JdPDAhUpOXytWYcBjiS1/LNei8FI3fH8N+RQAoUXrTp66hVFApGnt/yvmwhBCZywfDkkkkMGly+7OScTgwOUKzl8bllGAYyfNn1unMZCC5+z+/Zj0kMF1y57OegWBELW7Tq7aVZEQxVru3+unMeCTl62vLCei4FIHrM8NaOPwgVZL3u7JdPDAhUpOXytWYcBjiS1/LNei8FI3fH8N+RQAoUXrTp66hVFApGnt/yvmwhBCZywfDkkkkMGly+7OScTgwOUKzl8bllGAYyfNn1unMZCC5+z+/Zj0kMF1y57OegWBELW7Tq7aVZEQxVru3+unMeCTl62vLCei4FIHrM8NaOPwgVZL3u7JdPDAhUpOXytWYcBjiS1/LNei8FI3fH8N+RQAoUXrTp66hVFApGnt/yvmwhBCZywfDkkkkMGly+7OScTgwOUKzl8bllGAYyfNn1unMZCC5+z+/Zj0kMF1y57OegWBELW7Tq7aVZEQxVru3+unMeCTl62vLCei4FIHrM8NaOPwgVZL3u7JdPDAhUpOXytWYcBjiS1/LNei8FI3fH8N+RQAoUXrTp66hVFApGnt/yvmwhBCZywfDkkkkMGly+7OScTgwOUKzl8bllGAYyfNn1unMZCC5+z+/Zj0kMF1y57OegWBELW7Tq7aVZEQxVru3+unMeCTl62vLCei4FIHrM8NaOPwgVZL3u7JdPDAhUpOXyJQMASQMAUM==');
    
    const checkPreferences = async () => { 
      try { 
        const response = await getNotificationPreferences(); 
        const prefs = response.data; 
         
        // Only poll if in-app notifications are enabled 
        if (prefs.inAppEnabled) { 
          fetchUnreadCount(); 
          // Start polling 
          const interval = setInterval(fetchUnreadCount, 30000); 
          return () => clearInterval(interval); 
        } 
      } catch (error) { 
        console.error('Failed to check preferences:', error); 
        // Default to showing notifications if preference check fails 
        fetchUnreadCount(); 
        const interval = setInterval(fetchUnreadCount, 60000); 
        return () => clearInterval(interval); 
      } 
    }; 
     
    checkPreferences(); 
  }, []);

  useEffect(() => {
    // Check for new notifications and play sound if count increased
    if (unreadCount > previousCountRef.current && previousCountRef.current > 0) {
      playNotificationSound();
      // Find the newest notification
      if (notifications.length > 0 && notifications[0].status === 'UNREAD') {
        showNotificationToast(notifications[0]);
      }
    }
    previousCountRef.current = unreadCount;
  }, [unreadCount]);

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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'QUARANTINE':
        return <QuarantineIcon fontSize="small" />;
      case 'STOCK':
        return <StockIcon fontSize="small" />;
      case 'EXPIRY':
        return <ExpiryIcon fontSize="small" />;
      case 'BATCH':
        return <BatchIcon fontSize="small" />;
      case 'USER':
        return <UserIcon fontSize="small" />;
      case 'SYSTEM':
        return <SystemIcon fontSize="small" />;
      case 'APPROVAL':
        return <ApprovalIcon fontSize="small" />;
      case 'REPORT':
        return <ReportIcon fontSize="small" />;
      case 'PROCUREMENT':
        return <ProcurementIcon fontSize="small" />;
      default:
        return <NotificationsIcon fontSize="small" />;
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
      REPORT: 'success',
      PROCUREMENT: 'info'
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
            width: 420,
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
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsNoneIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography color="text.secondary">
              No new notifications
            </Typography>
            <Typography variant="caption" color="text.secondary">
              You're all caught up!
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
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    {getCategoryIcon(notification.category)}
                    {getPriorityIcon(notification.priority)}
                  </Box>
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

      {/* Toast notification for new critical/high priority notifications */}
      <Snackbar
        open={showToast}
        autoHideDuration={6000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {newNotification && (
          <Alert
            onClose={() => setShowToast(false)}
            severity={
              newNotification.priority === 'CRITICAL' ? 'error' :
              newNotification.priority === 'HIGH' ? 'warning' :
              'info'
            }
            sx={{ width: '100%' }}
          >
            <Typography variant="subtitle2">{newNotification.title}</Typography>
            <Typography variant="caption">{newNotification.message}</Typography>
          </Alert>
        )}
      </Snackbar>
    </>
  );
};

export default NotificationBell;