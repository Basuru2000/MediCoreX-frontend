import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Chip,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Pagination
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as ActiveIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  DeleteSweep as DeleteAllIcon,
  DoneAll as MarkAllReadIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import {
  getNotifications,
  getNotificationSummary,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  deleteNotification,
  sendTestNotification
} from '../services/api.js';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState(null);
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const statuses = ['UNREAD', 'READ', 'ARCHIVED'];
  const categories = [
    'QUARANTINE', 'STOCK', 'EXPIRY', 'BATCH', 
    'USER', 'SYSTEM', 'APPROVAL', 'REPORT'
  ];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  useEffect(() => {
    fetchNotifications();
    fetchSummary();
  }, [tabValue, selectedCategory, selectedPriority, page]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        status: statuses[tabValue],
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedPriority && { priority: selectedPriority }),
        page: page - 1,
        size: 10
      };
      
      const response = await getNotifications(params);
      setNotifications(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await getNotificationSummary();
      setSummary(response.data);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
    setSelectedNotifications([]);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId 
          ? { ...n, status: 'READ' } 
          : n
        )
      );
      fetchSummary();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      fetchNotifications();
      fetchSummary();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleArchive = async (notificationId) => {
    try {
      await archiveNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      fetchSummary();
    } catch (err) {
      console.error('Failed to archive:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      fetchSummary();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedNotifications.length === 0) return;
    
    try {
      for (const id of selectedNotifications) {
        if (action === 'read') {
          await markNotificationAsRead(id);
        } else if (action === 'archive') {
          await archiveNotification(id);
        } else if (action === 'delete') {
          await deleteNotification(id);
        }
      }
      fetchNotifications();
      fetchSummary();
      setSelectedNotifications([]);
    } catch (err) {
      console.error(`Failed to ${action}:`, err);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      setTimeout(fetchNotifications, 1000);
    } catch (err) {
      console.error('Failed to send test notification:', err);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <ErrorIcon color="error" />;
      case 'HIGH':
        return <WarningIcon color="warning" />;
      case 'MEDIUM':
        return <InfoIcon color="info" />;
      default:
        return <CheckCircleIcon color="success" />;
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

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Notifications
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {user?.role === 'HOSPITAL_MANAGER' && (
            <Button
              variant="outlined"
              startIcon={<NotificationsIcon />}
              onClick={handleTestNotification}
            >
              Test Notification
            </Button>
          )}
          <IconButton onClick={fetchNotifications}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total
                </Typography>
                <Typography variant="h4">
                  {summary.totalCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Unread
                </Typography>
                <Typography variant="h4" color="primary">
                  {summary.unreadCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Critical
                </Typography>
                <Typography variant="h4" color="error">
                  {summary.criticalCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  High Priority
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {summary.highPriorityCount || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Unread" icon={<ActiveIcon />} iconPosition="start" />
            <Tab label="Read" icon={<MarkReadIcon />} iconPosition="start" />
            <Tab label="Archived" icon={<ArchiveIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Filters */}
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              label="Priority"
            >
              <MenuItem value="">All</MenuItem>
              {priorities.map(pri => (
                <MenuItem key={pri} value={pri}>{pri}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {tabValue === 0 && notifications.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<MarkAllReadIcon />}
              onClick={handleMarkAllAsRead}
              sx={{ ml: 'auto' }}
            >
              Mark All Read
            </Button>
          )}
        </Box>

        <Divider />

        {/* Notifications List */}
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <>
            <List>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    borderLeft: notification.status === 'UNREAD' ? 4 : 0,
                    borderColor: 'primary.main',
                    bgcolor: notification.status === 'UNREAD' ? 'action.hover' : 'transparent',
                    '&:hover': {
                      bgcolor: 'action.selected'
                    }
                  }}
                >
                  <ListItemIcon>
                    {getPriorityIcon(notification.priority)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.category}
                          size="small"
                          color={getCategoryColor(notification.category)}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ my: 1 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {format(new Date(notification.createdAt), 'PPpp')}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    {notification.status === 'UNREAD' && (
                      <Tooltip title="Mark as read">
                        <IconButton onClick={() => handleMarkAsRead(notification.id)}>
                          <MarkReadIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {notification.status !== 'ARCHIVED' && (
                      <Tooltip title="Archive">
                        <IconButton onClick={() => handleArchive(notification.id)}>
                          <ArchiveIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(notification.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            {totalPages > 1 && (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default NotificationsPage;