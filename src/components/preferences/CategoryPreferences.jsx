// File: src/components/preferences/CategoryPreferences.jsx
import React from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  useTheme,
  alpha,
  Fade
} from '@mui/material';
import {
  Block as QuarantineIcon,
  Inventory as StockIcon,
  Schedule as ExpiryIcon,
  Category as BatchIcon,
  Person as UserIcon,
  Settings as SystemIcon,
  CheckCircleOutline as ApprovalIcon,
  Assessment as ReportIcon,
  LocalShipping as ProcurementIcon
} from '@mui/icons-material';

const CategoryPreferences = ({ preferences, onChange }) => {
  const theme = useTheme();
  
  const categories = [
    { 
      code: 'STOCK', 
      label: 'Stock Alerts', 
      icon: <StockIcon />, 
      description: 'Low stock and inventory updates',
      color: theme.palette.warning.main
    },
    { 
      code: 'EXPIRY', 
      label: 'Expiry Alerts', 
      icon: <ExpiryIcon />, 
      description: 'Product expiration notifications',
      color: theme.palette.error.main
    },
    { 
      code: 'BATCH', 
      label: 'Batch Updates', 
      icon: <BatchIcon />, 
      description: 'Batch creation and modifications',
      color: theme.palette.info.main
    },
    { 
      code: 'QUARANTINE', 
      label: 'Quarantine', 
      icon: <QuarantineIcon />, 
      description: 'Quarantine status changes',
      color: theme.palette.secondary.main
    },
    { 
      code: 'USER', 
      label: 'User Activity', 
      icon: <UserIcon />, 
      description: 'User account notifications',
      color: theme.palette.primary.main
    },
    { 
      code: 'SYSTEM', 
      label: 'System', 
      icon: <SystemIcon />, 
      description: 'System updates and maintenance',
      color: theme.palette.grey[600]
    },
    { 
      code: 'APPROVAL', 
      label: 'Approvals', 
      icon: <ApprovalIcon />, 
      description: 'Approval requests and responses',
      color: theme.palette.success.main
    },
    { 
      code: 'REPORT', 
      label: 'Reports', 
      icon: <ReportIcon />, 
      description: 'Report generation notifications',
      color: theme.palette.primary.dark
    },
    { 
      code: 'PROCUREMENT', 
      label: 'Procurement', 
      icon: <ProcurementIcon />, 
      description: 'Purchase orders and deliveries',
      color: theme.palette.info.dark
    }
  ];

  const handleCategoryToggle = (category) => (event) => {
    const newCategoryPrefs = {
      ...preferences.categoryPreferences,
      [category]: event.target.checked
    };
    onChange({
      ...preferences,
      categoryPreferences: newCategoryPrefs
    });
  };

  const handleFrequencyChange = (category) => (event) => {
    const newFrequencySettings = {
      ...preferences.frequencySettings,
      [category]: event.target.value
    };
    onChange({
      ...preferences,
      frequencySettings: newFrequencySettings
    });
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      'IMMEDIATE': 'Immediate',
      'HOURLY_DIGEST': 'Hourly',
      'DAILY_DIGEST': 'Daily',
      'WEEKLY_DIGEST': 'Weekly',
      'DISABLED': 'Disabled'
    };
    return labels[frequency] || 'Immediate';
  };

  const getFrequencyColor = (frequency) => {
    const colors = {
      'IMMEDIATE': 'primary',
      'HOURLY_DIGEST': 'info',
      'DAILY_DIGEST': 'warning',
      'WEEKLY_DIGEST': 'secondary',
      'DISABLED': 'default'
    };
    return colors[frequency] || 'default';
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Category Preferences
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose which types of notifications you want to receive and how often
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {categories.map((category, index) => (
          <Fade in timeout={300 + index * 50} key={category.code}>
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  borderRadius: 2,
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.3s',
                  opacity: preferences.categoryPreferences?.[category.code] ? 1 : 0.8,
                  '&:hover': {
                    borderColor: category.color,
                    boxShadow: `0 4px 12px ${alpha(category.color, 0.15)}`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box p={2.5}>
                  {/* Header */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          bgcolor: alpha(category.color, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: category.color
                        }}
                      >
                        {category.icon}
                      </Box>
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {category.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {category.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      checked={preferences.categoryPreferences?.[category.code] ?? true}
                      onChange={handleCategoryToggle(category.code)}
                      color="primary"
                      size="small"
                    />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Frequency Setting */}
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Delivery frequency:
                    </Typography>
                    {preferences.categoryPreferences?.[category.code] ? (
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={preferences.frequencySettings?.[category.code] || 'IMMEDIATE'}
                          onChange={handleFrequencyChange(category.code)}
                          sx={{
                            fontSize: '0.875rem',
                            '& .MuiSelect-select': {
                              py: 0.5,
                              px: 1.5
                            }
                          }}
                        >
                          <MenuItem value="IMMEDIATE">
                            <Typography variant="caption">Immediate</Typography>
                          </MenuItem>
                          <MenuItem value="HOURLY_DIGEST">
                            <Typography variant="caption">Hourly</Typography>
                          </MenuItem>
                          <MenuItem value="DAILY_DIGEST">
                            <Typography variant="caption">Daily</Typography>
                          </MenuItem>
                          <MenuItem value="WEEKLY_DIGEST">
                            <Typography variant="caption">Weekly</Typography>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip 
                        label="Disabled" 
                        size="small" 
                        sx={{ 
                          height: 24,
                          fontSize: '0.75rem',
                          bgcolor: alpha(theme.palette.action.disabled, 0.1)
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Fade>
        ))}
      </Grid>

      {/* Summary Stats */}
      <Box 
        mt={4} 
        p={3} 
        sx={{ 
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          border: `1px dashed ${theme.palette.divider}`
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Category Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Object.values(preferences.categoryPreferences || {}).filter(v => v).length} of {categories.length} categories enabled
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              {['IMMEDIATE', 'DAILY_DIGEST'].map(freq => {
                const count = Object.values(preferences.frequencySettings || {}).filter(v => v === freq).length;
                return count > 0 ? (
                  <Chip
                    key={freq}
                    label={`${count} ${getFrequencyLabel(freq)}`}
                    size="small"
                    color={getFrequencyColor(freq)}
                    variant="outlined"
                  />
                ) : null;
              })}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CategoryPreferences;