import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Schedule,
  AttachMoney
} from '@mui/icons-material';

const TrendMetrics = ({ metrics }) => {
  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp color="error" />;
    if (change < 0) return <TrendingDown color="success" />;
    return null;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'error';
    if (change < 0) return 'success';
    return 'default';
  };

  const metricCards = [
    {
      title: 'Current Expired',
      value: metrics?.expiredCount || 0,
      change: metrics?.expiredCountChange,
      changePercent: metrics?.expiredCountChangePercent,
      icon: <Warning color="error" />,
      color: 'error.light'
    },
    {
      title: 'Expiring (7 Days)',
      value: metrics?.expiring7Days || 0,
      subtitle: `30 days: ${metrics?.expiring30Days || 0}`,
      icon: <Schedule color="warning" />,
      color: 'warning.light'
    },
    {
      title: 'Value at Risk',
      value: `$${(metrics?.expiring30DaysValue || 0).toLocaleString()}`,
      change: metrics?.valueAtRiskChange,
      changePercent: metrics?.valueAtRiskChangePercent,
      icon: <AttachMoney color="primary" />,
      color: 'primary.light'
    },
    {
      title: 'Avg Days to Expiry',
      value: metrics?.avgDaysToExpiry?.toFixed(1) || 'N/A',
      subtitle: 'days',
      icon: <CheckCircle color="success" />,
      color: 'success.light'
    }
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {metricCards.map((metric, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            sx={{
              height: '100%',
              background: `linear-gradient(135deg, ${metric.color} 0%, transparent 100%)`,
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'transform 0.3s',
                boxShadow: 4
              }
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {metric.title}
                  </Typography>
                  <Typography variant="h4" sx={{ my: 1 }}>
                    {metric.value}
                  </Typography>
                  {metric.subtitle && (
                    <Typography variant="body2" color="text.secondary">
                      {metric.subtitle}
                    </Typography>
                  )}
                  {metric.change !== undefined && (
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      {getChangeIcon(metric.change)}
                      <Chip
                        size="small"
                        label={`${metric.change > 0 ? '+' : ''}${metric.changePercent?.toFixed(1)}%`}
                        color={getChangeColor(metric.change)}
                      />
                    </Box>
                  )}
                </Box>
                <Box>{metric.icon}</Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default TrendMetrics;