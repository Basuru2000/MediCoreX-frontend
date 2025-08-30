import React from 'react'
import { 
  Box, 
  Typography, 
  Chip,
  Stack,
  useTheme,
  alpha 
} from '@mui/material'
import { Circle } from '@mui/icons-material'

const ExpiryCalendarLegend = () => {
  const theme = useTheme()
  
  const legendItems = [
    { 
      label: 'Critical (≤7 days)', 
      color: theme.palette.error.main,
      bgColor: alpha(theme.palette.error.main, 0.1)
    },
    { 
      label: 'Warning (8-30 days)', 
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.1)
    },
    { 
      label: 'Medium (31-60 days)', 
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.1)
    },
    { 
      label: 'Normal (61+ days)', 
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.1)
    }
  ]
  
  return (
    <Box 
      sx={{ 
        mt: 3,
        p: 2,
        bgcolor: 'background.default',
        borderRadius: '8px',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Typography 
        variant="caption" 
        sx={{ 
          fontWeight: 600,
          color: 'text.secondary',
          mb: 1.5,
          display: 'block'
        }}
      >
        SEVERITY LEVELS
      </Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {legendItems.map(item => (
          <Box 
            key={item.label}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.75
            }}
          >
            <Circle 
              sx={{ 
                fontSize: 10, 
                color: item.color 
              }} 
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 500
              }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

export default ExpiryCalendarLegend