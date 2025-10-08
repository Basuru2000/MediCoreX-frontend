import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Fade,
  Stack,
  Divider,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material'
import {
  PlayArrow,
  Refresh,
  Schedule,
  CheckCircle,
  Error,
  Warning,
  BoltOutlined,
  Dashboard,
  History,
  Assessment,
  InfoOutlined,
  TrendingUp
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import {
  triggerExpiryCheck,
  getExpiryCheckHistory
} from '../services/api'
import ExpiryCheckHistory from '../components/expiry/ExpiryCheckHistory'
import AlertGenerationReport from '../components/expiry/AlertGenerationReport'
import ExpiryMonitoringDashboard from '../components/expiry/ExpiryMonitoringDashboard'

function ExpiryMonitoring() {
  const theme = useTheme()
  const { isManager } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [checkHistory, setCheckHistory] = useState([])
  const [lastCheckResult, setLastCheckResult] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showForceDialog, setShowForceDialog] = useState(false)
  const [checkAlreadyRun, setCheckAlreadyRun] = useState(false)

  useEffect(() => {
    fetchCheckHistory()
  }, [])

  const fetchCheckHistory = async () => {
    try {
      setLoading(true)
      const response = await getExpiryCheckHistory()
      setCheckHistory(response.data)
      
      if (response.data.length > 0) {
        setLastCheckResult(response.data[0])
        
        const today = new Date().toISOString().split('T')[0]
        const todayCheck = response.data.find(check => 
          check.checkDate === today && check.status === 'COMPLETED'
        )
        setCheckAlreadyRun(!!todayCheck)
      }
    } catch (error) {
      setError('Failed to fetch check history')
    } finally {
      setLoading(false)
    }
  }

  const handleTriggerCheck = async (force = false) => {
    try {
      setTriggering(true)
      setError(null)
      setSuccess(null)
      setShowForceDialog(false)
      
      const response = await triggerExpiryCheck()
      
      if (response.data.errorMessage?.includes('already completed')) {
        setCheckAlreadyRun(true)
        setError('An expiry check has already been completed for today.')
        setShowForceDialog(true)
        return
      }
      
      setLastCheckResult(response.data)
      setSuccess(`Expiry check completed. ${response.data.alertsGenerated || 0} alerts generated.`)
      await fetchCheckHistory()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to trigger expiry check')
    } finally {
      setTriggering(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    setError(null)
    setSuccess(null)
  }

  const handleRefresh = () => {
    fetchCheckHistory()
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle sx={{ color: theme.palette.success.main }} />
      case 'FAILED':
        return <Error sx={{ color: theme.palette.error.main }} />
      case 'RUNNING':
        return <Schedule sx={{ color: theme.palette.info.main }} />
      default:
        return <Warning sx={{ color: theme.palette.warning.main }} />
    }
  }

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Fade in={true}>
      <Box>
        {/* Page Header */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 4
          }}
        >
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.5
              }}
            >
              Expiry Monitoring
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: 'text.secondary' }}
            >
              Monitor product expiry dates and generate alerts automatically
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Tooltip title="Refresh data" arrow>
              <IconButton
                onClick={handleRefresh}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={triggering ? <CircularProgress size={20} /> : <PlayArrow />}
              onClick={() => handleTriggerCheck()}
              disabled={triggering}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none'
                }
              }}
            >
              {triggering ? 'Running Check...' : 'Run Expiry Check'}
            </Button>
          </Stack>
        </Box>

        {/* Status Cards */}
        {lastCheckResult && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Last Check
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {new Date(lastCheckResult.checkDate).toLocaleDateString()}
                    </Typography>
                    <Chip
                      label={lastCheckResult.status}
                      size="small"
                      icon={getStatusIcon(lastCheckResult.status)}
                      sx={{
                        fontWeight: 500,
                        borderRadius: '6px',
                        '& .MuiChip-icon': { fontSize: 16 }
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Assessment sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Products Checked
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {lastCheckResult.productsChecked || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Total products analyzed
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Warning sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Alerts Generated
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
                      {lastCheckResult.alertsGenerated || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      New expiry alerts
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BoltOutlined sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Execution Time
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {lastCheckResult.executionTimeMs ? 
                        `${(lastCheckResult.executionTimeMs / 1000).toFixed(2)}s` : 
                        'N/A'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Processing duration
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Alerts */}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ 
              mb: 3,
              borderRadius: '8px',
              boxShadow: `0 2px 4px ${alpha(theme.palette.error.main, 0.1)}`
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            onClose={() => setSuccess(null)}
            sx={{ 
              mb: 3,
              borderRadius: '8px',
              boxShadow: `0 2px 4px ${alpha(theme.palette.success.main, 0.1)}`
            }}
          >
            {success}
          </Alert>
        )}

        {/* Main Content */}
        <Paper 
          sx={{ 
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{
                px: 3,
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
              <Tab 
                icon={<Dashboard fontSize="small" />} 
                iconPosition="start" 
                label="Dashboard" 
              />
              <Tab 
                icon={<History fontSize="small" />} 
                iconPosition="start" 
                label="Check History" 
              />
              <Tab 
                icon={<Assessment fontSize="small" />} 
                iconPosition="start" 
                label="Alert Reports" 
              />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <ExpiryMonitoringDashboard 
                lastCheckResult={lastCheckResult}
                onRefresh={handleRefresh}
              />
            )}
            
            {tabValue === 1 && (
              <ExpiryCheckHistory 
                history={checkHistory}
                onRefresh={handleRefresh}
              />
            )}
            
            {tabValue === 2 && (
              <AlertGenerationReport 
                checkResult={lastCheckResult}
                onRefresh={handleRefresh}
              />
            )}
          </Box>
        </Paper>

        {/* Force Check Dialog */}
        <Dialog
          open={showForceDialog}
          onClose={() => setShowForceDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: theme.shadows[10]
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoOutlined color="info" />
              <Typography variant="h6" component="span">
                Expiry Check Already Completed
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: 'text.secondary' }}>
              An expiry check has already been completed for today. Running multiple checks per day
              is currently disabled in the system configuration. If you need to run another check,
              please contact your system administrator to enable multiple manual checks.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button 
              onClick={() => setShowForceDialog(false)}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Understood
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  )
}

export default ExpiryMonitoring