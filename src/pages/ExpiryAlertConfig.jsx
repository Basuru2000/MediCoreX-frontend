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
  Tooltip,
  Fade,
  useTheme,
  alpha,
  Stack,
  Chip
} from '@mui/material'
import {
  Add,
  Settings,
  Refresh,
  HelpOutline,
  Close,
  Shield,
  Notifications,
  DragIndicator
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
  const theme = useTheme()
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
    <Fade in={true}>
      <Box>
        {/* Page Header */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 4
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 0.5
                }}
              >
                Expiry Alert Configuration
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ color: 'text.secondary' }}
              >
                Configure multi-tier alerts for product expiry monitoring
              </Typography>
            </Box>
            <Tooltip title="Information" arrow>
              <IconButton 
                onClick={() => setHelpDialogOpen(true)} 
                size="small"
                sx={{
                  ml: 1,
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                <HelpOutline fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Tooltip title="Refresh">
              <IconButton 
                onClick={fetchConfigs} 
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderColor: theme.palette.primary.main
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            
            {isManager && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  fontWeight: 500,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Add Configuration
              </Button>
            )}
          </Stack>
        </Box>

        {/* Role Alert */}
        {!isManager && (
          <Alert 
            severity="info" 
            icon={<Shield />}
            sx={{ 
              mb: 3,
              borderRadius: '8px',
              '& .MuiAlert-icon': {
                color: theme.palette.info.main
              }
            }}
          >
            You can view alert configurations, but only Hospital Managers can create, edit, or delete them.
          </Alert>
        )}

        {/* Statistics Cards */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2}>
            <Paper
              sx={{
                flex: 1,
                p: 2.5,
                borderRadius: '8px',
                boxShadow: 'none',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.success.main, 0.02)
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Notifications sx={{ color: theme.palette.success.main }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {activeConfigs.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Configurations
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper
              sx={{
                flex: 1,
                p: 2.5,
                borderRadius: '8px',
                boxShadow: 'none',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.grey[500], 0.02)
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Settings sx={{ color: theme.palette.grey[600] }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {configs.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Configurations
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Box>

        {/* Tabs */}
        <Paper 
          sx={{ 
            mb: 3,
            borderRadius: '8px',
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={(e, v) => setTabValue(v)}
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0'
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                minHeight: 48
              }
            }}
          >
            <Tab 
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>Active</span>
                  <Chip 
                    label={activeConfigs.length} 
                    size="small" 
                    sx={{ 
                      height: 20,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                </Stack>
              } 
            />
            <Tab 
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>Inactive</span>
                  <Chip 
                    label={inactiveConfigs.length} 
                    size="small" 
                    sx={{ 
                      height: 20,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                </Stack>
              } 
            />
            <Tab 
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>All</span>
                  <Chip 
                    label={configs.length} 
                    size="small" 
                    sx={{ 
                      height: 20,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                </Stack>
              } 
            />
          </Tabs>
        </Paper>

        {/* Drag instruction for managers */}
        {isManager && activeConfigs.length > 1 && tabValue === 0 && (
          <Alert 
            severity="info" 
            icon={<DragIndicator />}
            sx={{ 
              mb: 2, 
              borderRadius: '8px',
              bgcolor: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${theme.palette.info.light}`,
              '& .MuiAlert-icon': {
                color: theme.palette.info.main
              }
            }}
          >
            <Typography variant="body2">
              Tip: You can drag and drop active configurations to reorder them.
            </Typography>
          </Alert>
        )}

        {/* Config List */}
        <AlertConfigList
          configs={tabValue === 0 ? activeConfigs : tabValue === 1 ? inactiveConfigs : configs}
          loading={loading}
          onEdit={handleOpenDialog}
          onDelete={handleDeleteClick}
          onToggle={handleToggle}
          onReorder={handleReorder}
        />

        {/* Form Dialog */}
        {openDialog && (
          <AlertConfigForm
            open={openDialog}
            onClose={handleCloseDialog}
            onSubmit={handleSubmit}
            config={editingConfig}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              maxWidth: 400
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Confirm Delete
              </Typography>
              <IconButton
                size="small"
                onClick={() => setDeleteDialogOpen(false)}
                sx={{ color: 'text.secondary' }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Typography color="text.secondary">
              Are you sure you want to delete this alert configuration?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 1 }}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
              sx={{ 
                borderRadius: '6px',
                textTransform: 'none'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained"
              sx={{ 
                borderRadius: '6px',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' }
              }}
            >
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
          PaperProps={{
            sx: {
              borderRadius: '12px'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Settings sx={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Alert Configuration Help
                </Typography>
              </Stack>
              <IconButton
                size="small"
                onClick={() => setHelpDialogOpen(false)}
                sx={{ color: 'text.secondary' }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              What are Expiry Alert Configurations?
            </Typography>
            <Typography paragraph color="text.secondary">
              Alert configurations define when and how you'll be notified about products 
              approaching their expiry dates. You can create multiple tiers of alerts 
              with different severity levels and notification settings.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, mt: 3 }}>
              Key Features:
            </Typography>
            <Stack spacing={2}>
              {[
                { title: 'Multi-tier Alerts', desc: 'Create different alert levels (e.g., 7 days, 30 days, 90 days before expiry)' },
                { title: 'Severity Levels', desc: 'Set alerts as Information, Warning, or Critical based on urgency' },
                { title: 'Role-based Notifications', desc: 'Choose which user roles receive specific alerts' },
                { title: 'Visual Indicators', desc: 'Assign colors to different alert tiers for easy identification' },
                { title: 'Active/Inactive Status', desc: 'Enable or disable configurations without deleting them' }
              ].map((feature, index) => (
                <Box key={index}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.desc}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Alert 
              severity="info" 
              sx={{ 
                mt: 3,
                borderRadius: '8px'
              }}
            >
              <Typography variant="body2">
                <strong>Tip:</strong> Start with critical alerts (7 days) and gradually 
                add longer-term alerts based on your inventory needs.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setHelpDialogOpen(false)}
              variant="contained"
              sx={{ 
                borderRadius: '6px',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' }
              }}
            >
              Got it
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ 
              width: '100%',
              borderRadius: '8px'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  )
}

export default ExpiryAlertConfig