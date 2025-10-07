import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  useTheme,
  alpha,
  Stack
} from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Business } from '@mui/icons-material'

function TopSuppliersChart({ data, loading, sortBy }) {
  const theme = useTheme()

  if (loading) {
    return (
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="text" width={200} height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={300} height={20} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: '8px' }} />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main
              }}
            >
              <Business fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Top Suppliers
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            No supplier data available
          </Typography>
        </CardContent>
      </Card>
    )
  }

  // Format data for chart
  const chartData = data.map(supplier => ({
    name: supplier.supplierCode,
    fullName: supplier.supplierName,
    'Total Value': Math.round(supplier.totalValue / 1000), // Convert to thousands
    'PO Count': supplier.totalPOs,
    'Completion Rate': supplier.completionRate
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const supplierData = data.find(s => s.supplierCode === label)
      return (
        <Box
          sx={{
            bgcolor: theme.palette.background.paper,
            p: 2,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
            minWidth: 200
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {supplierData?.supplierName}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Code: {label}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={index} display="flex" alignItems="center" justifyContent="space-between" gap={2} sx={{ mt: 0.5 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: entry.color
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {entry.name}:
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={600}>
                {entry.name === 'Total Value' ? `$${entry.value}K` : 
                 entry.name === 'Completion Rate' ? `${entry.value.toFixed(1)}%` : 
                 entry.value}
              </Typography>
            </Box>
          ))}
        </Box>
      )
    }
    return null
  }

  return (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: '12px',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main
            }}
          >
            <Business fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Top Suppliers
          </Typography>
        </Stack>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 3, ml: { xs: 0, sm: 5.5 } }}
        >
          {sortBy === 'value' ? 'Ranked by total purchase value' : 'Ranked by purchase order count'}
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={alpha(theme.palette.divider, 0.5)}
              vertical={false}
            />
            <XAxis 
              dataKey="name" 
              tick={{ 
                fontSize: 11,
                fill: theme.palette.text.secondary
              }}
              stroke={alpha(theme.palette.text.secondary, 0.2)}
            />
            <YAxis 
              tick={{ 
                fontSize: 12,
                fill: theme.palette.text.secondary
              }}
              stroke={alpha(theme.palette.text.secondary, 0.2)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '14px'
              }}
            />
            {sortBy === 'value' ? (
              <Bar 
                dataKey="Total Value" 
                fill={theme.palette.primary.main}
                radius={[8, 8, 0, 0]}
              />
            ) : (
              <Bar 
                dataKey="PO Count" 
                fill={theme.palette.success.main}
                radius={[8, 8, 0, 0]}
              />
            )}
            <Bar 
              dataKey="Completion Rate" 
              fill={theme.palette.info.main}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Detailed Table */}
        <Box sx={{ mt: 4 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 2,
              fontWeight: 600,
              color: theme.palette.text.primary
            }}
          >
            Detailed Breakdown
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Supplier
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    POs
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Value
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Completion
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.slice(0, 5).map((supplier, index) => (
                  <TableRow 
                    key={supplier.supplierId}
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {supplier.supplierName}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {supplier.supplierCode}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {supplier.totalPOs}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ${supplier.totalValue.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${supplier.completionRate.toFixed(0)}%`}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          bgcolor: supplier.completionRate >= 90 
                            ? alpha(theme.palette.success.main, 0.1)
                            : supplier.completionRate >= 70 
                            ? alpha(theme.palette.warning.main, 0.1)
                            : alpha(theme.palette.error.main, 0.1),
                          color: supplier.completionRate >= 90 
                            ? theme.palette.success.main
                            : supplier.completionRate >= 70 
                            ? theme.palette.warning.main
                            : theme.palette.error.main,
                          border: 'none'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

export default TopSuppliersChart