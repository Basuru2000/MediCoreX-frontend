import { useState, useEffect, useCallback, useRef } from 'react';
import webSocketService from '../services/websocket';

const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);
  
  const listenersRef = useRef([]);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No authentication token found');
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      await webSocketService.connect(token);
      setConnected(true);
      setConnectionStatus('connected');
      setError(null);
    } catch (err) {
      console.error('WebSocket connection failed:', err);
      setConnected(false);
      setConnectionStatus('error');
      setError(err.message);
    }
  }, []);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    webSocketService.disconnect();
    setConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  // Send message
  const sendMessage = useCallback((destination, message) => {
    if (!connected) {
      console.warn('Cannot send message - WebSocket not connected');
      return false;
    }
    
    return webSocketService.sendMessage(destination, message);
  }, [connected]);

  // Subscribe to channel
  const subscribe = useCallback((channel, callback) => {
    if (!connected) {
      console.warn('Cannot subscribe - WebSocket not connected');
      return null;
    }
    
    return webSocketService.subscribe(channel, callback);
  }, [connected]);

  // Unsubscribe from channel
  const unsubscribe = useCallback((channel) => {
    webSocketService.unsubscribe(channel);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    return webSocketService.markNotificationAsRead(notificationId);
  }, []);

  // Setup event listeners
  useEffect(() => {
    // Connection status listener
    const unsubConnected = webSocketService.addEventListener('connected', () => {
      setConnected(true);
      setConnectionStatus('connected');
    });

    const unsubDisconnected = webSocketService.addEventListener('disconnected', () => {
      setConnected(false);
      setConnectionStatus('disconnected');
    });

    const unsubError = webSocketService.addEventListener('error', (data) => {
      setError(data.error);
      setConnectionStatus('error');
    });

    // Notification listener
    const unsubNotification = webSocketService.addEventListener('notification', (message) => {
      setLastMessage(message);
      
      // Handle different message types
      if (message.type === 'COUNT_UPDATE') {
        // FIX: Handle count updates specifically
        if (message.unreadCount !== undefined) {
          setUnreadCount(message.unreadCount);
        }
      } else if (message.notification) {
        // Add new notification to list
        setNotifications(prev => [message.notification, ...prev]);
        
        // Update count if provided
        if (message.unreadCount !== undefined) {
          setUnreadCount(message.unreadCount);
        }
      } else if (message.eventType === 'NEW_NOTIFICATION') {
        // Handle WebSocketNotification type
        if (message.notification) {
          setNotifications(prev => [message.notification, ...prev]);
        }
        if (message.unreadCount !== undefined) {
          setUnreadCount(message.unreadCount);
        }
      }
    });

    // Update listener
    const unsubUpdate = webSocketService.addEventListener('update', (message) => {
      setLastMessage(message);
    });

    // Alert listener
    const unsubAlert = webSocketService.addEventListener('alert', (message) => {
      setLastMessage(message);
    });

    // System message listener
    const unsubSystem = webSocketService.addEventListener('system', (message) => {
      console.log('System message:', message);
    });

    // Store unsubscribe functions
    listenersRef.current = [
      unsubConnected,
      unsubDisconnected,
      unsubError,
      unsubNotification,
      unsubUpdate,
      unsubAlert,
      unsubSystem
    ];

    // Cleanup
    return () => {
      listenersRef.current.forEach(unsub => {
        if (typeof unsub === 'function') {
          unsub();
        }
      });
    };
  }, []);

  // Auto-connect when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token && !connected && connectionStatus !== 'connecting') {
      connect();
    }

    // Cleanup on unmount
    return () => {
      // Don't disconnect on unmount to maintain connection across components
      // disconnect();
    };
  }, []);

  return {
    // State
    connected,
    connectionStatus,
    lastMessage,
    notifications,
    unreadCount,
    error,
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe,
    markAsRead,
    
    // Service reference
    service: webSocketService
  };
};

export default useWebSocket;