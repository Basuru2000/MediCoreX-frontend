import React, { useState, useEffect } from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Typography,
  Box,
  Chip,
  Alert
} from '@mui/material';
import { 
  getQuarantinePendingReview,
  processQuarantineAction 
} from '../../services/api';

const QuarantineActions = ({ onRefresh }) => {
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = async () => {
    try {
      setLoading(true);
      const response = await getQuarantinePendingReview();
      setPendingItems(response.data);
    } catch (error) {
      console.error('Failed to load pending items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (record, action) => {
    try {
      await processQuarantineAction({
        quarantineRecordId: record.id,
        action: action,
        comments: 'Quick action performed'
      });
      loadPendingItems();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to process action:', error);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (pendingItems.length === 0) {
    return (
      <Alert severity="info">
        No items require immediate action at this time.
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Items Requiring Action ({pendingItems.length})
      </Typography>
      <List>
        {pendingItems.map((item) => (
          <ListItem key={item.id} divider>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body1">
                    {item.productName}
                  </Typography>
                  <Chip 
                    label={`${item.daysInQuarantine} days`} 
                    size="small" 
                    color={item.daysInQuarantine > 7 ? 'error' : 'warning'}
                  />
                </Box>
              }
              secondary={
                <>
                  Batch: {item.batchNumber} | 
                  Quantity: {item.quantityQuarantined} | 
                  Reason: {item.reason}
                </>
              }
            />
            <ListItemSecondaryAction>
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={() => handleQuickAction(item, 'REVIEW')}
              >
                Start Review
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default QuarantineActions;