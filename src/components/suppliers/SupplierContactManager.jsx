import React, { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Divider,
  Alert,
  useTheme
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Email,
  Phone,
  Close
} from '@mui/icons-material'
import {
  createSupplierContact,
  updateSupplierContact,
  deleteSupplierContact
} from '../../services/api'

function SupplierContactManager({ supplierId, contacts, canEdit, onUpdate }) {
  const theme = useTheme()
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    mobile: '',
    isPrimary: false,
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAdd = () => {
    setSelectedContact(null)
    setFormData({
      name: '',
      title: '',
      email: '',
      phone: '',
      mobile: '',
      isPrimary: false,
      notes: ''
    })
    setOpenDialog(true)
  }

  const handleEdit = (contact) => {
    setSelectedContact(contact)
    setFormData(contact)
    setOpenDialog(true)
  }

  const handleDelete = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteSupplierContact(contactId)
        onUpdate()
      } catch (error) {
        console.error('Error deleting contact:', error)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (selectedContact) {
        await updateSupplierContact(selectedContact.id, formData)
      } else {
        await createSupplierContact(supplierId, formData)
      }
      setOpenDialog(false)
      onUpdate()
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              fontSize: '1.125rem',
              mb: 0.5
            }}
          >
            Contact Persons
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            Manage supplier contact information
          </Typography>
        </Box>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
            sx={{
              height: 36,
              px: 2,
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
            Add Contact
          </Button>
        )}
      </Box>

      {contacts.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No contacts added yet
          </Typography>
        </Paper>
      ) : (
        <TableContainer 
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
                }}
              >
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Status</TableCell>
                {canEdit && (
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((contact, index) => (
                <TableRow 
                  key={contact.id}
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'light' ? 'action.hover' : 'action.selected'
                    }
                  }}
                >
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        fontSize: '0.875rem'
                      }}
                    >
                      {contact.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                      }}
                    >
                      {contact.title || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      {contact.email && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography 
                            variant="caption"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            {contact.email}
                          </Typography>
                        </Box>
                      )}
                      {contact.phone && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography 
                            variant="caption"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            {contact.phone}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {contact.isPrimary && (
                      <Chip
                        label="Primary"
                        color="primary"
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          borderRadius: '6px'
                        }}
                      />
                    )}
                  </TableCell>
                  {canEdit && (
                    <TableCell align="center">
                      <Box display="flex" gap={0.5} justifyContent="center">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEdit(contact)}
                          sx={{
                            width: 32,
                            height: 32,
                            color: 'info.main',
                            '&:hover': {
                              bgcolor: 'info.lighter'
                            }
                          }}
                        >
                          <Edit sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(contact.id)}
                          sx={{
                            width: 32,
                            height: 32,
                            color: 'error.main',
                            '&:hover': {
                              bgcolor: 'error.lighter'
                            }
                          }}
                        >
                          <Delete sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Contact Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                fontSize: '1.25rem'
              }}
            >
              {selectedContact ? 'Edit Contact' : 'Add Contact'}
            </Typography>
            <IconButton 
              onClick={() => setOpenDialog(false)}
              sx={{
                width: 32,
                height: 32,
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert 
              severity="error" 
              onClose={() => setError('')}
              sx={{ 
                mb: 3,
                borderRadius: '8px'
              }}
            >
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title/Position"
                name="title"
                value={formData.title}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: theme.shadows[2]
              }
            }}
          >
            {loading ? 'Saving...' : (selectedContact ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SupplierContactManager