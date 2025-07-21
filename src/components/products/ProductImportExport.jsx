import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  Grid,
  Chip
} from '@mui/material'
import {
  CloudUpload,
  CloudDownload,
  GetApp,
  Description,
  TableChart,
  Close,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material'
import { exportProductsCSV, exportProductsExcel, downloadImportTemplate, importProducts } from '../../services/api'

function ProductImportExport({ open, onClose, onImportSuccess }) {
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleExportCSV = async () => {
    try {
      setExporting(true)
      const response = await exportProductsCSV()
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `products_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to export CSV')
    } finally {
      setExporting(false)
    }
  }

  const handleExportExcel = async () => {
    try {
      setExporting(true)
      const response = await exportProductsExcel()
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `products_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to export Excel')
    } finally {
      setExporting(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await downloadImportTemplate()
      
      // Create blob and download
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'product_import_template.xlsx'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download template')
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (file) => {
    setError('')
    setImportResult(null)
    
    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx?)$/)) {
      setError('Please select a CSV or Excel file')
      return
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }
    
    setSelectedFile(file)
  }

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file to import')
      return
    }

    try {
      setImporting(true)
      setError('')
      
      const response = await importProducts(selectedFile)
      setImportResult(response.data)
      
      if (response.data.successfulImports > 0) {
        // Refresh product list after successful import
        setTimeout(() => {
          onImportSuccess()
        }, 2000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import products')
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setImportResult(null)
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Import/Export Products</Typography>
          <IconButton size="small" onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          {/* Export Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <CloudDownload sx={{ mr: 1, verticalAlign: 'middle' }} />
                Export Products
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Download all products in your preferred format
              </Typography>
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<TableChart />}
                  onClick={handleExportCSV}
                  disabled={exporting}
                >
                  Export as CSV
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Description />}
                  onClick={handleExportExcel}
                  disabled={exporting}
                  color="success"
                >
                  Export as Excel
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Divider sx={{ width: '100%', my: 2 }} />

          {/* Import Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <CloudUpload sx={{ mr: 1, verticalAlign: 'middle' }} />
                Import Products
              </Typography>
              
              {/* Step 1: Download Template */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Step 1: Download Import Template
                </Typography>
                <Button
                  variant="text"
                  startIcon={<GetApp />}
                  onClick={handleDownloadTemplate}
                  size="small"
                >
                  Download Template
                </Button>
              </Box>

              {/* Step 2: Upload File */}
              <Typography variant="subtitle2" gutterBottom>
                Step 2: Upload Your File
              </Typography>
              
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: dragActive ? 'primary.main' : 'grey.300',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: dragActive ? 'action.hover' : 'background.paper',
                  cursor: 'pointer',
                  mb: 2
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                />
                
                <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  Drag and drop your file here, or click to browse
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supported formats: CSV, Excel (.xlsx, .xls) - Max size: 10MB
                </Typography>
              </Box>

              {selectedFile && (
                <Alert
                  severity="info"
                  action={
                    <IconButton size="small" onClick={() => setSelectedFile(null)}>
                      <Close />
                    </IconButton>
                  }
                  sx={{ mb: 2 }}
                >
                  Selected file: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {importing && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Importing products...
                  </Typography>
                  <LinearProgress />
                </Box>
              )}

              {/* Import Results */}
              {importResult && (
                <Box sx={{ mt: 2 }}>
                  <Alert 
                    severity={importResult.failedImports === 0 ? 'success' : 'warning'}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Import Complete
                    </Typography>
                    <Box display="flex" gap={2}>
                      <Chip
                        icon={<CheckCircle />}
                        label={`${importResult.successfulImports} Successful`}
                        color="success"
                        size="small"
                      />
                      {importResult.failedImports > 0 && (
                        <Chip
                          icon={<Error />}
                          label={`${importResult.failedImports} Failed`}
                          color="error"
                          size="small"
                        />
                      )}
                      <Chip
                        label={`Total Rows: ${importResult.totalRows}`}
                        size="small"
                      />
                    </Box>
                  </Alert>

                  {importResult.errors && importResult.errors.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Import Errors:
                      </Typography>
                      <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                        <List dense>
                          {importResult.errors.map((error, index) => (
                            <ListItem key={index}>
                              <ListItemText
                                primary={`Row ${error.rowNumber}`}
                                secondary={error.errorMessage}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Instructions */}
          <Grid item xs={12}>
            <Alert severity="info">
              <Typography variant="subtitle2" gutterBottom>
                <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
                Import Instructions:
              </Typography>
              <Typography variant="body2">
                1. Download the template and fill in your product data<br />
                2. Ensure category names match existing categories in the system<br />
                3. Product codes will be auto-generated if left empty<br />
                4. Required fields: Product Name, Category, Quantity, Min Stock, Unit, Unit Price
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={!selectedFile || importing}
          startIcon={<CloudUpload />}
        >
          Import Products
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProductImportExport