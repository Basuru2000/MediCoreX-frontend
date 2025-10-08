import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Alert,
  IconButton,
  Divider,
  useTheme
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { createSupplier, updateSupplier } from '../../services/api'

function SupplierForm({ supplier, onClose }) {
  const theme = useTheme()
  const isEdit = !!supplier
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    taxId: supplier?.taxId || '',
    registrationNumber: supplier?.registrationNumber || '',
    website: supplier?.website || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    fax: supplier?.fax || '',
    addressLine1: supplier?.addressLine1 || '',
    addressLine2: supplier?.addressLine2 || '',
    city: supplier?.city || '',
    state: supplier?.state || '',
    country: supplier?.country || '',
    postalCode: supplier?.postalCode || '',
    paymentTerms: supplier?.paymentTerms || '',
    creditLimit: supplier?.creditLimit || '',
    notes: supplier?.notes || ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isEdit) {
        await updateSupplier(supplier.id, formData)
      } else {
        await createSupplier(formData)
      }
      onClose(true)
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              fontSize: '1.25rem'
            }}
          >
            {isEdit ? 'Edit Supplier' : 'Add New Supplier'}
          </Typography>
          <IconButton 
            onClick={() => onClose(false)}
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

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 2
                }}
              >
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Supplier Name"
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tax ID"
                name="taxId"
                value={formData.taxId}
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
                label="Registration Number"
                name="registrationNumber"
                value={formData.registrationNumber}
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
                label="Website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>

            {/* Contact Information Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  mt: 2,
                  mb: 2
                }}
              >
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
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
                required
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
                label="Fax"
                name="fax"
                value={formData.fax}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>

            {/* Address Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  mt: 2,
                  mb: 2
                }}
              >
                Address
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                name="addressLine1"
                value={formData.addressLine1}
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
                label="Address Line 2"
                name="addressLine2"
                value={formData.addressLine2}
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
                label="City"
                name="city"
                value={formData.city}
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
                label="State/Province"
                name="state"
                value={formData.state}
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
                label="Country"
                name="country"
                value={formData.country}
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
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>

            {/* Payment Terms Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  mt: 2,
                  mb: 2
                }}
              >
                Payment & Notes
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Payment Terms"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                placeholder="e.g., Net 30"
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
                label="Credit Limit"
                name="creditLimit"
                type="number"
                value={formData.creditLimit}
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
                rows={3}
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
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={() => onClose(false)}
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
          {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </>
  )
}

export default SupplierForm