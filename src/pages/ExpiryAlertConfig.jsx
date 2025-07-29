import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Add,
  Settings,
  Refresh,
  HelpOutline
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import {
  getExpiryAlertConfigs,
  createExpiryAlertConfig,
  updateExpiryAlertConfig,
  deleteExpiryAlertConfig,
  toggleExpiryAlertConfigStatus
} from '../services/api'
import AlertConfigForm from '../components/expiry/AlertConfigForm'
import AlertConfigList from '../components/expiry/AlertConfigList'

function ExpiryAlertConfig() {
  const { isManager } = useAuth()
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tabValue, setTabValue] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingConfig, setEditingConfig] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingConfigId, setDeletingConfigId] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      setLoading(true)
      const response = await getExpiryAlertConfigs()
      setConfigs(response.data)
    } catch (error) {
      showSnackbar('Failed to fetch alert configurations', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (config = null) => {
    setEditingConfig(config)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingConfig(null)
  }

  const handleSubmit = async (formData) => {
    try {
      if (editingConfig) {
        await updateExpiryAlertConfig(editingConfig.id, formData)
        showSnackbar('Alert configuration updated successfully', 'success')
      } else {
        await createExpiryAlertConfig(formData)
        showSnackbar('Alert configuration created successfully', 'success')
      }
      handleCloseDialog()
      fetchConfigs()
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Operation failed', 'error')
    }
  }

  const handleToggle = async (id) => {
    try {
      await toggleExpiryAlertConfigStatus(id)
      showSnackbar('Configuration status updated', 'success')
      fetchConfigs()
    } catch (error) {
      showSnackbar('Failed to update configuration status', 'error')
    }
  }

  const handleDeleteClick = (id) => {
    setDeletingConfigId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteExpiryAlertConfig(deletingConfigId)
      showSnackbar('Alert configuration deleted successfully', 'success')
      setDeleteDialogOpen(false)
      setDeletingConfigId(null)
      fetchConfigs()
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to delete configuration', 'error')
    }
  }

  const handleReorder = (reorderedConfigs) => {
    setConfigs(reorderedConfigs)
  }

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity })
  }

  const activeConfigs = configs.filter(c => c.active)
  const inactiveConfigs = configs.filter(c => !c.active)

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Expiry Alert Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure multi-tier alerts for product expiry monitoring
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchConfigs} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Help">
            <IconButton onClick={() => setHelpDialogOpen(true)}>
              <HelpOutline />
            </IconButton>
          </Tooltip>
          {isManager && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Configuration
            </Button>
          )}
        </Box>
      </Box>

      {!isManager && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You can view alert configurations, but only Hospital Managers can create, edit, or delete them.
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`Active (${activeConfigs.length})`} />
          <Tab label={`Inactive (${inactiveConfigs.length})`} />
          <Tab label={`All (${configs.length})`} />
        </Tabs>
      </Paper>

      <AlertConfigList
        configs={tabValue === 0 ? activeConfigs : tabValue === 1 ? inactiveConfigs : configs}
        loading={loading}
        onEdit={handleOpenDialog}
        onDelete={handleDeleteClick}
        onToggle={handleToggle}
        onReorder={handleReorder}
      />

      {openDialog && (
        <AlertConfigForm
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          config={editingConfig}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this alert configuration?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Help Dialog */}
      <Dialog 
        open={helpDialogOpen} 
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Settings />
            Alert Configuration Help
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            What are Expiry Alert Configurations?
          </Typography>
          <Typography paragraph>
            Alert configurations define when and how you'll be notified about products 
            approaching their expiry dates. You can create multiple tiers of alerts 
            with different severity levels and notification settings.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Key Features:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" paragraph>
              <strong>Multi-tier Alerts:</strong> Create different alert levels 
              (e.g., 7 days, 30 days, 90 days before expiry)
            </Typography>
            <Typography component="li" paragraph>
              <strong>Severity Levels:</strong> Set alerts as Information, Warning, 
              or Critical based on urgency
            </Typography>
            <Typography component="li" paragraph>
              <strong>Role-based Notifications:</strong> Choose which user roles 
              receive specific alerts
            </Typography>
            <Typography component="li" paragraph>
              <strong>Visual Indicators:</strong> Assign colors to different alert 
              tiers for easy identification
            </Typography>
            <Typography component="li" paragraph>
              <strong>Active/Inactive Status:</strong> Enable or disable configurations 
              without deleting them
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Tip:</strong> Start with critical alerts (7 days) and gradually 
            add longer-term alerts based on your inventory needs.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ExpiryAlertConfig