import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Snackbar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ViewModule,
  ViewWeek,
  ViewDay,
  Print,
  Download,
  Info
} from '@mui/icons-material';
import ExpiryCalendarWidget from '../components/expiry/ExpiryCalendarWidget';
import { useNavigate } from 'react-router-dom';
import { exportExpiryTrendReport } from '../services/api';
import { format } from 'date-fns';

const ExpiryCalendar = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('month');
  const [exportLoading, setExportLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
      // Show info about view modes
      setSnackbar({
        open: true,
        message: `${newView.charAt(0).toUpperCase() + newView.slice(1)} view selected. Full implementation coming soon!`,
        severity: 'info'
      });
    }
  };
  
  const handleExport = async () => {
    try {
      setExportLoading(true);
      
      // Get current month's data as CSV
      const currentDate = new Date();
      const startDate = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), 'yyyy-MM-dd');
      const endDate = format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), 'yyyy-MM-dd');
      
      const response = await exportExpiryTrendReport(startDate, endDate);
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expiry_calendar_${format(currentDate, 'yyyy_MM')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: 'Calendar data exported successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Export failed:', error);
      setSnackbar({
        open: true,
        message: 'Failed to export calendar data',
        severity: 'error'
      });
    } finally {
      setExportLoading(false);
    }
  };
  
  const handlePrint = () => {
    // Hide unnecessary elements for printing
    const elementsToHide = document.querySelectorAll('.no-print');
    elementsToHide.forEach(el => el.style.display = 'none');
    
    window.print();
    
    // Restore hidden elements
    elementsToHide.forEach(el => el.style.display = '');
    
    setSnackbar({
      open: true,
      message: 'Print dialog opened',
      severity: 'info'
    });
  };
  
  const handleInfo = () => {
    setSnackbar({
      open: true,
      message: 'Calendar shows product expiry events. Red=Critical (≤7 days), Orange=High (8-30 days), Yellow=Medium (31-60 days), Green=Low (61+ days)',
      severity: 'info'
    });
  };
  
  return (
    <Container maxWidth="xl">
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h4">
              Expiry Calendar
            </Typography>
            <IconButton onClick={handleInfo} color="primary" size="small">
              <Info />
            </IconButton>
          </Box>
          <Box display="flex" gap={2} className="no-print">
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              size="small"
            >
              <ToggleButton value="day" disabled>
                <Tooltip title="Day view (Coming soon)">
                  <ViewDay />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="week" disabled>
                <Tooltip title="Week view (Coming soon)">
                  <ViewWeek />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="month">
                <Tooltip title="Month view">
                  <ViewModule />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExport}
              disabled={exportLoading}
            >
              {exportLoading ? 'Exporting...' : 'Export'}
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
        
        <Typography variant="body2" color="text.secondary">
          Track product expiry dates and manage inventory lifecycle. Click on any date with events for details.
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <ExpiryCalendarWidget
          compact={false}
          onEventClick={(event, date) => {
            console.log('Event clicked from full calendar:', event, date);
          }}
        />
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ExpiryCalendar;