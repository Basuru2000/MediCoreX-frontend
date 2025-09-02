// File: src/components/preferences/QuietHoursSettings.jsx
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
  InputLabel,
  Card,
  Chip,
  useTheme,
  alpha,
  Fade,
  Divider
} from '@mui/material';
import {
  DoNotDisturb as QuietIcon,
  Schedule as TimeIcon,
  Bedtime as NightIcon,
  WbSunny as DayIcon,
  Language as TimezoneIcon,
  NotificationsOff as MutedIcon,
  NotificationImportant as CriticalIcon
} from '@mui/icons-material';

const QuietHoursSettings = ({ preferences, onChange }) => {
  const theme = useTheme();
  
  const quietHours = preferences.quietHours || {
    enabled: false,
    startTime: '22:00',
    endTime: '07:00',
    timezone: 'UTC'
  };

  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (New York)' },
    { value: 'America/Chicago', label: 'Central Time (Chicago)' },
    { value: 'America/Denver', label: 'Mountain Time (Denver)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
    { value: 'Europe/London', label: 'British Time (London)' },
    { value: 'Europe/Paris', label: 'Central European Time (Paris)' },
    { value: 'Asia/Tokyo', label: 'Japan Time (Tokyo)' },
    { value: 'Asia/Shanghai', label: 'China Time (Shanghai)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (Sydney)' }
  ];

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

  // Calculate quiet hours duration
  const calculateDuration = () => {
    const [startHour, startMin] = quietHours.startTime.split(':').map(Number);
    const [endHour, endMin] = quietHours.endTime.split(':').map(Number);
    
    let duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    if (duration < 0) duration += 24 * 60; // Handle overnight periods
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Quiet Hours
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Pause non-critical notifications during your preferred quiet time
        </Typography>
      </Box>

      {/* Main Toggle Card */}
      <Card 
        sx={{ 
          borderRadius: 2,
          boxShadow: 'none',
          border: `2px solid ${quietHours.enabled ? theme.palette.primary.main : theme.palette.divider}`,
          bgcolor: quietHours.enabled ? alpha(theme.palette.primary.main, 0.02) : 'background.paper',
          transition: 'all 0.3s',
          mb: 3
        }}
      >
        <Box p={3}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  bgcolor: quietHours.enabled 
                    ? alpha(theme.palette.primary.main, 0.1)
                    : alpha(theme.palette.action.disabled, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: quietHours.enabled 
                    ? theme.palette.primary.main 
                    : theme.palette.action.disabled
                }}
              >
                {quietHours.enabled ? <QuietIcon /> : <MutedIcon />}
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {quietHours.enabled ? 'Quiet Hours Active' : 'Quiet Hours Disabled'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {quietHours.enabled 
                    ? `Notifications paused ${quietHours.startTime} - ${quietHours.endTime}`
                    : 'Receive all notifications at any time'}
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={quietHours.enabled}
              onChange={handleQuietHoursToggle}
              color="primary"
              size="medium"
            />
          </Box>
        </Box>
      </Card>

      {/* Settings Grid - Only show when enabled */}
      {quietHours.enabled && (
        <Fade in timeout={300}>
          <Grid container spacing={3}>
            {/* Time Settings */}
            <Grid item xs={12} md={8}>
              <Card 
                sx={{ 
                  borderRadius: 2,
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  height: '100%'
                }}
              >
                <Box 
                  p={2} 
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <TimeIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Schedule Configuration
                    </Typography>
                  </Box>
                </Box>
                
                <Box p={3}>
                  <Grid container spacing={3}>
                    {/* Start Time */}
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <NightIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                          <Typography variant="body2" fontWeight={500}>
                            Start Time
                          </Typography>
                        </Box>
                        <TextField
                          type="time"
                          value={quietHours.startTime}
                          onChange={handleTimeChange('startTime')}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 300 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                    
                    {/* End Time */}
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <DayIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                          <Typography variant="body2" fontWeight={500}>
                            End Time
                          </Typography>
                        </Box>
                        <TextField
                          type="time"
                          value={quietHours.endTime}
                          onChange={handleTimeChange('endTime')}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ step: 300 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                    
                    {/* Timezone */}
                    <Grid item xs={12}>
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <TimezoneIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                          <Typography variant="body2" fontWeight={500}>
                            Timezone
                          </Typography>
                        </Box>
                        <FormControl fullWidth>
                          <Select
                            value={quietHours.timezone}
                            onChange={handleTimeChange('timezone')}
                            sx={{
                              borderRadius: 1,
                              '& .MuiSelect-select': {
                                py: 1.5
                              }
                            }}
                          >
                            {timezones.map((tz) => (
                              <MenuItem key={tz.value} value={tz.value}>
                                <Typography variant="body2">{tz.label}</Typography>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Duration Display */}
                  <Box 
                    mt={3} 
                    p={2} 
                    sx={{ 
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Total quiet duration:
                      </Typography>
                      <Chip 
                        label={calculateDuration()}
                        size="small"
                        color="info"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>

            {/* Status Card */}
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  borderRadius: 2,
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  height: '100%',
                  bgcolor: alpha(theme.palette.warning.main, 0.02)
                }}
              >
                <Box p={3}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    During Quiet Hours
                  </Typography>
                  
                  <Box display="flex" flexDirection="column" gap={2} mt={2}>
                    <Box display="flex" alignItems="flex-start" gap={1}>
                      <CriticalIcon sx={{ color: theme.palette.error.main, fontSize: 20, mt: 0.25 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          Critical Only
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Emergency alerts still delivered
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider />
                    
                    <Box display="flex" alignItems="flex-start" gap={1}>
                      <MutedIcon sx={{ color: theme.palette.text.secondary, fontSize: 20, mt: 0.25 }} />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          Others Queued
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Delivered after quiet hours end
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      )}

      {/* Info Alert */}
      <Alert 
        severity={quietHours.enabled ? 'warning' : 'info'}
        icon={quietHours.enabled ? <QuietIcon /> : <TimeIcon />}
        sx={{ 
          mt: 3,
          borderRadius: 1.5,
          '& .MuiAlert-icon': {
            fontSize: 24
          }
        }}
      >
        {quietHours.enabled ? (
          <Box>
            <Typography variant="body2" fontWeight={500} gutterBottom>
              Quiet hours are active from {quietHours.startTime} to {quietHours.endTime} ({quietHours.timezone})
            </Typography>
            <Typography variant="body2">
              • Only critical priority notifications will be shown immediately<br />
              • All other notifications will be queued and delivered after {quietHours.endTime}<br />
              • You can still manually check notifications in the notification center
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2">
            Quiet hours are currently disabled. You will receive all notifications based on your other preferences at any time of day.
          </Typography>
        )}
      </Alert>
    </Box>
  );
};

export default QuietHoursSettings;