import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Box, FormControlLabel, Switch } from '@mui/material';

const TrendChart = ({ data, showArea = false }) => {
  const [showExpired, setShowExpired] = React.useState(true);
  const [showExpiring, setShowExpiring] = React.useState(true);
  const [showValue, setShowValue] = React.useState(false);

  const ChartComponent = showArea ? AreaChart : LineChart;
  const DataComponent = showArea ? Area : Line;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formattedData = data?.map(point => ({
    ...point,
    date: formatDate(point.date),
    value: point.value ? parseFloat(point.value) : 0
  })) || [];

  return (
    <Box>
      <Box display="flex" gap={2} mb={2}>
        <FormControlLabel
          control={
            <Switch
              checked={showExpired}
              onChange={(e) => setShowExpired(e.target.checked)}
              color="error"
            />
          }
          label="Expired"
        />
        <FormControlLabel
          control={
            <Switch
              checked={showExpiring}
              onChange={(e) => setShowExpiring(e.target.checked)}
              color="warning"
            />
          }
          label="Expiring"
        />
        <FormControlLabel
          control={
            <Switch
              checked={showValue}
              onChange={(e) => setShowValue(e.target.checked)}
              color="primary"
            />
          }
          label="Value"
        />
      </Box>

      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis yAxisId="left" />
          {showValue && (
            <YAxis yAxisId="right" orientation="right" />
          )}
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'value') {
                return `$${value.toLocaleString()}`;
              }
              return value;
            }}
          />
          <Legend />
          
          {showExpired && (
            <DataComponent
              yAxisId="left"
              type="monotone"
              dataKey="expiredCount"
              stroke="#f44336"
              fill="#f44336"
              strokeWidth={2}
              name="Expired"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
          
          {showExpiring && (
            <DataComponent
              yAxisId="left"
              type="monotone"
              dataKey="expiringCount"
              stroke="#ff9800"
              fill="#ff9800"
              strokeWidth={2}
              name="Expiring"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
          
          {showValue && (
            <DataComponent
              yAxisId="right"
              type="monotone"
              dataKey="value"
              stroke="#2196f3"
              fill="#2196f3"
              strokeWidth={2}
              name="Value ($)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
          
          <ReferenceLine y={0} stroke="#000" />
        </ChartComponent>
      </ResponsiveContainer>
    </Box>
  );
};

export default TrendChart;