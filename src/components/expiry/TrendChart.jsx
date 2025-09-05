import React from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  useTheme,
  alpha
} from '@mui/material';
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
  Bar,
  BarChart
} from 'recharts';

const TrendChart = ({ data, height = 400, type = 'area', showOptionalData = false, onToggleOptional }) => {
  const theme = useTheme();

  // Defensive check for data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          height: height,
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No trend data available for the selected period
        </Typography>
      </Paper>
    );
  }

  // Custom tooltip component with null safety
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
                </Typography>
              </Box>
            );
          })}
        </Box>
      );
    }
    return null;
  };

  // Format Y-axis tick safely
  const formatYAxisTick = (value) => {
    const numValue = Number(value) || 0;
    if (numValue >= 1000) {
      return `${(numValue / 1000).toFixed(1)}k`;
    }
    return numValue.toString();
  };

  // Safely process data to ensure all values are numbers
  const processedData = data.map(item => ({
    ...item,
    date: item.date || '',
    expiredCount: Number(item.expiredCount) || 0,
    expiringCount: Number(item.expiringCount) || 0,
    safeCount: item.safeCount !== undefined ? Number(item.safeCount) || 0 : undefined,
    // Support additional optional fields from API
    warningCount: item.warningCount !== undefined ? Number(item.warningCount) || 0 : undefined,
    criticalCount: item.criticalCount !== undefined ? Number(item.criticalCount) || 0 : undefined
  }));

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '12px',
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.mode === 'dark'
          ? alpha(theme.palette.background.paper, 0.8)
          : theme.palette.background.paper
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          Expiry Trend Over Time
        </Typography>
        
        {/* Toggle for optional data display */}
        <FormControlLabel
          control={
            <Switch
              checked={showOptionalData}
              onChange={(e) => onToggleOptional && onToggleOptional(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: theme.palette.primary.main,
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: theme.palette.primary.main,
                },
              }}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Show Additional Values
            </Typography>
          }
        />
      </Box>
      
      <ResponsiveContainer width="100%" height={height}>
        {type === 'area' ? (
          <AreaChart
            data={processedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorExpired" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpiring" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.warning.main} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={theme.palette.warning.main} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.info.main} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={theme.palette.info.main} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={alpha(theme.palette.divider, 0.5)}
              vertical={false}
            />
            <XAxis 
              dataKey="date"
              stroke={theme.palette.text.secondary}
              fontSize={12}
              tick={{ fill: theme.palette.text.secondary }}
              tickLine={{ stroke: theme.palette.divider }}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              fontSize={12}
              tick={{ fill: theme.palette.text.secondary }}
              tickLine={{ stroke: theme.palette.divider }}
              tickFormatter={formatYAxisTick}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px'
              }}
              iconType="rect"
              formatter={(value) => (
                <span style={{ color: theme.palette.text.primary, fontWeight: 500 }}>
                  {value}
                </span>
              )}
            />
            {/* Always show primary data */}
            <Area
              type="monotone"
              dataKey="expiredCount"
              name="Expired"
              stroke={theme.palette.error.main}
              fill="url(#colorExpired)"
              strokeWidth={2}
              activeDot={{ r: 6, stroke: theme.palette.background.paper, strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="expiringCount"
              name="Expiring Soon"
              stroke={theme.palette.warning.main}
              fill="url(#colorExpiring)"
              strokeWidth={2}
              activeDot={{ r: 6, stroke: theme.palette.background.paper, strokeWidth: 2 }}
            />
            
            {/* Conditionally show optional data based on toggle */}
            {showOptionalData && processedData[0]?.safeCount !== undefined && (
              <Area
                type="monotone"
                dataKey="safeCount"
                name="Safe"
                stroke={theme.palette.success.main}
                fill="url(#colorSafe)"
                strokeWidth={2}
                activeDot={{ r: 6, stroke: theme.palette.background.paper, strokeWidth: 2 }}
              />
            )}
            {showOptionalData && processedData[0]?.warningCount !== undefined && (
              <Area
                type="monotone"
                dataKey="warningCount"
                name="Warning Level"
                stroke={theme.palette.info.main}
                fill="url(#colorWarning)"
                strokeWidth={2}
                activeDot={{ r: 6, stroke: theme.palette.background.paper, strokeWidth: 2 }}
              />
            )}
            {showOptionalData && processedData[0]?.criticalCount !== undefined && (
              <Area
                type="monotone"
                dataKey="criticalCount"
                name="Critical"
                stroke={theme.palette.error.dark}
                fill={alpha(theme.palette.error.dark, 0.2)}
                strokeWidth={2}
                activeDot={{ r: 6, stroke: theme.palette.background.paper, strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        ) : type === 'line' ? (
          <LineChart
            data={processedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={alpha(theme.palette.divider, 0.5)}
              vertical={false}
            />
            <XAxis 
              dataKey="date"
              stroke={theme.palette.text.secondary}
              fontSize={12}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              fontSize={12}
              tick={{ fill: theme.palette.text.secondary }}
              tickFormatter={formatYAxisTick}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px'
              }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="expiredCount"
              name="Expired"
              stroke={theme.palette.error.main}
              strokeWidth={3}
              dot={{ fill: theme.palette.error.main, strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="expiringCount"
              name="Expiring Soon"
              stroke={theme.palette.warning.main}
              strokeWidth={3}
              dot={{ fill: theme.palette.warning.main, strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
            {showOptionalData && processedData[0]?.safeCount !== undefined && (
              <Line
                type="monotone"
                dataKey="safeCount"
                name="Safe"
                stroke={theme.palette.success.main}
                strokeWidth={3}
                dot={{ fill: theme.palette.success.main, strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            )}
          </LineChart>
        ) : (
          <BarChart
            data={processedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={alpha(theme.palette.divider, 0.5)}
              vertical={false}
            />
            <XAxis 
              dataKey="date"
              stroke={theme.palette.text.secondary}
              fontSize={12}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <YAxis 
              stroke={theme.palette.text.secondary}
              fontSize={12}
              tick={{ fill: theme.palette.text.secondary }}
              tickFormatter={formatYAxisTick}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px'
              }}
            />
            <Bar
              dataKey="expiredCount"
              name="Expired"
              fill={theme.palette.error.main}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expiringCount"
              name="Expiring Soon"
              fill={theme.palette.warning.main}
              radius={[4, 4, 0, 0]}
            />
            {showOptionalData && processedData[0]?.safeCount !== undefined && (
              <Bar
                dataKey="safeCount"
                name="Safe"
                fill={theme.palette.success.main}
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        )}
      </ResponsiveContainer>
    </Paper>
  );
};

export default TrendChart;