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
  alpha
} from '@mui/material'
import {
  Edit,
  Close,
  Email,
  Phone,
  LocationOn,
  Business,
  CreditCard
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

  const InfoRow = ({ icon, label, value }) => (
    <Box display="flex" alignItems="center" mb={2}>
      <Box display="flex" alignItems="center" minWidth={150}>
        {icon}
        <Typography variant="body2" color="text.secondary" ml={1}>
          {label}
        </Typography>
      </Box>
      <Typography variant="body1">
        {value || '-'}
      </Typography>
    </Box>
  )

  return (
    <>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6">Supplier Details</Typography>
            <Chip
              label={supplierData.status}
              color={getStatusColor(supplierData.status)}
              size="small"
            />
          </Box>
          <Box>
            {canEdit && (
              <IconButton onClick={onEdit} color="primary">
                <Edit />
              </IconButton>
            )}
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="General Info" />
            <Tab label="Contacts" />
            <Tab label="Documents" />
            <Tab label="Product Catalog" />
            <Tab label="Performance Metrics" />
          </Tabs>
        </Box>

        {/* Tab Panel 1: General Information */}
        {tabValue === 0 && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.9)
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    Basic Information
                  </Typography>
                  <InfoRow
                    icon={<Business fontSize="small" />}
                    label="Code"
                    value={supplierData.code}
                  />
                  <InfoRow
                    icon={<Business fontSize="small" />}
                    label="Name"
                    value={supplierData.name}
                  />
                  <InfoRow
                    icon={<Business fontSize="small" />}
                    label="Tax ID"
                    value={supplierData.taxId}
                  />
                  <InfoRow
                    icon={<Business fontSize="small" />}
                    label="Registration"
                    value={supplierData.registrationNumber}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.9)
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    Contact Information
                  </Typography>
                  <InfoRow
                    icon={<Email fontSize="small" />}
                    label="Email"
                    value={supplierData.email}
                  />
                  <InfoRow
                    icon={<Phone fontSize="small" />}
                    label="Phone"
                    value={supplierData.phone}
                  />
                  <InfoRow
                    icon={<Phone fontSize="small" />}
                    label="Fax"
                    value={supplierData.fax}
                  />
                  <InfoRow
                    icon={<Business fontSize="small" />}
                    label="Website"
                    value={supplierData.website}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.9)
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    Address
                  </Typography>
                  <Box display="flex" alignItems="flex-start">
                    <LocationOn fontSize="small" sx={{ mt: 0.5, mr: 1 }} />
                    <Box>
                      {supplierData.addressLine1 && (
                        <Typography variant="body1">{supplierData.addressLine1}</Typography>
                      )}
                      {supplierData.addressLine2 && (
                        <Typography variant="body1">{supplierData.addressLine2}</Typography>
                      )}
                      <Typography variant="body1">
                        {[
                          supplierData.city,
                          supplierData.state,
                          supplierData.postalCode,
                          supplierData.country
                        ].filter(Boolean).join(', ') || '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.9)
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    Financial Information
                  </Typography>
                  <InfoRow
                    icon={<CreditCard fontSize="small" />}
                    label="Payment Terms"
                    value={supplierData.paymentTerms}
                  />
                  <InfoRow
                    icon={<CreditCard fontSize="small" />}
                    label="Credit Limit"
                    value={supplierData.creditLimit ? `$${supplierData.creditLimit}` : '-'}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.9)
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    Additional Information
                  </Typography>
                  <InfoRow
                    icon={<Business fontSize="small" />}
                    label="Rating"
                    value={supplierData.rating ? `${supplierData.rating}/5.00` : 'Not Rated'}
                  />
                  <InfoRow
                    icon={<Business fontSize="small" />}
                    label="Created By"
                    value={supplierData.createdBy}
                  />
                </Paper>
              </Grid>

              {supplierData.notes && (
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.paper, 0.9)
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                      Notes
                    </Typography>
                    <Typography variant="body1">{supplierData.notes}</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Tab Panel 2: Contacts */}
        {tabValue === 1 && (
          <Box sx={{ mt: 3 }}>
            <SupplierContactManager
              supplierId={supplierData.id}
              contacts={supplierData.contacts || []}
              canEdit={canEdit}
              onUpdate={fetchSupplierDetails}
            />
          </Box>
        )}

        {/* Tab Panel 3: Documents */}
        {tabValue === 2 && (
          <Box sx={{ mt: 3 }}>
            <SupplierDocumentManager
              supplierId={supplierData.id}
              documents={supplierData.documents || []}
              canEdit={canEdit}
              onUpdate={fetchSupplierDetails}
            />
          </Box>
        )}

        {/* Tab Panel 4: Product Catalog */}
        {tabValue === 3 && (
          <Box sx={{ mt: 3 }}>
            <SupplierProductCatalog
              supplierId={supplierData.id}
              canEdit={canEdit}
            />
          </Box>
        )}

        {/* Tab Panel 5: Performance Metrics */}
        {tabValue === 4 && (
          <Box sx={{ mt: 3 }}>
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
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </>
  )
}

export default SupplierDetails