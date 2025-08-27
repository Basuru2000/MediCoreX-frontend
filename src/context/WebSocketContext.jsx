import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';
import useWebSocket from '../hooks/useWebSocket';

const WebSocketContext = createContext(null);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    return {
      connected: false,
      connectionStatus: 'disconnected',
      connect: () => {},
      disconnect: () => {},
      sendMessage: () => false,
      subscribe: () => null,
      unsubscribe: () => {},
      markAsRead: () => {},
      notifications: [],
      unreadCount: null,
      error: null,
      isReady: false
    };
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  
  const isLoginPage = location.pathname === '/login';
  
  // FIX: ALWAYS call the hook - never conditionally
  const webSocket = useWebSocket();
  
  // Control connection based on conditions
  useEffect(() => {
    if (user && !isLoginPage && webSocket) {
      // Connect when we have a user and not on login page
      if (!webSocket.connected) {
        webSocket.connect().then(() => {
          setIsReady(true);
        }).catch(err => {
          console.error('WebSocket connection failed:', err);
          setIsReady(false);
        });
      }
    } else if (webSocket && webSocket.connected) {
      // Disconnect when no user or on login page
      webSocket.disconnect();
      setIsReady(false);
    }
  }, [user, isLoginPage, webSocket]);

  // Request notification permission
  useEffect(() => {
    if (user && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, [user]);

  // Provide empty context on login page
  if (isLoginPage || !user) {
    return (
      <WebSocketContext.Provider value={{
        connected: false,
        connectionStatus: 'disconnected',
        connect: () => {},
        disconnect: () => {},
        sendMessage: () => false,
        subscribe: () => null,
        unsubscribe: () => {},
        markAsRead: () => {},
        notifications: [],
        unreadCount: null,
        error: null,
        isReady: false,
        service: null
      }}>
        {children}
      </WebSocketContext.Provider>
    );
  }

  const value = {
    ...webSocket,
    isReady,
    unreadCount: webSocket?.unreadCount || null
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;