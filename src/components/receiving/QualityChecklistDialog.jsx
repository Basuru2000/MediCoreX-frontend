import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Divider,
  Chip,
  LinearProgress,
  Paper,
  Grid
} from '@mui/material'
import {
  CheckCircle,
  Cancel,
  Warning,
  Info
} from '@mui/icons-material'
import { getDefaultChecklistTemplate, submitQualityChecklist } from '../../services/api'

function QualityChecklistDialog({ open, onClose, receipt, onChecklistComplete }) {
  const [template, setTemplate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [inspectorNotes, setInspectorNotes] = useState('')
  const [answers, setAnswers] = useState({})

  useEffect(() => {
    if (open && receipt) {
      fetchTemplate()
    }
  }, [open, receipt])

  const fetchTemplate = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getDefaultChecklistTemplate()
      setTemplate(response.data)
      
      // Initialize answers
      const initialAnswers = {}
      response.data.items.forEach(item => {
        initialAnswers[item.id] = {
          answer: item.checkType === 'YES_NO' ? 'YES' : '',
          remarks: ''
        }
      })
      setAnswers(initialAnswers)
    } catch (error) {
      console.error('Error fetching template:', error)
      setError('Failed to load quality checklist template')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (itemId, field, value) => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }))
  }

  const handleSubmit = async () => {
    // Validate all mandatory questions are answered
    const unanswered = template.items.filter(item => 
      item.isMandatory && !answers[item.id]?.answer
    )

    if (unanswered.length > 0) {
      setError('Please answer all mandatory questions')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const submissionData = {
        receiptId: receipt.id,
        templateId: template.id,
        inspectorNotes: inspectorNotes,
        answers: template.items.map(item => ({
          checkItemId: item.id,
          answer: answers[item.id].answer,
          remarks: answers[item.id].remarks || null
        }))
      }

      const response = await submitQualityChecklist(submissionData)
      
      if (onChecklistComplete) {
        onChecklistComplete(response.data)
      }
      
      onClose()
    } catch (error) {
      console.error('Error submitting checklist:', error)
      setError(error.response?.data?.message || 'Failed to submit quality checklist')
    } finally {
      setSubmitting(false)
    }
  }

  const getProgress = () => {
    if (!template) return 0
    const answered = template.items.filter(item => answers[item.id]?.answer).length
    return Math.round((answered / template.items.length) * 100)
  }

  const renderCheckItem = (item) => {
    const currentAnswer = answers[item.id] || { answer: '', remarks: '' }

    return (
      <Paper key={item.id} elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="flex-start" gap={1} mb={1}>
          <Chip 
            label={item.itemOrder} 
            size="small" 
            color="primary" 
            sx={{ minWidth: 32 }}
          />
          <Box flex={1}>
            <Typography variant="body1" fontWeight={500}>
              {item.checkDescription}
              {item.isMandatory && (
                <Chip 
                  label="Required" 
                  size="small" 
                  color="error" 
                  sx={{ ml: 1, height: 20 }}
                />
              )}
            </Typography>
            {item.notes && (
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                <Info fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                {item.notes}
              </Typography>
            )}
          </Box>
        </Box>

        {item.checkType === 'YES_NO' && (
          <FormControl component="fieldset" sx={{ ml: 5 }}>
            <RadioGroup
              row
              value={currentAnswer.answer}
              onChange={(e) => handleAnswerChange(item.id, 'answer', e.target.value)}
            >
              <FormControlLabel 
                value="YES" 
                control={<Radio />} 
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CheckCircle fontSize="small" color="success" />
                    <Typography>Yes</Typography>
                  </Box>
                }
              />
              <FormControlLabel 
                value="NO" 
                control={<Radio />} 
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Cancel fontSize="small" color="error" />
                    <Typography>No</Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        )}

        {item.checkType === 'PASS_FAIL' && (
          <FormControl component="fieldset" sx={{ ml: 5 }}>
            <RadioGroup
              row
              value={currentAnswer.answer}
              onChange={(e) => handleAnswerChange(item.id, 'answer', e.target.value)}
            >
              <FormControlLabel value="PASS" control={<Radio />} label="Pass" />
              <FormControlLabel value="FAIL" control={<Radio />} label="Fail" />
            </RadioGroup>
          </FormControl>
        )}

        {(item.checkType === 'TEXT' || item.checkType === 'NUMERIC') && (
          <TextField
            fullWidth
            size="small"
            type={item.checkType === 'NUMERIC' ? 'number' : 'text'}
            placeholder="Enter value..."
            value={currentAnswer.answer}
            onChange={(e) => handleAnswerChange(item.id, 'answer', e.target.value)}
            sx={{ ml: 5, maxWidth: 400 }}
          />
        )}

        <TextField
          fullWidth
          size="small"
          multiline
          rows={2}
          placeholder="Additional remarks (optional)..."
          value={currentAnswer.remarks}
          onChange={(e) => handleAnswerChange(item.id, 'remarks', e.target.value)}
          sx={{ ml: 5, mt: 1 }}
        />
      </Paper>
    )
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { height: '90vh' } }}
    >
      <DialogTitle>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Quality Inspection Checklist
          </Typography>
          {receipt && (
            <Typography variant="body2" color="text.secondary">
              Receipt: {receipt.receiptNumber} | PO: {receipt.poNumber}
            </Typography>
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <LinearProgress sx={{ width: '50%' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        ) : template ? (
          <Box>
            {/* Progress Indicator */}
            <Box mb={3}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" fontWeight={500}>
                  Checklist Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getProgress()}% Complete
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={getProgress()} 
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Template Info */}
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {template.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {template.description}
              </Typography>
              <Chip 
                label={`${template.itemCount} Checks`} 
                size="small" 
                sx={{ mt: 1 }}
              />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Check Items */}
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Inspection Points
            </Typography>
            {template.items.map(renderCheckItem)}

            {/* Inspector Notes */}
            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Inspector Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add any overall observations or notes..."
                value={inspectorNotes}
                onChange={(e) => setInspectorNotes(e.target.value)}
              />
            </Box>
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading || submitting || getProgress() < 100}
        >
          {submitting ? 'Submitting...' : 'Submit Checklist'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default QualityChecklistDialog