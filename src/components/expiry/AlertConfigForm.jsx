import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Typography,
  Alert,
  Stack,
  IconButton,
  Divider,
  useTheme,
  alpha,
  Grid,
  FormHelperText,
  Tooltip
} from '@mui/material'
import { 
  Warning, 
  Info, 
  Error as ErrorIcon,
  Close,
  Palette,
  Schedule,
  Notifications
} from '@mui/icons-material'
import { HexColorPicker } from 'react-colorful'

const SEVERITY_OPTIONS = [
  { value: 'INFO', label: 'Information', icon: <Info fontSize="small" />, color: '#1976d2' },
  { value: 'WARNING', label: 'Warning', icon: <Warning fontSize="small" />, color: '#f57c00' },
  { value: 'CRITICAL', label: 'Critical', icon: <ErrorIcon fontSize="small" />, color: '#d32f2f' }
]

const ROLE_OPTIONS = [
  { value: 'HOSPITAL_MANAGER', label: 'Hospital Manager' },
  { value: 'PHARMACY_STAFF', label: 'Pharmacy Staff' },
  { value: 'PROCUREMENT_OFFICER', label: 'Procurement Officer' }
]

function AlertConfigForm({ open, onClose, onSubmit, config }) {
  const theme = useTheme()
  const [formData, setFormData] = useState({
    tierName: '',
    daysBeforeExpiry: '',
    severity: 'WARNING',
    description: '',
    active: true,
    notifyRoles: [],
    colorCode: '#fbc02d',
    sortOrder: null
  })

  const [errors, setErrors] = useState({})
  const [showColorPicker, setShowColorPicker] = useState(false)

  useEffect(() => {
    if (config) {
      setFormData({
        tierName: config.tierName || '',
        daysBeforeExpiry: config.daysBeforeExpiry || '',
        severity: config.severity || 'WARNING',
        description: config.description || '',
        active: config.active !== undefined ? config.active : true,
        notifyRoles: config.notifyRoles || [],
        colorCode: config.colorCode || '#fbc02d',
        sortOrder: config.sortOrder || null
      })
    } else {
      setFormData({
        tierName: '',
        daysBeforeExpiry: '',
        severity: 'WARNING',
        description: '',
        active: true,
        notifyRoles: [],
        colorCode: '#fbc02d',
        sortOrder: null
      })
    }
    setErrors({})
  }, [config, open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleRoleChange = (event) => {
    const value = event.target.value
    setFormData(prev => ({
      ...prev,
      notifyRoles: typeof value === 'string' ? value.split(',') : value
    }))
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.tierName.trim()) {
      newErrors.tierName = 'Tier name is required'
    }

    if (!formData.daysBeforeExpiry) {
      newErrors.daysBeforeExpiry = 'Days before expiry is required'
    } else if (formData.daysBeforeExpiry < 1 || formData.daysBeforeExpiry > 365) {
      newErrors.daysBeforeExpiry = 'Days must be between 1 and 365'
    }

    if (formData.notifyRoles.length === 0) {
      newErrors.notifyRoles = 'At least one role must be selected'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      const submitData = {
        ...formData,
        daysBeforeExpiry: parseInt(formData.daysBeforeExpiry)
      }
      onSubmit(submitData)
    }
  }

  const getSeverityIcon = (severity) => {
    const option = SEVERITY_OPTIONS.find(opt => opt.value === severity)
    return option ? option.icon : null
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Notifications sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {config ? 'Edit Alert Configuration' : 'Add Alert Configuration'}
            </Typography>
          </Stack>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: 'text.secondary' }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2.5}>
          {/* Tier Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tier Name"
              name="tierName"
              value={formData.tierName}
              onChange={handleChange}
              error={!!errors.tierName}
              helperText={errors.tierName}
              required
              placeholder="e.g., Critical Alert, 30-Day Warning"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
          </Grid>

          {/* Days Before Expiry */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Days Before Expiry"
              name="daysBeforeExpiry"
              value={formData.daysBeforeExpiry}
              onChange={handleChange}
              error={!!errors.daysBeforeExpiry}
              helperText={errors.daysBeforeExpiry || "Days before product expiry"}
              required
              InputProps={{
                inputProps: { min: 1, max: 365 },
                startAdornment: (
                  <Schedule sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
          </Grid>

          {/* Severity Level */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Severity Level</InputLabel>
              <Select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                label="Severity Level"
                renderValue={(selected) => {
                  const option = SEVERITY_OPTIONS.find(opt => opt.value === selected)
                  return (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {option?.icon}
                      <Typography variant="body2">{option?.label}</Typography>
                    </Stack>
                  )
                }}
                sx={{
                  borderRadius: '8px'
                }}
              >
                {SEVERITY_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ color: option.color }}>
                        {option.icon}
                      </Box>
                      <Typography>{option.label}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Notify Roles */}
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.notifyRoles}>
              <InputLabel>Notify Roles</InputLabel>
              <Select
                multiple
                value={formData.notifyRoles}
                onChange={handleRoleChange}
                label="Notify Roles"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={ROLE_OPTIONS.find(role => role.value === value)?.label}
                        size="small"
                        sx={{
                          borderRadius: '6px',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          '& .MuiChip-label': {
                            px: 1,
                            fontSize: '0.75rem'
                          }
                        }}
                      />
                    ))}
                  </Box>
                )}
                sx={{
                  borderRadius: '8px'
                }}
              >
                {ROLE_OPTIONS.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.notifyRoles && (
                <FormHelperText>{errors.notifyRoles}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="Brief description of when this alert triggers"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
          </Grid>

          {/* Alert Color */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              Alert Color
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Tooltip title="Click to change color">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    backgroundColor: formData.colorCode,
                    borderRadius: '8px',
                    border: `2px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: `0 0 0 4px ${alpha(formData.colorCode, 0.2)}`
                    }
                  }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                >
                  <Palette sx={{ color: 'white', fontSize: 20 }} />
                </Box>
              </Tooltip>
              <TextField
                value={formData.colorCode}
                onChange={handleChange}
                name="colorCode"
                size="small"
                sx={{
                  width: 120,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '6px',
                    fontFamily: 'monospace'
                  }
                }}
              />
            </Stack>
            {showColorPicker && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: 'background.default',
                borderRadius: '8px',
                border: `1px solid ${theme.palette.divider}`
              }}>
                <HexColorPicker
                  color={formData.colorCode}
                  onChange={(color) => setFormData(prev => ({ ...prev, colorCode: color }))}
                  style={{ width: '100%' }}
                />
              </Box>
            )}
          </Grid>

          {/* Info Alert */}
          {config && (
            <Grid item xs={12}>
              <Alert 
                severity="info" 
                sx={{ 
                  borderRadius: '8px',
                  '& .MuiAlert-icon': {
                    color: theme.palette.info.main
                  }
                }}
              >
                This configuration affects {config.affectedProductCount || 0} products
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2.5 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            borderRadius: '6px',
            textTransform: 'none',
            px: 3
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          sx={{ 
            borderRadius: '6px',
            textTransform: 'none',
            px: 3,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' }
          }}
        >
          {config ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AlertConfigForm