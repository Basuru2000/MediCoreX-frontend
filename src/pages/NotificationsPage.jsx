// src/pages/NotificationsPage.jsx
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
  Badge,
  Stack,
  InputAdornment,
  Fade,
  useTheme,
  alpha
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
  DoneAll as MarkAllReadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FolderOpen as EmptyIcon,
  BugReport as BugReportIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
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
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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

const NotificationsPage = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [filter, setFilter] = useState({
    category: 'ALL',
    priority: 'ALL',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState(null);
  const [groupByDate, setGroupByDate] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    fetchSummary();
  }, [tabValue, page]);

  useEffect(() => {
    // Apply client-side filtering for search, category, and priority
    let filtered = [...notifications];

    // Apply search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(notification => 
        notification.title?.toLowerCase().includes(searchLower) ||
        notification.message?.toLowerCase().includes(searchLower) ||
        notification.category?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filter.category !== 'ALL') {
      filtered = filtered.filter(notification => 
        notification.category === filter.category
      );
    }

    // Apply priority filter  
    if (filter.priority !== 'ALL') {
      filtered = filtered.filter(notification => 
        notification.priority === filter.priority
      );
    }

    setFilteredNotifications(filtered);

    // Update expanded groups for filtered notifications
    if (groupByDate) {
      const groups = {};
      filtered.forEach(notification => {
        const date = format(new Date(notification.createdAt), 'yyyy-MM-dd');
        groups[date] = true;
      });
      setExpandedGroups(groups);
    }
  }, [filter, notifications, groupByDate]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        status: tabValue === 0 ? 'UNREAD' : tabValue === 1 ? 'READ' : 'ARCHIVED',
        page: page - 1,
        size: 20 // Increased size to allow for client-side filtering
      };

      const response = await getNotifications(params);
      setNotifications(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
      
      // Expand all groups by default
      if (groupByDate) {
        const groups = {};
        response.data.content?.forEach(notification => {
          const date = format(new Date(notification.createdAt), 'yyyy-MM-dd');
          groups[date] = true;
        });
        setExpandedGroups(groups);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await getNotificationSummary();
      const summaryData = response.data;
      
      // Calculate archived count if not provided by the API
      if (!summaryData.archivedCount && summaryData.archivedCount !== 0) {
        // If the API doesn't provide archived count, calculate it
        // Total - (Unread + Read) = Archived
        const unread = summaryData.unreadCount || 0;
        const read = summaryData.readCount || 0;
        const total = summaryData.totalCount || 0;
        summaryData.archivedCount = Math.max(0, total - unread - read);
      }
      
      setSummary(summaryData);
    } catch (err) {
      console.error('Error fetching summary:', err);
      // Set default summary values if fetch fails
      setSummary({
        totalCount: 0,
        unreadCount: 0,
        readCount: 0,
        archivedCount: 0,
        criticalCount: 0
      });
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      fetchNotifications();
      fetchSummary();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      fetchNotifications();
      fetchSummary();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleArchive = async (notificationId) => {
    try {
      await archiveNotification(notificationId);
      fetchNotifications();
      fetchSummary();
    } catch (err) {
      console.error('Error archiving:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      fetchNotifications();
      fetchSummary();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      setTimeout(() => {
        fetchNotifications();
        fetchSummary();
      }, 1000);
    } catch (err) {
      console.error('Error sending test notification:', err);
    }
  };

  const handleClearSearch = () => {
    setFilter({ ...filter, search: '' });
  };

  const getCategoryIcon = (category) => {
    const iconProps = { fontSize: 'small' };
    switch (category) {
      case 'STOCK': return <StockIcon {...iconProps} />;
      case 'EXPIRY': return <ExpiryIcon {...iconProps} />;
      case 'BATCH': return <BatchIcon {...iconProps} />;
      case 'QUARANTINE': return <QuarantineIcon {...iconProps} />;
      case 'USER': return <UserIcon {...iconProps} />;
      case 'SYSTEM': return <SystemIcon {...iconProps} />;
      case 'APPROVAL': return <ApprovalIcon {...iconProps} />;
      case 'REPORT': return <ReportIcon {...iconProps} />;
      case 'PROCUREMENT': return <ProcurementIcon {...iconProps} />;
      default: return <NotificationsIcon {...iconProps} />;
    }
  };

  const getPriorityIcon = (priority) => {
    const iconProps = { fontSize: 'small' };
    switch (priority) {
      case 'CRITICAL': return <ErrorIcon {...iconProps} sx={{ color: 'error.main' }} />;
      case 'HIGH': return <WarningIcon {...iconProps} sx={{ color: 'warning.main' }} />;
      case 'MEDIUM': return <InfoIcon {...iconProps} sx={{ color: 'info.main' }} />;
      case 'LOW': return <CheckCircleIcon {...iconProps} sx={{ color: 'success.main' }} />;
      default: return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'QUARANTINE': return 'error';
      case 'EXPIRY': return 'warning';
      case 'STOCK': return 'info';
      default: return 'default';
    }
  };

  const groupNotificationsByDate = () => {
    const grouped = {};
    filteredNotifications.forEach(notification => {
      const date = format(new Date(notification.createdAt), 'EEEE, MMMM d, yyyy');
      const key = format(new Date(notification.createdAt), 'yyyy-MM-dd');
      if (!grouped[key]) {
        grouped[key] = {
          date,
          notifications: []
        };
      }
      grouped[key].notifications.push(notification);
    });
    return grouped;
  };

  const toggleGroupExpansion = (key) => {
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const EmptyState = () => (
    <Box sx={{ 
      textAlign: 'center', 
      py: 8, 
      px: 3 
    }}>
      <EmptyIcon sx={{ 
        fontSize: 64, 
        color: 'text.disabled', 
        mb: 2 
      }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {filter.search || filter.category !== 'ALL' || filter.priority !== 'ALL' 
          ? 'No Matching Notifications' 
          : 'No Notifications'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {filter.search || filter.category !== 'ALL' || filter.priority !== 'ALL'
          ? 'Try adjusting your search or filters'
          : tabValue === 0 
            ? "You're all caught up! No new notifications."
            : tabValue === 1 
            ? "No read notifications to display."
            : "No archived notifications."}
      </Typography>
      {user?.role === 'HOSPITAL_MANAGER' && tabValue === 0 && !filter.search && filter.category === 'ALL' && filter.priority === 'ALL' && (
        <Button
          variant="outlined"
          startIcon={<NotificationsIcon />}
          onClick={handleTestNotification}
          sx={{ 
            mt: 3,
            borderRadius: '8px',
            textTransform: 'none'
          }}
        >
          Send Test Notification
        </Button>
      )}
    </Box>
  );

  const NotificationItem = ({ notification, grouped = false }) => (
    <ListItem
      sx={{
        borderRadius: '8px',
        mb: 1,
        bgcolor: notification.status === 'UNREAD' 
          ? alpha(theme.palette.primary.main, 0.05) 
          : 'background.paper',
        border: `1px solid ${
          notification.status === 'UNREAD' 
            ? alpha(theme.palette.primary.main, 0.2)
            : theme.palette.divider
        }`,
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          transform: 'translateY(-1px)',
          boxShadow: theme.shadows[2]
        },
        transition: 'all 0.2s ease',
        pl: grouped ? 4 : 2
      }}
    >
      <ListItemIcon sx={{ minWidth: 48 }}>
        <Box sx={{ 
          width: 40,
          height: 40,
          borderRadius: '8px',
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {getCategoryIcon(notification.category)}
        </Box>
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {notification.title}
            </Typography>
            <Chip
              label={notification.category}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.75rem',
                borderRadius: '6px'
              }}
            />
            {getPriorityIcon(notification.priority)}
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {notification.message}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" color="text.disabled">
                {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
              </Typography>
              {notification.actionUrl && (
                <Button
                  size="small"
                  variant="text"
                  onClick={() => navigate(notification.actionUrl)}
                  sx={{ 
                    minWidth: 'auto',
                    textTransform: 'none',
                    fontSize: '0.75rem'
                  }}
                >
                  View Details
                </Button>
              )}
            </Box>
          </Box>
        }
      />
      
      <ListItemSecondaryAction>
        <Stack direction="row" spacing={0.5}>
          {notification.status === 'UNREAD' && (
            <Tooltip title="Mark as read">
              <IconButton 
                size="small" 
                onClick={() => handleMarkAsRead(notification.id)}
                sx={{ 
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.success.main, 0.1) 
                  }
                }}
              >
                <MarkReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {notification.status !== 'ARCHIVED' && (
            <Tooltip title="Archive">
              <IconButton 
                size="small" 
                onClick={() => handleArchive(notification.id)}
                sx={{ 
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.info.main, 0.1) 
                  }
                }}
              >
                <ArchiveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              onClick={() => handleDelete(notification.id)}
              sx={{ 
                '&:hover': { 
                  bgcolor: alpha(theme.palette.error.main, 0.1) 
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </ListItemSecondaryAction>
    </ListItem>
  );

  return (
    <ErrorBoundary>
      <Fade in={true}>
        <Box sx={{ p: 3 }}>
          {/* Page Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 4
          }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                Notifications
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Manage and review all your system notifications
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => navigate('/notification-preferences')}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderColor: theme.palette.divider,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                Preferences
              </Button>
              {tabValue === 0 && notifications.length > 0 && (
                <Button
                  variant="contained"
                  startIcon={<MarkAllReadIcon />}
                  onClick={handleMarkAllAsRead}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: theme.shadows[2]
                    }
                  }}
                >
                  Mark All Read
                </Button>
              )}
              <IconButton
                onClick={fetchNotifications}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Stack>
          </Box>

          {/* Summary Cards */}
          {summary && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none',
                  height: '100%'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '10px',
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <NotificationsIcon sx={{ color: 'info.main' }} />
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          {summary.totalCount || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none',
                  height: '100%'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '10px',
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ActiveIcon sx={{ color: 'warning.main' }} />
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          {summary.unreadCount || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Unread
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none',
                  height: '100%'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '10px',
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ErrorIcon sx={{ color: 'error.main' }} />
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          {summary.criticalCount || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Critical
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none',
                  height: '100%'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '10px',
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ArchiveIcon sx={{ color: 'success.main' }} />
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          {summary.archivedCount || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Archived
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Main Content */}
          <Paper sx={{ 
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
            overflow: 'hidden'
          }}>
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => {
                  setTabValue(newValue);
                  setPage(1);
                  // Reset filters when changing tabs
                  setFilter({
                    category: 'ALL',
                    priority: 'ALL',
                    search: ''
                  });
                }}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    minHeight: 48
                  }
                }}
              >
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Badge badgeContent={summary?.unreadCount || 0} color="error">
                        <ActiveIcon fontSize="small" />
                      </Badge>
                      <span>Unread</span>
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MarkReadIcon fontSize="small" />
                      <span>Read</span>
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ArchiveIcon fontSize="small" />
                      <span>Archived</span>
                    </Box>
                  } 
                />
              </Tabs>
            </Box>

            {/* Filters */}
            <Box sx={{ 
              p: 2, 
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.grey[100], 0.5)
            }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search notifications..."
                    value={filter.search}
                    onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: filter.search && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={handleClearSearch}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: '8px',
                        '& fieldset': {
                          borderColor: theme.palette.divider
                        }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filter.category}
                      onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                      label="Category"
                      sx={{ borderRadius: '8px' }}
                    >
                      <MenuItem value="ALL">All Categories</MenuItem>
                      <MenuItem value="STOCK">Stock</MenuItem>
                      <MenuItem value="EXPIRY">Expiry</MenuItem>
                      <MenuItem value="BATCH">Batch</MenuItem>
                      <MenuItem value="QUARANTINE">Quarantine</MenuItem>
                      <MenuItem value="USER">User</MenuItem>
                      <MenuItem value="SYSTEM">System</MenuItem>
                      <MenuItem value="APPROVAL">Approval</MenuItem>
                      <MenuItem value="REPORT">Report</MenuItem>
                      <MenuItem value="PROCUREMENT">Procurement</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={filter.priority}
                      onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                      label="Priority"
                      sx={{ borderRadius: '8px' }}
                    >
                      <MenuItem value="ALL">All Priorities</MenuItem>
                      <MenuItem value="CRITICAL">Critical</MenuItem>
                      <MenuItem value="HIGH">High</MenuItem>
                      <MenuItem value="MEDIUM">Medium</MenuItem>
                      <MenuItem value="LOW">Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={groupByDate ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    onClick={() => setGroupByDate(!groupByDate)}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      borderColor: theme.palette.divider,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  >
                    {groupByDate ? 'Ungroup' : 'Group'}
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Notifications List */}
            {loading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ m: 2 }}>
                {error}
              </Alert>
            ) : filteredNotifications.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <List sx={{ p: 2 }}>
                  {groupByDate ? (
                    Object.entries(groupNotificationsByDate()).map(([key, group]) => (
                      <Box key={key}>
                        <ListItem
                          button
                          onClick={() => toggleGroupExpansion(key)}
                          sx={{
                            borderRadius: '8px',
                            mb: 1,
                            bgcolor: alpha(theme.palette.grey[100], 0.5),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.grey[200], 0.5)
                            }
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {group.date}
                              </Typography>
                            }
                            secondary={`${group.notifications.length} notifications`}
                          />
                          {expandedGroups[key] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </ListItem>
                        <Collapse in={expandedGroups[key]} timeout="auto" unmountOnExit>
                          <Box sx={{ pl: 2 }}>
                            {group.notifications.map(notification => (
                              <NotificationItem 
                                key={notification.id} 
                                notification={notification} 
                                grouped 
                              />
                            ))}
                          </Box>
                        </Collapse>
                      </Box>
                    ))
                  ) : (
                    filteredNotifications.map(notification => (
                      <NotificationItem 
                        key={notification.id} 
                        notification={notification} 
                      />
                    ))
                  )}
                </List>

                {totalPages > 1 && (
                  <Box sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'center',
                    borderTop: `1px solid ${theme.palette.divider}`
                  }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(e, value) => setPage(value)}
                      color="primary"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          borderRadius: '8px'
                        }
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Box>
      </Fade>
    </ErrorBoundary>
  );
};

export default NotificationsPage;