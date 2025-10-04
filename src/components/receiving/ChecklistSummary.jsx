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
  CircularProgress
} from '@mui/material'
import {
  CheckCircle,
  Cancel,
  Warning,
  Assignment
} from '@mui/icons-material'
import { getChecklistByReceiptId } from '../../services/api'

function ChecklistSummary({ receiptId, checklist: initialChecklist }) {
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

  const getResultColor = (result) => {
    switch (result) {
      case 'PASS': return 'success'
      case 'FAIL': return 'error'
      case 'CONDITIONAL': return 'warning'
      default: return 'default'
    }
  }

  const getResultIcon = (result) => {
    switch (result) {
      case 'PASS': return <CheckCircle />
      case 'FAIL': return <Cancel />
      case 'CONDITIONAL': return <Warning />
      default: return <Assignment />
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    )
  }

  if (!checklist) {
    return (
      <Alert severity="info">No quality checklist found</Alert>
    )
  }

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Assignment color="primary" sx={{ fontSize: 32 }} />
        <Box flex={1}>
          <Typography variant="h6" fontWeight={600}>
            Quality Inspection Report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Completed on {new Date(checklist.completedAt).toLocaleString()}
          </Typography>
        </Box>
        <Chip
          icon={getResultIcon(checklist.overallResult)}
          label={checklist.overallResult}
          color={getResultColor(checklist.overallResult)}
          size="large"
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Summary Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={4}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
            <Typography variant="h4" color="success.main" fontWeight={700}>
              {checklist.passedChecks}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Passed Checks
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
            <Typography variant="h4" color="error.main" fontWeight={700}>
              {checklist.failedChecks}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Failed Checks
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
            <Typography variant="h4" color="primary.main" fontWeight={700}>
              {checklist.totalChecks}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Checks
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Inspector Info */}
      <Box mb={3}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Inspector
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {checklist.completedByName}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Template Used
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {checklist.templateName}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Inspector Notes */}
      {checklist.inspectorNotes && (
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Inspector Notes
          </Typography>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2">
              {checklist.inspectorNotes}
            </Typography>
          </Paper>
        </Box>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Detailed Answers */}
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Inspection Details
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width="50%">Check Point</TableCell>
              <TableCell align="center">Answer</TableCell>
              <TableCell align="center">Result</TableCell>
              <TableCell>Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {checklist.answers.map((answer, index) => (
              <TableRow key={answer.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip 
                      label={index + 1} 
                      size="small" 
                      sx={{ minWidth: 32 }} 
                    />
                    <Typography variant="body2">
                      {answer.checkDescription}
                      {answer.isMandatory && (
                        <Chip 
                          label="Required" 
                          size="small" 
                          color="error" 
                          sx={{ ml: 1, height: 18 }} 
                        />
                      )}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={answer.answer} 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  {answer.isCompliant ? (
                    <CheckCircle color="success" fontSize="small" />
                  ) : (
                    <Cancel color="error" fontSize="small" />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
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