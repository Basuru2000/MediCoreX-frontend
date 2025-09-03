import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  Chip,
  Alert,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  useTheme,
  alpha,
  Skeleton
} from '@mui/material'
import {
  Schedule,
  Warning,
  ArrowForward,
  TrendingUp,
  AccessTime,
  Inventory,
  PriorityHigh,
  CheckCircle
} from '@mui/icons-material'
import { 
  getQuarantinePendingReview,
  processQuarantineAction 
} from '../../services/api'

const QuarantineActions = ({ onRefresh }) => {
  const theme = useTheme()
  const [pendingItems, setPendingItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    loadPendingItems()
  }, [])

  const loadPendingItems = async () => {
    try {
      setLoading(true)
      const response = await getQuarantinePendingReview()
      setPendingItems(response.data)
    } catch (error) {
      console.error('Failed to load pending items:', error)
      setPendingItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = async (record, action) => {
    try {
      setProcessingId(record.id)
      await processQuarantineAction({
        quarantineRecordId: record.id,
        action: action,
        comments: 'Quick action performed via dashboard'
      })
      await loadPendingItems()
      if (onRefresh) onRefresh()
    } catch (error) {
      console.error('Failed to process action:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const getPriorityColor = (days) => {
    if (days >= 14) return theme.palette.error.main
    if (days >= 7) return theme.palette.warning.main
    return theme.palette.info.main
  }

  const getPriorityLabel = (days) => {
    if (days >= 14) return 'Critical'
    if (days >= 7) return 'High'
    return 'Normal'
  }

  if (loading) {
    return (
      <Box>
        <Grid container spacing={2}>
          {[1, 2, 3].map(i => (
            <Grid item xs={12} key={i}>
              <Card sx={{ borderRadius: '12px' }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="rectangular" height={40} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  if (pendingItems.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`,
          textAlign: 'center',
          backgroundColor: alpha(theme.palette.success.main, 0.02)
        }}
      >
        <Box>
          <CheckCircle sx={{ fontSize: 64, color: theme.palette.success.main, mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            All Caught Up!
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            No items require immediate action at this time.
          </Typography>
        </Box>
      </Paper>
    )
  }

  // Group items by priority
  const criticalItems = pendingItems.filter(item => item.daysInQuarantine >= 14)
  const highPriorityItems = pendingItems.filter(item => item.daysInQuarantine >= 7 && item.daysInQuarantine < 14)
  const normalItems = pendingItems.filter(item => item.daysInQuarantine < 7)

  return (
    <Box>
      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none'
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                    Total Pending
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                    {pendingItems.length}
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1) 
                }}>
                  <Schedule sx={{ color: theme.palette.primary.main }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none'
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                    Critical (≥14 days)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                    {criticalItems.length}
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: alpha(theme.palette.error.main, 0.1) 
                }}>
                  <PriorityHigh sx={{ color: theme.palette.error.main }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none'
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                    High Priority (7-13 days)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                    {highPriorityItems.length}
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: alpha(theme.palette.warning.main, 0.1) 
                }}>
                  <Warning sx={{ color: theme.palette.warning.main }} />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Items List */}
      <Stack spacing={2}>
        {pendingItems
          .sort((a, b) => b.daysInQuarantine - a.daysInQuarantine)
          .map((item) => (
            <Card
              key={item.id}
              sx={{
                borderRadius: '12px',
                border: `1px solid ${theme.palette.divider}`,
                borderLeft: `4px solid ${getPriorityColor(item.daysInQuarantine)}`,
                boxShadow: 'none',
                transition: 'all 0.3s ease',
                opacity: processingId === item.id ? 0.6 : 1,
                '&:hover': {
                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={5}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          backgroundColor: alpha(getPriorityColor(item.daysInQuarantine), 0.1),
                          color: getPriorityColor(item.daysInQuarantine),
                          fontWeight: 600
                        }}
                      >
                        {item.productName?.charAt(0) || 'P'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                          {item.productName}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Batch: {item.batchNumber}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                            •
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Code: {item.productCode}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                          icon={<Inventory sx={{ fontSize: 14 }} />}
                          label={`${item.quantityQuarantined} units`}
                          size="small"
                          sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            '& .MuiChip-icon': {
                              color: theme.palette.primary.main,
                              marginLeft: '6px'
                            }
                          }}
                        />
                        <Chip
                          icon={<AccessTime sx={{ fontSize: 14 }} />}
                          label={`${item.daysInQuarantine} days`}
                          size="small"
                          color={item.daysInQuarantine >= 14 ? 'error' : item.daysInQuarantine >= 7 ? 'warning' : 'default'}
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            '& .MuiChip-icon': {
                              marginLeft: '6px'
                            }
                          }}
                        />
                      </Stack>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Reason: {item.reason}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                      <Chip
                        label={getPriorityLabel(item.daysInQuarantine)}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getPriorityColor(item.daysInQuarantine), 0.1),
                          color: getPriorityColor(item.daysInQuarantine),
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<ArrowForward />}
                        onClick={() => handleQuickAction(item, 'REVIEW')}
                        disabled={processingId === item.id}
                        sx={{
                          borderRadius: '6px',
                          textTransform: 'none',
                          fontWeight: 600,
                          backgroundColor: getPriorityColor(item.daysInQuarantine),
                          boxShadow: 'none',
                          '&:hover': {
                            boxShadow: `0 4px 12px ${alpha(getPriorityColor(item.daysInQuarantine), 0.4)}`
                          }
                        }}
                      >
                        {processingId === item.id ? 'Processing...' : 'Start Review'}
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>

                {processingId === item.id && (
                  <LinearProgress
                    sx={{
                      mt: 2,
                      borderRadius: 1,
                      height: 2
                    }}
                  />
                )}
              </CardContent>
            </Card>
          ))}
      </Stack>
    </Box>
  )
}

export default QuarantineActions