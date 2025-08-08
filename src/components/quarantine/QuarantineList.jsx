import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,     // ✅ ADDED
  InputLabel,      // ✅ ADDED
  Select,          // ✅ ADDED
  MenuItem,        // ✅ ADDED
  Box,
  Typography,
  Snackbar,        // ✅ ADDED
  Alert as MuiAlert  // ✅ ADDED - Rename to avoid conflict
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  AssignmentReturn as ReturnIcon,
  CheckCircle as ApproveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { 
  getQuarantineRecords,
  processQuarantineAction 
} from '../../services/api';
import QuarantineDetails from './QuarantineDetails';

const QuarantineList = ({ status, onRefresh }) => {
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, record: null, action: '' });
  const [actionData, setActionData] = useState({
    comments: '',
    disposalMethod: '',
    disposalCertificate: '',
    returnReference: ''
  });
  
  // ✅ ADD THIS STATE
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // ✅ ADD THIS DEBUG LINE
  console.log('Rendering with records:', records.length, 'loading:', loading);

  useEffect(() => {
    loadRecords();
  }, [page, rowsPerPage, status]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      console.log('Loading with status:', status);
      
      const response = await getQuarantineRecords({
        status,
        page,
        size: rowsPerPage
      });
      
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Content array:', response.data.content);
      
      setRecords(response.data.content || []);
      setTotalElements(response.data.totalElements || 0);
      
      console.log('Records state set to:', response.data.content);
    } catch (error) {
      console.error('Failed to load quarantine records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    try {
      await processQuarantineAction({
        quarantineRecordId: actionDialog.record.id,
        action: actionDialog.action,
        ...actionData
      });
      
      // ✅ ADD SUCCESS MESSAGE
      let successMessage = '';
      switch(actionDialog.action) {
        case 'REVIEW':
          successMessage = 'Item moved to Under Review';
          break;
        case 'APPROVE_DISPOSAL':
          successMessage = 'Item approved for disposal';
          break;
        case 'APPROVE_RETURN':
          successMessage = 'Item approved for return';
          break;
        case 'DISPOSE':
          successMessage = 'Item successfully disposed';
          break;
        case 'RETURN':
          successMessage = 'Item successfully returned';
          break;
        default:
          successMessage = 'Action completed successfully';
      }
      
      setSnackbar({
        open: true,
        message: successMessage,
        severity: 'success'
      });
      
      setActionDialog({ open: false, record: null, action: '' });
      setActionData({
        comments: '',
        disposalMethod: '',
        disposalCertificate: '',
        returnReference: ''
      });
      
      loadRecords();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to process action:', error);
      
      // ✅ ADD ERROR MESSAGE
      setSnackbar({
        open: true,
        message: 'Failed to process action: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      PENDING_REVIEW: { color: 'warning', label: 'Pending Review' },
      UNDER_REVIEW: { color: 'info', label: 'Under Review' },
      APPROVED_FOR_DISPOSAL: { color: 'error', label: 'Approved for Disposal' },
      APPROVED_FOR_RETURN: { color: 'secondary', label: 'Approved for Return' },
      DISPOSED: { color: 'default', label: 'Disposed' },
      RETURNED: { color: 'success', label: 'Returned' }
    };

    const config = statusConfig[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getActionButtons = (record) => {
    const buttons = [];

    if (record.status === 'PENDING_REVIEW') {
      buttons.push(
        <Tooltip title="Start Review" key="review">
          <IconButton
            size="small"
            color="info"
            onClick={() => setActionDialog({ open: true, record, action: 'REVIEW' })}
          >
            <ApproveIcon />
          </IconButton>
        </Tooltip>
      );
    }

    if (record.status === 'UNDER_REVIEW') {
      buttons.push(
        <Tooltip title="Approve for Disposal" key="disposal">
          <IconButton
            size="small"
            color="error"
            onClick={() => setActionDialog({ open: true, record, action: 'APPROVE_DISPOSAL' })}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>,
        <Tooltip title="Approve for Return" key="return">
          <IconButton
            size="small"
            color="secondary"
            onClick={() => setActionDialog({ open: true, record, action: 'APPROVE_RETURN' })}
          >
            <ReturnIcon />
          </IconButton>
        </Tooltip>
      );
    }

    if (record.status === 'APPROVED_FOR_DISPOSAL') {
      buttons.push(
        <Tooltip title="Confirm Disposal" key="dispose">
          <IconButton
            size="small"
            color="error"
            onClick={() => setActionDialog({ open: true, record, action: 'DISPOSE' })}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      );
    }

    if (record.status === 'APPROVED_FOR_RETURN') {
      buttons.push(
        <Tooltip title="Confirm Return" key="return-confirm">
          <IconButton
            size="small"
            color="success"
            onClick={() => setActionDialog({ open: true, record, action: 'RETURN' })}
          >
            <ReturnIcon />
          </IconButton>
        </Tooltip>
      );
    }

    return buttons;
  };

  return (
    <>
      {/* ✅ ADD THIS DEBUG INFO TEMPORARILY */}
      <Box sx={{ p: 1, bgcolor: 'info.light', color: 'white', mb: 1 }}>
        Debug: {loading ? 'Loading...' : `${records.length} records loaded`}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Batch Number</TableCell>
              <TableCell>Product</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Quarantine Date</TableCell>
              <TableCell>Days in Quarantine</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Est. Loss</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* ✅ FIXED RENDERING LOGIC */}
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : !records || records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography>No quarantine records found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              records.map((record, index) => {
                console.log(`Rendering row ${index}:`, record); // Debug each row
                return (
                  <TableRow key={record.id || index}>
                    <TableCell>{record.batchNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{record.productName || 'Unknown'}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {record.productCode || ''}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{record.quantityQuarantined || 0}</TableCell>
                    <TableCell>{record.reason || 'N/A'}</TableCell>
                    <TableCell>
                      {record.quarantineDate 
                        ? format(new Date(record.quarantineDate), 'MMM dd, yyyy')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{record.daysInQuarantine || 0} days</TableCell>
                    <TableCell>{getStatusChip(record.status)}</TableCell>
                    <TableCell align="right">
                      ${record.estimatedLoss ? record.estimatedLoss.toFixed(2) : '0.00'}
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedRecord(record)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        {getActionButtons(record)}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Details Dialog */}
      {selectedRecord && (
        <QuarantineDetails
          record={selectedRecord}
          open={Boolean(selectedRecord)}
          onClose={() => setSelectedRecord(null)}
          onAction={(action) => {
            setActionDialog({ open: true, record: selectedRecord, action });
            setSelectedRecord(null);
          }}
        />
      )}

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, record: null, action: '' })}>
        <DialogTitle>
          {actionDialog.action === 'REVIEW' && 'Start Review'}
          {actionDialog.action === 'APPROVE_DISPOSAL' && 'Approve for Disposal'}
          {actionDialog.action === 'APPROVE_RETURN' && 'Approve for Return'}
          {actionDialog.action === 'DISPOSE' && 'Confirm Disposal'}
          {actionDialog.action === 'RETURN' && 'Confirm Return'}
        </DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comments"
            value={actionData.comments}
            onChange={(e) => setActionData({ ...actionData, comments: e.target.value })}
            margin="normal"
          />
          
          {actionDialog.action === 'DISPOSE' && (
            <>
              {/* ✅ FIXED: Changed from TextField to Select dropdown */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Disposal Method</InputLabel>
                <Select
                  value={actionData.disposalMethod}
                  onChange={(e) => setActionData({ ...actionData, disposalMethod: e.target.value })}
                  label="Disposal Method"
                >
                  <MenuItem value="Incineration">Incineration</MenuItem>
                  <MenuItem value="Chemical Treatment">Chemical Treatment</MenuItem>
                  <MenuItem value="Return to Supplier">Return to Supplier</MenuItem>
                  <MenuItem value="Landfill">Landfill</MenuItem>
                  <MenuItem value="Donation">Donation</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Disposal Certificate Number"
                value={actionData.disposalCertificate}
                onChange={(e) => setActionData({ ...actionData, disposalCertificate: e.target.value })}
                margin="normal"
              />
            </>
          )}
          
          {actionDialog.action === 'RETURN' && (
            <TextField
              fullWidth
              label="Return Reference Number"
              value={actionData.returnReference}
              onChange={(e) => setActionData({ ...actionData, returnReference: e.target.value })}
              margin="normal"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, record: null, action: '' })}>
            Cancel
          </Button>
          <Button onClick={handleAction} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ ADD SUCCESS/ERROR NOTIFICATIONS */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </>
  );
};

export default QuarantineList;