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
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material'
import {
  Add,
  Download,
  Delete,
  InsertDriveFile,
  Warning
} from '@mui/icons-material'
import {
  uploadSupplierDocument,
  deleteSupplierDocument,
  getDocumentDownloadUrl
} from '../../services/api'

function SupplierDocumentManager({ supplierId, documents, canEdit, onUpdate }) {
  const theme = useTheme()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', 'CERTIFICATE')
    formData.append('documentName', file.name)  // ✅ FIXED: Changed from 'description'

    try {
      await uploadSupplierDocument(supplierId, formData)
      onUpdate()
      event.target.value = null  // Reset file input
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
        setError(error.response?.data?.message || 'Failed to delete document')
      }
    }
  }

  const handleDownload = (documentId, documentName) => {
    const downloadUrl = getDocumentDownloadUrl(documentId)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = documentName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false
    const today = new Date()
    const expiry = new Date(expiryDate)
    return expiry < today
  }

  return (
    <Box>
      {/* Upload Section */}
      {canEdit && (
        <Box sx={{ mb: 3 }}>
          <input
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            id="document-upload"
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="document-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={uploading ? <CircularProgress size={20} /> : <Add />}
              disabled={uploading}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </label>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
            Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB)
          </Typography>
        </Box>
      )}

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{ mb: 3, borderRadius: '8px' }}
        >
          {error}
        </Alert>
      )}

      {/* Documents Table */}
      {documents && documents.length > 0 ? (
        <TableContainer 
          component={Paper} 
          elevation={0}
          sx={{ 
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px'
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <TableCell sx={{ fontWeight: 600 }}>Document Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Expiry Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Uploaded By</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow 
                  key={doc.id}
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.02)
                    }
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <InsertDriveFile sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="body2">{doc.documentName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={doc.documentType} 
                      size="small"
                      sx={{ height: 24, fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatFileSize(doc.fileSize)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {doc.expiryDate ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography 
                          variant="body2"
                          color={isExpired(doc.expiryDate) ? 'error' : isExpiringSoon(doc.expiryDate) ? 'warning.main' : 'text.secondary'}
                        >
                          {formatDate(doc.expiryDate)}
                        </Typography>
                        {(isExpired(doc.expiryDate) || isExpiringSoon(doc.expiryDate)) && (
                          <Tooltip title={isExpired(doc.expiryDate) ? 'Expired' : 'Expiring Soon'}>
                            <Warning 
                              sx={{ 
                                fontSize: 18, 
                                color: isExpired(doc.expiryDate) ? 'error.main' : 'warning.main'
                              }} 
                            />
                          </Tooltip>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">N/A</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {doc.uploadedBy || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={0.5}>
                      <Tooltip title="Download">
                        <IconButton 
                          size="small"
                          onClick={() => handleDownload(doc.id, doc.documentName)}
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main'
                            }
                          }}
                        >
                          <Download fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {canEdit && (
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small"
                            onClick={() => handleDelete(doc.id)}
                            sx={{
                              '&:hover': {
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                color: 'error.main'
                              }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            textAlign: 'center',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            bgcolor: alpha(theme.palette.primary.main, 0.02)
          }}
        >
          <InsertDriveFile sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No documents uploaded yet
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

export default SupplierDocumentManager