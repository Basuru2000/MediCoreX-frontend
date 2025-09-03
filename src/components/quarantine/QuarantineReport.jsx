import React, { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Stack,
  Chip,
  Avatar,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Skeleton
} from '@mui/material'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  Download,
  TrendingUp,
  TrendingDown,
  Assessment,
  PieChartOutline,
  ShowChart,
  Warning,
  CheckCircle
} from '@mui/icons-material'
import { getQuarantineSummary } from '../../services/api'

const QuarantineReport = () => {
  const theme = useTheme()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    try {
      setLoading(true)
      const response = await getQuarantineSummary()
      setSummary(response.data)
    } catch (error) {
      console.error('Failed to load summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export report')
  }

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map(i => (
          <Grid item xs={12} md={6} key={i}>
            <Paper sx={{ p: 3, borderRadius: '12px', height: 300 }}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    )
  }

  if (!summary) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`,
          textAlign: 'center'
        }}
      >
        <Warning sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 2 }} />
        <Typography variant="h6">No data available</Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
          Start by quarantining items to generate reports
        </Typography>
      </Paper>
    )
  }

  // Prepare chart data
  const statusData = [
    { name: 'Pending Review', value: summary.pendingReview, color: theme.palette.warning.main },
    { name: 'Under Review', value: summary.underReview, color: theme.palette.info.main },
    { name: 'Awaiting Disposal', value: summary.awaitingDisposal, color: theme.palette.error.main },
    { name: 'Awaiting Return', value: summary.awaitingReturn, color: theme.palette.secondary.main },
    { name: 'Disposed', value: summary.disposed, color: theme.palette.grey[600] },
    { name: 'Returned', value: summary.returned, color: theme.palette.success.main }
  ].filter(item => item.value > 0)

  const completionRate = summary.totalItems > 0
    ? ((summary.disposed + summary.returned) / summary.totalItems * 100).toFixed(1)
    : 0

  const progressData = [
    { stage: 'Quarantined', count: summary.totalItems },
    { stage: 'Reviewed', count: summary.underReview + summary.awaitingDisposal + summary.awaitingReturn + summary.disposed + summary.returned },
    { stage: 'Actioned', count: summary.awaitingDisposal + summary.awaitingReturn + summary.disposed + summary.returned },
    { stage: 'Completed', count: summary.disposed + summary.returned }
  ]

  // Mock trend data (would come from API in real implementation)
  const trendData = [
    { month: 'Jan', quarantined: 12, disposed: 8, returned: 4 },
    { month: 'Feb', quarantined: 19, disposed: 12, returned: 7 },
    { month: 'Mar', quarantined: 15, disposed: 10, returned: 5 },
    { month: 'Apr', quarantined: 22, disposed: 15, returned: 7 },
    { month: 'May', quarantined: 18, disposed: 14, returned: 4 },
    { month: 'Jun', quarantined: 25, disposed: 18, returned: 7 }
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 1.5,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="caption"
              sx={{ display: 'block', color: entry.color, mt: 0.5 }}
            >
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Paper>
      )
    }
    return null
  }

  return (
    <Box>
      {/* Report Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Quarantine Analytics & Reports
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleExport}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            borderColor: theme.palette.divider,
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.05)
            }
          }}
        >
          Export Report
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {/* Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <PieChartOutline sx={{ color: theme.palette.primary.main }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Status Distribution
              </Typography>
            </Stack>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: theme.palette.text.primary, fontSize: '0.875rem' }}>
                      {value}: {entry.payload.value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Progress Funnel */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <ShowChart sx={{ color: theme.palette.primary.main }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Processing Funnel
              </Typography>
            </Stack>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={80} />
                <ChartTooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill={theme.palette.primary.main}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Monthly Trends */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Assessment sx={{ color: theme.palette.primary.main }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Monthly Trends
              </Typography>
            </Stack>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorQuarantined" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.warning.main} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.palette.warning.main} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDisposed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="quarantined" 
                  stroke={theme.palette.warning.main}
                  fill="url(#colorQuarantined)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="disposed" 
                  stroke={theme.palette.error.main}
                  fill="url(#colorDisposed)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="returned" 
                  stroke={theme.palette.success.main}
                  fill="url(#colorReturned)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Key Metrics Cards */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Key Performance Indicators
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none'
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack spacing={1}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                      Total Quantity Quarantined
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                      {summary.totalQuantity?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      units in system
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none'
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack spacing={1}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                      Estimated Total Loss
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                      ${summary.totalEstimatedLoss?.toFixed(2) || '0.00'}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <TrendingUp sx={{ fontSize: 14, color: theme.palette.error.main }} />
                      <Typography variant="caption" sx={{ color: theme.palette.error.main }}>
                        +12.5% vs last month
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none'
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack spacing={1}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                      Completion Rate
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                      {completionRate}%
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <CheckCircle sx={{ fontSize: 14, color: theme.palette.success.main }} />
                      <Typography variant="caption" sx={{ color: theme.palette.success.main }}>
                        {summary.disposed + summary.returned} completed
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none'
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack spacing={1}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                      Pending Actions
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                      {summary.pendingReview}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      items need review
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default QuarantineReport