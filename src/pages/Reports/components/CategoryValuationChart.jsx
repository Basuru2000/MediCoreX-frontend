import React from 'react'
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
  Paper
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

function CategoryValuationChart({ categories, totalValue }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)
  }

  // Colors for the charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

  // Prepare data for pie chart
  const pieData = categories.map(cat => ({
    name: cat.categoryName,
    value: parseFloat(cat.totalValue)
  }))

  // Prepare data for bar chart
  const barData = categories.map(cat => ({
    name: cat.categoryName,
    value: parseFloat(cat.totalValue),
    products: cat.productCount,
    quantity: cat.totalQuantity
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <Box sx={{ bgcolor: 'background.paper', p: 1, border: 1, borderColor: 'grey.300' }}>
          <Typography variant="subtitle2">{label}</Typography>
          <Typography variant="body2">Value: {formatCurrency(data.value)}</Typography>
          <Typography variant="body2">Products: {data.products}</Typography>
          <Typography variant="body2">Quantity: {data.quantity}</Typography>
        </Box>
      )
    }
    return null
  }

  return (
    <Grid container spacing={3}>
      {/* Pie Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Value Distribution by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Bar Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Category Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#8884d8">
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Detailed Table */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Category Valuation Details
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Products</TableCell>
                    <TableCell align="right">Total Quantity</TableCell>
                    <TableCell align="right">Total Value</TableCell>
                    <TableCell align="right">% of Total</TableCell>
                    <TableCell align="right">Avg Product Value</TableCell>
                    <TableCell>Visual</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category, index) => (
                    <TableRow key={category.categoryId}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              bgcolor: COLORS[index % COLORS.length],
                              borderRadius: '50%',
                              mr: 1
                            }}
                          />
                          {category.categoryName}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{category.productCount}</TableCell>
                      <TableCell align="right">{category.totalQuantity.toLocaleString()}</TableCell>
                      <TableCell align="right">{formatCurrency(category.totalValue)}</TableCell>
                      <TableCell align="right">{category.percentageOfTotal.toFixed(1)}%</TableCell>
                      <TableCell align="right">{formatCurrency(category.averageProductValue)}</TableCell>
                      <TableCell>
                        <Box sx={{ width: 100 }}>
                          <LinearProgress
                            variant="determinate"
                            value={parseFloat(category.percentageOfTotal)}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: COLORS[index % COLORS.length]
                              }
                            }}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>
                      Total
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(totalValue)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      100.0%
                    </TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
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