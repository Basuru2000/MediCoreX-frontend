import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Stack,
  useTheme,
  alpha
} from '@mui/material'
import {
  CheckCircle,
  Cancel,
  Warning,
  Assignment
} from '@mui/icons-material'
import { getChecklistByReceiptId } from '../../services/api'

function ChecklistSummary({ receiptId, checklist: initialChecklist }) {
  const theme = useTheme()
  const [checklist, setChecklist] = useState(initialChecklist)
  const [loading, setLoading] = useState(!initialChecklist)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!initialChecklist && receiptId) {
      fetchChecklist()
    }
  }, [receiptId, initialChecklist])

  const fetchChecklist = async () => {
    try {
      setLoading(true)
      const response = await getChecklistByReceiptId(receiptId)
      setChecklist(response.data)
    } catch (error) {
      console.error('Error fetching checklist:', error)
      setError('Failed to load quality checklist')
    } finally {
      setLoading(false)
    }
  }

  const getResultConfig = (result) => {
    const configs = {
      PASS: {
        color: 'success',
        bgcolor: alpha(theme.palette.success.main, 0.1),
        textColor: theme.palette.success.dark,
        icon: <CheckCircle sx={{ fontSize: 20 }} />
      },
      FAIL: {
        color: 'error',
        bgcolor: alpha(theme.palette.error.main, 0.1),
        textColor: theme.palette.error.dark,
        icon: <Cancel sx={{ fontSize: 20 }} />
      },
      CONDITIONAL: {
        color: 'warning',
        bgcolor: alpha(theme.palette.warning.main, 0.1),
        textColor: theme.palette.warning.dark,
        icon: <Warning sx={{ fontSize: 20 }} />
      }
    }
    
    return configs[result] || {
      color: 'default',
      bgcolor: alpha(theme.palette.grey[500], 0.1),
      textColor: theme.palette.text.secondary,
      icon: <Assignment sx={{ fontSize: 20 }} />
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={40} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            Loading checklist...
          </Typography>
        </Stack>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: '8px' }}>
        {error}
      </Alert>
    )
  }

  if (!checklist) {
    return (
      <Alert severity="info" sx={{ borderRadius: '8px' }}>
        No quality checklist found
      </Alert>
    )
  }

  const resultConfig = getResultConfig(checklist.overallResult)

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '8px'
      }}
    >
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="flex-start" mb={3}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '8px',
            backgroundColor: resultConfig.bgcolor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Assignment sx={{ color: resultConfig.textColor, fontSize: 24 }} />
        </Box>
        <Box flex={1}>
          <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.125rem' }}>
            Quality Inspection Report
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            Completed on {new Date(checklist.completedAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        </Box>
        <Chip
          icon={resultConfig.icon}
          label={checklist.overallResult}
          sx={{
            backgroundColor: resultConfig.bgcolor,
            color: resultConfig.textColor,
            fontWeight: 600,
            fontSize: '0.875rem',
            height: 32,
            '& .MuiChip-icon': {
              color: resultConfig.textColor
            }
          }}
        />
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* Summary Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: '8px',
              backgroundColor: alpha(theme.palette.success.main, 0.08),
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
            }}
          >
            <Typography variant="h4" color="success.main" fontWeight={700}>
              {checklist.passedChecks}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
              Passed Checks
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: '8px',
              backgroundColor: alpha(theme.palette.error.main, 0.08),
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
            }}
          >
            <Typography variant="h4" color="error.main" fontWeight={700}>
              {checklist.failedChecks}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
              Failed Checks
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: '8px',
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            <Typography variant="h4" color="primary.main" fontWeight={700}>
              {checklist.totalChecks}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
              Total Checks
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Inspector Details */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '8px',
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          Inspector
        </Typography>
        <Typography variant="body1" fontWeight={600} sx={{ fontSize: '0.9375rem' }}>
          {checklist.completedByName}
        </Typography>
        {checklist.inspectorNotes && (
          <Box mt={1.5}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Inspector Notes
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.875rem' }}>
              {checklist.inspectorNotes}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Detailed Checks */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, fontSize: '1rem' }}>
        Inspection Details
      </Typography>
      <TableContainer 
        component={Paper} 
        elevation={0}
        sx={{ 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '8px'
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.03) }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Check Item</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Answer</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {checklist.answers?.map((answer, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {answer.checkDescription}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                    {answer.answer}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    icon={answer.isCompliant ? <CheckCircle sx={{ fontSize: 14 }} /> : <Cancel sx={{ fontSize: 14 }} />}
                    label={answer.isCompliant ? 'Pass' : 'Fail'}
                    size="small"
                    color={answer.isCompliant ? 'success' : 'error'}
                    sx={{ 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      height: 24
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                    {answer.remarks || '—'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

export default ChecklistSummary