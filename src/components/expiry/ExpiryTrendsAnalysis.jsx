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
  TextField
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
  Category
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TrendChart from './TrendChart';
import TrendMetrics from './TrendMetrics';
import PredictiveAnalysis from './PredictiveAnalysis';
import TrendExportDialog from './TrendExportDialog';
import {
  getExpiryTrendAnalysis,
  getExpiryTrendMetrics,
  getExpiryPredictions,
  exportExpiryTrendReport
} from '../../services/api';

const ExpiryTrendsAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [trendData, setTrendData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Date range states
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [granularity, setGranularity] = useState('DAILY');
  
  // Export dialog
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, granularity]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Format dates for API
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      // Fetch all data in parallel
      const [analysisResponse, metricsResponse, predictionsResponse] = await Promise.all([
        getExpiryTrendAnalysis(formattedStartDate, formattedEndDate, granularity),
        getExpiryTrendMetrics(),
        getExpiryPredictions(30)
      ]);

      setTrendData(analysisResponse.data);
      setMetrics(metricsResponse.data);
      setPredictions(predictionsResponse.data);
    } catch (err) {
      console.error('Error fetching trend data:', err);
      setError('Failed to load trend analysis data');
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
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expiry_trends_${formattedStartDate}_to_${formattedEndDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setExportDialogOpen(false);
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export trend report');
    }
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'IMPROVING':
        return <TrendingDown color="success" />;
      case 'WORSENING':
        return <TrendingUp color="error" />;
      default:
        return <ShowChart color="action" />;
    }
  };

  const getSeverityColor = (severity) => {
    if (severity > 70) return 'error';
    if (severity > 40) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={handleRefresh}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Assessment color="primary" fontSize="large" />
            <Typography variant="h5">
              Expiry Trends Analysis
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} disabled={refreshing}>
                <Refresh className={refreshing ? 'rotating' : ''} />
              </IconButton>
            </Tooltip>
            <Button
              startIcon={<Download />}
              variant="outlined"
              onClick={() => setExportDialogOpen(true)}
            >
              Export
            </Button>
          </Box>
        </Box>

        {/* Date Range Controls */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Granularity</InputLabel>
                <Select
                  value={granularity}
                  label="Granularity"
                  onChange={(e) => setGranularity(e.target.value)}
                >
                  <MenuItem value="DAILY">Daily</MenuItem>
                  <MenuItem value="WEEKLY">Weekly</MenuItem>
                  <MenuItem value="MONTHLY">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box display="flex" gap={1}>
                <Button
                  variant="text"
                  onClick={() => {
                    setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
                    setEndDate(new Date());
                  }}
                >
                  Last 7 Days
                </Button>
                <Button
                  variant="text"
                  onClick={() => {
                    setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
                    setEndDate(new Date());
                  }}
                >
                  Last 30 Days
                </Button>
              </Box>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Paper>

      {/* Current Metrics Summary */}
      {metrics && <TrendMetrics metrics={metrics} />}

      {/* Tabs for Different Views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab icon={<Timeline />} label="Trend Analysis" />
          <Tab icon={<ShowChart />} label="Predictive Analysis" />
          <Tab icon={<Category />} label="Category Breakdown" />
          <Tab icon={<Info />} label="Insights" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ mt: 3 }}>
        {tabValue === 0 && trendData && (
          <Grid container spacing={3}>
            {/* Main Trend Chart */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Expiry Trend Over Time
                </Typography>
                <TrendChart data={trendData.trendData} />
              </Paper>
            </Grid>

            {/* Summary Statistics */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Period Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Expired
                    </Typography>
                    <Typography variant="h4">
                      {trendData.summary.totalExpired}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Expiring
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {trendData.summary.totalExpiring}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Value Lost
                    </Typography>
                    <Typography variant="h5" color="error">
                      ${trendData.summary.totalValueLost?.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Value at Risk
                    </Typography>
                    <Typography variant="h5" color="warning.main">
                      ${trendData.summary.totalValueAtRisk?.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Trend Direction */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Overall Trend
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  {getTrendIcon(trendData.summary.overallTrend)}
                  <Typography variant="h5">
                    {trendData.summary.overallTrend}
                  </Typography>
                  <Chip
                    label={`${trendData.summary.trendStrength}% Strength`}
                    color={getSeverityColor(trendData.summary.trendStrength)}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Average Daily Expiry Rate: {trendData.summary.averageExpiryRate?.toFixed(1)} items
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {tabValue === 1 && predictions && (
          <PredictiveAnalysis predictions={predictions} />
        )}

        {tabValue === 2 && trendData && (
          <Grid container spacing={3}>
            {Object.entries(trendData.categoryAnalysis || {}).map(([category, analysis]) => (
              <Grid item xs={12} md={6} key={category}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {category}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Expiry Count
                        </Typography>
                        <Typography variant="h5">
                          {analysis.expiryCount}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Value
                        </Typography>
                        <Typography variant="h5">
                          ${analysis.value?.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          % of Total: {analysis.percentageOfTotal?.toFixed(1)}%
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          {getTrendIcon(analysis.trend)}
                          <Typography variant="body2">
                            {analysis.trend}
                          </Typography>
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
            {trendData.insights?.map((insight, index) => (
              <Grid item xs={12} key={index}>
                <Alert
                  severity={insight.type.toLowerCase()}
                  icon={
                    insight.type === 'WARNING' ? <Warning /> :
                    insight.type === 'SUCCESS' ? <CheckCircle /> :
                    <Info />
                  }
                >
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {insight.title}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {insight.description}
                  </Typography>
                  <Typography variant="body2" fontStyle="italic">
                    Recommendation: {insight.recommendation}
                  </Typography>
                  <Box mt={1}>
                    <Chip
                      size="small"
                      label={`Severity: ${insight.severity?.toFixed(0)}%`}
                      color={getSeverityColor(insight.severity)}
                    />
                  </Box>
                </Alert>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Export Dialog */}
      <TrendExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExport}
        startDate={startDate}
        endDate={endDate}
      />
    </Box>
  );
};

export default ExpiryTrendsAnalysis;