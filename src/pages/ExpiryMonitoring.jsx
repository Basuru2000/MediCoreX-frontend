import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material'
import {
  PlayArrow,
  Refresh,
  Schedule,
  CheckCircle,
  Error
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
      }
    } catch (error) {
      setError('Failed to fetch check history')
    } finally {
      setLoading(false)
    }
  }

  const handleTriggerCheck = async () => {
    try {
      setTriggering(true)
      setError(null)
      setSuccess(null)
      
      const response = await triggerExpiryCheck()
      setLastCheckResult(response.data)
      setSuccess(`Expiry check completed. ${response.data.alertsGenerated} alerts generated.`)
      
      // Refresh history
      await fetchCheckHistory()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to trigger expiry check')
    } finally {
      setTriggering(false)
    }
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
    return (
      <Box display="flex" alignItems="center" gap={1}>
        {getStatusIcon(status)}
        <Typography>
          Last check: {checkDate} - {status}
        </Typography>
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
              onClick={handleTriggerCheck}
              disabled={triggering || loading}
            >
              {triggering ? 'Running Check...' : 'Run Manual Check'}
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
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
              <Grid item xs={3}>
                <Typography variant="body2" color="text.secondary">
                  Products Checked
                </Typography>
                <Typography variant="h6">
                  {lastCheckResult.productsChecked}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" color="text.secondary">
                  Alerts Generated
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {lastCheckResult.alertsGenerated}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" color="text.secondary">
                  Execution Time
                </Typography>
                <Typography variant="h6">
                  {lastCheckResult.executionTimeMs}ms
                </Typography>
              </Grid>
              <Grid item xs={3}>
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
    </Box>
  )
}

export default ExpiryMonitoring