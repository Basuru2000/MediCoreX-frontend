import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Alert,
  Slider,
  FormControl,
  FormLabel,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  Settings,
  Save,
  RestartAlt
} from '@mui/icons-material'

function MetricsConfiguration({ onSave }) {
  const [config, setConfig] = useState({
    // Weight configuration (must total 100%)
    deliveryWeight: 30,
    qualityWeight: 35,
    complianceWeight: 20,
    costWeight: 15,
    
    // Threshold settings
    excellentThreshold: 80,
    goodThreshold: 60,
    poorThreshold: 40,
    
    // Alert settings
    enableAlerts: true,
    alertThreshold: 60,
    
    // Calculation frequency
    autoCalculate: true,
    calculationDay: 1 // Day of month
  })
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleWeightChange = (field, value) => {
    const newConfig = { ...config, [field]: value }
    
    // Validate total equals 100
    const total = newConfig.deliveryWeight + newConfig.qualityWeight + 
                  newConfig.complianceWeight + newConfig.costWeight
    
    if (total !== 100) {
      setError(`Total weight must equal 100% (currently ${total}%)`)
    } else {
      setError('')
    }
    
    setConfig(newConfig)
  }

  const handleSave = () => {
    const total = config.deliveryWeight + config.qualityWeight + 
                  config.complianceWeight + config.costWeight
    
    if (total !== 100) {
      setError('Total weight must equal 100%')
      return
    }
    
    // Save configuration (this would call an API in production)
    localStorage.setItem('metricsConfig', JSON.stringify(config))
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
    
    if (onSave) {
      onSave(config)
    }
  }

  const handleReset = () => {
    setConfig({
      deliveryWeight: 30,
      qualityWeight: 35,
      complianceWeight: 20,
      costWeight: 15,
      excellentThreshold: 80,
      goodThreshold: 60,
      poorThreshold: 40,
      enableAlerts: true,
      alertThreshold: 60,
      autoCalculate: true,
      calculationDay: 1
    })
    setError('')
    setSuccess(false)
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Settings color="primary" />
          <Typography variant="h6">
            Metrics Configuration
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Configuration saved successfully</Alert>}

        <Grid container spacing={3}>
          {/* Weight Configuration */}
          <Grid item xs={12}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">
                <Typography variant="subtitle1" fontWeight={600}>
                  Performance Score Weights (Must total 100%)
                </Typography>
              </FormLabel>
              
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" gutterBottom>
                      Delivery Performance: {config.deliveryWeight}%
                    </Typography>
                    <Slider
                      value={config.deliveryWeight}
                      onChange={(e, value) => handleWeightChange('deliveryWeight', value)}
                      min={0}
                      max={100}
                      step={5}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" gutterBottom>
                      Quality Score: {config.qualityWeight}%
                    </Typography>
                    <Slider
                      value={config.qualityWeight}
                      onChange={(e, value) => handleWeightChange('qualityWeight', value)}
                      min={0}
                      max={100}
                      step={5}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" gutterBottom>
                      Compliance Score: {config.complianceWeight}%
                    </Typography>
                    <Slider
                      value={config.complianceWeight}
                      onChange={(e, value) => handleWeightChange('complianceWeight', value)}
                      min={0}
                      max={100}
                      step={5}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" gutterBottom>
                      Cost Performance: {config.costWeight}%
                    </Typography>
                    <Slider
                      value={config.costWeight}
                      onChange={(e, value) => handleWeightChange('costWeight', value)}
                      min={0}
                      max={100}
                      step={5}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="caption" color="text.secondary">
                  Total: {config.deliveryWeight + config.qualityWeight + 
                         config.complianceWeight + config.costWeight}%
                </Typography>
              </Box>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Threshold Settings */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Performance Thresholds
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Excellent Threshold"
                  type="number"
                  value={config.excellentThreshold}
                  onChange={(e) => setConfig({ ...config, excellentThreshold: parseInt(e.target.value) })}
                  InputProps={{
                    inputProps: { min: 0, max: 100 }
                  }}
                  helperText="Score for excellent performance"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Good Threshold"
                  type="number"
                  value={config.goodThreshold}
                  onChange={(e) => setConfig({ ...config, goodThreshold: parseInt(e.target.value) })}
                  InputProps={{
                    inputProps: { min: 0, max: 100 }
                  }}
                  helperText="Score for good performance"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Poor Threshold"
                  type="number"
                  value={config.poorThreshold}
                  onChange={(e) => setConfig({ ...config, poorThreshold: parseInt(e.target.value) })}
                  InputProps={{
                    inputProps: { min: 0, max: 100 }
                  }}
                  helperText="Score below this is poor"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Alert Settings */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Alert Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.enableAlerts}
                      onChange={(e) => setConfig({ ...config, enableAlerts: e.target.checked })}
                    />
                  }
                  label="Enable Performance Alerts"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Alert Threshold"
                  type="number"
                  value={config.alertThreshold}
                  onChange={(e) => setConfig({ ...config, alertThreshold: parseInt(e.target.value) })}
                  disabled={!config.enableAlerts}
                  InputProps={{
                    inputProps: { min: 0, max: 100 }
                  }}
                  helperText="Alert when score falls below"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Calculation Settings */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Calculation Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.autoCalculate}
                      onChange={(e) => setConfig({ ...config, autoCalculate: e.target.checked })}
                    />
                  }
                  label="Auto-calculate Monthly Metrics"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Calculation Day"
                  type="number"
                  value={config.calculationDay}
                  onChange={(e) => setConfig({ ...config, calculationDay: parseInt(e.target.value) })}
                  disabled={!config.autoCalculate}
                  InputProps={{
                    inputProps: { min: 1, max: 28 }
                  }}
                  helperText="Day of month to calculate"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button
                variant="outlined"
                startIcon={<RestartAlt />}
                onClick={handleReset}
              >
                Reset to Defaults
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={!!error}
              >
                Save Configuration
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default MetricsConfiguration