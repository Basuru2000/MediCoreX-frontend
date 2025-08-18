import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Grid,
  Chip
} from '@mui/material';
import {
  Error as CriticalIcon,
  Warning as HighIcon,
  Info as MediumIcon,
  CheckCircle as LowIcon
} from '@mui/icons-material';

const PrioritySettings = ({ preferences, onChange }) => {
  const priorities = [
    { value: 'LOW', label: 'Low', icon: <LowIcon color="success" />, description: 'All notifications including informational' },
    { value: 'MEDIUM', label: 'Medium', icon: <MediumIcon color="info" />, description: 'Medium priority and above' },
    { value: 'HIGH', label: 'High', icon: <HighIcon color="warning" />, description: 'Important and critical only' },
    { value: 'CRITICAL', label: 'Critical', icon: <CriticalIcon color="error" />, description: 'Only critical alerts' }
  ];

  const handlePriorityChange = (event) => {
    onChange({
      ...preferences,
      priorityThreshold: event.target.value
    });
  };

  const currentPriority = priorities.find(p => p.value === preferences.priorityThreshold) || priorities[0];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Priority Filter
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Only receive notifications that meet or exceed this priority level.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Minimum Priority Level</InputLabel>
            <Select
              value={preferences.priorityThreshold || 'LOW'}
              onChange={handlePriorityChange}
              label="Minimum Priority Level"
            >
              {priorities.map((priority) => (
                <MenuItem key={priority.value} value={priority.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {priority.icon}
                    {priority.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {currentPriority.icon}
              <Typography variant="subtitle1">
                Current Setting: {currentPriority.label}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {currentPriority.description}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Critical notifications will always bypass quiet hours and other filters to ensure you receive urgent alerts.
        </Typography>
      </Alert>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Examples of notification priorities:
        </Typography>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          <Grid item>
            <Chip icon={<CriticalIcon />} label="Critical: Expired products, system failures" color="error" size="small" />
          </Grid>
          <Grid item>
            <Chip icon={<HighIcon />} label="High: Low stock, expiring soon" color="warning" size="small" />
          </Grid>
          <Grid item>
            <Chip icon={<MediumIcon />} label="Medium: New batches, user activities" color="primary" size="small" />
          </Grid>
          <Grid item>
            <Chip icon={<LowIcon />} label="Low: Reports ready, system updates" color="success" size="small" />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default PrioritySettings;
