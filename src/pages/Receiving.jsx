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
  Alert,
  Stack,
  Container
} from '@mui/material'
import { Add, Refresh, LocalShipping } from '@mui/icons-material'
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

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const canReceive = user?.role === 'HOSPITAL_MANAGER' || user?.role === 'PROCUREMENT_OFFICER'

  const handleCreate = () => {
    setOpenForm(true)
  }

  const handleView = (receipt) => {
    setSelectedReceipt(receipt)
    setOpenDetails(true)
  }

  const handleReceiptUpdate = () => {
    setRefreshTrigger(prev => prev + 1)
    setSnackbar({
      open: true,
      message: 'Quality decision recorded successfully!',
      severity: 'success'
    })
  }

  const handleSubmit = async (data) => {
    try {
      setLoading(true)
      const response = await createGoodsReceipt(data)
      
      setOpenForm(false)
      setRefreshTrigger(prev => prev + 1)
      
      setSnackbar({
        open: true,
        message: `Goods received successfully! Receipt #${response.data.receiptNumber}`,
        severity: 'success'
      })
    } catch (error) {
      console.error('Error creating goods receipt:', error)
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to receive goods. Please try again.'
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Page Header */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2rem' },
                color: theme.palette.text.primary,
                mb: 0.5
              }}
            >
              Goods Receiving
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.875rem'
              }}
            >
              Process incoming goods from purchase orders
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                px: 2.5,
                height: 40,
                borderColor: theme.palette.divider,
                color: theme.palette.text.secondary,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              Refresh
            </Button>
            {canReceive && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreate}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  height: 40,
                  background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                    boxShadow: `0 6px 16px ${alpha(theme.palette.success.main, 0.4)}`
                  }
                }}
              >
                Receive Goods
              </Button>
            )}
          </Stack>
        </Stack>

        {/* List Container */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[0]
          }}
        >
          <GoodsReceiptList
            onView={handleView}
            refreshTrigger={refreshTrigger}
          />
        </Paper>

        {/* Form Dialog */}
        <Dialog 
          open={openForm} 
          onClose={() => setOpenForm(false)} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: theme.shadows[24]
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 2, 
            borderBottom: `1px solid ${theme.palette.divider}`,
            fontSize: '1.25rem',
            fontWeight: 600
          }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <LocalShipping color="success" />
              <Typography variant="h6" component="span" fontWeight={600}>
                Receive Goods from Purchase Order
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <GoodsReceiptForm
              onSubmit={handleSubmit}
              onCancel={() => setOpenForm(false)}
              loading={loading}
            />
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

        {/* Snackbar Notification */}
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
            sx={{ 
              width: '100%',
              borderRadius: '8px',
              boxShadow: theme.shadows[8]
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  )
}

export default Receiving