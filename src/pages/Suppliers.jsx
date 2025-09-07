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
  Fade
} from '@mui/material'
import { Add, Refresh, Download } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import SupplierList from '../components/suppliers/SupplierList'
import SupplierForm from '../components/suppliers/SupplierForm'
import SupplierDetails from '../components/suppliers/SupplierDetails'
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
    <Fade in timeout={300}>
      <Box>
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.light, 0.04)} 100%)`
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                Supplier Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage suppliers, contacts, and documents
              </Typography>
            </Box>
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
                  sx={{ borderRadius: 2 }}
                >
                  Add Supplier
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        <SupplierList
          suppliers={suppliers}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSizeChange={handleSizeChange}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          canEdit={canEdit}
          canDelete={canDelete}
        />

        <Dialog
          open={openForm}
          onClose={() => handleFormClose(false)}
          maxWidth="md"
          fullWidth
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
        >
          {selectedSupplier && (
            <SupplierDetails
              supplier={selectedSupplier}
              onClose={() => setOpenDetails(false)}
              onEdit={() => {
                setOpenDetails(false)
                handleEdit(selectedSupplier)
              }}
              canEdit={canEdit}
            />
          )}
        </Dialog>
      </Box>
    </Fade>
  )
}

export default Suppliers