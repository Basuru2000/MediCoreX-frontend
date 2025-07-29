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
  Badge
} from '@mui/material'
import {
  Edit,
  Delete,
  Warning,
  Info,
  Error as ErrorIcon,
  Notifications,
  People,
  DragIndicator
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'

function AlertTierCard({ config, onEdit, onDelete, onToggle, onDragStart, onDragEnd, draggable }) {
  const { isManager } = useAuth()
  const [dragOver, setDragOver] = useState(false)

  const getSeverityIcon = () => {
    switch (config.severity) {
      case 'CRITICAL':
        return <ErrorIcon sx={{ color: '#d32f2f' }} />
      case 'WARNING':
        return <Warning sx={{ color: '#f57c00' }} />
      case 'INFO':
        return <Info sx={{ color: '#1976d2' }} />
      default:
        return null
    }
  }

  const handleDragStart = (e) => {
    if (draggable && onDragStart) {
      onDragStart(e, config)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (onDragEnd) {
      onDragEnd(e, config)
    }
  }

  return (
    <Card
      draggable={draggable && isManager}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        position: 'relative',
        borderLeft: 4,
        borderLeftColor: config.colorCode || '#ccc',
        opacity: config.active ? 1 : 0.6,
        cursor: draggable && isManager ? 'move' : 'default',
        backgroundColor: dragOver ? 'action.hover' : 'background.paper',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 3
        }
      }}
    >
      {draggable && isManager && (
        <Box
          sx={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'text.secondary'
          }}
        >
          <DragIndicator />
        </Box>
      )}

      <CardContent sx={{ pl: draggable && isManager ? 5 : 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            {getSeverityIcon()}
            <Typography variant="h6">
              {config.tierName}
            </Typography>
          </Box>
          <Chip
            label={`${config.daysBeforeExpiry} days`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        {config.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {config.description}
          </Typography>
        )}

        <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
          {config.notifyRoles?.map(role => (
            <Chip
              key={role}
              icon={<People />}
              label={role.replace('_', ' ')}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" gap={2}>
            <Tooltip title="Active alerts">
              <Badge badgeContent={config.activeAlertCount || 0} color="warning">
                <Notifications color="action" />
              </Badge>
            </Tooltip>
            <Typography variant="caption" color="text.secondary">
              {config.affectedProductCount || 0} products affected
            </Typography>
          </Box>

          {isManager && (
            <Box display="flex" alignItems="center">
              <Tooltip title={config.active ? 'Active' : 'Inactive'}>
                <Switch
                  checked={config.active}
                  onChange={() => onToggle(config.id)}
                  size="small"
                />
              </Tooltip>
            </Box>
          )}
        </Box>
      </CardContent>

      {isManager && (
        <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
          <Tooltip title="Edit configuration">
            <IconButton size="small" onClick={() => onEdit(config)}>
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete configuration">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(config.id)}
              disabled={config.activeAlertCount > 0}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </CardActions>
      )}
    </Card>
  )
}

export default AlertTierCard