import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
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

function TopSuppliersChart({ data, loading, sortBy = 'value' }) {
  const theme = useTheme()

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2">Loading supplier data...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Top Suppliers</Typography>
          <Typography variant="body2" color="text.secondary">
            No supplier data available
          </Typography>
        </CardContent>
      </Card>
    )
  }

  // Format data for chart
  const chartData = data.map(supplier => ({
    name: supplier.supplierCode || supplier.supplierName.substring(0, 15),
    'Total Value': Math.round(supplier.totalValue / 1000), // Convert to thousands
    'PO Count': supplier.totalPOs,
    'Completion Rate': Math.round(supplier.completionRate)
  }))

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Top Suppliers by {sortBy === 'value' ? 'Value' : 'Volume'}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Performance comparison of top suppliers
        </Typography>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11 }}
              stroke={theme.palette.text.secondary}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke={theme.palette.text.secondary}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8
              }}
              formatter={(value, name) => {
                if (name === 'Total Value') {
                  return [`$${value}K`, name]
                }
                if (name === 'Completion Rate') {
                  return [`${value}%`, name]
                }
                return [value, name]
              }}
            />
            <Legend />
            
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
        <Box mt={4}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            Detailed Breakdown
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Supplier</strong></TableCell>
                  <TableCell align="right"><strong>POs</strong></TableCell>
                  <TableCell align="right"><strong>Value</strong></TableCell>
                  <TableCell align="right"><strong>Completion</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.slice(0, 5).map((supplier) => (
                  <TableRow key={supplier.supplierId}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {supplier.supplierName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {supplier.supplierCode}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{supplier.totalPOs}</TableCell>
                    <TableCell align="right">
                      ${supplier.totalValue.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${supplier.completionRate.toFixed(0)}%`}
                        size="small"
                        color={
                          supplier.completionRate >= 90 ? 'success' :
                          supplier.completionRate >= 70 ? 'warning' : 'error'
                        }
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