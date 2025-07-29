import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'

function AlertGenerationReport({ checkResult }) {
  if (!checkResult || checkResult.status !== 'COMPLETED') {
    return (
      <Box p={4} textAlign="center">
        <Typography color="text.secondary">
          No completed check report available.
        </Typography>
      </Box>
    )
  }

  const SEVERITY_COLORS = {
    'CRITICAL': '#d32f2f',
    'WARNING': '#f57c00',
    'INFO': '#1976d2'
  }

  const DAYS_COLORS = {
    '0-7 days': '#d32f2f',
    '8-30 days': '#f57c00',
    '31-60 days': '#fbc02d',
    '61-90 days': '#388e3c',
    '91+ days': '#1976d2'
  }

  // Prepare chart data
  const severityData = checkResult.alertsBySeverity ? 
    Object.entries(checkResult.alertsBySeverity).map(([severity, count]) => ({
      name: severity,
      value: count
    })) : []

  const daysData = checkResult.alertsByDaysRange ?
    Object.entries(checkResult.alertsByDaysRange).map(([range, count]) => ({
      name: range,
      value: count
    })) : []

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Alert Generation Report
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h4">
                {checkResult.productsChecked}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Alerts Generated
              </Typography>
              <Typography variant="h4" color="warning.main">
                {checkResult.alertsGenerated}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Alert Rate
              </Typography>
              <Typography variant="h4">
                {checkResult.productsChecked > 0 
                  ? `${((checkResult.alertsGenerated / checkResult.productsChecked) * 100).toFixed(1)}%`
                  : '0%'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Processing Time
              </Typography>
              <Typography variant="h4">
                {(checkResult.executionTimeMs / 1000).toFixed(1)}s
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        {severityData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Alerts by Severity
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {daysData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Alerts by Days Until Expiry
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={daysData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {daysData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DAYS_COLORS[entry.name]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Performance Metrics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Performance Metrics
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Products/Second
                </Typography>
                <Typography variant="h6">
                  {checkResult.executionTimeMs > 0 
                    ? (checkResult.productsChecked / (checkResult.executionTimeMs / 1000)).toFixed(1)
                    : '0'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Average Time per Product
                </Typography>
                <Typography variant="h6">
                  {checkResult.productsChecked > 0
                    ? `${(checkResult.executionTimeMs / checkResult.productsChecked).toFixed(1)}ms`
                    : '0ms'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Check Efficiency
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <LinearProgress
                    variant="determinate"
                    value={checkResult.productsChecked > 0 ? 100 : 0}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2">100%</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AlertGenerationReport