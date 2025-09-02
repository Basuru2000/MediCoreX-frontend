// File: src/components/preferences/PrioritySettings.jsx
import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Grid,
  Chip,
  Card,
  LinearProgress,
  useTheme,
  alpha,
  Fade
} from '@mui/material';
import {
  Error as CriticalIcon,
  Warning as HighIcon,
  Info as MediumIcon,
  CheckCircle as LowIcon,
  FilterList as FilterIcon,
  NotificationImportant as AlertIcon
} from '@mui/icons-material';

const PrioritySettings = ({ preferences, onChange }) => {
  const theme = useTheme();
  
  const priorities = [
    { 
      value: 'LOW', 
      label: 'Low', 
      icon: <LowIcon />, 
      description: 'All notifications including informational',
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.1),
      examples: ['Reports ready', 'System updates', 'Regular maintenance']
    },
    { 
      value: 'MEDIUM', 
      label: 'Medium', 
      icon: <MediumIcon />, 
      description: 'Medium priority and above',
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.1),
      examples: ['New batches', 'User activities', 'Stock adjustments']
    },
    { 
      value: 'HIGH', 
      label: 'High', 
      icon: <HighIcon />, 
      description: 'Important and critical only',
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.1),
      examples: ['Low stock', 'Expiring soon', 'Approval needed']
    },
    { 
      value: 'CRITICAL', 
      label: 'Critical', 
      icon: <CriticalIcon />, 
      description: 'Only critical alerts',
      color: theme.palette.error.main,
      bgColor: alpha(theme.palette.error.main, 0.1),
      examples: ['Expired products', 'System failures', 'Security alerts']
    }
  ];

  const handlePriorityChange = (event) => {
    onChange({
      ...preferences,
      priorityThreshold: event.target.value
    });
  };

  const currentPriority = priorities.find(p => p.value === preferences.priorityThreshold) || priorities[0];
  const currentIndex = priorities.findIndex(p => p.value === preferences.priorityThreshold);
  const filteredCount = currentIndex + 1;

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Priority Filter
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Only receive notifications that meet or exceed your selected priority level
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Priority Selection */}
        <Grid item xs={12} md={7}>
          <Card 
            sx={{ 
              borderRadius: 2,
              boxShadow: 'none',
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden'
            }}
          >
            <Box 
              p={2} 
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <FilterIcon sx={{ color: theme.palette.primary.main }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Priority Threshold
                </Typography>
              </Box>
            </Box>
            
            <Box p={3}>
              <FormControl fullWidth>
                <InputLabel>Minimum Priority Level</InputLabel>
                <Select
                  value={preferences.priorityThreshold || 'LOW'}
                  onChange={handlePriorityChange}
                  label="Minimum Priority Level"
                  sx={{ borderRadius: 1 }}
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      <Box display="flex" alignItems="center" gap={1.5} width="100%">
                        <Box 
                          sx={{ 
                            color: priority.color,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {priority.icon}
                        </Box>
                        <Box flex={1}>
                          <Typography variant="body2" fontWeight={500}>
                            {priority.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {priority.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Visual Priority Scale */}
              <Box mt={3}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  NOTIFICATION VOLUME
                </Typography>
                <Box display="flex" gap={0.5} mt={1}>
                  {priorities.map((priority, index) => (
                    <Box
                      key={priority.value}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 1,
                        bgcolor: index <= currentIndex ? priority.color : theme.palette.action.disabledBackground,
                        transition: 'all 0.3s'
                      }}
                    />
                  ))}
                </Box>
                <Box display="flex" justifyContent="space-between" mt={0.5}>
                  <Typography variant="caption">More</Typography>
                  <Typography variant="caption">Less</Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Current Setting Display */}
        <Grid item xs={12} md={5}>
          <Fade in timeout={500}>
            <Card 
              sx={{ 
                borderRadius: 2,
                boxShadow: 'none',
                border: `2px solid ${currentPriority.color}`,
                bgcolor: currentPriority.bgColor,
                height: '100%'
              }}
            >
              <Box p={3}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      bgcolor: alpha(currentPriority.color, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: currentPriority.color
                    }}
                  >
                    {currentPriority.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {currentPriority.label} Priority
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Currently selected
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" paragraph>
                  {currentPriority.description}
                </Typography>
                
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  YOU WILL RECEIVE:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {priorities.slice(currentIndex).map(p => (
                    <Chip
                      key={p.value}
                      label={p.label}
                      size="small"
                      sx={{
                        bgcolor: alpha(p.color, 0.1),
                        color: p.color,
                        fontWeight: 500,
                        fontSize: '0.75rem'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Card>
          </Fade>
        </Grid>
      </Grid>

      {/* Priority Examples */}
      <Box mt={3}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Priority Examples
        </Typography>
        <Grid container spacing={2}>
          {priorities.map((priority, index) => (
            <Grid item xs={12} sm={6} md={3} key={priority.value}>
              <Card 
                sx={{ 
                  borderRadius: 1.5,
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  opacity: index >= currentIndex ? 1 : 0.5,
                  transition: 'all 0.3s',
                  height: '100%'
                }}
              >
                <Box 
                  p={2} 
                  sx={{ 
                    bgcolor: priority.bgColor,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ color: priority.color, fontSize: 20 }}>
                      {priority.icon}
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {priority.label}
                    </Typography>
                  </Box>
                </Box>
                <Box p={2}>
                  {priority.examples.map((example, i) => (
                    <Typography 
                      key={i} 
                      variant="caption" 
                      display="block" 
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      • {example}
                    </Typography>
                  ))}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Info Alert */}
      <Alert 
        severity="info" 
        icon={<AlertIcon />}
        sx={{ 
          mt: 3,
          borderRadius: 1.5,
          '& .MuiAlert-icon': {
            fontSize: 24
          }
        }}
      >
        <Typography variant="body2">
          <strong>Important:</strong> Critical notifications will always bypass quiet hours and other filters to ensure you receive urgent alerts about system failures, expired products, and security issues.
        </Typography>
      </Alert>
    </Box>
  );
};

export default PrioritySettings;