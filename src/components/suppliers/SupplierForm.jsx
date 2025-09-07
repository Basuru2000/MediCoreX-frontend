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
  Alert
} from '@mui/material'
import { createSupplier, updateSupplier } from '../../services/api'

function SupplierForm({ supplier, onClose }) {
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
        {isEdit ? 'Edit Supplier' : 'Add New Supplier'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Basic Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supplier Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tax ID"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Registration Number"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
            Contact Information
          </Typography>
          <Grid container spacing={2}>
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
                label="Fax"
                name="fax"
                value={formData.fax}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
            Address
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 2"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
            Additional Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payment Terms"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Credit Limit"
                name="creditLimit"
                type="number"
                value={formData.creditLimit}
                onChange={handleChange}
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
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !formData.name}
        >
          {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </>
  )
}

export default SupplierForm