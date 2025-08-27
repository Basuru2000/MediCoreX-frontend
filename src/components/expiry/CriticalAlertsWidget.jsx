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

  // Navigate to detailed view with proper routes
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Navigate to specific batch
  const handleBatchNavigate = (batchId) => {
    // Navigate to batch-tracking page with specific batch selected
    navigate('/batch-tracking', { state: { selectedBatchId: batchId } });
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

  // Loading state
  if (loading && !summaryData) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" height={40} />
          <Grid container spacing={2} mt={1}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={6} md={3} key={item}>
                <Skeleton variant="rectangular" height={100} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Critical Alerts Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last updated: {refreshing ? 'Refreshing...' : 
                lastRefresh ? new Date(lastRefresh).toLocaleTimeString() : 'Just now'}
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Refresh">
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

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

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
              onClick={() => handleNavigate('/batch-tracking')}
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
              onClick={() => handleNavigate('/batch-tracking')}
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
              onClick={() => handleNavigate('/batch-tracking')}
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
              onClick={() => handleNavigate('/batch-tracking')}
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
            {/* Critical Items */}
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                  <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                  Critical Items Requiring Action
                </Typography>
                <List dense>
                  {summaryData?.criticalItems?.length > 0 ? (
                    summaryData.criticalItems.slice(0, 5).map((item) => (
                      <ListItem 
                        key={item.id}
                        sx={{ 
                          bgcolor: 'background.paper',
                          mb: 1,
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => handleBatchNavigate(item.batchId)}
                      >
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: getSeverityColor(item.severity) + '.main', width: 32, height: 32 }}>
                            {item.severity === 'EXPIRED' ? 'E' : item.daysUntilExpiry || 'C'}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={item.productName}
                          secondary={
                            <>
                              <Typography component="span" variant="caption" display="block">
                                Batch: {item.batchNumber} | Qty: {item.quantity}
                              </Typography>
                              <Typography component="span" variant="caption" color="text.secondary">
                                {item.severity === 'EXPIRED' ? 
                                  `Expired ${Math.abs(item.daysUntilExpiry)} days ago` : 
                                  `Expires in ${item.daysUntilExpiry} days`}
                              </Typography>
                            </>
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
                    ))
                  ) : (
                    <Alert severity="success">
                      No critical items requiring immediate action
                    </Alert>
                  )}
                </List>
                {summaryData?.criticalItems?.length > 5 && (
                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => handleNavigate('/expiry-monitoring')}
                    endIcon={<ArrowIcon />}
                  >
                    View All {summaryData.criticalItems.length} Items
                  </Button>
                )}
              </Box>
            </Grid>

            {/* Right Side: Financial Impact and Actions */}
            <Grid item xs={12} md={6}>
              {/* Financial Impact */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                  <MoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
                  Financial Impact
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'error.lighter', 
                        borderRadius: 1,
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="h5" color="error.dark">
                        ${(summaryData?.financialImpact?.expiredValue || summaryData?.expiredValue || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Expired Value
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'warning.lighter', 
                        borderRadius: 1,
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="h5" color="warning.dark">
                        ${(summaryData?.financialImpact?.valueAtRisk || summaryData?.totalValueAtRisk || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Value at Risk
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Alert Status - Only show pending count */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Alert Status
                </Typography>
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'background.default', 
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Badge badgeContent={summaryData?.pendingAlertsCount || 0} color="error" max={999}>
                    <PendingIcon sx={{ fontSize: 30 }} />
                  </Badge>
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    Pending Alerts
                  </Typography>
                </Box>
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
                      onClick={() => handleNavigate('/expiry-monitoring')}
                    >
                      Run Check
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="warning"
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
                      onClick={() => handleNavigate('/expiry-config')}
                    >
                      Settings
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => handleNavigate('/expiry-calendar')}
                    >
                      Calendar
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default CriticalAlertsWidget;