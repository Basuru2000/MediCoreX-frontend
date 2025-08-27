import React from 'react';
import { Chip, Tooltip, IconButton } from '@mui/material';
import { 
  Circle as CircleIcon,
  Refresh as RefreshIcon,
  WifiOff as WifiOffIcon,
  Wifi as WifiIcon 
} from '@mui/icons-material';
import { useWebSocketContext } from '../../context/WebSocketContext';
import './WebSocketStatus.css';

const WebSocketStatus = ({ compact = false }) => {
  const { connected, connectionStatus, connect, disconnect, error } = useWebSocketContext();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'success';
      case 'connecting':
        return 'warning';
      case 'disconnected':
        return 'default';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Live';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Offline';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <WifiIcon fontSize="small" className="websocket-connected" />;
      case 'connecting':
        return <RefreshIcon fontSize="small" className="rotating-icon websocket-connecting" />;
      case 'disconnected':
        return <WifiOffIcon fontSize="small" className="websocket-disconnected" />;
      case 'error':
        return <WifiOffIcon fontSize="small" className="websocket-error" />;
      default:
        return <CircleIcon fontSize="small" />;
    }
  };

  const handleReconnect = () => {
    if (!connected) {
      connect();
    }
  };

  // FIX: Don't toggle connection on click for connected state
  const handleClick = () => {
    // Only reconnect if disconnected, don't disconnect if connected
    if (!connected) {
      connect();
    }
    // Remove the toggle behavior that was disconnecting
  };

  if (compact) {
    return (
      <Tooltip title={`WebSocket: ${getStatusText()}${error ? ` - ${error}` : ''}`}>
        <IconButton 
          size="small" 
          color={getStatusColor()}
          onClick={handleReconnect}
          disabled={connectionStatus === 'connecting'}
          className={connectionStatus === 'connecting' ? 'connecting-pulse' : ''}
        >
          {getStatusIcon()}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Chip
      icon={getStatusIcon()}
      label={getStatusText()}
      color={getStatusColor()}
      size="small"
      onClick={handleClick} // Only reconnect, don't disconnect
      onDelete={connectionStatus === 'error' || connectionStatus === 'disconnected' ? handleReconnect : undefined}
      deleteIcon={<RefreshIcon />}
      variant={connected ? "filled" : "outlined"}
      className={`websocket-status-chip ${connectionStatus === 'connecting' ? 'connecting-pulse' : ''}`}
      style={{ cursor: connected ? 'default' : 'pointer' }} // No pointer when connected
    />
  );
};

export default WebSocketStatus;