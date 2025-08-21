import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
  Tooltip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Badge,
  Skeleton,
  Collapse,
  Avatar
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LocalHospital as HospitalIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Block as BlockIcon,
  AttachMoney as MoneyIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getExpirySummary, getExpiryCriticalAlerts } from '../../services/api';

const CriticalAlertsWidget = ({ refreshInterval = 60000 }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch summary data
  const fetchSummaryData = useCallback(async () => {
    try {
      setError(null);
      const response = await getExpirySummary();
      setSummaryData(response.data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch expiry summary:', err);
      setError('Failed to load critical alerts summary');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load and auto-refresh
  useEffect(() => {
    fetchSummaryData();
    
    const interval = setInterval(() => {
      fetchSummaryData();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [fetchSummaryData, refreshInterval]);

  // Manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchSummaryData();
  };

  // Navigate to detailed view
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'EXPIRED':
      case 'CRITICAL':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    if (!trend) return null;
    
    if (trend.direction === 'UP') {
      return <TrendingUpIcon color={trend.severity === 'GOOD' ? 'success' : 'error'} />;
    } else if (trend.direction === 'DOWN') {
      return <TrendingDownIcon color="success" />;
    }
    return null;
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Format relative time
  const formatRelativeTime = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const then = new Date(date);
    const diff = now - then;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return then.toLocaleDateString();
  };

  // Loading state
  if (loading) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Skeleton variant="text" width="60%" height={30} />
          </Box>
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={6} md={3} key={item}>
                <Skeleton variant="rectangular" height={80} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Alert 
            severity="error" 
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={3}>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
              <WarningIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" component="h2">
                Critical Alerts Summary
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last updated: {formatRelativeTime(lastRefresh)}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} disabled={refreshing}>
                <RefreshIcon className={refreshing ? 'rotating' : ''} />
              </IconButton>
            </Tooltip>
            <Tooltip title={expanded ? 'Show less' : 'Show more'}>
              <IconButton onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Main Stats Grid */}
        <Grid container spacing={2} mb={3}>
          {/* Expired Items */}
          <Grid item xs={6} md={3}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'error.light',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 }
              }}
              onClick={() => handleNavigate('/batch-tracking?filter=expired')}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <ErrorIcon sx={{ color: 'error.dark', fontSize: 30 }} />
                <Typography variant="h4" color="error.dark">
                  {summaryData?.expiredCount || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="error.dark" fontWeight="bold">
                Expired
              </Typography>
              {summaryData?.expiredTrend && (
                <Box display="flex" alignItems="center" mt={1}>
                  {getTrendIcon(summaryData.expiredTrend)}
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {summaryData.expiredTrend.message}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Expiring Today */}
          <Grid item xs={6} md={3}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'warning.light',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 }
              }}
              onClick={() => handleNavigate('/batch-tracking?filter=today')}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <CalendarIcon sx={{ color: 'warning.dark', fontSize: 30 }} />
                <Typography variant="h4" color="warning.dark">
                  {summaryData?.expiringTodayCount || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="warning.dark" fontWeight="bold">
                Expiring Today
              </Typography>
              {summaryData?.expiringTodayCount > 0 && (
                <Chip
                  label="Urgent Action Required"
                  size="small"
                  color="warning"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          </Grid>

          {/* This Week */}
          <Grid item xs={6} md={3}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'info.light',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 }
              }}
              onClick={() => handleNavigate('/batch-tracking?filter=week')}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <ScheduleIcon sx={{ color: 'info.dark', fontSize: 30 }} />
                <Typography variant="h4" color="info.dark">
                  {summaryData?.expiringThisWeekCount || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="info.dark" fontWeight="bold">
                This Week
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(summaryData?.expiringThisWeekCount / summaryData?.expiringThisMonthCount) * 100 || 0}
                sx={{ mt: 1, bgcolor: 'info.lighter' }}
              />
            </Box>
          </Grid>

          {/* This Month */}
          <Grid item xs={6} md={3}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'success.light',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 }
              }}
              onClick={() => handleNavigate('/batch-tracking?filter=month')}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <HospitalIcon sx={{ color: 'success.dark', fontSize: 30 }} />
                <Typography variant="h4" color="success.dark">
                  {summaryData?.expiringThisMonthCount || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="success.dark" fontWeight="bold">
                This Month
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Expanded Details */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={3}>
            {/* Critical Items List */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Critical Items Requiring Action
              </Typography>
              <List dense>
                {summaryData?.criticalItems?.slice(0, 5).map((item, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleNavigate(item.actionUrl)}
                    sx={{
                      bgcolor: 'background.paper',
                      mb: 1,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <ListItemIcon>
                      <Badge
                        badgeContent={Math.abs(item.daysUntilExpiry)}
                        color={getSeverityColor(item.severity)}
                      >
                        <BlockIcon />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={item.productName}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            Batch: {item.batchNumber} | Qty: {item.quantity}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.daysUntilExpiry < 0
                              ? `Expired ${Math.abs(item.daysUntilExpiry)} days ago`
                              : item.daysUntilExpiry === 0
                              ? 'Expires today'
                              : `Expires in ${item.daysUntilExpiry} days`}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={item.severity}
                        size="small"
                        color={getSeverityColor(item.severity)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              {summaryData?.criticalItems?.length > 5 && (
                <Button
                  fullWidth
                  variant="outlined"
                  endIcon={<ArrowIcon />}
                  onClick={() => handleNavigate('/expiry/alerts')}
                >
                  View All Critical Items
                </Button>
              )}
            </Grid>

            {/* Stats and Actions */}
            <Grid item xs={12} md={6}>
              {/* Financial Impact */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Financial Impact
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <MoneyIcon color="error" />
                      <Typography variant="h6" color="error">
                        {formatCurrency(summaryData?.expiredValue)}
                      </Typography>
                      <Typography variant="caption">Expired Value</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <MoneyIcon color="warning" />
                      <Typography variant="h6" color="warning.main">
                        {formatCurrency(summaryData?.totalValueAtRisk)}
                      </Typography>
                      <Typography variant="caption">Value at Risk</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Alert Status */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Alert Status
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Badge badgeContent={summaryData?.pendingAlertsCount} color="error">
                        <PendingIcon color="action" />
                      </Badge>
                      <Typography variant="caption" display="block">
                        Pending
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Badge badgeContent={summaryData?.acknowledgedAlertsCount} color="warning">
                        <TaskIcon color="action" />
                      </Badge>
                      <Typography variant="caption" display="block">
                        Acknowledged
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Badge badgeContent={summaryData?.resolvedAlertsCount} color="success">
                        <CheckIcon color="action" />
                      </Badge>
                      <Typography variant="caption" display="block">
                        Resolved
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Quick Actions */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleNavigate('/expiry/monitoring')}
                    >
                      Run Check
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => handleNavigate('/quarantine')}
                    >
                      Quarantine
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => handleNavigate('/expiry/alerts')}
                    >
                      View Alerts
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => handleNavigate('/reports/expiry')}
                    >
                      Reports
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Collapse>
      </CardContent>

      <style jsx>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .rotating {
          animation: rotate 1s linear infinite;
        }
      `}</style>
    </Card>
  );
};

export default CriticalAlertsWidget;