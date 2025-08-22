import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  Divider
} from '@mui/material';
import { Download, Close } from '@mui/icons-material';

const TrendExportDialog = ({ open, onClose, onExport, startDate, endDate }) => {
  const [exportFormat, setExportFormat] = React.useState('csv');
  const [includeCharts, setIncludeCharts] = React.useState(false);
  const [includePredictions, setIncludePredictions] = React.useState(true);
  const [includeInsights, setIncludeInsights] = React.useState(true);

  const handleExport = () => {
    onExport({
      format: exportFormat,
      includeCharts,
      includePredictions,
      includeInsights
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Export Trend Report</Typography>
          <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Date Range
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <FormControl component="fieldset">
          <Typography variant="subtitle2" gutterBottom>
            Export Format
          </Typography>
          <RadioGroup
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
          >
            <FormControlLabel value="csv" control={<Radio />} label="CSV (Excel Compatible)" />
            <FormControlLabel value="json" control={<Radio />} label="JSON (Raw Data)" disabled />
            <FormControlLabel value="pdf" control={<Radio />} label="PDF Report" disabled />
          </RadioGroup>
        </FormControl>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Include in Export
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={includePredictions}
                onChange={(e) => setIncludePredictions(e.target.checked)}
              />
            }
            label="Predictive Analysis"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeInsights}
                onChange={(e) => setIncludeInsights(e.target.checked)}
              />
            }
            label="Trend Insights"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                disabled={exportFormat !== 'pdf'}
              />
            }
            label="Charts & Visualizations"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={<Download />}
        >
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TrendExportDialog;