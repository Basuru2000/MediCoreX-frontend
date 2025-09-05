import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  useTheme,
  alpha,
  Stack,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Remove,
  ErrorOutline,
  Warning,
  CheckCircle,
  AttachMoney,
  Schedule,
  Info
} from '@mui/icons-material';

const TrendMetrics = ({ metrics }) => {
  const theme = useTheme();

  // Early return if no metrics
  if (!metrics) {
    return null;
  }

  const getTrendIcon = (trend, percentage) => {
    // Defensive check for undefined values
    if (!trend || percentage === undefined || percentage === null) {
      return <Remove sx={{ color: theme.palette.grey[500] }} />;
    }

    const absPercentage = Math.abs(Number(percentage) || 0);
    const color = trend === 'IMPROVING' 
      ? theme.palette.success.main 
      : trend === 'WORSENING' 
      ? theme.palette.error.main 
      : theme.palette.warning.main;

    const Icon = trend === 'IMPROVING' ? TrendingDown : 
                 trend === 'WORSENING' ? TrendingUp : 
                 Remove;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Icon sx={{ color, fontSize: 20 }} />
        <Typography 
          variant="body2" 
          sx={{ 
            color,
            fontWeight: 600 
          }}
        >
          {absPercentage.toFixed(1)}%
        </Typography>
      </Box>
    );
  };

  const getStatusColor = (status) => {
    // Always return a valid palette object
    if (!status) {
      return theme.palette.info; // Default safe color
    }
    
    switch (status.toUpperCase()) {
      case 'CRITICAL':
        return theme.palette.error;
      case 'WARNING':
        return theme.palette.warning;
      case 'STABLE':
        return theme.palette.info;
      case 'GOOD':
        return theme.palette.success;
      default:
        return theme.palette.info; // Safe fallback
    }
  };

  const formatValue = (value, type = 'number') => {
    // Handle null/undefined safely
    if (value === null || value === undefined) return '0';
    
    const numValue = Number(value) || 0;
    
    if (type === 'currency') {
      return `$${numValue.toLocaleString()}`;
    }
    if (type === 'percentage') {
      return `${numValue.toFixed(1)}%`;
    }
    return numValue.toLocaleString();
  };

  // Map API fields to display values - FIXED to match actual API response structure
  const metricsCards = [
    {
      title: 'Current Expired',
      // Check multiple possible field names from API
      value: metrics.currentExpiredCount || metrics.currentExpired || metrics.expiredCount || 
             metrics.expired || metrics.totalExpired || 0,
      icon: <ErrorOutline />,
      color: theme.palette.error,
      trend: metrics.expiredTrend || metrics.trend,
      percentage: metrics.expiredChangePercentage || metrics.expiredChange,
      subtitle: 'Items past expiry date'
    },
    {
      title: 'Expiring This Week',
      // Check multiple possible field names from API
      value: metrics.expiringWeekCount || metrics.expiringThisWeek || metrics.weekCount ||
             metrics.expiring7Days || metrics.expiringWeek || 0,
      icon: <Warning />,
      color: theme.palette.warning,
      trend: metrics.weeklyTrend || metrics.weekTrend,
      percentage: metrics.weeklyChangePercentage || metrics.weeklyChange,
      subtitle: 'Require immediate attention'
    },
    {
      title: 'Expiring This Month',
      // Check multiple possible field names from API
      value: metrics.expiringMonthCount || metrics.expiringThisMonth || metrics.monthCount ||
             metrics.expiring30Days || metrics.expiringMonth || 0,
      icon: <Schedule />,
      color: theme.palette.info,
      trend: metrics.monthlyTrend || metrics.monthTrend,
      percentage: metrics.monthlyChangePercentage || metrics.monthlyChange,
      subtitle: 'Planning required'
    },
    {
      title: 'Financial Impact',
      // Check multiple possible field names from API
      value: metrics.totalValueAtRisk || metrics.valueAtRisk || metrics.financialImpact ||
             metrics.totalValue || metrics.expiredValue || 0,
      icon: <AttachMoney />,
      color: theme.palette.primary,
      type: 'currency',
      trend: metrics.financialTrend || metrics.valueTrend,
      percentage: metrics.financialChangePercentage || metrics.financialChange,
      subtitle: 'Total value at risk'
    }
  ];

  return (
    <Grid container spacing={3}>
      {metricsCards.map((metric, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
                borderColor: metric.color ? alpha(metric.color.main || metric.color, 0.3) : theme.palette.divider
              }
            }}
          >
            {/* Top accent line */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: metric.color ? 
                  `linear-gradient(90deg, ${metric.color.main || metric.color}, ${alpha(metric.color.main || metric.color, 0.3)})` :
                  theme.palette.primary.main
              }}
            />
            
            <CardContent sx={{ p: 3, pt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: metric.color ? alpha(metric.color.main || metric.color, 0.1) : alpha(theme.palette.primary.main, 0.1)
                  }}
                >
                  {React.cloneElement(metric.icon, {
                    sx: { color: metric.color?.main || metric.color || theme.palette.primary.main, fontSize: 24 }
                  })}
                </Box>
                {metric.trend && metric.percentage !== undefined && metric.percentage !== null && (
                  <Tooltip title={`${metric.trend} trend`}>
                    <Box>
                      {getTrendIcon(metric.trend, metric.percentage)}
                    </Box>
                  </Tooltip>
                )}
              </Box>
              
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 0.5
                }}
              >
                {formatValue(metric.value, metric.type)}
              </Typography>
              
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  mb: 1
                }}
              >
                {metric.title}
              </Typography>
              
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.disabled,
                  fontSize: '0.75rem'
                }}
              >
                {metric.subtitle}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Overall Status Card */}
      <Grid item xs={12}>
        <Card
          elevation={0}
          sx={{
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            background: !metrics.overallStatus ? theme.palette.background.paper :
              metrics.overallStatus === 'CRITICAL' ? alpha(theme.palette.error.main, 0.02) :
              metrics.overallStatus === 'WARNING' ? alpha(theme.palette.warning.main, 0.02) :
              alpha(theme.palette.success.main, 0.02)
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(
                    getStatusColor(metrics.overallStatus).main || theme.palette.info.main, 
                    0.1
                  )
                }}
              >
                {metrics.overallStatus === 'CRITICAL' ? (
                  <ErrorOutline sx={{ fontSize: 28, color: theme.palette.error.main }} />
                ) : metrics.overallStatus === 'WARNING' ? (
                  <Warning sx={{ fontSize: 28, color: theme.palette.warning.main }} />
                ) : (
                  <CheckCircle sx={{ fontSize: 28, color: theme.palette.success.main }} />
                )}
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="h6" fontWeight={600}>
                    Overall Status
                  </Typography>
                  <Chip
                    label={metrics.overallStatus || 'STABLE'}
                    size="small"
                    sx={{
                      bgcolor: alpha(
                        getStatusColor(metrics.overallStatus).main || theme.palette.info.main,
                        0.1
                      ),
                      color: getStatusColor(metrics.overallStatus).main || theme.palette.info.main,
                      fontWeight: 600,
                      borderRadius: '8px'
                    }}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {metrics.statusMessage || 'System is operating within normal parameters'}
                </Typography>
              </Box>

              {metrics.recommendations && Array.isArray(metrics.recommendations) && metrics.recommendations.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Info sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {metrics.recommendations.length} recommendations available
                  </Typography>
                </Box>
              )}
            </Stack>

            {/* Progress indicator if available */}
            {metrics.complianceScore !== undefined && metrics.complianceScore !== null && (
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Expiry Management Score
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {Number(metrics.complianceScore) || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Number(metrics.complianceScore) || 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: 
                        (Number(metrics.complianceScore) || 0) >= 80 ? theme.palette.success.main :
                        (Number(metrics.complianceScore) || 0) >= 60 ? theme.palette.warning.main :
                        theme.palette.error.main
                    }
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TrendMetrics;