import React, { useState } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useTheme,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from '@mui/material'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { DonutLarge, BarChart as BarChartIcon, RadarOutlined } from '@mui/icons-material'

function CategoryValuationChart({ categories, totalValue }) {
  const theme = useTheme()
  const [chartType, setChartType] = useState('pie')

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value || 0)
  }

  // Modern color palette
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
    '#8B5CF6', // Purple
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444'  // Red
  ]

  // Prepare data for charts
  const pieData = categories
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10)
    .map(cat => ({
      name: cat.categoryName,
      value: parseFloat(cat.totalValue),
      percentage: ((cat.totalValue / totalValue) * 100).toFixed(1)
    }))

  const barData = categories
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 8)
    .map(cat => ({
      name: cat.categoryName.length > 15 ? cat.categoryName.substring(0, 15) + '...' : cat.categoryName,
      value: parseFloat(cat.totalValue),
      products: cat.productCount,
      quantity: cat.totalQuantity
    }))

  const radarData = categories
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 6)
    .map(cat => ({
      category: cat.categoryName,
      value: (cat.totalValue / 1000).toFixed(1), // Convert to thousands for better visualization
      fullMark: Math.ceil(Math.max(...categories.map(c => c.totalValue)) / 1000)
    }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <Box 
          sx={{ 
            bgcolor: 'background.paper', 
            p: 1.5, 
            borderRadius: '8px',
            boxShadow: theme.shadows[4],
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {label || data.name || data.category}
          </Typography>
          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Value: {formatCurrency(data.value * (data.fullMark ? 1000 : 1))}
          </Typography>
          {data.products !== undefined && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Products: {data.products}
            </Typography>
          )}
          {data.quantity !== undefined && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Quantity: {formatNumber(data.quantity)}
            </Typography>
          )}
          {data.percentage !== undefined && (
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
              {data.percentage}% of total
            </Typography>
          )}
        </Box>
      )
    }
    return null
  }

  const renderCustomizedLabel = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null // Don't show label for small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <Grid container spacing={3}>
      {/* Chart Type Selector */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(e, newType) => newType && setChartType(newType)}
            sx={{
              '& .MuiToggleButton-root': {
                px: 2,
                py: 1,
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: '8px',
                border: `1px solid ${theme.palette.divider}`,
                '&.Mui-selected': {
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark
                  }
                }
              }
            }}
          >
            <ToggleButton value="pie">
              <DonutLarge fontSize="small" sx={{ mr: 1 }} />
              Pie Chart
            </ToggleButton>
            <ToggleButton value="bar">
              <BarChartIcon fontSize="small" sx={{ mr: 1 }} />
              Bar Chart
            </ToggleButton>
            <ToggleButton value="radar">
              <RadarOutlined fontSize="small" sx={{ mr: 1 }} />
              Radar Chart
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Grid>

      {/* Main Chart */}
      <Grid item xs={12} lg={8}>
        <Card 
          sx={{ 
            height: '100%',
            minHeight: 400,
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px'
          }}
        >
          <CardContent sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Value Distribution Visualization
            </Typography>
            
            <Box sx={{ height: 350 }}>
              {chartType === 'pie' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => (
                        <span style={{ fontSize: '12px', fontWeight: 500 }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {chartType === 'bar' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      fill={theme.palette.primary.main}
                      radius={[8, 8, 0, 0]}
                    >
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {chartType === 'radar' && (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={theme.palette.divider} />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, radarData[0]?.fullMark || 100]}
                      tick={{ fontSize: 10 }}
                    />
                    <Radar 
                      name="Value (in thousands)" 
                      dataKey="value" 
                      stroke={theme.palette.primary.main}
                      fill={theme.palette.primary.main}
                      fillOpacity={0.6}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Summary Statistics */}
      <Grid item xs={12} lg={4}>
        <Card 
          sx={{ 
            height: '100%',
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Distribution Summary
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Value Across Categories
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {formatCurrency(totalValue)}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Number of Categories
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {categories.length}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Average Value per Category
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {formatCurrency(totalValue / categories.length)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Top Category Contribution
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {categories[0]?.categoryName}
                </Typography>
                <Typography variant="body2" color="primary.main">
                  {formatCurrency(categories[0]?.totalValue)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(categories[0]?.totalValue / totalValue) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    bgcolor: theme.palette.primary.main
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {((categories[0]?.totalValue / totalValue) * 100).toFixed(1)}% of total value
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Categories Table */}
      <Grid item xs={12}>
        <Card 
          sx={{ 
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Top 10 Categories by Value
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Products</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Quantity</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total Value</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>% of Total</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Visual</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories
                    .sort((a, b) => b.totalValue - a.totalValue)
                    .slice(0, 10)
                    .map((category, index) => {
                      const percentage = ((category.totalValue / totalValue) * 100).toFixed(1)
                      
                      return (
                        <TableRow 
                          key={category.categoryId}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: alpha(theme.palette.primary.main, 0.02) 
                            }
                          }}
                        >
                          <TableCell>
                            <Chip 
                              label={`#${index + 1}`}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                bgcolor: index < 3 
                                  ? alpha(theme.palette.primary.main, 0.1)
                                  : alpha(theme.palette.grey[500], 0.1),
                                color: index < 3 
                                  ? 'primary.main'
                                  : 'text.secondary'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  bgcolor: COLORS[index % COLORS.length],
                                  borderRadius: '50%',
                                  mr: 1.5
                                }}
                              />
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {category.categoryName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">{category.productCount}</TableCell>
                          <TableCell align="right">{formatNumber(category.totalQuantity)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(category.totalValue)}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {percentage}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <LinearProgress
                              variant="determinate"
                              value={parseFloat(percentage)}
                              sx={{
                                width: 80,
                                height: 6,
                                borderRadius: 3,
                                bgcolor: alpha(COLORS[index % COLORS.length], 0.1),
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  bgcolor: COLORS[index % COLORS.length]
                                }
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default CategoryValuationChart