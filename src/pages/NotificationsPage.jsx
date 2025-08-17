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
  Pagination,
  Collapse,
  Badge
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
  DoneAll as MarkAllReadIcon
=======
>>>>>>> Stashed changes
=======
  DoneAll as MarkAllReadIcon
=======
>>>>>>> Stashed changes
  DoneAll as MarkAllReadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FolderOpen as EmptyIcon,
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
  BugReport as BugReportIcon,
>>>>>>> Stashed changes
=======
  BugReport as BugReportIcon,
>>>>>>> Stashed changes
  // Category icons
  Block as QuarantineIcon,
  Inventory as StockIcon,
  Schedule as ExpiryIcon,
  Category as BatchIcon,
  Person as UserIcon,
  Settings as SystemIcon,
  CheckCircleOutline as ApprovalIcon,
  Assessment as ReportIcon,
  LocalShipping as ProcurementIcon
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
>>>>>>> Stashed changes
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import {
  getNotifications,
  getNotificationSummary,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  deleteNotification,
  sendTestNotification
} from '../services/api.js';
import api from '../services/api.js';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [groupedNotifications, setGroupedNotifications] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState(null);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const statuses = ['UNREAD', 'READ', 'ARCHIVED'];
  const categories = [
    'QUARANTINE', 'STOCK', 'EXPIRY', 'BATCH', 
    'USER', 'SYSTEM', 'APPROVAL', 'REPORT', 'PROCUREMENT'
  ];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  useEffect(() => {
    fetchNotifications();
    fetchSummary();
  }, [tabValue, selectedCategory, selectedPriority, page]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        fetchNotifications(true);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [loading, refreshing]);

  const fetchNotifications = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    setError(null);
    try {
      const params = {
        status: statuses[tabValue],
        page: page - 1,
        size: 20
      };
      
      if (selectedCategory) params.category = selectedCategory;
      if (selectedPriority) params.priority = selectedPriority;
      
      const response = await getNotifications(params);
      const fetchedNotifications = response.data.content || [];
      
      setNotifications(fetchedNotifications);
      setTotalPages(response.data.totalPages || 1);
      
      // Group notifications by type and date
      groupNotifications(fetchedNotifications);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const groupNotifications = (notificationList) => {
    const grouped = {};
    
    notificationList.forEach(notification => {
      const date = format(new Date(notification.createdAt), 'yyyy-MM-dd');
      const groupKey = `${notification.category}_${date}`;
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          category: notification.category,
          date: date,
          displayDate: format(new Date(notification.createdAt), 'MMM dd, yyyy'),
          notifications: []
        };
      }
      
      grouped[groupKey].notifications.push(notification);
    });
    
    setGroupedNotifications(grouped);
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

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      setTimeout(fetchNotifications, 1000);
    } catch (err) {
      console.error('Failed to send test notification:', err);
    }
  };

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes
  const handleEnhancedTest = async () => {
    try {
      // First, check the system
      const systemCheck = await api.get('/notifications/debug/check-system');
      console.log('System Check:', systemCheck.data);
      
      // Then run the regular test
      const testResult = await sendTestNotification();
      console.log('Test Result:', testResult.data);
      
      // Show results
      const message = `
        System Status:
        - Templates: ${systemCheck.data.totalTemplates}
        - BATCH_CREATED: ${systemCheck.data.requiredTemplates.BATCH_CREATED ? '✓' : '✗'}
        - QUARANTINE_CREATED: ${systemCheck.data.requiredTemplates.QUARANTINE_CREATED ? '✓' : '✗'}
        - USER_REGISTERED: ${systemCheck.data.requiredTemplates.USER_REGISTERED ? '✓' : '✗'}
        
        Test Results:
        - ${testResult.data.SUMMARY}
      `;
      
      alert(message);
      
      // Refresh notifications after test
      setTimeout(() => {
        fetchNotifications();
        fetchSummary();
      }, 1000);
      
    } catch (error) {
      console.error('Enhanced test failed:', error);
      alert('Test failed. Check console for details.');
    }
  };

<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  const toggleGroupExpansion = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
>>>>>>> Stashed changes
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'QUARANTINE': return <QuarantineIcon />;
      case 'STOCK': return <StockIcon />;
      case 'EXPIRY': return <ExpiryIcon />;
      case 'BATCH': return <BatchIcon />;
      case 'USER': return <UserIcon />;
      case 'SYSTEM': return <SystemIcon />;
      case 'APPROVAL': return <ApprovalIcon />;
      case 'REPORT': return <ReportIcon />;
      case 'PROCUREMENT': return <ProcurementIcon />;
      default: return <NotificationsIcon />;
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

