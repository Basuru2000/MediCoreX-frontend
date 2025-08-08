import React from 'react';
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
  Paper
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent
} from '@mui/lab';
import { format } from 'date-fns';

const QuarantineDetails = ({ record, open, onClose, onAction }) => {
  if (!record) return null;

  const getStatusColor = (status) => {
    const colors = {
      PENDING_REVIEW: 'warning',
      UNDER_REVIEW: 'info',
      APPROVED_FOR_DISPOSAL: 'error',
      APPROVED_FOR_RETURN: 'secondary',
      DISPOSED: 'default',
      RETURNED: 'success'
    };
    return colors[status] || 'default';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Quarantine Record Details
        <Chip
          label={record.status.replace(/_/g, ' ')}
          color={getStatusColor(record.status)}
          size="small"
          sx={{ ml: 2 }}
        />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Product Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Product Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Product Name
                </Typography>
                <Typography variant="body1">
                  {record.productName}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Product Code
                </Typography>
                <Typography variant="body1">
                  {record.productCode}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Batch Number
                </Typography>
                <Typography variant="body1">
                  {record.batchNumber}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Quantity Quarantined
                </Typography>
                <Typography variant="body1">
                  {record.quantityQuarantined} units
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Quarantine Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Quarantine Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Quarantine Date
                </Typography>
                <Typography variant="body1">
                  {format(new Date(record.quarantineDate), 'MMM dd, yyyy')}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Days in Quarantine
                </Typography>
                <Typography variant="body1">
                  {record.daysInQuarantine} days
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Reason
                </Typography>
                <Typography variant="body1">
                  {record.reason}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Estimated Loss
                </Typography>
                <Typography variant="body1" color="error">
                  ${record.estimatedLoss?.toFixed(2) || '0.00'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Review Information */}
          {record.reviewDate && (
            <>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Review Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Review Date
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(record.reviewDate), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Reviewed By
                    </Typography>
                    <Typography variant="body1">
                      {record.reviewedBy}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </>
          )}

          {/* Disposal Information */}
          {record.disposalDate && (
            <>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Disposal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Disposal Date
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(record.disposalDate), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Disposal Method
                    </Typography>
                    <Typography variant="body1">
                      {record.disposalMethod}
                    </Typography>
                  </Grid>
                  {record.disposalCertificate && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Disposal Certificate
                      </Typography>
                      <Typography variant="body1">
                        {record.disposalCertificate}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </>
          )}

          {/* Notes */}
          {record.notes && (
            <>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Notes
                </Typography>
                <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                  {record.notes}
                </Typography>
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {record.canApprove && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => onAction('UNDER_REVIEW')}
          >
            Start Review
          </Button>
        )}
        {record.canDispose && (
          <Button 
            variant="contained" 
            color="error"
            onClick={() => onAction('DISPOSE')}
          >
            Confirm Disposal
          </Button>
        )}
        {record.canReturn && (
          <Button 
            variant="contained" 
            color="success"
            onClick={() => onAction('RETURN')}
          >
            Confirm Return
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QuarantineDetails;