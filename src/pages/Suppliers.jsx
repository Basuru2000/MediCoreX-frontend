import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  useTheme,
  Fade,
  Tab,
  Tabs,
  Stack,
  Paper
} from '@mui/material'
import { Add, Refresh } from '@mui/icons-material'
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

  return (
    <Fade in timeout={300}>
      <Box 
        sx={{ 
          maxWidth: 1400, 
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          py: 3
        }}
      >
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
              Supplier Management
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.875rem'
              }}
            >
              Manage suppliers, products, and performance metrics
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Tooltip title="Refresh">
              <IconButton 
                onClick={() => setRefreshTrigger(prev => prev + 1)}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderColor: theme.palette.primary.main
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>

            {canCreate && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreate}
                sx={{
                  height: 40,
                  px: 3,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: theme.shadows[2]
                  }
                }}
              >
                Add Supplier
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Tabs */}
        <Paper 
          elevation={0}
          sx={{ 
            mb: 3, 
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
              px: 2,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                minHeight: 48,
                py: 1.5
              }
            }}
          >
            <Tab label="Suppliers List" />
            <Tab label="Performance Comparison" />
            {canEdit && <Tab label="Metrics Configuration" />}
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* Tab Panel 0: Suppliers List */}
            {tabValue === 0 && (
              <SupplierList
                suppliers={suppliers}
                loading={loading}
                pagination={pagination}
                onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
                onSizeChange={(newSize) => setPagination(prev => ({ ...prev, page: 0, size: newSize }))}
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
                }}
              />
            )}
          </Box>
        </Paper>

        {/* Dialogs */}
        <Dialog
          open={openForm}
          onClose={() => setOpenForm(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              maxHeight: '90vh'
            }
          }}
        >
          <SupplierForm
            supplier={selectedSupplier}
            onClose={handleFormClose}
          />
        </Dialog>

        <Dialog
          open={openDetails}
          onClose={() => setOpenDetails(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              maxHeight: '90vh'
            }
          }}
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