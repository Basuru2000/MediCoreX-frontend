import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  useTheme,
  alpha,
  Fade,
  Tab,
  Tabs
} from '@mui/material'
import { Add, Refresh, Download } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import SupplierList from '../components/suppliers/SupplierList'
import SupplierForm from '../components/suppliers/SupplierForm'
import SupplierDetails from '../components/suppliers/SupplierDetails'
import SupplierComparison from '../components/suppliers/metrics/SupplierComparison'
import MetricsConfiguration from '../components/suppliers/metrics/MetricsConfiguration'
import { getSuppliers, deleteSupplier, updateSupplierStatus } from '../services/api'

function Suppliers() {
  const theme = useTheme()
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  })
  const [openForm, setOpenForm] = useState(false)
  const [openDetails, setOpenDetails] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [tabValue, setTabValue] = useState(0)

  const canCreate = user?.role === 'HOSPITAL_MANAGER' || user?.role === 'PROCUREMENT_OFFICER'
  const canEdit = user?.role === 'HOSPITAL_MANAGER' || user?.role === 'PROCUREMENT_OFFICER'
  const canDelete = user?.role === 'HOSPITAL_MANAGER'

  useEffect(() => {
    fetchSuppliers()
  }, [pagination.page, pagination.size, refreshTrigger])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const response = await getSuppliers({
        page: pagination.page,
        size: pagination.size
      })
      setSuppliers(response.data.content)
      setPagination(prev => ({
        ...prev,
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages
      }))
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedSupplier(null)
    setOpenForm(true)
  }

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier)
    setOpenForm(true)
  }

  const handleView = (supplier) => {
    setSelectedSupplier(supplier)
    setOpenDetails(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(id)
        setRefreshTrigger(prev => prev + 1)
      } catch (error) {
        console.error('Error deleting supplier:', error)
      }
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await updateSupplierStatus(id, status)
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Error updating supplier status:', error)
    }
  }

  const handleFormClose = (saved) => {
    setOpenForm(false)
    if (saved) {
      setRefreshTrigger(prev => prev + 1)
    }
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleSizeChange = (newSize) => {
    setPagination(prev => ({ ...prev, page: 0, size: newSize }))
  }

  return (
    <Fade in={true}>
      <Box sx={{ p: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
            borderRadius: 2
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" fontWeight="bold">
              Supplier Management
            </Typography>
            <Box display="flex" gap={2}>
              <Tooltip title="Refresh">
                <IconButton onClick={() => setRefreshTrigger(prev => prev + 1)}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              {canCreate && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreate}
                >
                  Add Supplier
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Suppliers List" />
            <Tab label="Performance Comparison" />
            <Tab label="Metrics Configuration" disabled={!canEdit} />
          </Tabs>
        </Box>
        {/* Tab Panel 0: Suppliers List */}
        {tabValue === 0 && (
          <SupplierList
            suppliers={suppliers}
            loading={loading}
            pagination={pagination}
            onPageChange={(e, page) => setPagination(prev => ({ ...prev, page }))}
            onSizeChange={(e) => setPagination(prev => ({ 
              ...prev, 
              size: parseInt(e.target.value, 10),
              page: 0 
            }))}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        )}
        {/* Tab Panel 1: Performance Comparison */}
        {tabValue === 1 && (
          <SupplierComparison />
        )}
        {/* Tab Panel 2: Metrics Configuration */}
        {tabValue === 2 && canEdit && (
          <MetricsConfiguration 
            onSave={(config) => {
              console.log('Metrics configuration saved:', config)
              // In production, this would call an API to save configuration
            }}
          />
        )}
        {/* Dialogs */}
        <Dialog
          open={openForm}
          onClose={() => setOpenForm(false)}
          maxWidth="md"
          fullWidth
        >
          <SupplierForm
            supplier={selectedSupplier}
            onClose={(success) => {
              setOpenForm(false)
              if (success) {
                setRefreshTrigger(prev => prev + 1)
              }
            }}
          />
        </Dialog>
        <Dialog
          open={openDetails}
          onClose={() => setOpenDetails(false)}
          maxWidth="lg"
          fullWidth
        >
          <SupplierDetails
            supplier={selectedSupplier}
            onClose={() => setOpenDetails(false)}
            onEdit={handleEdit}
            canEdit={canEdit}
          />
        </Dialog>
      </Box>
    </Fade>
  )
}

export default Suppliers