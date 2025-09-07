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
  Tooltip,
  LinearProgress
} from '@mui/material'
import {
  Add,
  Delete,
  Download,
  Description,
  Warning,
  CheckCircle,
  Upload
} from '@mui/icons-material'
import { format } from 'date-fns'
import { 
  uploadSupplierDocument, 
  deleteSupplierDocument, 
  downloadSupplierDocument 
} from '../../services/api'

function SupplierDocumentManager({ supplierId, documents, canEdit, onUpdate }) {
  const [openDialog, setOpenDialog] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    documentType: '',
    documentName: '',
    expiryDate: '',
    file: null
  })

  const documentTypes = [
    'Business License',
    'Tax Certificate',
    'ISO Certificate',
    'Quality Certificate',
    'Insurance Certificate',
    'Contract',
    'Agreement',
    'Other'
  ]

  const handleUpload = () => {
    setFormData({
      documentType: '',
      documentName: '',
      expiryDate: '',
      file: null
    })
    setOpenDialog(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      setFormData({
        ...formData,
        file: file,
        documentName: formData.documentName || file.name
      })
    }
  }

  const handleSubmit = async () => {
    try {
      setUploading(true)
      setError('')
      
      const formDataToSend = new FormData()
      formDataToSend.append('file', formData.file)
      formDataToSend.append('documentType', formData.documentType)
      formDataToSend.append('documentName', formData.documentName)
      if (formData.expiryDate) {
        formDataToSend.append('expiryDate', formData.expiryDate)
      }
      
      await uploadSupplierDocument(supplierId, formDataToSend)
      
      setOpenDialog(false)
      onUpdate()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteSupplierDocument(documentId)
        onUpdate()
      } catch (error) {
        console.error('Error deleting document:', error)
        alert('Failed to delete document')
      }
    }
  }

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null
    
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) {
      return { label: 'Expired', color: 'error', icon: <Warning /> }
    } else if (daysUntilExpiry <= 30) {
      return { label: `Expires in ${daysUntilExpiry} days`, color: 'warning', icon: <Warning /> }
    } else {
      return { label: 'Valid', color: 'success', icon: <CheckCircle /> }
    }
  }

  if (!documents || documents.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary" mb={2}>
          No documents uploaded yet
        </Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<Upload />}
            onClick={handleUpload}
          >
            Upload First Document
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
            startIcon={<Upload />}
            onClick={handleUpload}
          >
            Upload Document
          </Button>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Document</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Uploaded By</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => {
              const expiryStatus = getExpiryStatus(doc.expiryDate)
              return (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Description fontSize="small" />
                      {doc.documentName}
                    </Box>
                  </TableCell>
                  <TableCell>{doc.documentType}</TableCell>
                  <TableCell>
                    {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(2)} KB` : '-'}
                  </TableCell>
                  <TableCell>
                    {doc.expiryDate ? format(new Date(doc.expiryDate), 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    {expiryStatus && (
                      <Chip
                        icon={expiryStatus.icon}
                        label={expiryStatus.label}
                        color={expiryStatus.color}
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>{doc.uploadedBy || '-'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        onClick={() => {
                          const downloadUrl = downloadSupplierDocument(doc.id)
                          // Add token to download URL
                          const token = localStorage.getItem('token')
                          window.open(`${downloadUrl}?token=${token}`, '_blank')
                        }}
                      >
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {canEdit && (
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Document Type"
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                SelectProps={{ native: true }}
                required
              >
                <option value="">Select Type</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Document Name"
                value={formData.documentName}
                onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<Upload />}
              >
                {formData.file ? formData.file.name : 'Choose File'}
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </Button>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB)
              </Typography>
            </Grid>
          </Grid>
          
          {uploading && <LinearProgress sx={{ mt: 2 }} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={uploading || !formData.documentType || !formData.documentName || !formData.file}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SupplierDocumentManager