<<<<<<< Updated upstream
  const EmptyState = () => (
    <Box sx={{ p: 6, textAlign: 'center' }}>
      <EmptyIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h5" color="text.secondary" gutterBottom>
        No Notifications
      </Typography>
      <Typography variant="body1" color="text.disabled">
        {tabValue === 0 
          ? "You're all caught up! No new notifications."
          : tabValue === 1 
          ? "No read notifications to display."
          : "No archived notifications."}
      </Typography>
      {user?.role === 'HOSPITAL_MANAGER' && tabValue === 0 && (
        <Button
          variant="outlined"
          startIcon={<NotificationsIcon />}
          onClick={handleTestNotification}
          sx={{ mt: 3 }}
        >
          Send Test Notification
        </Button>
=======
  return (
<<<<<<< Updated upstream
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
=======
    <ErrorBoundary>
      <Box>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">
            Notifications
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {user?.role === 'HOSPITAL_MANAGER' && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<NotificationsIcon />}
                  onClick={handleTestNotification}
                >
                  Test Notification
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleEnhancedTest}
                  startIcon={<BugReportIcon />}
                >
                  Debug Test
                </Button>
              </>
            )}
            <IconButton 
              onClick={() => fetchNotifications()}
              disabled={loading || refreshing}
>>>>>>> Stashed changes
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
>>>>>>> Stashed changes
      )}
    </Box>
  );

  const NotificationItem = ({ notification, grouped = false }) => (
    <ListItem
      sx={{
        borderLeft: notification.status === 'UNREAD' ? 4 : 0,
        borderColor: 'primary.main',
        bgcolor: notification.status === 'UNREAD' ? 'action.hover' : 'transparent',
        '&:hover': {
          bgcolor: 'action.selected'
        },
        pl: grouped ? 4 : 2
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
            <Typography variant="subtitle1">
              {notification.title}
            </Typography>
            <Chip
              label={notification.category}
              size="small"
              color={getCategoryColor(notification.category)}
            />
            {notification.actionUrl && (
              <Button
                size="small"
                variant="text"
                onClick={() => window.location.href = notification.actionUrl}
              >
                View Details
              </Button>
            )}
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
  );

  return (
    <ErrorBoundary>
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
            <IconButton 
              onClick={() => fetchNotifications()}
              disabled={loading || refreshing}
            >
              {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
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
                    Total Notifications
                  </Typography>
                  <Typography variant="h4">
                    {summary.totalCount || 0}
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
                    {summary.unreadCount || 0}
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
                    {summary.criticalCount || 0}
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
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab 
                label={
                  <Badge badgeContent={summary?.unreadCount || 0} color="error">
                    Unread
                  </Badge>
                } 
              />
              <Tab label="Read" />
              <Tab label="Archived" />
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
                  <MenuItem key={cat} value={cat}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getCategoryIcon(cat)}
                      {cat}
                    </Box>
                  </MenuItem>
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
                  <MenuItem key={pri} value={pri}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getPriorityIcon(pri)}
                      {pri}
                    </Box>
                  </MenuItem>
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
            <EmptyState />
          ) : (
            <>
              <List>
                {/* Show grouped notifications if more than 5 of same category */}
                {Object.keys(groupedNotifications).length > 0 && 
                 Object.values(groupedNotifications).some(g => g.notifications.length > 2) ? (
                  Object.entries(groupedNotifications).map(([key, group]) => (
                    <Box key={key}>
                      <ListItem
                        button
                        onClick={() => toggleGroupExpansion(key)}
                        sx={{ bgcolor: 'grey.50' }}
                      >
                        <ListItemIcon>
                          {getCategoryIcon(group.category)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">
                                {group.category} Notifications
                              </Typography>
                              <Chip
                                label={group.notifications.length}
                                size="small"
                                color="primary"
                              />
                            </Box>
                          }
                          secondary={group.displayDate}
                        />
                        {expandedGroups[key] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </ListItem>
                      <Collapse in={expandedGroups[key]} timeout="auto" unmountOnExit>
                        {group.notifications.map(notification => (
                          <NotificationItem 
                            key={notification.id} 
                            notification={notification} 
                            grouped 
                          />
                        ))}
                      </Collapse>
                    </Box>
                  ))
                ) : (
                  // Show individual notifications
                  notifications.map(notification => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification} 
                    />
                  ))
                )}
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
    </ErrorBoundary>
  );
};

export default NotificationsPage;