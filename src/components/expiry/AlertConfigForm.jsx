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
  InputAdornment,
  Typography,
  Alert
} from '@mui/material'
import { Warning, Info, Error as ErrorIcon } from '@mui/icons-material'
import { HexColorPicker } from 'react-colorful'

const SEVERITY_OPTIONS = [
  { value: 'INFO', label: 'Information', icon: <Info />, color: '#1976d2' },
  { value: 'WARNING', label: 'Warning', icon: <Warning />, color: '#f57c00' },
  { value: 'CRITICAL', label: 'Critical', icon: <ErrorIcon />, color: '#d32f2f' }
]

const ROLE_OPTIONS = [
  { value: 'HOSPITAL_MANAGER', label: 'Hospital Manager' },
  { value: 'PHARMACY_STAFF', label: 'Pharmacy Staff' },
  { value: 'PROCUREMENT_OFFICER', label: 'Procurement Officer' }
]

function AlertConfigForm({ open, onClose, onSubmit, config }) {
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {config ? 'Edit Alert Configuration' : 'Add Alert Configuration'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Tier Name"
            name="tierName"
            value={formData.tierName}
            onChange={handleChange}
            error={!!errors.tierName}
            helperText={errors.tierName}
            required
            sx={{ mb: 2 }}
            placeholder="e.g., Critical Alert, 30-Day Warning"
          />

          <TextField
            fullWidth
            type="number"
            label="Days Before Expiry"
            name="daysBeforeExpiry"
            value={formData.daysBeforeExpiry}
            onChange={handleChange}
            error={!!errors.daysBeforeExpiry}
            helperText={errors.daysBeforeExpiry || "Number of days before product expiry to trigger alert"}
            required
            InputProps={{
              inputProps: { min: 1, max: 365 }
            }}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Severity Level</InputLabel>
            <Select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              label="Severity Level"
              renderValue={(selected) => (
                <Box display="flex" alignItems="center">
                  {getSeverityIcon(selected)}
                  <Typography sx={{ ml: 1 }}>
                    {SEVERITY_OPTIONS.find(opt => opt.value === selected)?.label}
                  </Typography>
                </Box>
              )}
            >
              {SEVERITY_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  <Box display="flex" alignItems="center">
                    {option.icon}
                    <Typography sx={{ ml: 1 }}>{option.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.notifyRoles}>
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
                    />
                  ))}
                </Box>
              )}
            >
              {ROLE_OPTIONS.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
            {errors.notifyRoles && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.notifyRoles}
              </Typography>
            )}
          </FormControl>

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={2}
            sx={{ mb: 2 }}
            placeholder="Brief description of when this alert triggers"
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Alert Color
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: formData.colorCode,
                  borderRadius: 1,
                  border: '1px solid #ccc',
                  cursor: 'pointer'
                }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              <TextField
                value={formData.colorCode}
                onChange={handleChange}
                name="colorCode"
                size="small"
                sx={{ width: 120 }}
              />
            </Box>
            {showColorPicker && (
              <Box sx={{ mt: 2 }}>
                <HexColorPicker
                  color={formData.colorCode}
                  onChange={(color) => setFormData(prev => ({ ...prev, colorCode: color }))}
                />
              </Box>
            )}
          </Box>

          {config && (
            <Alert severity="info" sx={{ mb: 2 }}>
              This configuration affects {config.affectedProductCount || 0} products
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {config ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AlertConfigForm