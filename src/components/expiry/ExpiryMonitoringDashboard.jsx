import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material'
import {
  Schedule,
  CheckCircle,
  Error,
  Warning,
  TrendingUp,
  Timer
} from '@mui/icons-material'
import { getExpiryMonitoringDashboard } from "../../services/api";

function ExpiryMonitoringDashboard() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await getExpiryMonitoringDashboard()
      setDashboardData(response.data)
    } catch (error) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box p={4}>
        <LinearProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    )
  }

  const getNextScheduledTime = () => {
    const now = new Date()
    const nextRun = new Date()
    nextRun.setHours(2, 0, 0, 0) // 2 AM
    
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1)
    }
    
    const hoursUntil = Math.floor((nextRun - now) / (1000 * 60 * 60))
    const minutesUntil = Math.floor(((nextRun - now) % (1000 * 60 * 60)) / (1000 * 60))
    
    return {
      time: nextRun.toLocaleString(),
      countdown: `${hoursUntil}h ${minutesUntil}m`
    }
  }

  const nextScheduled = getNextScheduledTime()

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Schedule Info */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" gutterBottom>
                  Automated Check Schedule
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Daily expiry checks run automatically at 2:00 AM
                </Typography>
              </Box>
              <Box textAlign="right">
                <Box display="flex" alignItems="center" gap={1} justifyContent="flex-end">
                  <Timer color="primary" />
                  <Typography variant="h6" color="primary.main">
                    {nextScheduled.countdown}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Next run: {nextScheduled.time}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Check Summary */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Check Summary
            </Typography>
            {dashboardData?.checkHistory?.length > 0 ? (
              <List>
                {dashboardData.checkHistory.slice(0, 5).map((check, index) => (
                  <ListItem key={check.checkLogId} divider={index < 4}>
                    <ListItemIcon>
                      {check.status === 'COMPLETED' ? (
                        <CheckCircle color="success" />
                      ) : check.status === 'FAILED' ? (
                        <Error color="error" />
                      ) : (
                        <Schedule color="primary" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={new Date(check.checkDate).toLocaleDateString()}
                      secondary={`${check.productsChecked} products, ${check.alertsGenerated} alerts`}
                    />
                    <Chip
                      label={`${(check.executionTimeMs / 1000).toFixed(1)}s`}
                      size="small"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No check history available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              System Health
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Scheduler"
                  secondary="Active"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Alert Configs"
                  secondary="5 active configurations"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Warning color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Pending Alerts"
                  secondary="12 unacknowledged"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Performance Trends */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <TrendingUp color="primary" />
              <Typography variant="h6">
                Performance Trends
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Avg. Products/Check
                    </Typography>
                    <Typography variant="h4">
                      {dashboardData?.checkHistory?.length > 0
                        ? Math.round(
                            dashboardData.checkHistory.reduce((sum, check) => 
                              sum + check.productsChecked, 0
                            ) / dashboardData.checkHistory.length
                          )
                        : 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Avg. Alerts/Check
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {dashboardData?.checkHistory?.length > 0
                        ? Math.round(
                            dashboardData.checkHistory.reduce((sum, check) => 
                              sum + check.alertsGenerated, 0
                            ) / dashboardData.checkHistory.length
                          )
                        : 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Avg. Execution Time
                    </Typography>
                    <Typography variant="h4">
                      {dashboardData?.checkHistory?.length > 0
                        ? (
                            dashboardData.checkHistory.reduce((sum, check) => 
                              sum + check.executionTimeMs, 0
                            ) / dashboardData.checkHistory.length / 1000
                          ).toFixed(1)
                        : 0}s
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Success Rate
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {dashboardData?.checkHistory?.length > 0
                        ? Math.round(
                            (dashboardData.checkHistory.filter(check => 
                              check.status === 'COMPLETED'
                            ).length / dashboardData.checkHistory.length) * 100
                          )
                        : 0}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ExpiryMonitoringDashboard