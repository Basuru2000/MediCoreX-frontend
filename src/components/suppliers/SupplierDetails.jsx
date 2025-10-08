import React, { useState, useEffect } from 'react'
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Divider,
  Tab,
  Tabs,
  IconButton,
  useTheme,
  CircularProgress
} from '@mui/material'
import {
  Edit,
  Close,
  Email,
  Phone,
  LocationOn,
  Business,
  CreditCard,
  CheckCircle,
  Block,
  Warning
} from '@mui/icons-material'
import SupplierContactManager from './SupplierContactManager'
import SupplierDocumentManager from './SupplierDocumentManager'
import SupplierProductCatalog from './catalog/SupplierProductCatalog'
import SupplierScorecard from './metrics/SupplierScorecard'
import PerformanceChart from './metrics/PerformanceChart'
import { getSupplierById } from '../../services/api'

function SupplierDetails({ supplier, onClose, onEdit, canEdit }) {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [supplierData, setSupplierData] = useState(supplier)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSupplierDetails()
  }, [supplier.id])

  const fetchSupplierDetails = async () => {
    try {
      setLoading(true)
      const response = await getSupplierById(supplier.id)
      setSupplierData(response.data)
    } catch (error) {
      console.error('Error fetching supplier details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success'
      case 'INACTIVE': return 'default'
      case 'BLOCKED': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle sx={{ fontSize: 16 }} />
      case 'INACTIVE': return <Warning sx={{ fontSize: 16 }} />
      case 'BLOCKED': return <Block sx={{ fontSize: 16 }} />
      default: return null
    }
  }

  const InfoRow = ({ icon, label, value }) => (
    <Box display="flex" alignItems="flex-start" mb={2}>
      <Box 
        display="flex" 
        alignItems="center" 
        minWidth={140}
        sx={{ color: 'text.secondary' }}
      >
        {icon}
        <Typography 
          variant="body2" 
          sx={{ 
            ml: 1,
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          {label}
        </Typography>
      </Box>
      <Typography 
        variant="body1"
        sx={{ 
          fontSize: '0.875rem',
          color: 'text.primary',
          fontWeight: 500
        }}
      >
        {value || '-'}
      </Typography>
    </Box>
  )

  return (
    <>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                fontSize: '1.25rem'
              }}
            >
              Supplier Details
            </Typography>
            <Chip
              icon={getStatusIcon(supplierData.status)}
              label={supplierData.status}
              color={getStatusColor(supplierData.status)}
              size="small"
              sx={{
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 500,
                borderRadius: '6px'
              }}
            />
          </Box>
          <Box display="flex" gap={1}>
            {canEdit && (
              <IconButton 
                onClick={() => onEdit(supplierData)}
                sx={{
                  width: 36,
                  height: 36,
                  color: 'primary.main',
                  bgcolor: 'primary.lighter',
                  '&:hover': {
                    bgcolor: 'primary.light'
                  }
                }}
              >
                <Edit sx={{ fontSize: 18 }} />
              </IconButton>
            )}
            <IconButton 
              onClick={onClose}
              sx={{
                width: 36,
                height: 36,
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              minHeight: 48,
              py: 1.5
            }
          }}
        >
          <Tab label="General Info" />
          <Tab label="Contacts" />
          <Tab label="Documents" />
          <Tab label="Product Catalog" />
          <Tab label="Performance" />
        </Tabs>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Tab Panel 0: General Information */}
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: '12px',
                      border: `1px solid ${theme.palette.divider}`,
                      height: '100%'
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600,
                        mb: 2,
                        fontSize: '0.875rem'
                      }}
                    >
                      Basic Information
                    </Typography>
                    <InfoRow
                      icon={<Business sx={{ fontSize: 18 }} />}
                      label="Code"
                      value={supplierData.code}
                    />
                    <InfoRow
                      icon={<Business sx={{ fontSize: 18 }} />}
                      label="Name"
                      value={supplierData.name}
                    />
                    <InfoRow
                      icon={<Business sx={{ fontSize: 18 }} />}
                      label="Tax ID"
                      value={supplierData.taxId}
                    />
                    <InfoRow
                      icon={<Business sx={{ fontSize: 18 }} />}
                      label="Registration"
                      value={supplierData.registrationNumber}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: '12px',
                      border: `1px solid ${theme.palette.divider}`,
                      height: '100%'
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600,
                        mb: 2,
                        fontSize: '0.875rem'
                      }}
                    >
                      Contact Information
                    </Typography>
                    <InfoRow
                      icon={<Email sx={{ fontSize: 18 }} />}
                      label="Email"
                      value={supplierData.email}
                    />
                    <InfoRow
                      icon={<Phone sx={{ fontSize: 18 }} />}
                      label="Phone"
                      value={supplierData.phone}
                    />
                    <InfoRow
                      icon={<Phone sx={{ fontSize: 18 }} />}
                      label="Fax"
                      value={supplierData.fax}
                    />
                    <InfoRow
                      icon={<Business sx={{ fontSize: 18 }} />}
                      label="Website"
                      value={supplierData.website}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: '12px',
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600,
                        mb: 2,
                        fontSize: '0.875rem'
                      }}
                    >
                      Address
                    </Typography>
                    <InfoRow
                      icon={<LocationOn sx={{ fontSize: 18 }} />}
                      label="Address"
                      value={[
                        supplierData.addressLine1,
                        supplierData.addressLine2,
                        supplierData.city,
                        supplierData.state,
                        supplierData.postalCode,
                        supplierData.country
                      ].filter(Boolean).join(', ')}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: '12px',
                      border: `1px solid ${theme.palette.divider}`,
                      height: '100%'
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600,
                        mb: 2,
                        fontSize: '0.875rem'
                      }}
                    >
                      Payment Terms
                    </Typography>
                    <InfoRow
                      icon={<CreditCard sx={{ fontSize: 18 }} />}
                      label="Terms"
                      value={supplierData.paymentTerms}
                    />
                    <InfoRow
                      icon={<CreditCard sx={{ fontSize: 18 }} />}
                      label="Credit Limit"
                      value={supplierData.creditLimit}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: '12px',
                      border: `1px solid ${theme.palette.divider}`,
                      height: '100%'
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600,
                        mb: 2,
                        fontSize: '0.875rem'
                      }}
                    >
                      Additional Info
                    </Typography>
                    <InfoRow
                      icon={<Business sx={{ fontSize: 18 }} />}
                      label="Rating"
                      value={supplierData.rating ? `${supplierData.rating}/5.00` : 'Not Rated'}
                    />
                    <InfoRow
                      icon={<Business sx={{ fontSize: 18 }} />}
                      label="Created By"
                      value={supplierData.createdBy}
                    />
                  </Paper>
                </Grid>

                {supplierData.notes && (
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: '12px',
                        border: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          mb: 2,
                          fontSize: '0.875rem'
                        }}
                      >
                        Notes
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                      >
                        {supplierData.notes}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}

            {/* Tab Panel 1: Contacts */}
            {tabValue === 1 && (
              <SupplierContactManager
                supplierId={supplierData.id}
                contacts={supplierData.contacts || []}
                canEdit={canEdit}
                onUpdate={fetchSupplierDetails}
              />
            )}

            {/* Tab Panel 2: Documents */}
            {tabValue === 2 && (
              <SupplierDocumentManager
                supplierId={supplierData.id}
                documents={supplierData.documents || []}
                canEdit={canEdit}
                onUpdate={fetchSupplierDetails}
              />
            )}

            {/* Tab Panel 3: Product Catalog */}
            {tabValue === 3 && (
              <SupplierProductCatalog
                supplierId={supplierData.id}
                canEdit={canEdit}
              />
            )}

            {/* Tab Panel 4: Performance Metrics */}
            {tabValue === 4 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <SupplierScorecard
                    supplierId={supplierData.id}
                    supplierName={supplierData.name}
                    onRefresh={fetchSupplierDetails}
                  />
                </Grid>
                <Grid item xs={12}>
                  <PerformanceChart
                    supplierId={supplierData.id}
                    supplierName={supplierData.name}
                  />
                </Grid>
              </Grid>
            )}
          </>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            px: 3
          }}
        >
          Close
        </Button>
      </DialogActions>
    </>
  )
}

export default SupplierDetails