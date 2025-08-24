import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

const ExpiryCalendarLegend = () => {
  const legendItems = [
    { label: 'Critical', color: '#d32f2f' },
    { label: 'High', color: '#ff9800' },
    { label: 'Medium', color: '#ffc107' },
    { label: 'Low', color: '#4caf50' }
  ];
  
  return (
    <Box mt={2} display="flex" alignItems="center" gap={2}>
      <Typography variant="caption" color="text.secondary">
        Severity:
      </Typography>
      {legendItems.map(item => (
        <Chip
          key={item.label}
          label={item.label}
          size="small"
          sx={{
            bgcolor: item.color,
            color: 'white',
            height: 20,
            fontSize: '0.7rem'
          }}
        />
      ))}
    </Box>
  );
};

export default ExpiryCalendarLegend;