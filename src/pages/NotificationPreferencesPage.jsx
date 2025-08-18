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
  Divider,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Snackbar,
  Chip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  VolumeUp as SoundIcon,
  DesktopWindows as DesktopIcon,
  RestartAlt as ResetIcon,
  Save as SaveIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
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
    // Check if preferences have changed
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!preferences) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load preferences</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Notification Preferences
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {hasChanges && (
            <Chip
              label="Unsaved Changes"
              color="warning"
              icon={<WarningIcon />}
              size="small"
            />
          )}
          <Button
            variant="outlined"
            startIcon={<ResetIcon />}
            onClick={handleReset}
            disabled={saving}
          >
            Reset to Default
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      {/* Global Settings Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Global Notification Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.inAppEnabled}
                    onChange={handleGlobalToggle('inAppEnabled')}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotificationsIcon />
                    In-App Notifications
                  </Box>
                }
              />
              <Typography variant="caption" display="block" sx={{ ml: 5, mt: 1 }}>
                Show notifications within the application
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.emailEnabled}
                    onChange={handleGlobalToggle('emailEnabled')}
                    color="primary"
                    disabled
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon />
                    Email Notifications
                  </Box>
                }
              />
              <Typography variant="caption" display="block" sx={{ ml: 5, mt: 1 }}>
                Coming in next release
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.smsEnabled}
                    onChange={handleGlobalToggle('smsEnabled')}
                    color="primary"
                    disabled
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SmsIcon />
                    SMS Notifications
                  </Box>
                }
              />
              <Typography variant="caption" display="block" sx={{ ml: 5, mt: 1 }}>
                Not available in current version
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.soundEnabled}
                    onChange={handleGlobalToggle('soundEnabled')}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SoundIcon />
                    Sound Alerts
                  </Box>
                }
              />
              <Typography variant="caption" display="block" sx={{ ml: 5, mt: 1 }}>
                Play sound for critical notifications
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.desktopNotifications}
                    onChange={handleGlobalToggle('desktopNotifications')}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DesktopIcon />
                    Desktop Notifications
                  </Box>
                }
              />
              <Typography variant="caption" display="block" sx={{ ml: 5, mt: 1 }}>
                Show browser desktop notifications
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Detailed Settings Tabs */}
      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Categories" />
          <Tab label="Priority & Filters" />
          <Tab label="Quiet Hours" />
          <Tab label="Digest Settings" />
        </Tabs>

        <Box sx={{ p: 3 }}>
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
          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Digest Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.digestEnabled}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      digestEnabled: e.target.checked
                    })}
                  />
                }
                label="Enable Daily Digest"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Receive a daily summary of notifications at your preferred time.
              </Typography>
              {preferences.digestEnabled && (
                <Box sx={{ mt: 2 }}>
                  <Typography>Digest Time: {preferences.digestTime}</Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Test Notification */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Test Your Settings</Typography>
              <Typography variant="body2" color="text.secondary">
                Send a test notification with your current preferences
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={handleTestNotification}
            >
              Send Test Notification
            </Button>
          </Box>
          {testResult && (
            <Alert 
              severity={testResult.shouldSend ? 'success' : 'warning'}
              sx={{ mt: 2 }}
            >
              {testResult.reason}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Preferences saved successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationPreferencesPage;