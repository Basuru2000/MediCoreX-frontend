import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Alert,
  Button,
  Chip,
  Snackbar,
  Stack,
  LinearProgress,
  useTheme,
  alpha,
  Skeleton
} from '@mui/material'
import {
  Warning,
  Assignment,
  Delete,
  AssignmentReturn,
  Assessment,
  Refresh,
  PendingActions,
  CheckCircle,
  Schedule,
  AutoDelete,
  TrendingUp
} from '@mui/icons-material'
import { 
  getQuarantineSummary, 
  triggerAutoQuarantine 
} from '../../services/api'
import QuarantineList from './QuarantineList'
import QuarantineActions from './QuarantineActions'
import QuarantineReport from './QuarantineReport'

const QuarantineDashboard = ({ onRefresh }) => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  useEffect(() => {
    loadSummary()
  }, [refreshTrigger])

  const loadSummary = async () => {
    try {
      setLoading(true)
      const response = await getQuarantineSummary()
      setSummary(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load quarantine summary')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
    if (onRefresh) onRefresh()
  }

  const handleAutoQuarantine = async () => {
    try {
      const response = await triggerAutoQuarantine()
      setSnackbar({
        open: true,
        message: response.data?.message || 'Auto-quarantine process completed successfully!',
        severity: 'success'
      })
      handleRefresh()
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to trigger auto-quarantine process',
        severity: 'error'
      })
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const SummaryCard = ({ title, value, icon, color, trend }) => (
    <Card
      sx={{
        height: '100%',
        borderRadius: '12px',
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`
        }
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '10px',
              backgroundColor: alpha(color, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 24, color } })}
          </Box>
          {trend && (
            <Chip
              label={trend}
              size="small"
              icon={<TrendingUp sx={{ fontSize: 14 }} />}
              sx={{
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                '& .MuiChip-icon': {
                  fontSize: 14,
                  marginLeft: '4px'
                }
              }}
            />
          )}
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            fontSize: '2rem',
            lineHeight: 1.2,
            mb: 0.5
          }}
        >
          {loading ? <Skeleton width={60} /> : value}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  )

  const getCompletionRate = () => {
    if (!summary || summary.totalItems === 0) return 0
    return ((summary.disposed + summary.returned) / summary.totalItems * 100).toFixed(1)
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          borderRadius: '12px',
          border: `1px solid ${theme.palette.error.light}`
        }}
      >
        {error}
      </Alert>
    )
  }

  return (
    <Box>
      {/* Auto-quarantine Action Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.warning.main, 0.02)
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AutoDelete sx={{ color: theme.palette.warning.main }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                Automatic Quarantine Processing
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Automatically quarantine expired batches based on configured rules
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AutoDelete />}
            onClick={handleAutoQuarantine}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: theme.palette.warning.main,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: theme.palette.warning.dark,
                boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.4)}`
              }
            }}
          >
            Run Auto-Quarantine
          </Button>
        </Stack>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Pending Review"
            value={summary?.pendingReview || 0}
            icon={<PendingActions />}
            color={theme.palette.warning.main}
            trend={summary?.pendingReview > 0 ? `${summary.pendingReview} items` : null}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Under Review"
            value={summary?.underReview || 0}
            icon={<Schedule />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Awaiting Action"
            value={(summary?.awaitingDisposal || 0) + (summary?.awaitingReturn || 0)}
            icon={<Assignment />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Completed"
            value={(summary?.disposed || 0) + (summary?.returned || 0)}
            icon={<CheckCircle />}
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>

      {/* Statistics Overview */}
      {summary && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Overview Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                  Total Quarantined Quantity
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  {summary.totalQuantity?.toLocaleString() || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  units across all items
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                  Estimated Total Loss
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                  ${summary.totalEstimatedLoss?.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  potential financial impact
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                  Completion Rate
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                    {getCompletionRate()}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    processed
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(getCompletionRate())}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      backgroundColor: theme.palette.success.main
                    }
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
                  Total Items
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  {summary.totalItems || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  in quarantine system
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Tabs Section */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              minHeight: 48,
              '&.Mui-selected': {
                fontWeight: 600
              }
            }
          }}
        >
          <Tab label="All Records" />
          <Tab label="Pending Review" />
          <Tab label="Actions Required" />
          <Tab label="Reports & Analytics" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <QuarantineList 
              status={null} 
              onRefresh={handleRefresh}
            />
          )}
          {tabValue === 1 && (
            <QuarantineList 
              status="PENDING_REVIEW" 
              onRefresh={handleRefresh}
            />
          )}
          {tabValue === 2 && (
            <QuarantineActions 
              onRefresh={handleRefresh}
            />
          )}
          {tabValue === 3 && (
            <QuarantineReport />
          )}
        </Box>
      </Paper>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            borderRadius: '8px',
            boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default QuarantineDashboard