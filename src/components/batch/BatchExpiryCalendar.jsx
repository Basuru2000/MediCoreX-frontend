import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material'
import {
  ChevronLeft,
  ChevronRight,
  Warning,
  Schedule
} from '@mui/icons-material'
import { getExpiringBatches } from '../../services/api'

function BatchExpiryCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [batches, setBatches] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchExpiringBatches()
  }, [])

  const fetchExpiringBatches = async () => {
    try {
      const response = await getExpiringBatches(90) // Get batches expiring in next 90 days
      setBatches(response.data)
    } catch (error) {
      console.error('Failed to fetch expiring batches:', error)
    }
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getBatchesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return batches.filter(batch => batch.expiryDate === dateStr)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDateClick = (date) => {
    const batchesForDate = getBatchesForDate(date)
    if (batchesForDate.length > 0) {
      setSelectedDate(date)
      setDialogOpen(true)
    }
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<Grid item xs key={`empty-${i}`} sx={{ p: 1 }} />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const batchesForDate = getBatchesForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()

      days.push(
        <Grid item xs key={day}>
          <Paper
            sx={{
              p: 1,
              cursor: batchesForDate.length > 0 ? 'pointer' : 'default',
              backgroundColor: isToday ? 'primary.light' : 'background.paper',
              '&:hover': batchesForDate.length > 0 ? { backgroundColor: 'action.hover' } : {}
            }}
            onClick={() => handleDateClick(date)}
          >
            <Typography variant="body2" align="center">
              {day}
            </Typography>
            {batchesForDate.length > 0 && (
              <Box display="flex" justifyContent="center" mt={0.5}>
                <Chip
                  size="small"
                  label={batchesForDate.length}
                  color={batchesForDate.some(b => b.daysUntilExpiry <= 7) ? 'error' : 'warning'}
                  sx={{ height: 16, fontSize: '0.7rem' }}
                />
              </Box>
            )}
          </Paper>
        </Grid>
      )
    }

    return days
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <IconButton onClick={handlePrevMonth}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <ChevronRight />
          </IconButton>
        </Box>

        <Grid container spacing={1}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Grid item xs key={day}>
              <Typography variant="body2" align="center" fontWeight="bold">
                {day}
              </Typography>
            </Grid>
          ))}
          {renderCalendarDays()}
        </Grid>

        <Box mt={3}>
          <Typography variant="body2" color="text.secondary">
            <Warning color="error" sx={{ fontSize: 16, verticalAlign: 'middle' }} /> Critical (≤7 days)
            <Schedule color="warning" sx={{ fontSize: 16, verticalAlign: 'middle', ml: 2 }} /> Warning (8-30 days)
          </Typography>
        </Box>
      </Paper>

      {/* Date Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Batches Expiring on {selectedDate?.toLocaleDateString()}
        </DialogTitle>
        <DialogContent>
          <List>
            {selectedDate && getBatchesForDate(selectedDate).map(batch => (
              <ListItem key={batch.id}>
                <ListItemText
                  primary={`${batch.productName} - Batch: ${batch.batchNumber}`}
                  secondary={`Quantity: ${batch.quantity} | Days until expiry: ${batch.daysUntilExpiry}`}
                />
                <Chip
                  size="small"
                  color={batch.daysUntilExpiry <= 7 ? 'error' : 'warning'}
                  label={`${batch.daysUntilExpiry} days`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default BatchExpiryCalendar