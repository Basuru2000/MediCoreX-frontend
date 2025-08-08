import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Download as DownloadIcon } from '@mui/icons-material';
import { getQuarantineSummary } from '../../services/api'; // ✅ Updated import

const QuarantineReport = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const response = await getQuarantineSummary(); // ✅ Updated function call
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to load summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !summary) {
    return <Typography>Loading report...</Typography>;
  }

  const statusData = [
    { name: 'Pending Review', value: summary.pendingReview, color: '#ff9800' },
    { name: 'Under Review', value: summary.underReview, color: '#2196f3' },
    { name: 'Awaiting Disposal', value: summary.awaitingDisposal, color: '#f44336' },
    { name: 'Awaiting Return', value: summary.awaitingReturn, color: '#9c27b0' },
    { name: 'Disposed', value: summary.disposed, color: '#757575' },
    { name: 'Returned', value: summary.returned, color: '#4caf50' }
  ].filter(item => item.value > 0);

  const completionRate = summary.totalItems > 0
    ? ((summary.disposed + summary.returned) / summary.totalItems * 100).toFixed(1)
    : 0;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Quarantine Report</Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => {/* Implement export functionality */}}
        >
          Export Report
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Items in Quarantine
              </Typography>
              <Typography variant="h3">
                {summary.totalItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Estimated Loss
              </Typography>
              <Typography variant="h3" color="error">
                ${summary.totalEstimatedLoss?.toFixed(2) || '0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completion Rate
              </Typography>
              <Typography variant="h3" color="success.main">
                {completionRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Process Flow */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Workflow Progress
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { stage: 'Pending', count: summary.pendingReview },
                  { stage: 'Review', count: summary.underReview },
                  { stage: 'Approved', count: summary.awaitingDisposal + summary.awaitingReturn },
                  { stage: 'Completed', count: summary.disposed + summary.returned }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Summary Statistics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Summary Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Total Quantity Quarantined
                </Typography>
                <Typography variant="h6">
                  {summary.totalQuantity?.toLocaleString() || 0} units
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Items Pending Review
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {summary.pendingReview}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Items Disposed
                </Typography>
                <Typography variant="h6">
                  {summary.disposed}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Items Returned
                </Typography>
                <Typography variant="h6" color="success.main">
                  {summary.returned}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QuarantineReport;
