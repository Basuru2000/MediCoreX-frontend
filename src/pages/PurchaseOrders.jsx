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
  useTheme,
  alpha
} from '@mui/material'
import { Add, Refresh, ShoppingCart } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import POList from '../components/purchase-orders/POList'
import POForm from '../components/purchase-orders/POForm'
import PODetails from '../components/purchase-orders/PODetails'
import PendingApprovalsList from '../components/purchase-orders/PendingApprovalsList'
import POApproval from '../components/purchase-orders/POApproval'
import StatusUpdateModal from '../components/purchase-orders/StatusUpdateModal'
import ReceiptProgressIndicator from '../components/receiving/ReceiptProgressIndicator'
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

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true)
      
      if (selectedOrder) {
        await updatePurchaseOrder(selectedOrder.id, formData)
      } else {
        await createPurchaseOrder(formData)
      }
      
      setOpenForm(false)
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Error saving purchase order:', error)
      alert('Failed to save purchase order: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleApproveClick = (order) => {
    setSelectedForApproval(order)
    setOpenApproval(true)
  }

  const handleApprove = async (id, comments) => {
    try {
      setLoading(true)
      await approvePurchaseOrder(id, comments)
      setOpenApproval(false)
      setSelectedForApproval(null)
      setRefreshTrigger(prev => prev + 1)
      // Show success message if you have a snackbar
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
      await rejectPurchaseOrder(id, comments)
      setOpenApproval(false)
      setSelectedForApproval(null)
      setRefreshTrigger(prev => prev + 1)
      // Show success message if you have a snackbar
    } catch (error) {
      console.error('Error rejecting PO:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = (order) => {
    setSelectedForStatusUpdate(order)
    setOpenStatusModal(true)
  }

  const handleStatusUpdateSubmit = async (orderId, newStatus, comments) => {
    try {
      setLoading(true)
      await updatePurchaseOrderStatusWithComments(orderId, newStatus, comments)
      setRefreshTrigger(prev => prev + 1)
      setOpenStatusModal(false)
      setSelectedForStatusUpdate(null)
    } catch (error) {
      console.error('Error updating status:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          p: 3,
          mb: 3,
          borderRadius: 2
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Purchase Orders
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Create and manage purchase orders for suppliers
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: alpha('#ffffff', 0.1)
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
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: alpha('#ffffff', 0.9)
                  }
                }}
              >
                New Purchase Order
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Orders
                </Typography>
                <Typography variant="h4">{summary.totalOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Draft Orders
                </Typography>
                <Typography variant="h4">{summary.draftOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Approved Orders
                </Typography>
                <Typography variant="h4">{summary.approvedOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Value
                </Typography>
                <Typography variant="h4">
                  ${summary.totalValue.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Auto PO Banner */}
      <AutoPOBanner />

      {/* Pending Approvals Section - Only for Managers */}
      {user?.role === 'HOSPITAL_MANAGER' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pending Approvals
          </Typography>
          <PendingApprovalsList
            onView={handleView}
            onApprove={handleApproveClick}
            refreshTrigger={refreshTrigger}
          />
        </Paper>
      )}

      {/* Purchase Orders List */}
      <Paper sx={{ p: 3 }}>
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
      >
        <DialogTitle>
          {selectedOrder ? 'Edit Purchase Order' : 'Create New Purchase Order'}
        </DialogTitle>
        <DialogContent>
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