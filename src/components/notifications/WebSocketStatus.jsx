import React from 'react'
import { 
  Chip, 
  Tooltip, 
  IconButton,
  Box,
  Typography,
  Stack,
  alpha,
  useTheme
} from '@mui/material'
import { 
  Circle as CircleIcon,
  Refresh as RefreshIcon,
  WifiOff as WifiOffIcon,
  Wifi as WifiIcon,
  Sync
} from '@mui/icons-material'
import { useWebSocketContext } from '../../context/WebSocketContext'
import './WebSocketStatus.css'

const WebSocketStatus = ({ compact = false }) => {
  const theme = useTheme()
  const { connected, connectionStatus, connect, disconnect, error } = useWebSocketContext()

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          label: compact ? 'Live' : 'Connected',
          color: theme.palette.success.main,
          bgColor: alpha(theme.palette.success.main, 0.1),
          icon: <WifiIcon fontSize="small" />,
          tooltip: 'Real-time updates active'
        }
      case 'connecting':
        return {
          label: compact ? 'Connecting' : 'Connecting...',
          color: theme.palette.warning.main,
          bgColor: alpha(theme.palette.warning.main, 0.1),
          icon: <Sync fontSize="small" className="rotating-icon" />,
          tooltip: 'Establishing connection to server...'
        }
      case 'error':
        return {
          label: compact ? 'Error' : 'Connection Error',
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, 0.1),
          icon: <WifiOffIcon fontSize="small" />,
          tooltip: error || 'Connection error occurred'
        }
      case 'disconnected':
      default:
        return {
          label: compact ? 'Offline' : 'Disconnected',
          color: theme.palette.grey[600],
          bgColor: alpha(theme.palette.grey[600], 0.1),
          icon: <WifiOffIcon fontSize="small" />,
          tooltip: 'Click to connect'
        }
    }
  }

  const config = getStatusConfig()

  const handleClick = () => {
    // Only reconnect if disconnected, don't disconnect if connected
    if (!connected) {
      connect()
    }
  }

  const handleReconnect = () => {
    if (!connected) {
      connect()
    }
  }

  if (compact) {
    return (
      <Tooltip title={config.tooltip} arrow placement="bottom">
        <IconButton 
          size="small" 
          onClick={handleReconnect}
          disabled={connectionStatus === 'connecting'}
          sx={{
            color: config.color,
            backgroundColor: config.bgColor,
            border: `1px solid ${alpha(config.color, 0.2)}`,
            '&:hover': {
              backgroundColor: alpha(config.color, 0.15),
              transform: 'translateY(-1px)'
            },
            '&:disabled': {
              color: config.color,
              opacity: 0.7
            },
            transition: 'all 0.2s'
          }}
        >
          {connectionStatus === 'connecting' ? (
            <Sync fontSize="small" className="rotating-icon" />
          ) : (
            config.icon
          )}
        </IconButton>
      </Tooltip>
    )
  }

  return (
    <Tooltip title={config.tooltip} arrow placement="bottom">
      <Chip
        size="small"
        icon={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: config.color,
              ml: 0.5,
              '& .rotating-icon': {
                animation: 'spin 1s linear infinite'
              },
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          >
            {connectionStatus === 'connecting' ? (
              <Sync fontSize="small" className="rotating-icon" />
            ) : (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <CircleIcon 
                  sx={{ 
                    fontSize: 8,
                    color: config.color,
                    animation: connected ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.4 },
                      '100%': { opacity: 1 }
                    }
                  }} 
                />
                {config.icon}
              </Stack>
            )}
          </Box>
        }
        label={config.label}
        onClick={handleClick}
        onDelete={(connectionStatus === 'error' || connectionStatus === 'disconnected') ? handleReconnect : undefined}
        deleteIcon={<RefreshIcon fontSize="small" />}
        sx={{
          height: 28,
          backgroundColor: config.bgColor,
          border: `1px solid ${alpha(config.color, 0.2)}`,
          cursor: connected ? 'default' : 'pointer',
          '& .MuiChip-label': {
            px: 1,
            fontWeight: 600,
            fontSize: '0.75rem',
            color: config.color,
            letterSpacing: '0.025em'
          },
          '& .MuiChip-icon': {
            mr: 0.25
          },
          '& .MuiChip-deleteIcon': {
            color: config.color,
            '&:hover': {
              color: config.color,
              opacity: 0.8
            }
          },
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: alpha(config.color, 0.15),
            transform: connected ? 'none' : 'translateY(-1px)',
            boxShadow: connected ? 'none' : `0 2px 8px ${alpha(config.color, 0.2)}`
          }
        }}
      />
    </Tooltip>
  )
}

export default WebSocketStatus