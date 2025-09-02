import { useState } from 'react'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Switch,
  Tooltip,
  Badge,
  Stack,
  useTheme,
  alpha,
  Divider
} from '@mui/material'
import {
  Edit,
  Delete,
  Warning,
  Info,
  Error as ErrorIcon,
  Notifications,
  People,
  Schedule,
  Circle,
  DragIndicator
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'

function AlertTierCard({ config, onEdit, onDelete, onToggle, isDragging, isDraggable }) {
  const theme = useTheme()
  const { isManager } = useAuth()
  const [isHovered, setIsHovered] = useState(false)

  const getSeverityIcon = () => {
    switch (config.severity) {
      case 'CRITICAL':
        return <ErrorIcon sx={{ fontSize: 20 }} />
      case 'WARNING':
        return <Warning sx={{ fontSize: 20 }} />
      case 'INFO':
        return <Info sx={{ fontSize: 20 }} />
      default:
        return null
    }
  }

  const getSeverityColor = () => {
    switch (config.severity) {
      case 'CRITICAL':
        return theme.palette.error.main
      case 'WARNING':
        return theme.palette.warning.main
      case 'INFO':
        return theme.palette.info.main
      default:
        return theme.palette.grey[500]
    }
  }

  // Check if delete should be disabled
  const deleteDisabled = (config.alertCount && config.alertCount > 0) || false

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: 'relative',
        height: '100%',
        borderRadius: '12px',
        boxShadow: isDragging ? 2 : 'none',
        border: `1px solid ${theme.palette.divider}`,
        opacity: config.active ? 1 : 0.7,
        cursor: isDraggable && config.active ? 'grab' : 'default',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        '&:hover': {
          transform: isDragging ? 'none' : 'translateY(-2px)',
          boxShadow: isDragging ? 2 : 1,
          borderColor: config.active ? theme.palette.primary.light : theme.palette.divider
        }
      }}
    >
      {/* Color Bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: config.colorCode || getSeverityColor(),
          transition: 'height 0.2s',
          ...(isHovered && { height: 6 })
        }}
      />

      {/* Drag Indicator */}
      {isManager && isDraggable && config.active && (
        <Box
          sx={{
            position: 'absolute',
            left: 12,
            top: 16,
            color: 'text.secondary',
            opacity: isHovered ? 0.6 : 0.3,
            transition: 'opacity 0.2s'
          }}
        >
          <DragIndicator fontSize="small" />
        </Box>
      )}

      <CardContent sx={{ pt: 2.5, pl: isManager && isDraggable && config.active ? 5 : 2 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                bgcolor: alpha(getSeverityColor(), 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: getSeverityColor()
              }}
            >
              {getSeverityIcon()}
            </Box>
            <Box>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  lineHeight: 1.2
                }}
              >
                {config.tierName}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {config.daysBeforeExpiry} days before
                </Typography>
              </Stack>
            </Box>
          </Stack>
          
          {/* Status Badge */}
          <Chip
            label={config.severity}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.7rem',
              fontWeight: 600,
              borderRadius: '6px',
              bgcolor: alpha(getSeverityColor(), 0.1),
              color: getSeverityColor(),
              border: `1px solid ${alpha(getSeverityColor(), 0.3)}`
            }}
          />
        </Stack>

        {/* Description */}
        {config.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.5
            }}
          >
            {config.description}
          </Typography>
        )}

        {/* Notify Roles */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Notifies:
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {config.notifyRoles?.map(role => (
              <Chip
                key={role}
                icon={<People sx={{ fontSize: 14 }} />}
                label={role.replace(/_/g, ' ')}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  '& .MuiChip-icon': {
                    fontSize: 14,
                    ml: 0.5
                  },
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Statistics */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={3}>
            <Tooltip title="Active alerts">
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Badge 
                  badgeContent={config.alertCount || 0} 
                  color="warning"
                  max={99}
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.65rem',
                      height: 18,
                      minWidth: 18,
                      borderRadius: '6px'
                    }
                  }}
                >
                  <Notifications sx={{ fontSize: 18, color: 'text.secondary' }} />
                </Badge>
              </Stack>
            </Tooltip>
            
            <Typography variant="caption" color="text.secondary">
              {config.affectedProductCount || 0} products
            </Typography>
          </Stack>

          {/* Active Toggle */}
          {isManager && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Circle 
                sx={{ 
                  fontSize: 8,
                  color: config.active ? theme.palette.success.main : theme.palette.grey[400]
                }} 
              />
              <Tooltip title={config.active ? 'Active' : 'Inactive'}>
                <Switch
                  checked={config.active}
                  onChange={() => onToggle(config.id)}
                  size="small"
                  sx={{
                    '& .MuiSwitch-track': {
                      borderRadius: 12
                    }
                  }}
                />
              </Tooltip>
            </Stack>
          )}
        </Stack>
      </CardContent>

      {/* Actions */}
      {isManager && (
        <CardActions 
          sx={{ 
            px: 2,
            pb: 2,
            pt: 0,
            gap: 1,
            justifyContent: 'flex-end'
          }}
        >
          <Tooltip title="Edit configuration">
            <IconButton 
              size="small" 
              onClick={() => onEdit(config)}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '6px',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderColor: theme.palette.primary.main
                }
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={deleteDisabled ? 'Cannot delete - has active alerts' : 'Delete configuration'}>
            <span>
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(config.id)}
                disabled={deleteDisabled}
                sx={{
                  border: `1px solid ${deleteDisabled ? theme.palette.divider : alpha(theme.palette.error.main, 0.5)}`,
                  borderRadius: '6px',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.error.main, 0.05),
                    borderColor: theme.palette.error.main
                  },
                  '&:disabled': {
                    borderColor: theme.palette.divider
                  }
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </CardActions>
      )}
    </Card>
  )
}

export default AlertTierCard