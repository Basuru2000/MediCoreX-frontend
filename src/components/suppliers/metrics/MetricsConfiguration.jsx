import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  Slider,
  Button,
  Alert,
  Paper,
  Divider,
  useTheme
} from '@mui/material'
import { Save } from '@mui/icons-material'

function MetricsConfiguration({ onSave }) {
  const theme = useTheme()
  const [saved, setSaved] = useState(false)
  const [config, setConfig] = useState({
    deliveryWeight: 30,
    qualityWeight: 35,
    complianceWeight: 20,
    costWeight: 15,
    alertThreshold: 60
  })

  const handleSliderChange = (name) => (event, newValue) => {
    setConfig(prev => ({
      ...prev,
      [name]: newValue
    }))
  }

  const handleInputChange = (name) => (event) => {
    setConfig(prev => ({
      ...prev,
      [name]: Number(event.target.value)
    }))
  }

  const handleSave = () => {
    onSave(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const totalWeight = config.deliveryWeight + config.qualityWeight + 
                      config.complianceWeight + config.costWeight

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '12px',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box mb={3}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              fontSize: '1.125rem',
              mb: 0.5
            }}
          >
            Metrics Configuration
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            Configure weights and thresholds for supplier performance scoring
          </Typography>
        </Box>

        {saved && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: '8px'
            }}
          >
            Configuration saved successfully
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Weight Configuration */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '8px',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600,
                  mb: 3,
                  fontSize: '0.875rem'
                }}
              >
                Performance Weights
              </Typography>

              <Grid container spacing={3}>
                {/* Delivery Weight */}
                <Grid item xs={12} md={6}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          fontSize: '0.875rem'
                        }}
                      >
                        Delivery Performance
                      </Typography>
                      <TextField
                        value={config.deliveryWeight}
                        onChange={handleInputChange('deliveryWeight')}
                        type="number"
                        inputProps={{ min: 0, max: 100, step: 5 }}
                        size="small"
                        sx={{
                          width: 80,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '6px',
                            height: 32,
                            fontSize: '0.875rem'
                          }
                        }}
                        InputProps={{
                          endAdornment: <Typography variant="caption">%</Typography>
                        }}
                      />
                    </Box>
                    <Slider
                      value={config.deliveryWeight}
                      onChange={handleSliderChange('deliveryWeight')}
                      min={0}
                      max={100}
                      step={5}
                      marks
                      valueLabelDisplay="auto"
                      sx={{
                        '& .MuiSlider-thumb': {
                          width: 16,
                          height: 16
                        },
                        '& .MuiSlider-track': {
                          height: 4
                        },
                        '& .MuiSlider-rail': {
                          height: 4
                        }
                      }}
                    />
                  </Box>
                </Grid>

                {/* Quality Weight */}
                <Grid item xs={12} md={6}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          fontSize: '0.875rem'
                        }}
                      >
                        Quality Score
                      </Typography>
                      <TextField
                        value={config.qualityWeight}
                        onChange={handleInputChange('qualityWeight')}
                        type="number"
                        inputProps={{ min: 0, max: 100, step: 5 }}
                        size="small"
                        sx={{
                          width: 80,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '6px',
                            height: 32,
                            fontSize: '0.875rem'
                          }
                        }}
                        InputProps={{
                          endAdornment: <Typography variant="caption">%</Typography>
                        }}
                      />
                    </Box>
                    <Slider
                      value={config.qualityWeight}
                      onChange={handleSliderChange('qualityWeight')}
                      min={0}
                      max={100}
                      step={5}
                      marks
                      valueLabelDisplay="auto"
                      sx={{
                        '& .MuiSlider-thumb': {
                          width: 16,
                          height: 16
                        },
                        '& .MuiSlider-track': {
                          height: 4
                        },
                        '& .MuiSlider-rail': {
                          height: 4
                        }
                      }}
                    />
                  </Box>
                </Grid>

                {/* Compliance Weight */}
                <Grid item xs={12} md={6}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          fontSize: '0.875rem'
                        }}
                      >
                        Compliance
                      </Typography>
                      <TextField
                        value={config.complianceWeight}
                        onChange={handleInputChange('complianceWeight')}
                        type="number"
                        inputProps={{ min: 0, max: 100, step: 5 }}
                        size="small"
                        sx={{
                          width: 80,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '6px',
                            height: 32,
                            fontSize: '0.875rem'
                          }
                        }}
                        InputProps={{
                          endAdornment: <Typography variant="caption">%</Typography>
                        }}
                      />
                    </Box>
                    <Slider
                      value={config.complianceWeight}
                      onChange={handleSliderChange('complianceWeight')}
                      min={0}
                      max={100}
                      step={5}
                      marks
                      valueLabelDisplay="auto"
                      sx={{
                        '& .MuiSlider-thumb': {
                          width: 16,
                          height: 16
                        },
                        '& .MuiSlider-track': {
                          height: 4
                        },
                        '& .MuiSlider-rail': {
                          height: 4
                        }
                      }}
                    />
                  </Box>
                </Grid>

                {/* Cost Weight */}
                <Grid item xs={12} md={6}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          fontSize: '0.875rem'
                        }}
                      >
                        Cost Performance
                      </Typography>
                      <TextField
                        value={config.costWeight}
                        onChange={handleInputChange('costWeight')}
                        type="number"
                        inputProps={{ min: 0, max: 100, step: 5 }}
                        size="small"
                        sx={{
                          width: 80,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '6px',
                            height: 32,
                            fontSize: '0.875rem'
                          }
                        }}
                        InputProps={{
                          endAdornment: <Typography variant="caption">%</Typography>
                        }}
                      />
                    </Box>
                    <Slider
                      value={config.costWeight}
                      onChange={handleSliderChange('costWeight')}
                      min={0}
                      max={100}
                      step={5}
                      marks
                      valueLabelDisplay="auto"
                      sx={{
                        '& .MuiSlider-thumb': {
                          width: 16,
                          height: 16
                        },
                        '& .MuiSlider-track': {
                          height: 4
                        },
                        '& .MuiSlider-rail': {
                          height: 4
                        }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Total Weight Indicator */}
              <Box 
                mt={3} 
                p={2} 
                sx={{ 
                  borderRadius: '8px',
                  bgcolor: totalWeight === 100 ? 'success.lighter' : 'warning.lighter',
                  border: `1px solid ${totalWeight === 100 ? theme.palette.success.main : theme.palette.warning.main}`
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    color: totalWeight === 100 ? 'success.main' : 'warning.main',
                    fontSize: '0.875rem'
                  }}
                >
                  Total Weight: {totalWeight}%
                  {totalWeight !== 100 && ' (Must equal 100%)'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Alert Threshold */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '8px',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
              }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600,
                  mb: 3,
                  fontSize: '0.875rem'
                }}
              >
                Alert Threshold
              </Typography>

              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      fontSize: '0.875rem'
                    }}
                  >
                    Low Performance Alert Threshold
                  </Typography>
                  <TextField
                    value={config.alertThreshold}
                    onChange={handleInputChange('alertThreshold')}
                    type="number"
                    inputProps={{ min: 0, max: 100, step: 5 }}
                    size="small"
                    sx={{
                      width: 80,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '6px',
                        height: 32,
                        fontSize: '0.875rem'
                      }
                    }}
                    InputProps={{
                      endAdornment: <Typography variant="caption">%</Typography>
                    }}
                  />
                </Box>
                <Slider
                  value={config.alertThreshold}
                  onChange={handleSliderChange('alertThreshold')}
                  min={0}
                  max={100}
                  step={5}
                  marks
                  valueLabelDisplay="auto"
                  sx={{
                    '& .MuiSlider-thumb': {
                      width: 16,
                      height: 16
                    },
                    '& .MuiSlider-track': {
                      height: 4
                    },
                    '& .MuiSlider-rail': {
                      height: 4
                    }
                  }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    display: 'block',
                    mt: 1,
                    fontSize: '0.75rem'
                  }}
                >
                  Alert will be triggered when supplier score falls below this threshold
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={totalWeight !== 100}
                sx={{
                  height: 40,
                  px: 3,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: theme.shadows[2]
                  }
                }}
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