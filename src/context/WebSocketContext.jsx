import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import useWebSocket from '../hooks/useWebSocket';

const WebSocketContext = createContext(null);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user } = useAuth();
  const webSocket = useWebSocket();
  const [isReady, setIsReady] = useState(false);

  // Connect when user logs in
  useEffect(() => {
    if (user && !webSocket.connected) {
      webSocket.connect().then(() => {
        setIsReady(true);
      });
    } else if (!user && webSocket.connected) {
      webSocket.disconnect();
      setIsReady(false);
    }
  }, [user]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  const value = {
    ...webSocket,
    isReady
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;