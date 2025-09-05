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
  CardContent,
  Stack,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  Warning,
  CheckCircle,
  Lightbulb,
  Assessment,
  PriorityHigh,
  Info,
  AutoGraph,
  Speed,
  Category,
  ErrorOutline
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
  AreaChart,
  ReferenceLine
} from 'recharts';

const PredictiveAnalysis = ({ predictions }) => {
  const theme = useTheme();

  // Early return if no predictions data
  if (!predictions || typeof predictions !== 'object') {
    return (
      <Alert 
        severity="info"
        sx={{
          borderRadius: '12px',
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
        }}
      >
        <Typography variant="body1">
          No prediction data available. Predictions require at least 7 days of historical data.
        </Typography>
      </Alert>
    );
  }

  const getRiskColor = (level) => {
    if (!level) return theme.palette.info;
    
    const levelUpper = String(level).toUpperCase();
    switch (levelUpper) {
      case 'CRITICAL':
      case 'HIGH':
        return theme.palette.error;
      case 'MEDIUM':
        return theme.palette.warning;
      case 'LOW':
        return theme.palette.success;
      default:
        return theme.palette.info;
    }
  };

  const getConfidenceColor = (confidence) => {
    const numConfidence = Number(confidence) || 0;
    if (numConfidence >= 80) return theme.palette.success;
    if (numConfidence >= 60) return theme.palette.info;
    if (numConfidence >= 40) return theme.palette.warning;
    return theme.palette.error;
  };

  const formatPredictionData = () => {
    if (!predictions?.predictions || !Array.isArray(predictions.predictions)) {
      return [];
    }
    
    return predictions.predictions.map(point => {
      if (!point) return null;
      return {
        date: point.date ? new Date(point.date).toLocaleDateString() : 'N/A',
        predicted: Number(point.predictedExpiry) || 0,
        lowerBound: Number(point.lowerBound) || 0,
        upperBound: Number(point.upperBound) || 0,
        confidence: Number(point.confidence) || 0
      };
    }).filter(item => item !== null);
  };

  // Custom tooltip for the prediction chart with null safety
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && Array.isArray(payload) && payload.length > 0) {
      return (
        <Box
          sx={{
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            p: 2,
            boxShadow: theme.shadows[4]
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {label || 'N/A'}
          </Typography>
          {payload.map((entry, index) => {
            if (!entry) return null;
            return (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '2px',
                    bgcolor: entry.color || theme.palette.primary.main
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {entry.name || 'Unknown'}:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {entry.value !== undefined && entry.value !== null ? entry.value : 0}
                  {entry.dataKey === 'confidence' ? '%' : ''}
                </Typography>
              </Box>
            );
          })}
        </Box>
      );
    }
    return null;
  };

  const predictionData = formatPredictionData();

  return (
    <Grid container spacing={3}>
      {/* Prediction Overview Cards */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }}
                  >
                    <AutoGraph sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {predictions.algorithm || 'Moving Average'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Prediction Algorithm
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(
                        getConfidenceColor(predictions.overallConfidence).main, 
                        0.1
                      )
                    }}
                  >
                    <Speed sx={{ 
                      color: getConfidenceColor(predictions.overallConfidence).main, 
                      fontSize: 24 
                    }} />
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {Number(predictions.overallConfidence || 0).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overall Confidence
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette.info.main, 0.1)
                    }}
                  >
                    <Assessment sx={{ color: theme.palette.info.main, fontSize: 24 }} />
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {Number(predictions.historicalAccuracy || 0).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Historical Accuracy
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette.success.main, 0.1)
                    }}
                  >
                    <Timeline sx={{ color: theme.palette.success.main, fontSize: 24 }} />
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {predictions.dataPointsUsed || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Data Points Used
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Prediction Chart */}
      {predictionData.length > 0 && (
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              30-Day Expiry Prediction
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={predictionData}>
                <defs>
                  <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.info.light} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={theme.palette.info.light} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={alpha(theme.palette.divider, 0.5)}
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70}
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  tickLine={{ stroke: theme.palette.divider }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  tickLine={{ stroke: theme.palette.divider }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '14px'
                  }}
                  iconType="rect"
                />
                {predictionData[0]?.date && (
                  <ReferenceLine 
                    x={predictionData[0].date} 
                    stroke={theme.palette.divider}
                    strokeDasharray="3 3"
                    label={{ value: "Today", position: "top" }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fill={alpha(theme.palette.warning.light, 0.2)}
                  name="Upper Bound"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="none"
                  fill={alpha(theme.palette.success.light, 0.2)}
                  name="Lower Bound"
                  stackId="2"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  name="Predicted"
                  dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      )}

      {/* Risk Assessment and Recommendations Side by Side */}
      <Grid item xs={12} md={6}>
        <Card
          elevation={0}
          sx={{
            height: '100%',
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Risk Assessment
            </Typography>
            
            <Stack spacing={3}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Risk Level
                  </Typography>
                  <Chip
                    label={predictions.riskAssessment?.level || 'MEDIUM'}
                    size="small"
                    sx={{
                      bgcolor: alpha(
                        getRiskColor(predictions.riskAssessment?.level || 'MEDIUM').main, 
                        0.1
                      ),
                      color: getRiskColor(predictions.riskAssessment?.level || 'MEDIUM').main,
                      fontWeight: 600,
                      borderRadius: '8px'
                    }}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Number(predictions.riskAssessment?.score) || 50}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.grey[400], 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: getRiskColor(predictions.riskAssessment?.level || 'MEDIUM').main
                    }
                  }}
                />
              </Box>

              <Divider />

              {/* Key Risk Factors */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Key Risk Factors
                </Typography>
                {Array.isArray(predictions.riskAssessment?.factors) && predictions.riskAssessment.factors.length > 0 ? (
                  predictions.riskAssessment.factors.map((factor, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                      <PriorityHigh sx={{ fontSize: 18, color: theme.palette.warning.main, mt: 0.25 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {factor?.name || 'Risk Factor'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {factor?.description || ''}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No specific risk factors identified
                  </Typography>
                )}
              </Box>

              <Divider />

              {/* High-Risk Categories - RESTORED */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  High-Risk Categories
                </Typography>
                {Array.isArray(predictions.riskAssessment?.highRiskCategories) || 
                 Array.isArray(predictions.highRiskCategories) ? (
                  (predictions.riskAssessment?.highRiskCategories || predictions.highRiskCategories || []).map((category, index) => (
                    <Box key={index} sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Category sx={{ fontSize: 18, color: theme.palette.error.main }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {category?.name || category || 'Category'}
                        </Typography>
                        {category?.count && (
                          <Chip 
                            label={`${category.count} items`}
                            size="small"
                            sx={{ 
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              color: theme.palette.error.main,
                              fontSize: '0.7rem'
                            }}
                          />
                        )}
                      </Box>
                      {category?.value && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5 }}>
                          Value at risk: ${Number(category.value).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No high-risk categories identified
                  </Typography>
                )}
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Recommendations - MOVED TO RIGHT SIDE */}
      <Grid item xs={12} md={6}>
        <Card
          elevation={0}
          sx={{
            height: '100%',
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Recommendations
            </Typography>
            
            <List sx={{ p: 0 }}>
              {Array.isArray(predictions.recommendations) && predictions.recommendations.length > 0 ? (
                predictions.recommendations.map((recommendation, index) => (
                  <ListItem 
                    key={index}
                    sx={{ 
                      px: 0,
                      py: 1.5,
                      alignItems: 'flex-start',
                      borderBottom: index < predictions.recommendations.length - 1 ? 
                        `1px solid ${theme.palette.divider}` : 'none'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>
                      <Lightbulb sx={{ fontSize: 20, color: theme.palette.warning.main }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {recommendation?.title || 'Recommendation'}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {recommendation?.description || ''}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Info sx={{ fontSize: 48, color: theme.palette.action.disabled, mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No recommendations available at this time
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                    Recommendations will be generated based on prediction confidence and risk assessment
                  </Typography>
                </Box>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PredictiveAnalysis;