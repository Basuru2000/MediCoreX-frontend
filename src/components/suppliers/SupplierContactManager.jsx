import React, { useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Alert,
  Tooltip
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Phone,
  Email,
  Person,
  Star
} from '@mui/icons-material'
import { addSupplierContact, deleteSupplierContact } from '../../services/api'

function SupplierContactManager({ supplierId, contacts, canEdit, onUpdate }) {
  const [openDialog, setOpenDialog] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    email: '',
    phone: '',
    mobile: '',
    isPrimary: false,
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAdd = () => {
    setEditingContact(null)
    setFormData({
      name: '',
      designation: '',
      email: '',
      phone: '',
      mobile: '',
      isPrimary: false,
      notes: ''
    })
    setOpenDialog(true)
  }

  const handleEdit = (contact) => {
    setEditingContact(contact)
    setFormData({
      name: contact.name,
      designation: contact.designation || '',
      email: contact.email || '',
      phone: contact.phone || '',
      mobile: contact.mobile || '',
      isPrimary: contact.isPrimary || false,
      notes: contact.notes || ''
    })
    setOpenDialog(true)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')
      
      await addSupplierContact(supplierId, formData)
      
      setOpenDialog(false)
      onUpdate()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save contact')
    } finally {
      setLoading(false)
    }
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  if (!contacts || contacts.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary" mb={2}>
          No contacts added yet
        </Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
          >
            Add First Contact
          </Button>
        )}
      </Box>
    )
  }

  return (
    <Box>
      {canEdit && (
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
          >
            Add Contact
          </Button>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell align="center">Primary</TableCell>
              {canEdit && <TableCell align="center">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Person fontSize="small" />
                    {contact.name}
                  </Box>
                </TableCell>
                <TableCell>{contact.designation || '-'}</TableCell>
                <TableCell>
                  {contact.email ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email fontSize="small" />
                      {contact.email}
                    </Box>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {contact.phone ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone fontSize="small" />
                      {contact.phone}
                    </Box>
                  ) : '-'}
                </TableCell>
                <TableCell>{contact.mobile || '-'}</TableCell>
                <TableCell align="center">
                  {contact.isPrimary && (
                    <Chip
                      icon={<Star />}
                      label="Primary"
                      color="primary"
                      size="small"
                    />
                  )}
                </TableCell>
                {canEdit && (
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(contact)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(contact.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingContact ? 'Edit Contact' : 'Add New Contact'}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" height="100%">
                <label>
                  <input
                    type="checkbox"
                    name="isPrimary"
                    checked={formData.isPrimary}
                    onChange={handleChange}
                  />
                  <Typography component="span" ml={1}>
                    Set as Primary Contact
                  </Typography>
                </label>
              </Box>
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
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !formData.name}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SupplierContactManager