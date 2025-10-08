import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme,
  alpha
} from '@mui/material'
import {
  Add,
  Refresh,
  ShoppingCart,
  CheckCircle,
  Schedule,
  AttachMoney,
  Receipt
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import POList from '../components/purchase-orders/POList'
import POForm from '../components/purchase-orders/POForm'
import PODetails from '../components/purchase-orders/PODetails'
import PendingApprovalsList from '../components/purchase-orders/PendingApprovalsList'
import POApproval from '../components/purchase-orders/POApproval'
import StatusUpdateModal from '../components/purchase-orders/StatusUpdateModal'
import AutoPOBanner from '../components/purchase-orders/AutoPOBanner'
import {
  createPurchaseOrder,
  updatePurchaseOrder,
  getPurchaseOrderSummary,
  approvePurchaseOrder,
  rejectPurchaseOrder,
  updatePurchaseOrderStatusWithComments
} from '../services/api'

function PurchaseOrders() {
  const theme = useTheme()
  const { user } = useAuth()
  const [openForm, setOpenForm] = useState(false)
  const [openDetails, setOpenDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [summary, setSummary] = useState(null)
  const [openApproval, setOpenApproval] = useState(false)
  const [selectedForApproval, setSelectedForApproval] = useState(null)
  const [openStatusModal, setOpenStatusModal] = useState(false)
  const [selectedForStatusUpdate, setSelectedForStatusUpdate] = useState(null)

  const canCreate = user?.role === 'HOSPITAL_MANAGER' || user?.role === 'PROCUREMENT_OFFICER'
  const canEdit = user?.role === 'HOSPITAL_MANAGER' || user?.role === 'PROCUREMENT_OFFICER'
  const canDelete = user?.role === 'HOSPITAL_MANAGER'

  useEffect(() => {
    fetchSummary()
  }, [refreshTrigger])

  const fetchSummary = async () => {
    try {
      const response = await getPurchaseOrderSummary()
      setSummary(response.data)
    } catch (error) {
      console.error('Error fetching summary:', error)
    }
  }

  const handleCreate = () => {
    setSelectedOrder(null)
    setOpenForm(true)
  }

  const handleEdit = (order) => {
    setSelectedOrder(order)
    setOpenForm(true)
  }

  const handleView = (order) => {
    setSelectedOrder(order)
    setOpenDetails(true)
  }

  const handleApproveClick = (order) => {
    setSelectedForApproval(order)
    setOpenApproval(true)
  }

  const handleStatusUpdate = (order) => {
    setSelectedForStatusUpdate(order)
    setOpenStatusModal(true)
  }

  const handleFormSubmit = async (data) => {
    try {
      setLoading(true)
      if (selectedOrder) {
        await updatePurchaseOrder(selectedOrder.id, data)
      } else {
        await createPurchaseOrder(data)
      }
      setOpenForm(false)
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Error saving PO:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id, comments) => {
    try {
      setLoading(true)
      await approvePurchaseOrder(id, { comments })
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Error approving PO:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (id, comments) => {
    try {
      setLoading(true)
      await rejectPurchaseOrder(id, { comments })
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Error rejecting PO:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdateSubmit = async (data) => {
    try {
      setLoading(true)
      await updatePurchaseOrderStatusWithComments(selectedForStatusUpdate.id, data)
      setOpenStatusModal(false)
      setSelectedForStatusUpdate(null)
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Error updating status:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const summaryCards = summary ? [
    {
      title: 'Total Orders',
      value: summary.totalOrders || 0,
      icon: <ShoppingCart sx={{ fontSize: 24 }} />,
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.1)
    },
    {
      title: 'Pending Approval',
      value: summary.pendingApprovals || 0,
      icon: <Schedule sx={{ fontSize: 24 }} />,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.1)
    },
    {
      title: 'Approved Orders',
      value: summary.approvedOrders || 0,
      icon: <CheckCircle sx={{ fontSize: 24 }} />,
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.1)
    },
    {
      title: 'Total Value',
      value: `$${(summary.totalValue || 0).toLocaleString()}`,
      icon: <AttachMoney sx={{ fontSize: 24 }} />,
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.1)
    }
  ] : []

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      {/* Header */}
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
            Purchase Orders
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary
            }}
          >
            Manage purchase orders, approvals, and supplier transactions
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
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
          >
            Refresh
          </Button>
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreate}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: theme.palette.primary.main,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
                }
              }}
            >
              New Purchase Order
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {summaryCards.map((card, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: card.bgColor,
                        color: card.color
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      mb: 0.5,
                      fontWeight: 500,
                      fontSize: '0.875rem'
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '1.75rem', sm: '2rem' },
                      color: theme.palette.text.primary
                    }}
                  >
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Auto PO Banner */}
      <AutoPOBanner />

      {/* Pending Approvals Section */}
      {user?.role === 'HOSPITAL_MANAGER' && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5} mb={3}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                color: theme.palette.warning.main
              }}
            >
              <Schedule fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Pending Approvals
            </Typography>
          </Box>
          <PendingApprovalsList
            onView={handleView}
            onApprove={handleApproveClick}
            refreshTrigger={refreshTrigger}
          />
        </Paper>
      )}

      {/* Purchase Orders List */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} mb={3}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main
            }}
          >
            <Receipt fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            All Purchase Orders
          </Typography>
        </Box>
        <POList
          onView={handleView}
          onEdit={handleEdit}
          onStatusUpdate={handleStatusUpdate}
          canEdit={canEdit}
          canDelete={canDelete}
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
            borderRadius: '12px'
          }
        }}
      >
        <DialogTitle sx={{
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {selectedOrder ? 'Edit Purchase Order' : 'Create New Purchase Order'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <POForm
            order={selectedOrder}
            onSubmit={handleFormSubmit}
            onCancel={() => setOpenForm(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <PODetails
        order={selectedOrder}
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        onApprove={handleApproveClick}
        onReject={handleApproveClick}
      />

      {/* Approval Dialog */}
      <POApproval
        order={selectedForApproval}
        open={openApproval}
        onClose={() => {
          setOpenApproval(false)
          setSelectedForApproval(null)
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={loading}
      />

      {/* Status Update Modal */}
      <StatusUpdateModal
        order={selectedForStatusUpdate}
        open={openStatusModal}
        onClose={() => {
          setOpenStatusModal(false)
          setSelectedForStatusUpdate(null)
        }}
        onUpdate={handleStatusUpdateSubmit}
        loading={loading}
      />
    </Box>
  )
}

export default PurchaseOrders