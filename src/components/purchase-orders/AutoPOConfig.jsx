import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  Chip,
  Stack,
  useTheme,
  alpha
} from '@mui/material'
import { Save, Settings, Check, Error } from '@mui/icons-material'
import { getAutoPOConfig, updateAutoPOConfig } from '../../services/api'

function AutoPOConfig({ onConfigUpdate }) {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [config, setConfig] = useState({
    enabled: true,
    reorderMultiplier: 2.0,
    daysUntilDelivery: 7,
    onlyPreferredSuppliers: true,
    autoApprove: false,
    notificationEnabled: true
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await getAutoPOConfig()
      setConfig(response.data)
    } catch (error) {
      console.error('Error fetching config:', error)
      setError('Failed to load configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : event.target.value
    
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      
      const response = await updateAutoPOConfig(config)
      setConfig(response.data)
      setSuccess('Configuration saved successfully!')
      
      if (onConfigUpdate) {
        onConfigUpdate(response.data)
      }
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error saving config:', error)
      setError(error.response?.data?.message || 'Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={6}>
        <Typography color="text.secondary">Loading configuration...</Typography>
      </Box>
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '12px',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main
            }}
          >
            <Settings fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Quick Auto PO Settings
          </Typography>
        </Stack>
        <Chip
          icon={config.enabled ? <Check sx={{ fontSize: 16 }} /> : <Error sx={{ fontSize: 16 }} />}
          label={config.enabled ? "Enabled" : "Disabled"}
          size="small"
          sx={{
            height: 28,
            fontSize: '0.8125rem',
            fontWeight: 600,
            bgcolor: config.enabled ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.grey[500], 0.1),
            color: config.enabled ? theme.palette.success.main : theme.palette.grey[600],
            border: `1px solid ${alpha(config.enabled ? theme.palette.success.main : theme.palette.grey[500], 0.3)}`
          }}
        />
      </Box>

      {/* Alerts */}
      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: '8px'
          }}
        >
          {success}
        </Alert>
      )}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: '8px'
          }}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Enable/Disable Toggle */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={config.enabled}
                onChange={handleChange('enabled')}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Enable Auto PO Generation
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Automatically create purchase orders for low-stock products
                </Typography>
              </Box>
            }
          />
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* Reorder Multiplier */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Reorder Multiplier"
            type="number"
            value={config.reorderMultiplier}
            onChange={handleChange('reorderMultiplier')}
            inputProps={{ min: 1, max: 10, step: 0.1 }}
            disabled={!config.enabled}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
          />
        </Grid>

        {/* Delivery Days */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Delivery Days"
            type="number"
            value={config.daysUntilDelivery}
            onChange={handleChange('daysUntilDelivery')}
            inputProps={{ min: 1, max: 90 }}
            disabled={!config.enabled}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
          />
        </Grid>

        {/* Preferred Suppliers Only */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={config.onlyPreferredSuppliers}
                onChange={handleChange('onlyPreferredSuppliers')}
                size="small"
              />
            }
            label="Only Preferred Suppliers"
            disabled={!config.enabled}
          />
        </Grid>

        {/* Auto Approve */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={config.autoApprove}
                onChange={handleChange('autoApprove')}
                size="small"
                color="warning"
              />
            }
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2">Auto-Approve Generated POs</Typography>
                <Chip
                  label="⚠️ Use with caution"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.main
                  }}
                />
              </Box>
            }
            disabled={!config.enabled}
          />
        </Grid>

        {/* Notifications */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={config.notificationEnabled}
                onChange={handleChange('notificationEnabled')}
                size="small"
              />
            }
            label="Send Notifications"
            disabled={!config.enabled}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
              }
            }}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default AutoPOConfig