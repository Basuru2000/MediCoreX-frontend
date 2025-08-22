import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  Warning,
  CheckCircle,
  Lightbulb,
  Assessment
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const PredictiveAnalysis = ({ predictions }) => {
  if (!predictions) {
    return (
      <Alert severity="info">
        No prediction data available
      </Alert>
    );
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const formatPredictionData = () => {
    return predictions.predictions?.map(point => ({
      date: new Date(point.date).toLocaleDateString(),
      predicted: point.predictedExpiry,
      lowerBound: point.lowerBound,
      upperBound: point.upperBound,
      confidence: point.confidence
    })) || [];
  };

  return (
    <Grid container spacing={3}>
      {/* Prediction Chart */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            30-Day Expiry Prediction
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={formatPredictionData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="#ffcccc"
                fill="#ffeeee"
                strokeWidth={0}
                name="Upper Bound"
              />
              <Area
                type="monotone"
                dataKey="lowerBound"
                stroke="#ccffcc"
                fill="#eeffee"
                strokeWidth={0}
                name="Lower Bound"
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#2196f3"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Predicted"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Risk Assessment */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Warning />
            <Typography variant="h6">
              Risk Assessment
            </Typography>
          </Box>
          
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Risk Level
            </Typography>
            <Chip
              label={predictions.riskAssessment?.riskLevel}
              color={getRiskColor(predictions.riskAssessment?.riskLevel)}
              size="large"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          <Box mb={3}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Estimated Loss
            </Typography>
            <Typography variant="h4" color="error">
              ${predictions.riskAssessment?.estimatedLoss?.toLocaleString()}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            High Risk Categories
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {predictions.riskAssessment?.highRiskCategories?.map((category, index) => (
              <Chip
                key={index}
                label={category}
                variant="outlined"
                color="error"
                size="small"
              />
            ))}
          </Box>
        </Paper>
      </Grid>

      {/* Model Confidence */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Assessment />
            <Typography variant="h6">
              Prediction Confidence
            </Typography>
          </Box>

          <Box mb={3}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Overall Confidence
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <LinearProgress
                variant="determinate"
                value={predictions.overallConfidence}
                sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
              />
              <Typography variant="h6">
                {predictions.overallConfidence?.toFixed(0)}%
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Algorithm
                  </Typography>
                  <Typography variant="subtitle1">
                    {predictions.algorithm}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Data Points
                  </Typography>
                  <Typography variant="subtitle1">
                    {predictions.dataPointsUsed}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Historical Accuracy
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinearProgress
                      variant="determinate"
                      value={predictions.historicalAccuracy}
                      sx={{ flexGrow: 1 }}
                      color="success"
                    />
                    <Typography>
                      {predictions.historicalAccuracy?.toFixed(1)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Recommendations */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Lightbulb color="primary" />
            <Typography variant="h6">
              Recommendations
            </Typography>
          </Box>
          <List>
            {predictions.riskAssessment?.recommendations?.map((recommendation, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText primary={recommendation} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default PredictiveAnalysis;