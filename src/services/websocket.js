import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.connectionPromise = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.heartbeatInterval = null;
    this.listeners = new Map();
  }

  /**
   * Connect to WebSocket server
   */
  connect(token) {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Create STOMP client with SockJS
        this.client = new Client({
          webSocketFactory: () => {
            return new SockJS('http://localhost:8080/ws');
          },
          
          connectHeaders: {
            Authorization: `Bearer ${token}`
          },
          
          debug: (str) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('STOMP: ' + str);
            }
          },
          
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 25000,
          heartbeatOutgoing: 25000,
          
          onConnect: (frame) => {
            console.log('WebSocket Connected:', frame);
            this.connected = true;
            this.reconnectAttempts = 0;
            
            // Subscribe to default channels
            this.subscribeToDefaults();
            
            // Start heartbeat
            this.startHeartbeat();
            
            // Notify listeners
            this.notifyListeners('connected', { timestamp: new Date() });
            
            resolve(this.client);
          },
          
          onStompError: (frame) => {
            console.error('STOMP error:', frame);
            this.connected = false;
            
            // Notify listeners
            this.notifyListeners('error', { 
              error: frame.headers.message || 'Connection error',
              timestamp: new Date() 
            });
            
            reject(new Error('STOMP error: ' + frame.headers.message));
          },
          
          onWebSocketError: (error) => {
            console.error('WebSocket error:', error);
            this.connected = false;
            
            // Notify listeners
            this.notifyListeners('error', { 
              error: error.message || 'WebSocket error',
              timestamp: new Date() 
            });
          },
          
          onDisconnect: () => {
            console.log('WebSocket Disconnected');
            this.connected = false;
            this.stopHeartbeat();
            
            // Notify listeners
            this.notifyListeners('disconnected', { timestamp: new Date() });
            
            // Attempt reconnection
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
              this.reconnectAttempts++;
              console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
              setTimeout(() => {
                this.connectionPromise = null;
                this.connect(token);
              }, this.reconnectDelay * this.reconnectAttempts);
            }
          }
        });

        // Activate the client
        this.client.activate();
        
      } catch (error) {
        console.error('Failed to create WebSocket client:', error);
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Subscribe to default channels
   */
  subscribeToDefaults() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const username = user.username;

    if (!username) return;

    // Personal notification queue
    this.subscribe(`/user/${username}/queue/notifications`, (message) => {
      this.handleNotificationMessage(message);
    });

    // System messages
    this.subscribe(`/user/${username}/queue/system`, (message) => {
      this.handleSystemMessage(message);
    });

    // Updates queue
    this.subscribe(`/user/${username}/queue/updates`, (message) => {
      this.handleUpdateMessage(message);
    });

    // Alerts queue
    this.subscribe(`/user/${username}/queue/alerts`, (message) => {
      this.handleAlertMessage(message);
    });

    // Broadcast channel
    this.subscribe('/topic/broadcast', (message) => {
      this.handleBroadcastMessage(message);
    });

    // Heartbeat channel
    this.subscribe('/topic/heartbeat', (message) => {
      this.handleHeartbeat(message);
    });
  }

  /**
   * Subscribe to a channel
   */
  subscribe(channel, callback) {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected. Cannot subscribe to:', channel);
      return null;
    }

    try {
      const subscription = this.client.subscribe(channel, (message) => {
        try {
          const body = JSON.parse(message.body);
          callback(body);
        } catch (error) {
          console.error('Error parsing message:', error);
          callback(message.body);
        }
      });

      this.subscriptions.set(channel, subscription);
      console.log('Subscribed to channel:', channel);
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to channel:', channel, error);
      return null;
    }
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channel) {
    const subscription = this.subscriptions.get(channel);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(channel);
      console.log('Unsubscribed from channel:', channel);
    }
  }

  /**
   * Send message to server
   */
  sendMessage(destination, message) {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected. Cannot send message');
      return false;
    }

    try {
      this.client.publish({
        destination,
        body: JSON.stringify(message)
      });
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId) {
    return this.sendMessage('/app/notification.read', {
      notificationId
    });
  }

  /**
   * Send private notification
   */
  sendPrivateNotification(notification) {
    return this.sendMessage('/app/notification.private', notification);
  }

  /**
   * Get connection status
   */
  getStatus() {
    this.sendMessage('/app/status', {});
  }

  /**
   * Handle notification messages
   */
  handleNotificationMessage(message) {
    console.log('New notification:', message);
    
    // Notify all notification listeners
    this.notifyListeners('notification', message);
    
    // Show browser notification if enabled
    if (message.notification && message.notification.priority === 'CRITICAL') {
      this.showBrowserNotification(message.notification);
    }
  }

  /**
   * Handle system messages
   */
  handleSystemMessage(message) {
    console.log('System message:', message);
    this.notifyListeners('system', message);
  }

  /**
   * Handle update messages
   */
  handleUpdateMessage(message) {
    console.log('Update message:', message);
    this.notifyListeners('update', message);
  }

  /**
   * Handle alert messages
   */
  handleAlertMessage(message) {
    console.log('Alert message:', message);
    this.notifyListeners('alert', message);
  }

  /**
   * Handle broadcast messages
   */
  handleBroadcastMessage(message) {
    console.log('Broadcast message:', message);
    this.notifyListeners('broadcast', message);
  }

  /**
   * Handle heartbeat
   */
  handleHeartbeat(message) {
    // Update last heartbeat time
    this.lastHeartbeat = new Date();
  }

  /**
   * Start heartbeat monitoring
   */
  startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.lastHeartbeat) {
        const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeat.getTime();
        
        // If no heartbeat for 60 seconds, assume disconnected
        if (timeSinceLastHeartbeat > 60000) {
          console.warn('No heartbeat received. Connection may be lost.');
          this.handleConnectionLoss();
        }
      }
    }, 30000);
  }

  /**
   * Stop heartbeat monitoring
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Handle connection loss
   */
  handleConnectionLoss() {
    if (this.connected) {
      this.disconnect();
      // Attempt to reconnect
      const token = localStorage.getItem('token');
      if (token) {
        this.connect(token);
      }
    }
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: `notification-${notification.id}`,
        requireInteraction: notification.priority === 'CRITICAL'
      });
    }
  }

  /**
   * Add event listener
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Remove event listener
   */
  removeEventListener(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Notify all listeners for an event
   */
  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.client) {
      // Unsubscribe from all channels
      this.subscriptions.forEach((subscription, channel) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      
      // Deactivate client
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.connectionPromise = null;
      
      // Stop heartbeat
      this.stopHeartbeat();
      
      console.log('WebSocket disconnected');
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected;
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;