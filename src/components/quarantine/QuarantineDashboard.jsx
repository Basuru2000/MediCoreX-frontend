import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Alert,
  Button,
  Chip,
  Snackbar  // ✅ ADD THIS IMPORT
} from '@mui/material';
import {
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  Delete as DeleteIcon,
  AssignmentReturn as ReturnIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  getQuarantineSummary, 
  triggerAutoQuarantine 
} from '../../services/api';
import QuarantineList from './QuarantineList';
import QuarantineActions from './QuarantineActions';
import QuarantineReport from './QuarantineReport';

const QuarantineDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // ✅ ADD THESE NEW STATE VARIABLES
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadSummary();
  }, [refreshTrigger]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const response = await getQuarantineSummary();
      setSummary(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load quarantine summary');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // ✅ UPDATE handleAutoQuarantine function
  const handleAutoQuarantine = async () => {
    try {
      const response = await triggerAutoQuarantine();
      
      // Show success message
      setSnackbar({
        open: true,
        message: response.data?.message || 'Auto-quarantine process completed successfully!',
        severity: 'success'
      });
      
      handleRefresh();
    } catch (err) {
      // Show error message
      setSnackbar({
        open: true,
        message: 'Failed to trigger auto-quarantine: ' + (err.response?.data?.message || err.message),
        severity: 'error'
      });
    }
  };
  
  // ✅ ADD THIS: Close snackbar handler
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const SummaryCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {value || 0}
            </Typography>
          </Box>
          <Box sx={{ color: color || 'text.secondary' }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Quarantine Management</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleAutoQuarantine}
          >
            Auto-Quarantine Expired
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title="Pending Review"
              value={summary.pendingReview}
              icon={<WarningIcon fontSize="large" />}
              color="warning.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title="Under Review"
              value={summary.underReview}
              icon={<AssignmentIcon fontSize="large" />}
              color="info.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title="Awaiting Disposal"
              value={summary.awaitingDisposal}
              icon={<DeleteIcon fontSize="large" />}
              color="error.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title="Total Items"
              value={summary.totalItems}
              icon={<AssessmentIcon fontSize="large" />}
              color="primary.main"
            />
          </Grid>
        </Grid>
      )}

      {/* Additional Summary Info */}
      {summary && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                Total Quarantined Quantity
              </Typography>
              <Typography variant="h6">
                {summary.totalQuantity?.toLocaleString() || 0} units
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                Estimated Loss
              </Typography>
              <Typography variant="h6" color="error.main">
                ${summary.totalEstimatedLoss?.toFixed(2) || '0.00'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                Completion Rate
              </Typography>
              <Typography variant="h6" color="success.main">
                {summary.totalItems > 0 
                  ? ((summary.disposed + summary.returned) / summary.totalItems * 100).toFixed(1) 
                  : 0}%
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="All Records" />
          <Tab label="Pending Review" />
          <Tab label="Actions Required" />
          <Tab label="Reports" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {tabValue === 0 && (
          <QuarantineList 
            status={null} 
            onRefresh={handleRefresh}
          />
        )}
        {tabValue === 1 && (
          <QuarantineList 
            status="PENDING_REVIEW" 
            onRefresh={handleRefresh}
          />
        )}
        {tabValue === 2 && (
          <QuarantineActions 
            onRefresh={handleRefresh}
          />
        )}
        {tabValue === 3 && (
          <QuarantineReport />
        )}
      </Box>

      {/* ✅ ADD THIS AT THE END before closing </Box> */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QuarantineDashboard;