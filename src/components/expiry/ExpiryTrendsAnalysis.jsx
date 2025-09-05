import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  useTheme,
  alpha,
  Fade,
  Skeleton
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShowChart,
  Assessment,
  Download,
  Refresh,
  Info,
  Warning,
  CheckCircle,
  Timeline,
  DateRange,
  Category,
  ArrowUpward,
  ArrowDownward,
  Remove
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TrendChart from './TrendChart';
import TrendMetrics from './TrendMetrics';
import PredictiveAnalysis from './PredictiveAnalysis';
import {
  getExpiryTrendAnalysis,
  getExpiryTrendMetrics,
  getExpiryPredictions,
  exportExpiryTrendReport
} from '../../services/api';

const ExpiryTrendsAnalysis = ({ compact = false }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [trendData, setTrendData] = useState({});
  const [metrics, setMetrics] = useState({});
  const [predictions, setPredictions] = useState({});
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showOptionalData, setShowOptionalData] = useState(false); // State for chart toggle
  
  // Date range states
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [granularity, setGranularity] = useState('DAILY');

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, granularity]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      // Use Promise.allSettled for better error handling
      const results = await Promise.allSettled([
        getExpiryTrendAnalysis(formattedStartDate, formattedEndDate, granularity),
        getExpiryTrendMetrics(),
        getExpiryPredictions(30)
      ]);

      // Handle each response individually
      if (results[0].status === 'fulfilled') {
        setTrendData(results[0].value?.data || {});
      } else {
        console.error('Failed to fetch trend analysis:', results[0].reason);
        setTrendData({});
      }

      if (results[1].status === 'fulfilled') {
        setMetrics(results[1].value?.data || {});
      } else {
        console.error('Failed to fetch metrics:', results[1].reason);
        setMetrics({});
      }

      if (results[2].status === 'fulfilled') {
        setPredictions(results[2].value?.data || {});
      } else {
        console.error('Failed to fetch predictions:', results[2].reason);
        setPredictions({});
      }

    } catch (err) {
      console.error('Error fetching trend data:', err);
      setError('Failed to load trend analysis data');
      // Set default empty objects to prevent crashes
      setTrendData({});
      setMetrics({});
      setPredictions({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleExport = async () => {
    try {
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      const response = await exportExpiryTrendReport(formattedStartDate, formattedEndDate);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expiry_trends_${formattedStartDate}_to_${formattedEndDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Error exporting report:', err);
    }
  };

  const getTrendIcon = (trend) => {
    if (!trend) return <Remove sx={{ color: theme.palette.grey[500] }} />;
    
    const trendUpper = String(trend).toUpperCase();
    switch(trendUpper) {
      case 'IMPROVING':
        return <TrendingDown sx={{ color: theme.palette.success.main }} />;
      case 'WORSENING':
        return <TrendingUp sx={{ color: theme.palette.error.main }} />;
      default:
        return <Remove sx={{ color: theme.palette.warning.main }} />;
    }
  };

  const getSeverityColor = (value) => {
    const numValue = Number(value) || 0;
    if (numValue >= 75) return 'error';
    if (numValue >= 50) return 'warning';
    if (numValue >= 25) return 'info';
    return 'success';
  };

  if (loading && !trendData) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: '12px' }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '12px' }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '12px' }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: '12px' }} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '12px' }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%' }}>
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              boxShadow: 'none',
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
            }}
          >
            {error}
          </Alert>
        )}

        {/* Header Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            background: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.8)
              : theme.palette.background.paper
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Timeline sx={{ color: theme.palette.primary.main }} />
                Expiry Trends Analysis
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  mt: 0.5
                }}
              >
                Monitor and predict product expiry patterns
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Tooltip title="Refresh data">
                <IconButton 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '10px',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderColor: theme.palette.primary.main
                    }
                  }}
                >
                  {refreshing ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Refresh />
                  )}
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExport}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2.5,
                  borderColor: theme.palette.divider,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                Export Report
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Date Range Controls */}
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        }
                      }
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        }
                      }
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Granularity</InputLabel>
                <Select
                  value={granularity}
                  label="Granularity"
                  onChange={(e) => setGranularity(e.target.value)}
                  sx={{
                    borderRadius: '10px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    }
                  }}
                >
                  <MenuItem value="DAILY">Daily</MenuItem>
                  <MenuItem value="WEEKLY">Weekly</MenuItem>
                  <MenuItem value="MONTHLY">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
                    setEndDate(new Date());
                  }}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    borderColor: theme.palette.divider,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  7 Days
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
                    setEndDate(new Date());
                  }}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    borderColor: theme.palette.divider,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  30 Days
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setStartDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
                    setEndDate(new Date());
                  }}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    borderColor: theme.palette.divider,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  90 Days
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Current Metrics Summary - Fixed to pass correct data */}
        {metrics && !compact && (
          <Fade in={true} timeout={600}>
            <Box sx={{ mb: 3 }}>
              <TrendMetrics metrics={metrics} />
            </Box>
          </Fade>
        )}

        {/* Tabs for Different Views */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={(e, v) => setTabValue(v)}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              '& .MuiTab-root': {
                minHeight: 56,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
                '&.Mui-selected': {
                  color: theme.palette.primary.main
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab icon={<Timeline />} iconPosition="start" label="Trend Analysis" />
            <Tab icon={<ShowChart />} iconPosition="start" label="Predictive Analysis" />
            <Tab icon={<Category />} iconPosition="start" label="Category Breakdown" />
            <Tab icon={<Info />} iconPosition="start" label="Insights" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Fade in={true} timeout={800}>
          <Box>
            {tabValue === 0 && trendData && (
              <Grid container spacing={3}>
                {/* Main Trend Chart - Pass toggle props */}
                <Grid item xs={12}>
                  <TrendChart 
                    data={trendData.trendData || []} 
                    showOptionalData={showOptionalData}
                    onToggleOptional={setShowOptionalData}
                  />
                </Grid>

                {/* Summary Cards */}
                <Grid item xs={12} md={6}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: '12px',
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          mb: 3,
                          color: theme.palette.text.primary
                        }}
                      >
                        Period Summary
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={6}>
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: theme.palette.text.secondary,
                                mb: 0.5
                              }}
                            >
                              Total Expired
                            </Typography>
                            <Typography 
                              variant="h4" 
                              sx={{ 
                                fontWeight: 700,
                                color: theme.palette.error.main
                              }}
                            >
                              {trendData.summary?.totalExpired || 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: theme.palette.text.secondary,
                                mb: 0.5
                              }}
                            >
                              Total Expiring
                            </Typography>
                            <Typography 
                              variant="h4" 
                              sx={{ 
                                fontWeight: 700,
                                color: theme.palette.warning.main
                              }}
                            >
                              {trendData.summary?.totalExpiring || 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: theme.palette.text.secondary,
                                mb: 0.5
                              }}
                            >
                              Value Lost
                            </Typography>
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                fontWeight: 600,
                                color: theme.palette.error.dark
                              }}
                            >
                              ${(Number(trendData.summary?.totalValueLost) || 0).toLocaleString()}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: theme.palette.text.secondary,
                                mb: 0.5
                              }}
                            >
                              Value at Risk
                            </Typography>
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                fontWeight: 600,
                                color: theme.palette.warning.dark
                              }}
                            >
                              ${(Number(trendData.summary?.totalValueAtRisk) || 0).toLocaleString()}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Trend Direction Card */}
                <Grid item xs={12} md={6}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: '12px',
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          mb: 3,
                          color: theme.palette.text.primary
                        }}
                      >
                        Overall Trend
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        {getTrendIcon(trendData.summary?.overallTrend)}
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 600,
                            color: theme.palette.text.primary
                          }}
                        >
                          {trendData.summary?.overallTrend || 'STABLE'}
                        </Typography>
                        <Chip
                          label={`${Math.abs(Number(trendData.summary?.trendStrength) || 0).toFixed(1)}% Strength`}
                          size="small"
                          color={getSeverityColor(Math.abs(Number(trendData.summary?.trendStrength) || 0))}
                          sx={{
                            fontWeight: 500,
                            borderRadius: '8px'
                          }}
                        />
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Average Daily Expiry Rate
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {Number(trendData.summary?.averageExpiryRate || 0).toFixed(1)} items
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Peak Expiry Period
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {trendData.summary?.peakPeriod || 'N/A'}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {tabValue === 1 && predictions && (
              <PredictiveAnalysis predictions={predictions} />
            )}

            {tabValue === 2 && trendData && (
              <Grid container spacing={3}>
                {Object.entries(trendData.categoryAnalysis || {}).map(([category, analysis]) => (
                  <Grid item xs={12} md={6} lg={4} key={category}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        borderRadius: '12px',
                        border: `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: theme.shadows[4]
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            mb: 3,
                            color: theme.palette.text.primary
                          }}
                        >
                          {category}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Expiry Count
                              </Typography>
                              <Typography variant="h5" fontWeight={600}>
                                {analysis?.expiryCount || 0}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Value
                              </Typography>
                              <Typography variant="h5" fontWeight={600}>
                                ${(Number(analysis?.value) || 0).toLocaleString()}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box 
                              sx={{ 
                                p: 1.5,
                                borderRadius: '8px',
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                mt: 1
                              }}
                            >
                              <Typography variant="body2" color="text.secondary">
                                {Number(analysis?.percentageOfTotal || 0).toFixed(1)}% of Total
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                {getTrendIcon(analysis?.trend)}
                                <Typography variant="body2" fontWeight={500}>
                                  {analysis?.trend || 'STABLE'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {tabValue === 3 && trendData && (
              <Grid container spacing={3}>
                {Array.isArray(trendData.insights) && trendData.insights.length > 0 ? (
                  trendData.insights.map((insight, index) => (
                    <Grid item xs={12} key={index}>
                      <Alert
                        severity={insight?.type?.toLowerCase() || 'info'}
                        icon={
                          insight?.type === 'WARNING' ? <Warning /> :
                          insight?.type === 'SUCCESS' ? <CheckCircle /> :
                          <Info />
                        }
                        sx={{
                          borderRadius: '12px',
                          border: `1px solid ${
                            insight?.type === 'WARNING' ? alpha(theme.palette.warning.main, 0.2) :
                            insight?.type === 'SUCCESS' ? alpha(theme.palette.success.main, 0.2) :
                            alpha(theme.palette.info.main, 0.2)
                          }`,
                          '& .MuiAlert-icon': {
                            fontSize: 24
                          }
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            {insight?.title || 'Insight'}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {insight?.description || ''}
                          </Typography>
                          {insight?.recommendation && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontStyle: 'italic',
                                color: theme.palette.text.secondary
                              }}
                            >
                              Recommendation: {insight.recommendation}
                            </Typography>
                          )}
                        </Box>
                      </Alert>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ borderRadius: '12px' }}>
                      No insights available for the selected period.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        </Fade>
      </Box>
    </LocalizationProvider>
  );
};

export default ExpiryTrendsAnalysis;