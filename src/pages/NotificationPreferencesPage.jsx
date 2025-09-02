// File: src/pages/NotificationPreferencesPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  IconButton,
  Tooltip,
  Snackbar,
  Chip,
  Container,
  Fade,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  VolumeUp as SoundIcon,
  DesktopWindows as DesktopIcon,
  RestartAlt as ResetIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
  Science as TestIcon,
  CheckCircle as SuccessIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  PriorityHigh as PriorityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CategoryPreferences from '../components/preferences/CategoryPreferences';
import PrioritySettings from '../components/preferences/PrioritySettings';
import QuietHoursSettings from '../components/preferences/QuietHoursSettings';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  resetNotificationPreferences,
  testNotificationPreferences
} from '../services/api';

const NotificationPreferencesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [originalPreferences, setOriginalPreferences] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  useEffect(() => {
    if (originalPreferences && preferences) {
      const changed = JSON.stringify(preferences) !== JSON.stringify(originalPreferences);
      setHasChanges(changed);
    }
  }, [preferences, originalPreferences]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await getNotificationPreferences();
      setPreferences(response.data);
      setOriginalPreferences(response.data);
    } catch (err) {
      setError('Failed to load preferences');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await updateNotificationPreferences(preferences);
      setPreferences(response.data);
      setOriginalPreferences(response.data);
      setSuccess(true);
      setHasChanges(false);
    } catch (err) {
      setError('Failed to save preferences');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all preferences to default?')) {
      return;
    }

    try {
      setSaving(true);
      const response = await resetNotificationPreferences();
      setPreferences(response.data);
      setOriginalPreferences(response.data);
      setSuccess(true);
      setHasChanges(false);
    } catch (err) {
      setError('Failed to reset preferences');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      const testParams = {
        category: 'SYSTEM',
        priority: preferences.priorityThreshold || 'MEDIUM'
      };
      const response = await testNotificationPreferences(testParams);
      setTestResult(response.data);
    } catch (err) {
      console.error('Test failed:', err);
    }
  };

  const handleGlobalToggle = (field) => (event) => {
    setPreferences({
      ...preferences,
      [field]: event.target.checked
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} md={4} key={i}>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    );
  }

  if (!preferences) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            boxShadow: `0 2px 4px ${alpha(theme.palette.error.main, 0.1)}`
          }}
        >
          Failed to load preferences
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Fade in timeout={500}>
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <NotificationsIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
              <Box>
                <Typography variant="h4" fontWeight={600}>
                  Notification Preferences
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customize how and when you receive notifications
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" gap={2} alignItems="center">
              {hasChanges && (
                <Fade in>
                  <Chip
                    label="Unsaved Changes"
                    color="warning"
                    size="small"
                    icon={<WarningIcon />}
                    sx={{ fontWeight: 500 }}
                  />
                </Fade>
              )}
              <Button
                variant="outlined"
                startIcon={<ResetIcon />}
                onClick={handleReset}
                disabled={saving}
                sx={{
                  borderRadius: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  borderColor: theme.palette.divider,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                Reset to Default
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={!hasChanges || saving}
                sx={{
                  borderRadius: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  boxShadow: hasChanges ? 2 : 0,
                  '&:disabled': {
                    bgcolor: theme.palette.action.disabledBackground
                  }
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Fade>

      {/* Global Settings Grid */}
      <Fade in timeout={600}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* In-App Notifications */}
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 2,
                boxShadow: 'none',
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
                }
              }}
            >
              <Box p={3}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <NotificationsIcon sx={{ color: theme.palette.primary.main }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        In-App
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Application alerts
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={preferences.inAppEnabled}
                    onChange={handleGlobalToggle('inAppEnabled')}
                    color="primary"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Show notifications within the application interface
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Email Notifications */}
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 2,
                boxShadow: 'none',
                border: `1px solid ${theme.palette.divider}`,
                opacity: 0.7,
                position: 'relative'
              }}
            >
              <Box p={3}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.action.disabled, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <EmailIcon sx={{ color: theme.palette.action.disabled }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Email
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Email delivery
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={preferences.emailEnabled}
                    onChange={handleGlobalToggle('emailEnabled')}
                    disabled
                    color="primary"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Coming in the next release
                </Typography>
                <Chip 
                  label="Coming Soon" 
                  size="small" 
                  sx={{ 
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    fontSize: '0.7rem'
                  }}
                />
              </Box>
            </Card>
          </Grid>

          {/* Sound & Desktop */}
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 2,
                boxShadow: 'none',
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
                }
              }}
            >
              <Box p={3}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <DesktopIcon sx={{ color: theme.palette.info.main }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Desktop
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Browser alerts
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={preferences.desktopNotifications}
                    onChange={handleGlobalToggle('desktopNotifications')}
                    color="primary"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Show browser desktop notifications
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Fade>

      {/* Detailed Settings Tabs */}
      <Fade in timeout={700}>
        <Paper 
          sx={{ 
            borderRadius: 2,
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 56,
                '&.Mui-selected': {
                  color: theme.palette.primary.main
                }
              }
            }}
          >
            <Tab icon={<CategoryIcon />} iconPosition="start" label="Categories" />
            <Tab icon={<PriorityIcon />} iconPosition="start" label="Priority & Filters" />
            <Tab icon={<ScheduleIcon />} iconPosition="start" label="Quiet Hours" />
          </Tabs>

          <Box sx={{ p: 4 }}>
            {tabValue === 0 && (
              <CategoryPreferences
                preferences={preferences}
                onChange={setPreferences}
              />
            )}
            {tabValue === 1 && (
              <PrioritySettings
                preferences={preferences}
                onChange={setPreferences}
              />
            )}
            {tabValue === 2 && (
              <QuietHoursSettings
                preferences={preferences}
                onChange={setPreferences}
              />
            )}
          </Box>
        </Paper>
      </Fade>

      {/* Test Notification Card */}
      <Fade in timeout={800}>
        <Card 
          sx={{ 
            mt: 3,
            borderRadius: 2,
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, transparent 100%)`
          }}
        >
          <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <TestIcon sx={{ color: theme.palette.info.main }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Test Your Settings
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Send a test notification with your current preferences
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<NotificationsIcon />}
                onClick={handleTestNotification}
                sx={{
                  borderRadius: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  bgcolor: theme.palette.info.main,
                  '&:hover': {
                    bgcolor: theme.palette.info.dark
                  }
                }}
              >
                Send Test
              </Button>
            </Box>
            
            {testResult && (
              <Fade in>
                <Alert 
                  severity={testResult.shouldSend ? 'success' : 'warning'}
                  sx={{ 
                    mt: 2,
                    borderRadius: 1,
                    '& .MuiAlert-icon': {
                      fontSize: 24
                    }
                  }}
                  icon={testResult.shouldSend ? <SuccessIcon /> : <WarningIcon />}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {testResult.reason}
                  </Typography>
                </Alert>
              </Fade>
            )}
          </Box>
        </Card>
      </Fade>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccess(false)}
          sx={{ 
            borderRadius: 1,
            boxShadow: 3,
            '& .MuiAlert-icon': {
              fontSize: 24
            }
          }}
        >
          Preferences saved successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ 
            borderRadius: 1,
            boxShadow: 3,
            '& .MuiAlert-icon': {
              fontSize: 24
            }
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NotificationPreferencesPage;