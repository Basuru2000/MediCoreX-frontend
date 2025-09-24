import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tab,
  Tabs,
  Paper,
  IconButton,
  LinearProgress,
  Alert,
  Stack,
  Chip,
  Divider,
  useTheme,
  alpha,
  Grid,
  CircularProgress
} from '@mui/material'
import {
  Close,
  CloudUpload,
  CloudDownload,
  Description,
  TableChart,
  CheckCircle,
  Error,
  FileDownload,
  FileUpload,
  Info
} from '@mui/icons-material'
import {
  exportProductsCSV,
  exportProductsExcel,
  downloadImportTemplate,
  importProducts
} from '../../services/api'

function ProductImportExport({ open, onClose, currentFilter = 'all', onImportSuccess }) {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [error, setError] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      const validTypes = ['.csv', '.xlsx', '.xls']
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
      
      if (!validTypes.includes(fileExtension)) {
        setError('Please select a valid CSV or Excel file')
        return
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB')
        return
      }
      
      setSelectedFile(file)
      setError(null)
      setImportResult(null)
      setSnackbar({ open: false, message: '', severity: 'info' })
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file to import')
      return
    }
    setImporting(true)
    setError(null)
    try {
      const response = await importProducts(selectedFile)

      if (response.data) {
        // Map backend field names to frontend expected names
        const importData = {
          ...response.data,
          successCount: response.data.successfulImports || response.data.successCount || 0,
          failedCount: response.data.failedImports || response.data.failedCount || 0,
          totalRows: response.data.totalRows || 0,
          errors: response.data.errors || []
        }

        setImportResult(importData)

        // Check if any products were successfully imported
        if (importData.successCount > 0) {
          // Important: Call the success callback if provided
          if (typeof onImportSuccess === 'function') {
            console.log('Import successful, calling refresh callback')
            onImportSuccess()
          }

          // Clear the file selection
          setSelectedFile(null)

          // Show success message in the dialog
          setSnackbar({
            open: true,
            message: `Successfully imported ${importData.successCount} products` +
                    (importData.failedCount > 0 ? ` (${importData.failedCount} failed)` : ''),
            severity: 'success'
          })
        } else {
          // No products imported, show warning
          setSnackbar({
            open: true,
            message: 'No products were imported. Check the error details.',
            severity: 'warning'
          })
        }
      }
    } catch (err) {
      console.error('Import error:', err)

      // Handle 400 responses which may contain partial success data
      if (err.response?.status === 400 && err.response?.data) {
        const errorData = err.response.data

        // Map backend field names to frontend expected names
        const importData = {
          ...errorData,
          successCount: errorData.successfulImports || errorData.successCount || 0,
          failedCount: errorData.failedImports || errorData.failedCount || 0,
          totalRows: errorData.totalRows || 0,
          errors: errorData.errors || []
        }

        setImportResult(importData)

        // If there were any successful imports, still call the success callback
        if (importData.successCount > 0) {
          if (typeof onImportSuccess === 'function') {
            console.log('Partial import success, calling refresh callback')
            onImportSuccess()
          }

          setSelectedFile(null)

          setSnackbar({
            open: true,
            message: `Partially successful: ${importData.successCount} imported, ${importData.failedCount} failed`,
            severity: 'warning'
          })
        } else {
          // All imports failed
          setSnackbar({
            open: true,
            message: `Import failed: All ${importData.failedCount || importData.totalRows || 'items'} failed to import`,
            severity: 'error'
          })
        }

        // Show detailed error if available
        if (errorData.message) {
          setError(errorData.message)
        }
      } else {
        // Handle other error types
        setError(err.response?.data?.message || 'Import failed')
        setSnackbar({
          open: true,
          message: 'Import failed. Please check your file format.',
          severity: 'error'
        })
      }
    } finally {
      setImporting(false)
    }
  }

  const handleExport = async (format) => {
    setExporting(true)
    setError(null)

    try {
      let response
      let filename
      let mimeType

      // Map the filter correctly
      const exportFilter = currentFilter === 'low-stock' ? 'low-stock' : 
                          currentFilter === 'expiring' ? 'expiring' :
                          currentFilter === 'out-of-stock' ? 'out-of-stock' : 
                          'all'

      if (format === 'csv') {
        response = await exportProductsCSV(exportFilter)
        filename = `products_${exportFilter}_${new Date().toISOString().split('T')[0]}.csv`
        mimeType = 'text/csv'
      } else {
        response = await exportProductsExcel(exportFilter)
        filename = `products_${exportFilter}_${new Date().toISOString().split('T')[0]}.xlsx`
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }

      const blob = new Blob([response.data], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await downloadImportTemplate()
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'product_import_template.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError('Failed to download template')
    }
  }

  const TabPanel = ({ children, value, index }) => (
    <Box hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  )

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 3,
            bgcolor: theme.palette.grey[50],
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Import / Export Products
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Bulk manage your product inventory
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: theme.palette.text.secondary,
              '&:hover': {
                bgcolor: alpha(theme.palette.text.secondary, 0.1)
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)}
          sx={{ 
            px: 3,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              minHeight: 48
            }
          }}
        >
          <Tab label="Import Products" icon={<FileUpload fontSize="small" />} iconPosition="start" />
          <Tab label="Export Products" icon={<FileDownload fontSize="small" />} iconPosition="start" />
        </Tabs>
      </DialogTitle>

      <DialogContent sx={{ p: 3, minHeight: 350 }}>
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mb: 2, borderRadius: '8px' }}
          >
            {error}
          </Alert>
        )}

        <TabPanel value={activeTab} index={0}>
          <Stack spacing={3}>
            {/* Instructions */}
            <Paper 
              sx={{ 
                p: 2, 
                borderRadius: '12px',
                bgcolor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Info sx={{ color: theme.palette.info.main, mt: 0.5 }} />
                <Box>
                  <Typography variant="body2" fontWeight={500} gutterBottom>
                    Import Instructions
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="div">
                    1. Download the template file first<br />
                    2. Fill in your product data following the format<br />
                    3. Save as CSV or Excel file<br />
                    4. Upload the file here to import<br />
                    5. Remove the row containing field descriptions (e.g., "Required", "Optional", etc.) before uploading the file
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Template Download */}
            <Box>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Description />}
                onClick={handleDownloadTemplate}
                sx={{ 
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderColor: theme.palette.divider,
                  borderStyle: 'dashed',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    borderStyle: 'dashed',
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                Download Import Template
              </Button>
            </Box>

            {/* File Upload Area */}
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: '12px',
                borderStyle: 'dashed',
                borderColor: selectedFile ? theme.palette.success.main : theme.palette.divider,
                bgcolor: selectedFile ? alpha(theme.palette.success.main, 0.05) : 'transparent',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.02)
                }
              }}
              component="label"
            >
              <input
                type="file"
                hidden
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
              />
              <CloudUpload 
                sx={{ 
                  fontSize: 48, 
                  color: selectedFile ? theme.palette.success.main : theme.palette.text.secondary,
                  mb: 2
                }} 
              />
              <Typography variant="body1" fontWeight={500} gutterBottom>
                {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                CSV or Excel files (Max 10MB)
              </Typography>
              {selectedFile && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={`${(selectedFile.size / 1024).toFixed(2)} KB`}
                    size="small"
                    color="success"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={selectedFile.type || 'File selected'}
                    size="small"
                    color="success"
                  />
                </Box>
              )}
            </Paper>

            {/* Import Result */}
            {importResult && (
              <Stack spacing={2}>
                <Alert
                  severity={
                    importResult.successCount > 0 && importResult.failedCount === 0 ? 'success' :
                    importResult.successCount > 0 && importResult.failedCount > 0 ? 'warning' :
                    'error'
                  }
                  icon={
                    importResult.successCount > 0 && importResult.failedCount === 0 ? <CheckCircle /> :
                    importResult.successCount > 0 && importResult.failedCount > 0 ? <Info /> :
                    <Error />
                  }
                  sx={{ borderRadius: '8px' }}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {importResult.successCount > 0 && importResult.failedCount === 0 ? 'Import Successful!' :
                     importResult.successCount > 0 && importResult.failedCount > 0 ? 'Import Partially Successful' :
                     'Import Failed'}
                  </Typography>
                  <Typography variant="caption" component="div">
                    {importResult.totalRows && (
                      <div>Total rows processed: {importResult.totalRows}</div>
                    )}
                    <div>
                      {importResult.successCount > 0 && `✓ ${importResult.successCount} products imported successfully`}
                      {importResult.successCount > 0 && importResult.failedCount > 0 && <br />}
                      {importResult.failedCount > 0 && `✗ ${importResult.failedCount} products failed to import`}
                    </div>
                  </Typography>
                </Alert>

                {/* Show error details if available */}
                {importResult.errors && importResult.errors.length > 0 && (
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: '8px',
                      bgcolor: alpha(theme.palette.error.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                      maxHeight: 200,
                      overflowY: 'auto'
                    }}
                  >
                    <Typography variant="body2" fontWeight={500} gutterBottom color="error">
                      Import Errors:
                    </Typography>
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <Typography key={index} variant="caption" component="div" color="text.secondary">
                        {typeof error === 'string' ? error : error.message || JSON.stringify(error)}
                      </Typography>
                    ))}
                    {importResult.errors.length > 10 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        ... and {importResult.errors.length - 10} more errors
                      </Typography>
                    )}
                  </Paper>
                )}
              </Stack>
            )}

            {/* Import Progress */}
            {importing && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  Importing products...
                </Typography>
                <LinearProgress sx={{ borderRadius: '4px' }} />
              </Box>
            )}
          </Stack>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Stack spacing={3}>
            {/* Export Options */}
            <Paper 
              sx={{ 
                p: 2, 
                borderRadius: '12px',
                bgcolor: theme.palette.grey[50]
              }}
            >
              <Typography variant="body2" fontWeight={500} gutterBottom>
                Export Filter
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Currently exporting: 
                <Chip 
                  label={currentFilter.replace(/-/g, ' ').toUpperCase()} 
                  size="small" 
                  sx={{ ml: 1 }}
                  color={
                    currentFilter === 'low-stock' ? 'warning' : 
                    currentFilter === 'expiring' ? 'error' : 
                    currentFilter === 'out-of-stock' ? 'error' :
                    'default'
                  }
                />
              </Typography>
            </Paper>

            {/* Export Formats */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: '12px',
                    border: `1px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onClick={() => handleExport('csv')}
                >
                  <TableChart sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                  <Typography variant="body1" fontWeight={500}>
                    CSV Format
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Lightweight text format
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: '12px',
                    border: `1px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onClick={() => handleExport('excel')}
                >
                  <Description sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                  <Typography variant="body1" fontWeight={500}>
                    Excel Format
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Full Excel compatibility
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Export Info */}
            <Alert 
              severity="info" 
              sx={{ borderRadius: '8px' }}
              icon={<Info />}
            >
              <Typography variant="body2">
                Exported files will include all product information including stock levels, 
                prices, and expiry dates based on the current filter.
              </Typography>
            </Alert>

            {/* Export Progress */}
            {exporting && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  Preparing export...
                </Typography>
                <LinearProgress sx={{ borderRadius: '4px' }} />
              </Box>
            )}
          </Stack>
        </TabPanel>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            borderRadius: '8px',
            textTransform: 'none',
            px: 3
          }}
        >
          Close
        </Button>
        {activeTab === 0 && (
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={!selectedFile || importing}
            startIcon={importing ? <CircularProgress size={16} /> : <CloudUpload />}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              px: 4,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}
          >
            {importing ? 'Importing...' : 'Import Products'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ProductImportExport