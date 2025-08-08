import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Alert,
  Divider,
  Chip,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { 
  getQuarantineRecord,
  processQuarantineAction 
} from '../../services/api';

const QuarantineApproval = ({ recordId, onComplete, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvalData, setApprovalData] = useState({
    decision: '', // 'DISPOSAL' or 'RETURN'
    reviewNotes: '',
    riskAssessment: '',
    disposalMethod: '',
    disposalJustification: '',
    returnJustification: '',
    supplierNotified: false,
    complianceChecked: false,
    managerApproval: false
  });

  const steps = [
    'Review Information',
    'Risk Assessment',
    'Decision',
    'Documentation',
    'Final Approval'
  ];

  useEffect(() => {
    if (recordId) {
      loadRecord();
    }
  }, [recordId]);

  const loadRecord = async () => {
    try {
      setLoading(true);
      const response = await getQuarantineRecord(recordId);
      setRecord(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load quarantine record');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const action = approvalData.decision === 'DISPOSAL' 
        ? 'APPROVE_DISPOSAL' 
        : 'APPROVE_RETURN';
      
      await processQuarantineAction({
        quarantineRecordId: recordId,
        action: action,
        comments: approvalData.reviewNotes,
        disposalMethod: approvalData.disposalMethod,
        returnReference: approvalData.returnJustification
      });
      
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      setError('Failed to submit approval');
      console.error(err);
    }
  };

  const isStepComplete = (step) => {
    switch (step) {
      case 0:
        return approvalData.reviewNotes.length > 0;
      case 1:
        return approvalData.riskAssessment.length > 0;
      case 2:
        return approvalData.decision !== '';
      case 3:
        if (approvalData.decision === 'DISPOSAL') {
          return approvalData.disposalMethod && approvalData.disposalJustification;
        } else if (approvalData.decision === 'RETURN') {
          return approvalData.returnJustification && approvalData.supplierNotified;
        }
        return false;
      case 4:
        return approvalData.complianceChecked && approvalData.managerApproval;
      default:
        return false;
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!record) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Quarantine Approval Process
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="textSecondary">Product</Typography>
            <Typography variant="h6">{record.productName}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary">Batch</Typography>
            <Typography variant="h6">{record.batchNumber}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="textSecondary">Quantity</Typography>
            <Typography variant="h6">{record.quantityQuarantined} units</Typography>
          </Grid>
        </Grid>
      </Box>

      <Stepper activeStep={activeStep} orientation="vertical">
        {/* Step 0: Review Information */}
        <Step>
          <StepLabel>
            <Typography>Review Information</Typography>
          </StepLabel>
          <StepContent>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Alert severity="info" icon={<InfoIcon />}>
                      Review the quarantine details carefully before proceeding
                    </Alert>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Quarantine Date
                    </Typography>
                    <Typography>
                      {format(new Date(record.quarantineDate), 'MMM dd, yyyy')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Days in Quarantine
                    </Typography>
                    <Typography>{record.daysInQuarantine} days</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Reason
                    </Typography>
                    <Typography>{record.reason}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Estimated Loss
                    </Typography>
                    <Typography color="error">
                      ${record.estimatedLoss?.toFixed(2) || '0.00'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Review Notes"
                      value={approvalData.reviewNotes}
                      onChange={(e) => setApprovalData({
                        ...approvalData,
                        reviewNotes: e.target.value
                      })}
                      placeholder="Enter your review observations..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepComplete(0)}
              >
                Continue
              </Button>
              <Button onClick={onCancel} sx={{ ml: 1 }}>
                Cancel
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* Step 1: Risk Assessment */}
        <Step>
          <StepLabel>
            <Typography>Risk Assessment</Typography>
          </StepLabel>
          <StepContent>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Risk Assessment"
                  value={approvalData.riskAssessment}
                  onChange={(e) => setApprovalData({
                    ...approvalData,
                    riskAssessment: e.target.value
                  })}
                  placeholder="Assess the risks associated with this quarantined item..."
                  helperText="Consider: Health risks, financial impact, regulatory compliance, etc."
                />
              </CardContent>
            </Card>
            <Box sx={{ mb: 2 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepComplete(1)}
              >
                Continue
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* Step 2: Decision */}
        <Step>
          <StepLabel>
            <Typography>Decision</Typography>
          </StepLabel>
          <StepContent>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Select Action</FormLabel>
                  <RadioGroup
                    value={approvalData.decision}
                    onChange={(e) => setApprovalData({
                      ...approvalData,
                      decision: e.target.value
                    })}
                  >
                    <FormControlLabel
                      value="DISPOSAL"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center">
                          <CancelIcon color="error" sx={{ mr: 1 }} />
                          <Box>
                            <Typography>Approve for Disposal</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Item will be safely disposed according to regulations
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="RETURN"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center">
                          <CheckIcon color="success" sx={{ mr: 1 }} />
                          <Box>
                            <Typography>Approve for Return</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Item will be returned to supplier for credit/replacement
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </CardContent>
            </Card>
            <Box sx={{ mb: 2 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepComplete(2)}
              >
                Continue
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* Step 3: Documentation */}
        <Step>
          <StepLabel>
            <Typography>Documentation</Typography>
          </StepLabel>
          <StepContent>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                {approvalData.decision === 'DISPOSAL' ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Disposal Method</InputLabel>
                        <Select
                          value={approvalData.disposalMethod}
                          onChange={(e) => setApprovalData({
                            ...approvalData,
                            disposalMethod: e.target.value
                          })}
                        >
                          <MenuItem value="Incineration">Incineration</MenuItem>
                          <MenuItem value="Chemical Treatment">Chemical Treatment</MenuItem>
                          <MenuItem value="Landfill">Landfill</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Disposal Justification"
                        value={approvalData.disposalJustification}
                        onChange={(e) => setApprovalData({
                          ...approvalData,
                          disposalJustification: e.target.value
                        })}
                      />
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Return Justification"
                        value={approvalData.returnJustification}
                        onChange={(e) => setApprovalData({
                          ...approvalData,
                          returnJustification: e.target.value
                        })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={approvalData.supplierNotified}
                            onChange={(e) => setApprovalData({
                              ...approvalData,
                              supplierNotified: e.target.checked
                            })}
                          />
                        }
                        label="Supplier has been notified"
                      />
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
            <Box sx={{ mb: 2 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepComplete(3)}
              >
                Continue
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* Step 4: Final Approval */}
        <Step>
          <StepLabel>
            <Typography>Final Approval</Typography>
          </StepLabel>
          <StepContent>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
                  Please confirm all details before final approval
                </Alert>
                
                <Typography variant="h6" gutterBottom>Summary</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Decision
                    </Typography>
                    <Chip
                      label={approvalData.decision === 'DISPOSAL' ? 'Disposal' : 'Return'}
                      color={approvalData.decision === 'DISPOSAL' ? 'error' : 'success'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Review Notes
                    </Typography>
                    <Typography>{approvalData.reviewNotes}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Risk Assessment
                    </Typography>
                    <Typography>{approvalData.riskAssessment}</Typography>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={approvalData.complianceChecked}
                        onChange={(e) => setApprovalData({
                          ...approvalData,
                          complianceChecked: e.target.checked
                        })}
                      />
                    }
                    label="I confirm this decision complies with all regulations"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={approvalData.managerApproval}
                        onChange={(e) => setApprovalData({
                          ...approvalData,
                          managerApproval: e.target.checked
                        })}
                      />
                    }
                    label="I have the authority to approve this action"
                  />
                </Box>
              </CardContent>
            </Card>
            <Box sx={{ mb: 2 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!isStepComplete(4)}
              >
                Submit Approval
              </Button>
            </Box>
          </StepContent>
        </Step>
      </Stepper>
    </Paper>
  );
};

export default QuarantineApproval;