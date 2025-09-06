import React, { useState, useEffect, useRef } from 'react'
import { 
  IconButton, 
  Badge, 
  Menu, 
  MenuItem, 
  Typography, 
  Box,
  Divider,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
  Alert,
  Tooltip,
  Stack,
  alpha,
  useTheme
} from '@mui/material'
import { 
  Notifications as NotificationsIcon,
  NotificationsNone,
  NotificationsActive,
  Delete as DeleteIconMui,
  CheckCircle,
  Warning,
  Error,
  Info,
  MarkEmailRead,
  Settings,
  OpenInNew
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useWebSocketContext } from '../../context/WebSocketContext'
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  archiveNotification,
  getNotificationPreferences,
  sendTestNotification
} from '../../services/api'

const NotificationBell = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const webSocket = useWebSocketContext()
  
  const [anchorEl, setAnchorEl] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [newNotification, setNewNotification] = useState(null)
  const [preferences, setPreferences] = useState({
    soundEnabled: true,
    desktopNotifications: true,
    priorityThreshold: 'LOW'
  })
  
  const open = Boolean(anchorEl)
  const audioRef = useRef(null)
  const previousCountRef = useRef(null)
  const hasPlayedInitialSound = useRef(false)

  // Initialize audio
  useEffect(() => {
    try {
      // Try multiple audio formats for better compatibility
      const audio = new Audio()
      
      // Check which format is supported
      const canPlayMP3 = audio.canPlayType('audio/mpeg') !== ''
      const canPlayWAV = audio.canPlayType('audio/wav') !== ''
      const canPlayOGG = audio.canPlayType('audio/ogg') !== ''
      
      if (canPlayMP3) {
        audio.src = '/notification-sound.mp3'
      } else if (canPlayWAV) {
        audio.src = '/notification-sound.wav'
      } else if (canPlayOGG) {
        audio.src = '/notification-sound.ogg'
      } else {
        // Fallback: create a simple beep sound programmatically
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        audioRef.current = {
          play: () => {
            const osc = audioContext.createOscillator()
            const gain = audioContext.createGain()
            
            osc.connect(gain)
            gain.connect(audioContext.destination)
            
            osc.frequency.value = 800
            gain.gain.setValueAtTime(0.3, audioContext.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
            
            osc.start(audioContext.currentTime)
            osc.stop(audioContext.currentTime + 0.2)
          }
        }
        console.log('Using programmatic sound as fallback')
        return
      }
      
      // Set volume
      audio.volume = 0.5
      
      // Preload the audio
      audio.load()
      
      audioRef.current = audio
      console.log('Notification sound initialized')
      
    } catch (err) {
      console.warn('Could not initialize notification sound:', err)
    }
  }, [])

  // Check preferences
  useEffect(() => {
    const checkPreferences = async () => {
      try {
        const response = await getNotificationPreferences()
        if (response.data) {
          setPreferences({
            soundEnabled: response.data.soundEnabled !== false,
            desktopNotifications: response.data.desktopNotifications !== false,
            priorityThreshold: response.data.priorityThreshold || 'LOW'
          })
        }
      } catch (err) {
        console.log('Using default notification preferences')
      }
    }
    
    checkPreferences()
  }, [])

  // Use WebSocket notifications when connected
  useEffect(() => {
    fetchUnreadCount()
    
    if (webSocket && webSocket.connected) {
      fetchUnreadCount()
      
      if (webSocket.notifications && webSocket.notifications.length > 0) {
        setNotifications(webSocket.notifications)
      }
      
      if (webSocket.unreadCount !== undefined && webSocket.unreadCount !== null) {
        setUnreadCount(webSocket.unreadCount)
      }
    }
  }, [webSocket?.connected])

  // Listen for WebSocket messages directly
  useEffect(() => {
    if (!webSocket?.service) return
    
    const handleWebSocketMessage = (message) => {
      console.log('WebSocket notification received:', message)
      
      // Handle different message types
      if (message.type === 'COUNT_UPDATE' || message.unreadCount !== undefined) {
        const newCount = message.unreadCount || 0
        
        // Play sound if count increased (not on first load)
        if (previousCountRef.current !== null && newCount > previousCountRef.current) {
          playNotificationSound('MEDIUM')
        }
        
        previousCountRef.current = newCount
        setUnreadCount(newCount)
      }
      
      // Handle new notification
      if (message.notification || message.eventType === 'NEW_NOTIFICATION') {
        const notification = message.notification || message
        
        // Play sound for new notification
        playNotificationSound(notification.priority)
        
        // Show desktop notification
        showDesktopNotification(notification)
        
        // Show toast
        showNotificationToast(notification)
        
        // Refresh notifications
        fetchUnreadCount()
        if (open) {
          fetchNotifications()
        }
      }
    }
    
    const unsubscribe = webSocket.service?.addEventListener?.('notification', handleWebSocketMessage)
    const unsubscribeUpdate = webSocket.service?.addEventListener?.('update', handleWebSocketMessage)
    
    return () => {
      if (unsubscribe) unsubscribe()
      if (unsubscribeUpdate) unsubscribeUpdate()
    }
  }, [webSocket?.service])

  // Separate polling effect - only when NOT connected
  useEffect(() => {
    if (!webSocket?.connected) {
      const interval = setInterval(() => {
        fetchUnreadCount()
        if (open) {
          fetchNotifications()
        }
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [webSocket?.connected, open])

  // Periodic refresh as backup
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadNotificationCount()
      const newCount = response.data.count || 0
      
      // Only play sound if count increased (not on first load)
      if (previousCountRef.current !== null && newCount > previousCountRef.current) {
        playNotificationSound('MEDIUM')
      } else if (previousCountRef.current === null) {
        // First load - just set the reference
        previousCountRef.current = newCount
      }
      
      setUnreadCount(newCount)
      previousCountRef.current = newCount
      
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }

  const fetchNotifications = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getNotifications({ 
        status: 'UNREAD', 
        page: 0, 
        size: 10 
      })
      setNotifications(response.data.content || [])
    } catch (err) {
      setError('Failed to load notifications')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const playNotificationSound = (priority = 'MEDIUM') => {
    // Check if sound is enabled in preferences
    if (!preferences.soundEnabled) {
      console.log('Sound disabled in preferences')
      return
    }
    
    // Check priority threshold
    const priorityLevels = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }
    const thresholdLevel = priorityLevels[preferences.priorityThreshold] || 1
    const notificationLevel = priorityLevels[priority] || 2
    
    if (notificationLevel < thresholdLevel) {
      console.log('Notification priority below threshold')
      return
    }
    
    // Play the sound
    if (audioRef.current && audioRef.current.play) {
      audioRef.current.play()
        .then(() => console.log('Notification sound played'))
        .catch(err => {
          // Handle autoplay restrictions
          console.log('Could not play sound (autoplay restriction):', err.message)
          // Try to play after user interaction
          document.addEventListener('click', () => {
            audioRef.current?.play?.().catch(() => {})
          }, { once: true })
        })
    }
  }

  const showDesktopNotification = (notification) => {
    if (!preferences.desktopNotifications) return
    
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications')
      return
    }
    
    if (Notification.permission === 'granted') {
      new Notification(notification.title || 'New Notification', {
        body: notification.message || 'You have a new notification',
        icon: '/favicon.ico',
        tag: `notification-${notification.id}`,
        requireInteraction: notification.priority === 'CRITICAL'
      })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showDesktopNotification(notification)
        }
      })
    }
  }

  const showNotificationToast = (notification) => {
    setNewNotification(notification)
    setShowToast(true)
  }

  const handleClick = async (event) => {
    setAnchorEl(event.currentTarget)
    if (!open) {
      await fetchNotifications()
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationClick = async (notification) => {
    try {
      if (webSocket?.connected && webSocket?.markAsRead) {
        webSocket.markAsRead(notification.id)
      } else {
        await markNotificationAsRead(notification.id)
      }
      
      setNotifications(prev => 
        prev.map(n => n.id === notification.id 
          ? { ...n, status: 'READ' } 
          : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      if (notification.actionUrl) {
        navigate(notification.actionUrl)
      }
      
      handleClose()
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })))
      setUnreadCount(0)
      fetchNotifications()
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleViewAll = () => {
    handleClose()
    navigate('/notifications')
  }

  const handleSettings = () => {
    handleClose()
    navigate('/notification-preferences')
  }

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'CRITICAL':
      case 'HIGH':
        return <Error fontSize="small" sx={{ color: theme.palette.error.main }} />
      case 'MEDIUM':
        return <Warning fontSize="small" sx={{ color: theme.palette.warning.main }} />
      case 'LOW':
        return <Info fontSize="small" sx={{ color: theme.palette.info.main }} />
      default:
        return <CheckCircle fontSize="small" sx={{ color: theme.palette.success.main }} />
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'CRITICAL':
      case 'HIGH':
        return theme.palette.error.main
      case 'MEDIUM':
        return theme.palette.warning.main
      case 'LOW':
        return theme.palette.info.main
      default:
        return theme.palette.success.main
    }
  }

  const getCategoryColor = (category) => {
    const categoryColors = {
      EXPIRY: theme.palette.warning.main,
      STOCK: theme.palette.info.main,
      QUARANTINE: theme.palette.error.main,
      BATCH: theme.palette.primary.main,
      USER: theme.palette.success.main,
      SYSTEM: theme.palette.grey[600]
    }
    return categoryColors[category] || theme.palette.grey[600]
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <>
      <Tooltip title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}>
        <IconButton
          onClick={handleClick}
          sx={{
            position: 'relative',
            backgroundColor: unreadCount > 0 
              ? alpha(theme.palette.primary.main, 0.1) 
              : 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
            }
          }}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.7rem',
                height: 18,
                minWidth: 18,
                fontWeight: 600
              }
            }}
          >
            {unreadCount > 0 ? (
              <NotificationsActive sx={{ color: theme.palette.primary.main }} />
            ) : (
              <NotificationsNone sx={{ color: theme.palette.text.secondary }} />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            minWidth: 380,
            maxWidth: 420,
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <NotificationsIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
              <Typography variant="subtitle1" fontWeight={600}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Chip
                  label={unreadCount}
                  size="small"
                  color="error"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}
                />
              )}
            </Stack>
            <IconButton 
              size="small" 
              onClick={handleSettings}
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              <Settings fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        {/* Notifications List */}
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Loading notifications...
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsNone sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No new notifications
              </Typography>
              <Typography variant="caption" color="text.secondary">
                You're all caught up!
              </Typography>
            </Box>
          ) : (
            notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  py: 2,
                  px: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  },
                  display: 'block',
                  whiteSpace: 'normal'
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      backgroundColor: alpha(getPriorityColor(notification.priority), 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {getPriorityIcon(notification.priority)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          lineHeight: 1.3
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.category}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: '0.65rem',
                          backgroundColor: alpha(getCategoryColor(notification.category), 0.1),
                          color: getCategoryColor(notification.category),
                          fontWeight: 600,
                          '& .MuiChip-label': {
                            px: 0.75
                          }
                        }}
                      />
                    </Stack>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        display: 'block',
                        lineHeight: 1.4,
                        mb: 0.5
                      }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: theme.palette.text.disabled,
                        fontSize: '0.7rem'
                      }}
                    >
                      {formatTime(notification.createdAt)}
                    </Typography>
                  </Box>
                </Stack>
              </MenuItem>
            ))
          )}
        </Box>

        {/* Footer */}
        {notifications.length > 0 && (
          <Box
            sx={{
              p: 1.5,
              backgroundColor: alpha(theme.palette.background.default, 0.6),
              borderTop: `1px solid ${theme.palette.divider}`
            }}
          >
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                variant="text"
                onClick={handleMarkAllAsRead}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                Mark all as read
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={handleViewAll}
                endIcon={<OpenInNew fontSize="small" />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                View All
              </Button>
            </Stack>
          </Box>
        )}
      </Menu>

      {/* Toast Notification */}
      <Snackbar
        open={showToast}
        autoHideDuration={6000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowToast(false)} 
          severity={newNotification?.priority === 'HIGH' ? 'error' : 'info'}
          sx={{ width: '100%' }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            {newNotification?.title}
          </Typography>
          <Typography variant="caption">
            {newNotification?.message}
          </Typography>
        </Alert>
      </Snackbar>
    </>
  )
}

export default NotificationBell