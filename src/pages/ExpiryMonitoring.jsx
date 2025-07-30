import { useState, useEffect } from 'react'
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
  Chip
} from '@mui/material'
import {
  PlayArrow,
  Refresh,
  Schedule,
  CheckCircle,
  Error,
  Warning,
  BoltOutlined
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
      
      // Set last check result
      if (response.data.length > 0) {
        setLastCheckResult(response.data[0])
        
        // Check if a check was already run today
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
      
      // Check if the response indicates the check was already run
      if (response.data.errorMessage?.includes('already completed')) {
        setCheckAlreadyRun(true)
        setError('An expiry check has already been completed for today.')
        setShowForceDialog(true)
        return
      }
      
      setLastCheckResult(response.data)
      setSuccess(`Expiry check completed. ${response.data.alertsGenerated} alerts generated.`)
      setCheckAlreadyRun(true)
      
      // Refresh history
      await fetchCheckHistory()
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to trigger expiry check'
      setError(errorMessage)
      
      // Show force dialog if the error is about already completed check
      if (errorMessage.includes('already completed')) {
        setCheckAlreadyRun(true)
        setShowForceDialog(true)
      }
    } finally {
      setTriggering(false)
    }
  }

  const handleForceCheck = async () => {
    setShowForceDialog(false)
    // In a real implementation, you would call a different endpoint for force check
    // For now, we'll just show a message
    setError('Force check functionality is available in development mode. Please enable "expiry.check.allow-multiple-manual=true" in application.properties')
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle color="success" />
      case 'FAILED':
        return <Error color="error" />
      case 'RUNNING':
        return <Schedule color="primary" />
      default:
        return null
    }
  }

  const getLastCheckInfo = () => {
    if (!lastCheckResult) {
      return 'No checks performed yet'
    }

    const checkDate = new Date(lastCheckResult.checkDate).toLocaleDateString()
    const status = lastCheckResult.status
    const checkType = lastCheckResult.startTime?.includes('02:00') ? 'Scheduled' : 'Manual'
    
    return (
      <Box display="flex" alignItems="center" gap={1}>
        {getStatusIcon(status)}
        <Typography>
          Last check: {checkDate} - {status}
        </Typography>
        <Chip label={checkType} size="small" variant="outlined" />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Expiry Monitoring
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Automated daily checks run at 2:00 AM. Monitor and manage expiry alert generation.
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            startIcon={<Refresh />}
            onClick={fetchCheckHistory}
            disabled={loading}
          >
            Refresh
          </Button>
          {isManager && (
            <Button
              variant="contained"
              startIcon={triggering ? <CircularProgress size={20} /> : <PlayArrow />}
              onClick={() => handleTriggerCheck(false)}
              disabled={triggering || loading}
            >
              {triggering ? 'Running Check...' : 'Run Manual Check'}
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }} 
          onClose={() => setError(null)}
          action={
            checkAlreadyRun && isManager ? (
              <Button color="inherit" size="small" onClick={() => setShowForceDialog(true)}>
                View Options
              </Button>
            ) : null
          }
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        {getLastCheckInfo()}
        {lastCheckResult && lastCheckResult.status === 'COMPLETED' && (
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Products Checked
                </Typography>
                <Typography variant="h6">
                  {lastCheckResult.productsChecked}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Alerts Generated
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {lastCheckResult.alertsGenerated}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Execution Time
                </Typography>
                <Typography variant="h6">
                  {(lastCheckResult.executionTimeMs / 1000).toFixed(1)}s
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Check Type
                </Typography>
                <Typography variant="h6">
                  {lastCheckResult.startTime ? 
                    (lastCheckResult.startTime.includes('02:00') ? 'Scheduled' : 'Manual') 
                    : 'Unknown'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Dashboard" />
          <Tab label="Check History" />
          <Tab label="Latest Report" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tabValue === 0 && <ExpiryMonitoringDashboard />}
          {tabValue === 1 && <ExpiryCheckHistory history={checkHistory} onRefresh={fetchCheckHistory} />}
          {tabValue === 2 && <AlertGenerationReport checkResult={lastCheckResult} />}
        </>
      )}

      {/* Force Check Dialog */}
      <Dialog open={showForceDialog} onClose={() => setShowForceDialog(false)}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning color="warning" />
            Expiry Check Already Completed
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            An expiry check has already been completed for today. Running multiple checks on the same day 
            might create duplicate alerts.
          </DialogContentText>
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Options:
            </Typography>
            <Typography variant="body2" paragraph>
              1. Wait until tomorrow for the next scheduled check (2:00 AM)
            </Typography>
            <Typography variant="body2" paragraph>
              2. Enable multiple manual checks in the backend configuration
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowForceDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ExpiryMonitoring