import React from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Grid,
  Paper,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  DoNotDisturb as QuietIcon,
  Schedule as TimeIcon
} from '@mui/icons-material';

const QuietHoursSettings = ({ preferences, onChange }) => {
  const quietHours = preferences.quietHours || {
    enabled: false,
    startTime: '22:00',
    endTime: '07:00',
    timezone: 'UTC'
  };

  const handleQuietHoursToggle = (event) => {
    onChange({
      ...preferences,
      quietHours: {
        ...quietHours,
        enabled: event.target.checked
      }
    });
  };

  const handleTimeChange = (field) => (event) => {
    onChange({
      ...preferences,
      quietHours: {
        ...quietHours,
        [field]: event.target.value
      }
    });
  };

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Quiet Hours
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Pause non-critical notifications during specified hours.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={quietHours.enabled}
              onChange={handleQuietHoursToggle}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QuietIcon />
              Enable Quiet Hours
            </Box>
          }
        />

        {quietHours.enabled && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Start Time"
                  type="time"
                  value={quietHours.startTime}
                  onChange={handleTimeChange('startTime')}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    step: 300, // 5 min
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="End Time"
                  type="time"
                  value={quietHours.endTime}
                  onChange={handleTimeChange('endTime')}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    step: 300, // 5 min
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={quietHours.timezone}
                    onChange={handleTimeChange('timezone')}
                    label="Timezone"
                  >
                    {timezones.map((tz) => (
                      <MenuItem key={tz} value={tz}>
                        {tz}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Alert severity="warning" sx={{ mt: 3 }}>
              <Typography variant="body2">
                During quiet hours ({quietHours.startTime} - {quietHours.endTime} {quietHours.timezone}):
              </Typography>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                <li>Only critical priority notifications will be shown</li>
                <li>All other notifications will be queued and delivered after quiet hours end</li>
                <li>You can still manually check notifications in the notification center</li>
              </ul>
            </Alert>
          </Box>
        )}
      </Paper>

      {!quietHours.enabled && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            Quiet hours are currently disabled. You will receive all notifications based on your other preferences.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default QuietHoursSettings;