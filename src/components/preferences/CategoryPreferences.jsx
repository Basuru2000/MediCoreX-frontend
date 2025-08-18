import React from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip
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
  const categories = [
    { code: 'STOCK', label: 'Stock Alerts', icon: <StockIcon />, description: 'Low stock and inventory updates' },
    { code: 'EXPIRY', label: 'Expiry Alerts', icon: <ExpiryIcon />, description: 'Product expiration notifications' },
    { code: 'BATCH', label: 'Batch Updates', icon: <BatchIcon />, description: 'Batch creation and modifications' },
    { code: 'QUARANTINE', label: 'Quarantine', icon: <QuarantineIcon />, description: 'Quarantine status changes' },
    { code: 'USER', label: 'User Activity', icon: <UserIcon />, description: 'User account notifications' },
    { code: 'SYSTEM', label: 'System', icon: <SystemIcon />, description: 'System updates and maintenance' },
    { code: 'APPROVAL', label: 'Approvals', icon: <ApprovalIcon />, description: 'Approval requests and responses' },
    { code: 'REPORT', label: 'Reports', icon: <ReportIcon />, description: 'Report generation notifications' },
    { code: 'PROCUREMENT', label: 'Procurement', icon: <ProcurementIcon />, description: 'Purchase orders and deliveries' }
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

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Category Preferences
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose which types of notifications you want to receive and how often.
      </Typography>

      <Grid container spacing={2}>
        {categories.map((category) => (
          <Grid item xs={12} md={6} key={category.code}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    {category.icon}
                    <Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences.categoryPreferences?.[category.code] ?? true}
                            onChange={handleCategoryToggle(category.code)}
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="subtitle2">
                            {category.label}
                          </Typography>
                        }
                      />
                      <Typography variant="caption" display="block" color="text.secondary">
                        {category.description}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {preferences.categoryPreferences?.[category.code] && (
                  <FormControl size="small" fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      value={preferences.frequencySettings?.[category.code] || 'IMMEDIATE'}
                      onChange={handleFrequencyChange(category.code)}
                      label="Frequency"
                    >
                      <MenuItem value="IMMEDIATE">Immediate</MenuItem>
                      <MenuItem value="HOURLY_DIGEST">Hourly Digest</MenuItem>
                      <MenuItem value="DAILY_DIGEST">Daily Digest</MenuItem>
                      <MenuItem value="WEEKLY_DIGEST">Weekly Digest</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoryPreferences;