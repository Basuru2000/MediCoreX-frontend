import React, { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  alpha,
  Snackbar,
  Alert
} from '@mui/material'
import { Add, Refresh } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import GoodsReceiptForm from '../components/receiving/GoodsReceiptForm'
import GoodsReceiptList from '../components/receiving/GoodsReceiptList'
import GoodsReceiptDetails from '../components/receiving/GoodsReceiptDetails'
import { createGoodsReceipt } from '../services/api'

function Receiving() {
  const theme = useTheme()
  const { user } = useAuth()
  const [openForm, setOpenForm] = useState(false)
  const [openDetails, setOpenDetails] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // ✨ Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success' | 'error' | 'warning' | 'info'
  })

  const canReceive = user?.role === 'HOSPITAL_MANAGER' || user?.role === 'PROCUREMENT_OFFICER'

  const handleCreate = () => {
    setOpenForm(true)
  }

  const handleView = (receipt) => {
    setSelectedReceipt(receipt)
    setOpenDetails(true)
  }

  // ✨ NEW: Handle updates after quality decision
  const handleReceiptUpdate = () => {
    setRefreshTrigger(prev => prev + 1)
    setSnackbar({
      open: true,
      message: '✅ Quality decision recorded successfully!',
      severity: 'success'
    })
  }

  const handleSubmit = async (data) => {
    try {
      setLoading(true)
      const response = await createGoodsReceipt(data)
      
      // ✨ Close form
      setOpenForm(false)
      
      // ✨ Refresh list
      setRefreshTrigger(prev => prev + 1)
      
      // ✨ Show success snackbar with receipt number
      setSnackbar({
        open: true,
        message: `✅ Goods received successfully! Receipt #${response.data.receiptNumber}`,
        severity: 'success'
      })
    } catch (error) {
      console.error('Error creating goods receipt:', error)
      
      // ✨ Show error snackbar with specific message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to receive goods. Please try again.'
      
      setSnackbar({
        open: true,
        message: `❌ ${errorMessage}`,
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // ✨ Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    // Prevent closing on clickaway
    if (reason === 'clickaway') {
      return
    }
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          p: 3,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} color="success.main">
            Goods Receiving
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Process incoming goods from purchase orders
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => setRefreshTrigger(prev => prev + 1)}
          >
            Refresh
          </Button>
          {canReceive && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreate}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`
              }}
            >
              Receive Goods
            </Button>
          )}
        </Box>
      </Box>

      {/* List */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <GoodsReceiptList
          onView={handleView}
          refreshTrigger={refreshTrigger}
        />
      </Paper>

      {/* Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Typography variant="h6">Receive Goods from Purchase Order</Typography>
        </DialogTitle>
        <DialogContent>
          <Box pt={2}>
            <GoodsReceiptForm
              onSubmit={handleSubmit}
              onCancel={() => setOpenForm(false)}
              loading={loading}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <GoodsReceiptDetails
        receipt={selectedReceipt}
        open={openDetails}
        onClose={() => {
          setOpenDetails(false)
          setSelectedReceipt(null)
        }}
        onUpdate={handleReceiptUpdate}
      />

      {/* ✨ Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Receiving