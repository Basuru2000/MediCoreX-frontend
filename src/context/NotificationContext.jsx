import React, { createContext, useContext, useState, useEffect } from 'react';
import { getNotificationPreferences } from '../services/api';

const NotificationContext = createContext();

export const useNotificationPreferences = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationPreferences must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await getNotificationPreferences();
      setPreferences(response.data);
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      // Set default preferences
      setPreferences({
        inAppEnabled: true,
        soundEnabled: true,
        desktopNotifications: true,
        priorityThreshold: 'LOW'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = (newPreferences) => {
    setPreferences(newPreferences);
  };

  const shouldPlaySound = (priority) => {
    if (!preferences) return false;
    if (!preferences.soundEnabled) return false;
    
    const priorityLevels = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    const thresholdLevel = priorityLevels[preferences.priorityThreshold] || 1;
    const notificationLevel = priorityLevels[priority] || 1;
    
    return notificationLevel >= thresholdLevel;
  };

  const shouldShowDesktopNotification = (priority) => {
    if (!preferences) return false;
    if (!preferences.desktopNotifications) return false;
    
    const priorityLevels = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
    const thresholdLevel = priorityLevels[preferences.priorityThreshold] || 1;
    const notificationLevel = priorityLevels[priority] || 1;
    
    return notificationLevel >= thresholdLevel;
  };

  return (
    <NotificationContext.Provider value={{
      preferences,
      loading,
      fetchPreferences,
      updatePreferences,
      shouldPlaySound,
      shouldShowDesktopNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};