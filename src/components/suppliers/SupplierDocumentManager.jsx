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
  useTheme
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
    formData.append('description', file.name)

    try {
      await uploadSupplierDocument(supplierId, formData)
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
      }
    }
  }

  const handleDownload = (documentId, fileName) => {
    const url = getDocumentDownloadUrl(documentId)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    return days <= 30 && days > 0
  }

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  const getDocumentStatusChip = (expiryDate) => {
    if (!expiryDate) return null
    
    if (isExpired(expiryDate)) {
      return (
        <Chip
          label="Expired"
          color="error"
          size="small"
          icon={<Warning sx={{ fontSize: 14 }} />}
          sx={{
            height: 22,
            fontSize: '0.7rem',
            fontWeight: 500,
            borderRadius: '6px'
          }}
        />
      )
    }
    
    if (isExpiringSoon(expiryDate)) {
      return (
        <Chip
          label="Expiring Soon"
          color="warning"
          size="small"
          icon={<Warning sx={{ fontSize: 14 }} />}
          sx={{
            height: 22,
            fontSize: '0.7rem',
            fontWeight: 500,
            borderRadius: '6px'
          }}
        />
      )
    }
    
    return (
      <Chip
        label="Valid"
        color="success"
        size="small"
        sx={{
          height: 22,
          fontSize: '0.7rem',
          fontWeight: 500,
          borderRadius: '6px'
        }}
      />
    )
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
            Documents
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            Manage supplier certificates and documents
          </Typography>
        </Box>
        {canEdit && (
          <Button
            variant="contained"
            component="label"
            startIcon={uploading ? <CircularProgress size={16} /> : <Add />}
            disabled={uploading}
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
            {uploading ? 'Uploading...' : 'Upload Document'}
            <input
              type="file"
              hidden
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </Button>
        )}
      </Box>

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

      {documents.length === 0 ? (
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
            No documents uploaded yet
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
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Document</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Expiry Date</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Uploaded</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc, index) => (
                <TableRow 
                  key={doc.id}
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'light' ? 'action.hover' : 'action.selected'
                    }
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <InsertDriveFile 
                        sx={{ 
                          fontSize: 20, 
                          color: 'primary.main' 
                        }} 
                      />
                      <Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            fontSize: '0.875rem'
                          }}
                        >
                          {doc.fileName || doc.description}
                        </Typography>
                        {doc.description && doc.fileName !== doc.description && (
                          <Typography 
                            variant="caption"
                            sx={{ 
                              color: 'text.secondary',
                              fontSize: '0.75rem'
                            }}
                          >
                            {doc.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                      }}
                    >
                      {doc.documentType || 'Document'}
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
                      {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getDocumentStatusChip(doc.expiryDate)}
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="caption"
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.75rem'
                      }}
                    >
                      {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={0.5} justifyContent="center">
                      <Tooltip title="Download" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(doc.id, doc.fileName)}
                          sx={{
                            width: 32,
                            height: 32,
                            color: 'primary.main',
                            '&:hover': {
                              bgcolor: 'primary.lighter'
                            }
                          }}
                        >
                          <Download sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      {canEdit && (
                        <Tooltip title="Delete" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(doc.id)}
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
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

export default SupplierDocumentManager