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
  LinearProgress,
  MenuItem,
  CircularProgress  // ✅ FIX: Added missing import
} from '@mui/material'
import {
  Add,
  Delete,
  Download,
  Description,
  Warning,
  CheckCircle,
  Upload,
  Error as ErrorIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import { 
  uploadSupplierDocument, 
  deleteSupplierDocument
} from '../../services/api'
import {
  formatFileSize,
  validateFile,
  isDocumentExpiring,
  isDocumentExpired
} from '../../utils/fileUtils'

function SupplierDocumentManager({ supplierId, documents, canEdit, onUpdate }) {
  const [openDialog, setOpenDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, document: null })
  const [uploading, setUploading] = useState(false)
  const [downloading, setDownloading] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
    'Bank Guarantee',
    'NDA',
    'Other'
  ]

  const handleUpload = () => {
    setFormData({
      documentType: '',
      documentName: '',
      expiryDate: '',
      file: null
    })
    setError('')
    setSuccess('')
    setOpenDialog(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const validation = validateFile(file)
      if (!validation.valid) {
        setError(validation.error)
        return
      }
      setFormData({
        ...formData,
        file: file,
        documentName: formData.documentName || file.name.split('.')[0]
      })
      setError('')
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
      
      setSuccess('Document uploaded successfully')
      setOpenDialog(false)
      onUpdate()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  // ✅ FIX: Improved download function without page redirect
  const handleDownload = async (documentId, documentName) => {
    try {
      setDownloading(documentId)
      setError('')
      
      // Direct download using anchor element with authorization header
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:8080/api/suppliers/documents/${documentId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Download failed')
      }

      // Get the filename from Content-Disposition header or use provided name
      const contentDisposition = response.headers.get('content-disposition')
      let filename = documentName
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(?:;|$)/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setSuccess('Download started successfully')
    } catch (error) {
      console.error('Download error:', error)
      setError('Failed to download document')
    } finally {
      setDownloading(null)
    }
  }

  // ✅ FIX: Replace window.confirm with Material-UI Dialog
  const handleDeleteClick = (document) => {
    setDeleteDialog({ open: true, document })
  }

  const handleDeleteConfirm = async () => {
    const { document } = deleteDialog
    try {
      await deleteSupplierDocument(document.id)
      setSuccess('Document deleted successfully')
      setDeleteDialog({ open: false, document: null })
      onUpdate()
    } catch (error) {
      setError('Failed to delete document')
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, document: null })
  }

  const getStatusChip = (document) => {
    if (isDocumentExpired(document.expiryDate)) {
      return <Chip label="Expired" color="error" size="small" icon={<ErrorIcon />} />
    }
    if (isDocumentExpiring(document.expiryDate)) {
      return <Chip label="Expiring Soon" color="warning" size="small" icon={<Warning />} />
    }
    if (document.expiryDate) {
      return <Chip label="Valid" color="success" size="small" icon={<CheckCircle />} />
    }
    return null
  }

  return (
    <Box>
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

      {canEdit && (
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleUpload}
          >
            Upload Document
          </Button>
        </Box>
      )}

      {!documents || documents.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No documents uploaded yet
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Document Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Uploaded By</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>{document.documentName}</TableCell>
                  <TableCell>{document.documentType}</TableCell>
                  <TableCell>{formatFileSize(document.fileSize)}</TableCell>
                  <TableCell>
                    {document.expiryDate 
                      ? format(new Date(document.expiryDate), 'MMM dd, yyyy')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>{getStatusChip(document)}</TableCell>
                  <TableCell>{document.uploadedBy || '-'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Download">
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(document.id, document.documentName)}
                        disabled={downloading === document.id}
                      >
                        {downloading === document.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Download fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    {canEdit && (
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(document)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Upload Dialog */}
      <Dialog open={openDialog} onClose={() => !uploading && setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Document Type"
                name="documentType"
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                required
              >
                {documentTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
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
                label="Expiry Date (Optional)"
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
                sx={{ py: 2 }}
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
                Accepted: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
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

      {/* ✅ NEW: Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the document 
            <strong> "{deleteDialog.document?.documentName}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SupplierDocumentManager