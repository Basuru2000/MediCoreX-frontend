import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton,
  Collapse,
  Divider,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Container
} from '@mui/material'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab'
import {
  Warning,
  ErrorOutline,
  Schedule,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  Inventory,
  AttachMoney
} from '@mui/icons-material'

function ExpiryTimeline({ report, onBatchSelect }) {
  const theme = useTheme()
  const [expandedRange, setExpandedRange] = useState(null)

  if (!report || !report.batchesByExpiryRange) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">No expiry data available</Typography>
      </Paper>
    )
  }

  const getRangeConfig = (rangeName) => {
    const configs = {
      '0-7 days': {
        color: theme.palette.error.main,
        bgColor: alpha(theme.palette.error.main, 0.1),
        icon: <ErrorOutline />,
        severity: 'CRITICAL',
        label: 'Critical'
      },
      '8-30 days': {
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.1),
        icon: <Warning />,
        severity: 'HIGH',
        label: 'High Priority'
      },
      '31-60 days': {
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.1),
        icon: <Schedule />,
        severity: 'MEDIUM',
        label: 'Medium Priority'
      },
      '61-90 days': {
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1),
        icon: <CheckCircle />,
        severity: 'LOW',
        label: 'Low Priority'
      },
      'Expired': {
        color: theme.palette.error.dark,
        bgColor: alpha(theme.palette.error.dark, 0.1),
        icon: <ErrorOutline />,
        severity: 'CRITICAL',
        label: 'Expired'
      }
    }
    return configs[rangeName] || configs['61-90 days']
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0)
  }

  const calculateTotals = (batches) => {
    return {
      count: batches.length,
      quantity: batches.reduce((sum, b) => sum + b.quantity, 0),
      value: batches.reduce((sum, b) => sum + (b.value || 0), 0)
    }
  }

  const handleToggleRange = (rangeName) => {
    setExpandedRange(expandedRange === rangeName ? null : rangeName)
  }

  const handleBatchClick = (batch) => {
    if (onBatchSelect) {
      onBatchSelect(batch.batchId)
    }
  }

  const orderedRanges = ['0-7 days', '8-30 days', '31-60 days', '61-90 days', 'Expired']

  return (
    <Paper sx={{ p: 3, borderRadius: '8px', border: `1px solid ${theme.palette.divider}` }}>
      {/* Header - Centered */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Batch Expiry Timeline
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visual representation of batches grouped by expiry timeframes
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Timeline - Centered Container */}
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'center',
          width: '100%'
        }}
      >
        <Box sx={{ maxWidth: '1200px', width: '100%' }}>
          <Timeline 
            position="alternate"
            sx={{
              '& .MuiTimelineItem-root': {
                minHeight: '180px'
              },
              '& .MuiTimelineItem-root:before': {
                flex: 0.5,
                padding: '6px 16px'
              }
            }}
          >
            {orderedRanges.map((rangeName, index) => {
              const batches = report.batchesByExpiryRange[rangeName] || []
              const config = getRangeConfig(rangeName)
              const totals = calculateTotals(batches)
              const isExpanded = expandedRange === rangeName
              const isLast = index === orderedRanges.length - 1

              return (
                <TimelineItem key={rangeName}>
                  <TimelineOppositeContent
                    sx={{ 
                      py: 2,
                      px: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: index % 2 === 0 ? 'flex-end' : 'flex-start',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="body1" fontWeight={700} sx={{ mb: 0.5 }}>
                      {rangeName}
                    </Typography>
                    <Chip
                      label={config.label}
                      size="small"
                      sx={{
                        bgcolor: config.bgColor,
                        color: config.color,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: '24px'
                      }}
                    />
                  </TimelineOppositeContent>

                  <TimelineSeparator>
                    <TimelineDot
                      sx={{
                        bgcolor: config.color,
                        boxShadow: `0 0 0 4px ${config.bgColor}`,
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        m: 0
                      }}
                    >
                      {config.icon}
                    </TimelineDot>
                    {!isLast && (
                      <TimelineConnector
                        sx={{
                          bgcolor: alpha(config.color, 0.3),
                          width: 3,
                          minHeight: '80px'
                        }}
                      />
                    )}
                  </TimelineSeparator>

                  <TimelineContent sx={{ py: 2, px: 2 }}>
                    <Card
                      elevation={0}
                      sx={{
                        border: `2px solid ${config.color}`,
                        bgcolor: batches.length > 0 ? config.bgColor : 'background.paper',
                        cursor: batches.length > 0 ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        '&:hover': batches.length > 0 ? {
                          boxShadow: `0 4px 12px ${alpha(config.color, 0.3)}`,
                          transform: 'translateY(-2px)'
                        } : {}
                      }}
                      onClick={() => batches.length > 0 && handleToggleRange(rangeName)}
                    >
                      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={3}>
                            <Box textAlign="center">
                              <Typography variant="h4" fontWeight={700} color={config.color}>
                                {totals.count}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {totals.count === 1 ? 'Batch' : 'Batches'}
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid item xs={12} sm={1}>
                            <Divider orientation="vertical" flexItem sx={{ mx: 'auto', display: { xs: 'none', sm: 'block' } }} />
                            <Divider sx={{ display: { xs: 'block', sm: 'none' } }} />
                          </Grid>

                          <Grid item xs={12} sm={3}>
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                              <Inventory fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Box textAlign="center">
                                <Typography variant="h6" fontWeight={600}>
                                  {totals.quantity}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Units
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>

                          <Grid item xs={12} sm={1}>
                            <Divider orientation="vertical" flexItem sx={{ mx: 'auto', display: { xs: 'none', sm: 'block' } }} />
                            <Divider sx={{ display: { xs: 'block', sm: 'none' } }} />
                          </Grid>

                          <Grid item xs={12} sm={3}>
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                              <AttachMoney fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Box textAlign="center">
                                <Typography variant="h6" fontWeight={600}>
                                  {formatCurrency(totals.value)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Value
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>

                          <Grid item xs={12} sm={1}>
                            {batches.length > 0 && (
                              <Box textAlign="center">
                                <IconButton size="small">
                                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                              </Box>
                            )}
                          </Grid>
                        </Grid>

                        {/* Progress Bar */}
                        {batches.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min((totals.count / report.activeBatches) * 100, 100)}
                              sx={{
                                height: 8,
                                borderRadius: 1,
                                bgcolor: alpha(config.color, 0.15),
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: config.color,
                                  borderRadius: 1
                                }
                              }}
                            />
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}
                            >
                              {((totals.count / report.activeBatches) * 100).toFixed(1)}% of active batches
                            </Typography>
                          </Box>
                        )}

                        {/* Expanded Batch List */}
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                            Batch Details:
                          </Typography>
                          <List dense disablePadding>
                            {batches.slice(0, 10).map((batch) => (
                              <ListItem
                                key={batch.batchId}
                                disablePadding
                                sx={{ mb: 0.5 }}
                              >
                                <ListItemButton
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleBatchClick(batch)
                                  }}
                                  sx={{
                                    borderRadius: '6px',
                                    border: `1px solid ${alpha(config.color, 0.2)}`,
                                    '&:hover': {
                                      bgcolor: alpha(config.color, 0.05),
                                      borderColor: config.color
                                    }
                                  }}
                                >
                                  <ListItemText
                                    primary={
                                      <Typography variant="body2" fontWeight={600}>
                                        {batch.productName}
                                      </Typography>
                                    }
                                    secondary={
                                      <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">
                                          Batch: {batch.batchNumber}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          Qty: {batch.quantity}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {batch.daysUntilExpiry >= 0 
                                            ? `${batch.daysUntilExpiry} days remaining`
                                            : `Expired ${Math.abs(batch.daysUntilExpiry)} days ago`
                                          }
                                        </Typography>
                                      </Stack>
                                    }
                                  />
                                </ListItemButton>
                              </ListItem>
                            ))}
                            {batches.length > 10 && (
                              <ListItem>
                                <ListItemText
                                  sx={{ textAlign: 'center' }}
                                  secondary={
                                    <Typography variant="caption" color="text.secondary" fontStyle="italic">
                                      ... and {batches.length - 10} more batches
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            )}
                          </List>
                        </Collapse>

                        {batches.length === 0 && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontStyle="italic"
                            sx={{ mt: 1, textAlign: 'center' }}
                          >
                            No batches in this range
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </TimelineContent>
                </TimelineItem>
              )
            })}
          </Timeline>
        </Box>
      </Box>

      {/* Summary Footer - Centered */}
      <Divider sx={{ my: 3 }} />
      <Container maxWidth="lg">
        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: '8px' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight={700} color="primary">
                  {report.activeBatches}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Active Batches
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight={700} color="error.main">
                  {report.expiringBatches}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Expiring Soon (30 days)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {formatCurrency(report.totalInventoryValue)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Inventory Value
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {formatCurrency(report.expiringInventoryValue)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  At-Risk Value (30 days)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Paper>
  )
}

export default ExpiryTimeline