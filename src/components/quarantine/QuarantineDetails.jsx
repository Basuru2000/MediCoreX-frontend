import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Divider,
  Box,
  Chip,
  Paper,
  Stack,
  Avatar,
  IconButton,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent
} from '@mui/lab'
import {
  Close,
  Schedule,
  Delete,
  AssignmentReturn,
  Warning,
  CheckCircle,
  AccessTime,
  Person,
  Inventory,
  AttachMoney,
  Description
} from '@mui/icons-material'
import { format } from 'date-fns'

const QuarantineDetails = ({ record, open, onClose, onAction }) => {
  const theme = useTheme()

  if (!record) return null

  const getStatusColor = (status) => {
    const colors = {
      PENDING_REVIEW: theme.palette.warning.main,
      UNDER_REVIEW: theme.palette.info.main,
      APPROVED_FOR_DISPOSAL: theme.palette.error.main,
      APPROVED_FOR_RETURN: theme.palette.secondary.main,
      DISPOSED: theme.palette.grey[600],
      RETURNED: theme.palette.success.main
    }
    return colors[status] || theme.palette.grey[600]
  }

  const getStatusIcon = (status) => {
    const icons = {
      PENDING_REVIEW: <Schedule />,
      UNDER_REVIEW: <Schedule />,
      APPROVED_FOR_DISPOSAL: <Delete />,
      APPROVED_FOR_RETURN: <AssignmentReturn />,
      DISPOSED: <Delete />,
      RETURNED: <CheckCircle />
    }
    return icons[status] || <Warning />
  }

  const InfoCard = ({ icon, label, value, color }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          backgroundColor: alpha(color || theme.palette.primary.main, 0.1)
        }}
      >
        {React.cloneElement(icon, { 
          sx: { 
            fontSize: 18, 
            color: color || theme.palette.primary.main 
          } 
        })}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
          {value || 'N/A'}
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          pb: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Quarantine Record Details
          </Typography>
          <Chip
            icon={getStatusIcon(record.status)}
            label={record.status.replace(/_/g, ' ')}
            size="small"
            sx={{
              backgroundColor: alpha(getStatusColor(record.status), 0.1),
              color: getStatusColor(record.status),
              fontWeight: 600,
              fontSize: '0.75rem',
              '& .MuiChip-icon': {
                color: getStatusColor(record.status),
                fontSize: 16,
                marginLeft: '6px'
              }
            }}
          />
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: alpha(theme.palette.text.secondary, 0.1)
            }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Product Information Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
              Product Information
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '10px',
                backgroundColor: alpha(theme.palette.grey[100], 0.5),
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    icon={<Inventory />}
                    label="Product Name"
                    value={record.productName}
                    color={theme.palette.primary.main}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    icon={<Description />}
                    label="Product Code"
                    value={record.productCode}
                    color={theme.palette.secondary.main}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    icon={<Inventory />}
                    label="Batch Number"
                    value={record.batchNumber}
                    color={theme.palette.info.main}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    icon={<Inventory />}
                    label="Quantity Quarantined"
                    value={`${record.quantityQuarantined} units`}
                    color={theme.palette.warning.main}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Quarantine Details Section */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
              Quarantine Details
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '10px',
                backgroundColor: alpha(theme.palette.grey[100], 0.5),
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    icon={<AccessTime />}
                    label="Quarantine Date"
                    value={record.quarantineDate ? format(new Date(record.quarantineDate), 'MMMM dd, yyyy') : 'N/A'}
                    color={theme.palette.info.main}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    icon={<Person />}
                    label="Quarantined By"
                    value={record.quarantinedBy}
                    color={theme.palette.primary.main}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    icon={<Warning />}
                    label="Reason"
                    value={record.reason}
                    color={theme.palette.error.main}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoCard
                    icon={<AttachMoney />}
                    label="Estimated Loss"
                    value={`$${record.estimatedLoss ? record.estimatedLoss.toFixed(2) : '0.00'}`}
                    color={theme.palette.error.main}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Status Timeline */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
              Status History
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '10px',
                backgroundColor: alpha(theme.palette.grey[100], 0.5),
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Timeline position="alternate" sx={{ p: 0, m: 0 }}>
                <TimelineItem>
                  <TimelineOppositeContent sx={{ flex: 0.3 }}>
                    <Typography variant="caption" color="text.secondary">
                      {record.quarantineDate ? format(new Date(record.quarantineDate), 'MMM dd') : 'N/A'}
                    </Typography>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot sx={{ backgroundColor: theme.palette.warning.main }}>
                      <Warning sx={{ fontSize: 16 }} />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Quarantined
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      By {record.quarantinedBy}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>

                {record.reviewedAt && (
                  <TimelineItem>
                    <TimelineOppositeContent sx={{ flex: 0.3 }}>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(record.reviewedAt), 'MMM dd')}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot sx={{ backgroundColor: theme.palette.info.main }}>
                        <Schedule sx={{ fontSize: 16 }} />
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Under Review
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        By {record.reviewedBy}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {(record.status === 'DISPOSED' || record.status === 'RETURNED') && (
                  <TimelineItem>
                    <TimelineOppositeContent sx={{ flex: 0.3 }}>
                      <Typography variant="caption" color="text.secondary">
                        {record.disposalDate ? format(new Date(record.disposalDate), 'MMM dd') : 'Current'}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot sx={{ backgroundColor: getStatusColor(record.status) }}>
                        {record.status === 'DISPOSED' ? <Delete sx={{ fontSize: 16 }} /> : <CheckCircle sx={{ fontSize: 16 }} />}
                      </TimelineDot>
                    </TimelineSeparator>
                    <TimelineContent sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {record.status === 'DISPOSED' ? 'Disposed' : 'Returned'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {record.status === 'DISPOSED' && record.disposalMethod}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}
              </Timeline>
            </Paper>
          </Box>

          {/* Additional Information */}
          {(record.disposalMethod || record.disposalCertificate || record.notes) && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.primary }}>
                Additional Information
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '10px',
                  backgroundColor: alpha(theme.palette.grey[100], 0.5),
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Stack spacing={2}>
                  {record.disposalMethod && (
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Disposal Method
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {record.disposalMethod}
                      </Typography>
                    </Box>
                  )}
                  {record.disposalCertificate && (
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Disposal Certificate
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {record.disposalCertificate}
                      </Typography>
                    </Box>
                  )}
                  {record.notes && (
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Notes
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {record.notes}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button 
          onClick={onClose}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Close
        </Button>
        {record.status === 'PENDING_REVIEW' && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => onAction('REVIEW')}
            startIcon={<Schedule />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Start Review
          </Button>
        )}
        {record.status === 'UNDER_REVIEW' && (
          <>
            <Button 
              variant="contained" 
              color="error"
              onClick={() => onAction('APPROVE_DISPOSAL')}
              startIcon={<Delete />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Approve Disposal
            </Button>
            <Button 
              variant="contained" 
              color="success"
              onClick={() => onAction('APPROVE_RETURN')}
              startIcon={<AssignmentReturn />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              Approve Return
            </Button>
          </>
        )}
        {record.status === 'APPROVED_FOR_DISPOSAL' && (
          <Button 
            variant="contained" 
            color="error"
            onClick={() => onAction('DISPOSE')}
            startIcon={<Delete />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Confirm Disposal
          </Button>
        )}
        {record.status === 'APPROVED_FOR_RETURN' && (
          <Button 
            variant="contained" 
            color="success"
            onClick={() => onAction('RETURN')}
            startIcon={<CheckCircle />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Confirm Return
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default QuarantineDetails