import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material'
import {
  Save,
  Refresh,
  PlayArrow,
  AutoAwesome,
  ArrowBack,
  Info,
  CheckCircle,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { getAutoPOConfig, updateAutoPOConfig, generateAutoPOs } from '../services/api'

// Available roles for notification
const AVAILABLE_ROLES = [
  { value: 'HOSPITAL_MANAGER', label: 'Hospital Manager' },
  { value: 'PROCUREMENT_OFFICER', label: 'Procurement Officer' },
  { value: 'PHARMACY_STAFF', label: 'Pharmacy Staff' }
]

function AutoPOSettings() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [generationResult, setGenerationResult] = useState(null)
  const [lastRunDetails, setLastRunDetails] = useState(null)
  
  const [config, setConfig] = useState({
    enabled: true,
    scheduleCron: '0 0 2 * * ?',
    reorderMultiplier: 2.0,
    daysUntilDelivery: 7,
    minPoValue: 100.0,
    onlyPreferredSuppliers: true,
    autoApprove: false,
    notificationEnabled: true,
    notifyRoles: 'HOSPITAL_MANAGER,PROCUREMENT_OFFICER'
  })

  // Parse notify roles for multi-select
  const [selectedRoles, setSelectedRoles] = useState([])

  useEffect(() => {
    fetchConfig()
  }, [])

  useEffect(() => {
    // Parse notify roles string to array
    if (config.notifyRoles) {
      const roles = config.notifyRoles.split(',').map(r => r.trim())
      setSelectedRoles(roles)
    }
  }, [config.notifyRoles])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await getAutoPOConfig()
      setConfig(response.data)
      
      // Parse last run details if exists
      if (response.data.lastRunDetails) {
        try {
          const details = JSON.parse(response.data.lastRunDetails)
          setLastRunDetails(details)
        } catch (e) {
          console.error('Error parsing last run details:', e)
        }
      }
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

  const handleRolesChange = (event) => {
    const {
      target: { value },
    } = event
    const roles = typeof value === 'string' ? value.split(',') : value
    setSelectedRoles(roles)
    
    // Update config with comma-separated string
    setConfig(prev => ({
      ...prev,
      notifyRoles: roles.join(',')
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      
      await updateAutoPOConfig(config)
      setSuccess('Configuration saved successfully!')
      
      // Reload config to get updated data
      await fetchConfig()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error saving config:', error)
      setError(error.response?.data?.message || 'Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateNow = async () => {
    if (!window.confirm('Generate purchase orders now? This will create POs for all low-stock products.')) {
      return
    }

    try {
      setGenerating(true)
      setError('')
      setGenerationResult(null)
      
      const response = await generateAutoPOs()
      setGenerationResult(response.data)
      
      // Parse and update last run details
      if (response.data) {
        const details = {
          posGenerated: response.data.posGenerated,
          productsEvaluated: response.data.productsEvaluated,
          lowStockProducts: response.data.lowStockProducts,
          totalValue: response.data.totalValue,
          errors: response.data.errors?.length || 0,
          warnings: response.data.warnings?.length || 0
        }
        setLastRunDetails(details)
      }
      
      if (response.data.success) {
        setSuccess(`Successfully generated ${response.data.posGenerated} purchase orders!`)
        setTimeout(() => navigate('/purchase-orders'), 2000)
      } else {
        setError('Generation completed with errors. Check results below.')
      }
    } catch (error) {
      console.error('Error generating POs:', error)
      setError(error.response?.data?.message || 'Failed to generate purchase orders')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/purchase-orders')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h4" fontWeight={700}>
            Automated PO Generation Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure automatic purchase order creation for low-stock products
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchConfig}
        >
          Reload
        </Button>
      </Box>

      {/* Alerts */}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Last Run Status - IMPROVED UI */}
      {(config.lastRunAt || lastRunDetails) && (
        <Card sx={{ mb: 3, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <TrendingUp color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Last Execution Summary
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              {/* Last Run Time */}
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Last Run Time
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {config.lastRunAt ? new Date(config.lastRunAt).toLocaleString() : 'Never'}
                </Typography>
              </Grid>

              {/* Status */}
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Execution Status
                </Typography>
                <Chip
                  icon={
                    config.lastRunStatus === 'SUCCESS' ? <CheckCircle /> :
                    config.lastRunStatus === 'PARTIAL' ? <WarningIcon /> : <ErrorIcon />
                  }
                  label={config.lastRunStatus || 'N/A'}
                  color={
                    config.lastRunStatus === 'SUCCESS' ? 'success' :
                    config.lastRunStatus === 'PARTIAL' ? 'warning' : 'error'
                  }
                  sx={{ fontWeight: 600 }}
                />
              </Grid>

              {/* Quick Stats */}
              {lastRunDetails && (
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Quick Summary
                  </Typography>
                  <Typography variant="body1">
                    <strong>{lastRunDetails.posGenerated}</strong> POs Generated
                  </Typography>
                </Grid>
              )}
            </Grid>

            {/* Detailed Breakdown - IMPROVED FORMAT */}
            {lastRunDetails && (
              <>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4} md={2}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.50', textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main" fontWeight={700}>
                        {lastRunDetails.posGenerated}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        POs Generated
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={6} sm={4} md={2}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'info.50', textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main" fontWeight={700}>
                        {lastRunDetails.productsEvaluated}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Products Evaluated
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={6} sm={4} md={2}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'warning.50', textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main" fontWeight={700}>
                        {lastRunDetails.lowStockProducts}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Low Stock Items
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={6} sm={4} md={2}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'success.50', textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main" fontWeight={700}>
                        ${parseFloat(lastRunDetails.totalValue || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Value
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={6} sm={4} md={2}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'error.50', textAlign: 'center' }}>
                      <Typography variant="h4" color="error.main" fontWeight={700}>
                        {lastRunDetails.errors || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Errors
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={6} sm={4} md={2}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.100', textAlign: 'center' }}>
                      <Typography variant="h4" color="text.primary" fontWeight={700}>
                        {lastRunDetails.warnings || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Warnings
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Main Configuration */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Configuration Settings
            </Typography>

            <Grid container spacing={3}>
              {/* Enable/Disable */}
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
                      <Typography fontWeight={600}>Enable Auto PO Generation</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Automatically create purchase orders for low-stock products
                      </Typography>
                    </Box>
                  }
                />
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* Reorder Multiplier */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Reorder Multiplier"
                  type="number"
                  value={config.reorderMultiplier}
                  onChange={handleChange('reorderMultiplier')}
                  inputProps={{ min: 1, max: 10, step: 0.1 }}
                  helperText="Order quantity = Min Stock × Multiplier"
                />
              </Grid>

              {/* Days Until Delivery */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expected Delivery Days"
                  type="number"
                  value={config.daysUntilDelivery}
                  onChange={handleChange('daysUntilDelivery')}
                  inputProps={{ min: 1, max: 90 }}
                  helperText="Expected days for delivery"
                />
              </Grid>

              {/* Min PO Value */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Minimum PO Value ($)"
                  type="number"
                  value={config.minPoValue}
                  onChange={handleChange('minPoValue')}
                  inputProps={{ min: 0, step: 10 }}
                  helperText="Skip POs below this value"
                />
              </Grid>

              {/* Schedule */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Schedule (Cron Expression)"
                  value={config.scheduleCron}
                  onChange={handleChange('scheduleCron')}
                  helperText="Default: 0 0 2 * * ? (2 AM daily)"
                />
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* Supplier Preferences */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.onlyPreferredSuppliers}
                      onChange={handleChange('onlyPreferredSuppliers')}
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={600}>Only Use Preferred Suppliers</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Generate POs only for products with preferred suppliers
                      </Typography>
                    </Box>
                  }
                />
              </Grid>

              {/* Auto Approve */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.autoApprove}
                      onChange={handleChange('autoApprove')}
                      color="warning"
                    />
                  }
                  label={
                    <Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight={600}>Auto-Approve Generated POs</Typography>
                        <Chip label="Use with Caution" size="small" color="warning" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        ⚠️ Generated POs will be automatically approved and ready to send
                      </Typography>
                    </Box>
                  }
                />
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              {/* Notifications */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.notificationEnabled}
                      onChange={handleChange('notificationEnabled')}
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={600}>Send Notifications</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Notify selected roles when POs are generated
                      </Typography>
                    </Box>
                  }
                />
              </Grid>

              {/* Notify Roles - IMPROVED UI WITH MULTI-SELECT */}
              {config.notificationEnabled && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Notify Roles</InputLabel>
                    <Select
                      multiple
                      value={selectedRoles}
                      onChange={handleRolesChange}
                      input={<OutlinedInput label="Notify Roles" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const role = AVAILABLE_ROLES.find(r => r.value === value)
                            return (
                              <Chip 
                                key={value} 
                                label={role?.label || value} 
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            )
                          })}
                        </Box>
                      )}
                    >
                      {AVAILABLE_ROLES.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          <Checkbox checked={selectedRoles.indexOf(role.value) > -1} />
                          <ListItemText primary={role.label} />
                        </MenuItem>
                      ))}
                    </Select>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, ml: 2 }}>
                      Select user roles to receive notifications when POs are auto-generated
                    </Typography>
                  </FormControl>
                </Grid>
              )}
            </Grid>

            <Box mt={4} display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/purchase-orders')}
              >
                Cancel
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Actions & Info */}
        <Grid item xs={12} md={4}>
          {/* Manual Trigger */}
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Manual Trigger
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Run PO generation immediately to test configuration
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              startIcon={<PlayArrow />}
              onClick={handleGenerateNow}
              disabled={!config.enabled || generating}
            >
              {generating ? 'Generating...' : 'Generate Now'}
            </Button>
          </Paper>

          {/* Generation Result - IMPROVED UI */}
          {generationResult && (
            <Paper sx={{ p: 3, mb: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
              <Typography variant="h6" fontWeight={600} mb={2} color="success.dark">
                Generation Results
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main" fontWeight={700}>
                      {generationResult.productsEvaluated}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Products Evaluated
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main" fontWeight={700}>
                      {generationResult.lowStockProducts}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Low Stock
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary.main" fontWeight={700}>
                      {generationResult.posGenerated}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      POs Generated
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main" fontWeight={700}>
                      ${parseFloat(generationResult.totalValue || 0).toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Value
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {generationResult.generatedPoNumbers?.length > 0 && (
                <Box mt={2}>
                  <Typography variant="body2" fontWeight={600} mb={1} color="success.dark">
                    Generated POs:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {generationResult.generatedPoNumbers.map(po => (
                      <Chip 
                        key={po} 
                        label={po} 
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              {generationResult.errors?.length > 0 && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {generationResult.errors.join(', ')}
                </Alert>
              )}
            </Paper>
          )}

          {/* Help Info */}
          <Paper sx={{ p: 3, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Info color="info" />
              <Typography variant="h6" fontWeight={600}>
                How It Works
              </Typography>
            </Box>
            <Box component="ol" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body2" paragraph>
                System scans all products at scheduled time
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                Identifies products at or below minimum stock level
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                Groups products by preferred supplier
              </Typography>
              <Typography component="li" variant="body2" paragraph>
                Creates draft POs with calculated quantities
              </Typography>
              <Typography component="li" variant="body2">
                Sends notifications to procurement team
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default AutoPOSettings