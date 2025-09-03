import React, { useState, useEffect, useCallback } from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
  Tooltip,
  Button,
  Divider,
  Stack,
  useTheme,
  alpha,
  Fade,
  Badge,
  Avatar
} from '@mui/material'
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as HospitalIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Block as BlockIcon,
  AttachMoney as MoneyIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  Assignment as TaskIcon,
  Visibility as ViewIcon,
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  EventNote as EventNoteIcon,
  Info as InfoIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { getExpirySummary } from '../../services/api'

const CriticalAlertsWidget = ({ refreshInterval = 60000 }) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summaryData, setSummaryData] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // Fetch summary data
  const fetchSummaryData = useCallback(async () => {
    try {
      setError(null)
      const response = await getExpirySummary()
      setSummaryData(response.data)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Failed to fetch expiry summary:', err)
      setError('Failed to load critical alerts summary')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial load and auto-refresh
  useEffect(() => {
    fetchSummaryData()
    
    const interval = setInterval(() => {
      fetchSummaryData()
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [fetchSummaryData, refreshInterval])

  // Manual refresh
  const handleRefresh = () => {
    setRefreshing(true)
    fetchSummaryData()
  }

  // Navigate to detailed view
  const handleNavigate = (path) => {
    navigate(path)
  }

  // Navigate to specific batch
  const handleBatchNavigate = (batchId) => {
    navigate('/batch-tracking', { state: { selectedBatchId: batchId } })
  }

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'EXPIRED':
      case 'CRITICAL':
        return theme.palette.error
      case 'HIGH':
        return theme.palette.warning
      case 'MEDIUM':
        return theme.palette.info
      case 'LOW':
        return theme.palette.success
      default:
        return theme.palette.grey
    }
  }

  // Get severity icon
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'EXPIRED':
      case 'CRITICAL':
        return <ErrorIcon />
      case 'HIGH':
        return <WarningIcon />
      case 'MEDIUM':
        return <InfoIcon />
      case 'LOW':
        return <CheckIcon />
      default:
        return <InfoIcon />
    }
  }

  // Loading state
  if (loading && !summaryData) {
    return (
      <Paper 
        sx={{ 
          p: 3,
          borderRadius: '12px',
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Critical Alerts Summary
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={6} md={3} key={item}>
              <Paper 
                sx={{ 
                  height: '180px',
                  borderRadius: '8px',
                  bgcolor: theme.palette.grey[100],
                  animation: 'pulse 1.5s infinite'
                }} 
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    )
  }

  return (
    <Fade in timeout={500}>
      <Paper 
        sx={{ 
          p: 3,
          borderRadius: '12px',
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative gradient background */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, 
              ${theme.palette.error.main} 0%, 
              ${theme.palette.warning.main} 25%, 
              ${theme.palette.info.main} 50%, 
              ${theme.palette.success.main} 100%)`,
          }}
        />

        {/* Header Section */}
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="flex-start"
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 0.5
              }}
            >
              Critical Alerts Summary
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: theme.palette.text.secondary }}
            >
              Last updated: {refreshing ? 'Refreshing...' : 
                lastRefresh ? new Date(lastRefresh).toLocaleTimeString() : 'Just now'}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh data" arrow>
              <IconButton 
                onClick={handleRefresh} 
                disabled={refreshing}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <RefreshIcon 
                  sx={{ 
                    fontSize: 20,
                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }} 
                />
              </IconButton>
            </Tooltip>
            <Tooltip title={expanded ? 'Show less' : 'Show more details'} arrow>
              <IconButton 
                onClick={() => setExpanded(!expanded)}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                {expanded ? 
                  <ExpandLessIcon sx={{ fontSize: 20 }} /> : 
                  <ExpandMoreIcon sx={{ fontSize: 20 }} />
                }
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: '8px',
              '& .MuiAlert-icon': {
                fontSize: 20
              }
            }}
          >
            {error}
          </Alert>
        )}

        {/* Main Statistics Grid - FIXED HEIGHT CARDS */}
        <Grid container spacing={2} sx={{ mb: expanded ? 3 : 0 }}>
          {/* Expired Items Card */}
          <Grid item xs={6} md={3}>
            <Paper
              sx={{
                p: 2.5,
                height: '180px', // Fixed height
                borderRadius: '8px',
                boxShadow: 'none',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.error.main, 0.02),
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  bgcolor: alpha(theme.palette.error.main, 0.04)
                }
              }}
              onClick={() => handleNavigate('/batch-tracking')}
            >
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: 24 }} />
                </Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.error.main,
                    lineHeight: 1,
                    mb: 0.5
                  }}
                >
                  {summaryData?.expiredCount || 0}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    mb: 'auto'
                  }}
                >
                  Expired Items
                </Typography>
                {/* Empty space for chip alignment */}
                <Box sx={{ height: 22, mt: 1 }}>
                  {summaryData?.expiredCount > 0 && (
                    <Chip
                      label="Immediate Action"
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        color: theme.palette.error.main,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 22
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Expiring Today Card */}
          <Grid item xs={6} md={3}>
            <Paper
              sx={{
                p: 2.5,
                height: '180px', // Fixed height
                borderRadius: '8px',
                boxShadow: 'none',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.warning.main, 0.02),
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                  bgcolor: alpha(theme.palette.warning.main, 0.04)
                }
              }}
              onClick={() => handleNavigate('/batch-tracking')}
            >
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <CalendarIcon sx={{ color: theme.palette.warning.main, fontSize: 24 }} />
                </Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.warning.main,
                    lineHeight: 1,
                    mb: 0.5
                  }}
                >
                  {summaryData?.expiringTodayCount || 0}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    mb: 'auto'
                  }}
                >
                  Expiring Today
                </Typography>
                {/* Empty space for chip alignment */}
                <Box sx={{ height: 22, mt: 1 }}>
                  {summaryData?.expiringTodayCount > 0 && (
                    <Chip
                      label="Urgent"
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        color: theme.palette.warning.main,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 22
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* This Week Card */}
          <Grid item xs={6} md={3}>
            <Paper
              sx={{
                p: 2.5,
                height: '180px', // Fixed height
                borderRadius: '8px',
                boxShadow: 'none',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.info.main, 0.02),
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                  bgcolor: alpha(theme.palette.info.main, 0.04)
                }
              }}
              onClick={() => handleNavigate('/batch-tracking')}
            >
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <ScheduleIcon sx={{ color: theme.palette.info.main, fontSize: 24 }} />
                </Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.info.main,
                    lineHeight: 1,
                    mb: 0.5
                  }}
                >
                  {summaryData?.expiringThisWeekCount || 0}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    mb: 'auto'
                  }}
                >
                  This Week
                </Typography>
                {/* Empty space for progress bar alignment */}
                <Box sx={{ height: 22, mt: 1 }}>
                  {summaryData?.expiringThisWeekCount > 0 && (
                    <LinearProgress
                      variant="determinate"
                      value={(summaryData?.expiringThisWeekCount / summaryData?.expiringThisMonthCount) * 100 || 0}
                      sx={{ 
                        height: 4,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.info.main
                        }
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* This Month Card */}
          <Grid item xs={6} md={3}>
            <Paper
              sx={{
                p: 2.5,
                height: '180px', // Fixed height
                borderRadius: '8px',
                boxShadow: 'none',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.success.main, 0.02),
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                  bgcolor: alpha(theme.palette.success.main, 0.04)
                }
              }}
              onClick={() => handleNavigate('/batch-tracking')}
            >
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <HospitalIcon sx={{ color: theme.palette.success.main, fontSize: 24 }} />
                </Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.success.main,
                    lineHeight: 1,
                    mb: 0.5
                  }}
                >
                  {summaryData?.expiringThisMonthCount || 0}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    mb: 'auto'
                  }}
                >
                  This Month
                </Typography>
                {/* Empty space for alignment */}
                <Box sx={{ height: 22, mt: 1 }} />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Expanded Details Section */}
        {expanded && (
          <>
            <Divider sx={{ my: 3 }} />
            
            <Grid container spacing={3}>
              {/* Left Side: Critical Items List */}
              <Grid item xs={12} md={7}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
                    <Typography 
                      variant="h6" 
                      sx={{ fontWeight: 600 }}
                    >
                      Critical Items Requiring Action
                    </Typography>
                  </Box>

                  {/* Critical Items or Empty State */}
                  {summaryData?.criticalItems?.length > 0 ? (
                    <Stack spacing={1}>
                      {summaryData.criticalItems.slice(0, 5).map((item, index) => (
                        <Paper
                          key={item.id || index}
                          sx={{
                            p: 2,
                            borderRadius: '8px',
                            boxShadow: 'none',
                            border: `1px solid ${theme.palette.divider}`,
                            bgcolor: alpha(getSeverityColor(item.severity).main, 0.02),
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: alpha(getSeverityColor(item.severity).main, 0.05),
                              transform: 'translateX(4px)'
                            }
                          }}
                          onClick={() => handleBatchNavigate(item.batchId)}
                        >
                          <Stack 
                            direction="row" 
                            alignItems="center" 
                            justifyContent="space-between"
                          >
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Box
                                sx={{ 
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  bgcolor: alpha(getSeverityColor(item.severity).main, 0.1),
                                  color: getSeverityColor(item.severity).main,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {getSeverityIcon(item.severity)}
                              </Box>
                              <Box>
                                <Typography 
                                  variant="body1" 
                                  sx={{ fontWeight: 600 }}
                                >
                                  {item.productName}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ color: theme.palette.text.secondary }}
                                >
                                  Batch: {item.batchNumber} • Qty: {item.quantity}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    display: 'block',
                                    color: getSeverityColor(item.severity).main,
                                    fontWeight: 500
                                  }}
                                >
                                  {item.severity === 'EXPIRED' ? 
                                    `Expired ${Math.abs(item.daysUntilExpiry)} days ago` : 
                                    `Expires in ${item.daysUntilExpiry} days`}
                                </Typography>
                              </Box>
                            </Stack>
                            <Chip
                              label={item.severity}
                              size="small"
                              sx={{
                                bgcolor: alpha(getSeverityColor(item.severity).main, 0.1),
                                color: getSeverityColor(item.severity).main,
                                fontWeight: 600
                              }}
                            />
                          </Stack>
                        </Paper>
                      ))}
                      
                      {summaryData.criticalItems.length > 5 && (
                        <Button
                          fullWidth
                          variant="text"
                          onClick={() => handleNavigate('/expiry-monitoring')}
                          endIcon={<ArrowIcon />}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 500,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.05)
                            }
                          }}
                        >
                          View All {summaryData.criticalItems.length} Critical Items
                        </Button>
                      )}
                    </Stack>
                  ) : (
                    <Paper
                      sx={{
                        p: 4,
                        borderRadius: '8px',
                        boxShadow: 'none',
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: alpha(theme.palette.success.main, 0.02),
                        textAlign: 'center'
                      }}
                    >
                      <CheckIcon 
                        sx={{ 
                          fontSize: 48,
                          color: theme.palette.success.main,
                          mb: 2
                        }} 
                      />
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          color: theme.palette.success.main,
                          mb: 0.5
                        }}
                      >
                        All Clear!
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.text.secondary
                        }}
                      >
                        No critical items requiring immediate action
                      </Typography>
                    </Paper>
                  )}
                </Stack>
              </Grid>

              {/* Right Side: Financial Impact & Quick Actions */}
              <Grid item xs={12} md={5}>
                {/* Precisely align with first item card */}
                <Stack spacing={3} sx={{ mt: { xs: 0, md: summaryData?.criticalItems?.length > 0 ? '56px' : 0 } }}>
                  {/* Financial Impact */}
                  <Paper
                    sx={{
                      p: 2.5,
                      borderRadius: '8px',
                      boxShadow: 'none',
                      border: `1px solid ${theme.palette.divider}`,
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.error.main, 0.02)} 0%, 
                        ${alpha(theme.palette.warning.main, 0.02)} 100%)`
                    }}
                  >
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MoneyIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Financial Impact
                        </Typography>
                      </Box>
                      
                      <Stack spacing={1.5}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'baseline'
                        }}>
                          <Typography variant="body2" color="text.secondary">
                            Value at Risk
                          </Typography>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700,
                              color: theme.palette.warning.main
                            }}
                          >
                            ${summaryData?.totalValueAtRisk?.toLocaleString() || '0'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'baseline'
                        }}>
                          <Typography variant="body2" color="text.secondary">
                            Expired Value
                          </Typography>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700,
                              color: theme.palette.error.main
                            }}
                          >
                            ${summaryData?.expiredValue?.toLocaleString() || '0'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Paper>

                  {/* Alert Status - Fixed display of values */}
                  <Paper
                    sx={{
                      p: 2.5,
                      borderRadius: '8px',
                      boxShadow: 'none',
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: alpha(theme.palette.info.main, 0.02)
                    }}
                  >
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TaskIcon sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Alert Status
                        </Typography>
                      </Box>
                      
                      <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PendingIcon sx={{ fontSize: 20, color: theme.palette.warning.main }} />
                            <Typography variant="body2">Pending Review</Typography>
                          </Box>
                          <Badge 
                            badgeContent={summaryData?.pendingAlertsCount || 0} 
                            color="warning"
                            max={999}
                            sx={{
                              '& .MuiBadge-badge': {
                                position: 'static',
                                transform: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                minWidth: 24,
                                height: 24
                              }
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ViewIcon sx={{ fontSize: 20, color: theme.palette.info.main }} />
                            <Typography variant="body2">Acknowledged</Typography>
                          </Box>
                          <Badge 
                            badgeContent={summaryData?.acknowledgedAlertsCount || 0} 
                            color="info"
                            max={999}
                            sx={{
                              '& .MuiBadge-badge': {
                                position: 'static',
                                transform: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                minWidth: 24,
                                height: 24
                              }
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BlockIcon sx={{ fontSize: 20, color: theme.palette.error.main }} />
                            <Typography variant="body2">In Quarantine</Typography>
                          </Box>
                          <Badge 
                            badgeContent={summaryData?.quarantinedItemsCount || 0} 
                            color="error"
                            max={999}
                            sx={{
                              '& .MuiBadge-badge': {
                                position: 'static',
                                transform: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                minWidth: 24,
                                height: 24
                              }
                            }}
                          />
                        </Box>
                      </Stack>
                    </Stack>
                  </Paper>

                  {/* Quick Actions */}
                  <Stack spacing={2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Quick Actions
                    </Typography>
                    
                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="medium"
                          startIcon={<PlayIcon />}
                          onClick={() => handleNavigate('/expiry-monitoring')}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 500,
                            boxShadow: 'none',
                            bgcolor: theme.palette.primary.main,
                            '&:hover': {
                              boxShadow: 'none',
                              bgcolor: theme.palette.primary.dark
                            }
                          }}
                        >
                          Run Check
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="medium"
                          startIcon={<BlockIcon />}
                          onClick={() => handleNavigate('/quarantine')}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 500,
                            boxShadow: 'none',
                            bgcolor: theme.palette.warning.main,
                            '&:hover': {
                              boxShadow: 'none',
                              bgcolor: theme.palette.warning.dark
                            }
                          }}
                        >
                          Quarantine
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="medium"
                          startIcon={<SettingsIcon />}
                          onClick={() => handleNavigate('/expiry-config')}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 500,
                            borderColor: theme.palette.divider,
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.05)
                            }
                          }}
                        >
                          Settings
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="medium"
                          startIcon={<EventNoteIcon />}
                          onClick={() => handleNavigate('/expiry-calendar')}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 500,
                            borderColor: theme.palette.divider,
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.05)
                            }
                          }}
                        >
                          Calendar
                        </Button>
                      </Grid>
                    </Grid>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>
    </Fade>
  )
}

export default CriticalAlertsWidget