import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  ViewModule,
  ViewWeek,
  ViewDay,
  Print,
  Download
} from '@mui/icons-material';
import ExpiryCalendarWidget from '../components/expiry/ExpiryCalendarWidget';
import { useNavigate } from 'react-router-dom';

const ExpiryCalendar = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('month');
  
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };
  
  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting calendar...');
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <Container maxWidth="xl">
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">
            Expiry Calendar
          </Typography>
          <Box display="flex" gap={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              size="small"
            >
              <ToggleButton value="day">
                <ViewDay />
              </ToggleButton>
              <ToggleButton value="week">
                <ViewWeek />
              </ToggleButton>
              <ToggleButton value="month">
                <ViewModule />
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExport}
            >
              Export
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={handlePrint}
            >
              Print
            </Button>
          </Box>
        </Box>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <ExpiryCalendarWidget
          compact={false}
          onEventClick={(event, date) => {
            if (event.actionUrl) {
              navigate(event.actionUrl);
            }
          }}
        />
      </Paper>
    </Container>
  );
};

export default ExpiryCalendar;