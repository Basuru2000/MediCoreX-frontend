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
  Chip
} from '@mui/material'
import { Save, Settings } from '@mui/icons-material'
import { getAutoPOConfig, updateAutoPOConfig } from '../../services/api'

/**
 * Compact Auto PO Configuration Component
 * Can be embedded in dashboards or as a quick settings panel
 */
function AutoPOConfig({ onConfigUpdate }) {
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
      setSuccess('Configuration saved!')
      
      if (onConfigUpdate) {
        onConfigUpdate(response.data)
      }
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error saving config:', error)
      setError(error.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Typography>Loading configuration...</Typography>
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Settings color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Quick Auto PO Settings
          </Typography>
        </Box>
        <Chip
          label={config.enabled ? "Enabled" : "Disabled"}
          color={config.enabled ? "success" : "default"}
          size="small"
        />
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
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
            label="Enable Auto PO Generation"
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
            label="Auto-Approve Generated POs (⚠️ Use with caution)"
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

        {/* Save Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving || !config.enabled}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default AutoPOConfig