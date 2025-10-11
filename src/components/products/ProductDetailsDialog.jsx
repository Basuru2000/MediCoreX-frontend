import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Grid,
  Avatar,
  Chip,
  Divider,
  Paper,
  Stack,
  useTheme,
  alpha
} from '@mui/material'
import {
  Close,
  Inventory,
  Category,
  AttachMoney,
  QrCode2,
  CalendarToday,
  LocalOffer,
  CheckCircle,
  Warning,
  ErrorOutline,
  Business,
  Functions
} from '@mui/icons-material'
import { format } from 'date-fns'

function ProductDetailsDialog({ open, onClose, product }) {
  const theme = useTheme()

  if (!product) return null

  const getStockStatusColor = (status) => {
    switch(status) {
      case 'LOW': return 'warning'
      case 'OUT_OF_STOCK': return 'error'
      default: return 'success'
    }
  }

  const getStockStatusIcon = (status) => {
    switch(status) {
      case 'LOW': return <Warning sx={{ fontSize: 18 }} />
      case 'OUT_OF_STOCK': return <ErrorOutline sx={{ fontSize: 18 }} />
      default: return <CheckCircle sx={{ fontSize: 18 }} />
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch (error) {
      return dateString
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: theme.shadows[24]
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            p: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Avatar
              src={product.imageUrl ? `http://localhost:8080${product.imageUrl}` : null}
              variant="rounded"
              sx={{
                width: 80,
                height: 80,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: `3px solid ${theme.palette.background.paper}`,
                boxShadow: theme.shadows[4]
              }}
            >
              <Inventory sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h5" fontWeight={700}>
                {product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Product ID: #{product.id} | Code: {product.code || 'N/A'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={getStockStatusIcon(product.stockStatus)}
                  label={product.stockStatus?.replace('_', ' ')}
                  size="small"
                  color={getStockStatusColor(product.stockStatus)}
                  sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                />
                {product.isExpiringSoon && (
                  <Chip
                    icon={<Warning sx={{ fontSize: 16 }} />}
                    label="Expiring Soon"
                    size="small"
                    color="warning"
                    sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                  />
                )}
              </Box>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.action.active, 0.05),
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Product Image Section */}
          {product.imageUrl && (
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, fontSize: '1rem', alignSelf: 'flex-start' }}>
                  Product Image
                </Typography>
                <Box
                  component="img"
                  src={`http://localhost:8080${product.imageUrl}`}
                  alt={product.name}
                  sx={{
                    width: '100%',
                    maxWidth: 300,
                    height: 'auto',
                    maxHeight: 300,
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.grey[100], 0.5)
                  }}
                />
              </Paper>
            </Grid>
          )}

          {/* Product Details Sections */}
          <Grid item xs={12} md={product.imageUrl ? 8 : 12}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                  }}
                >
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, fontSize: '1.125rem' }}>
                    Basic Information
                  </Typography>
                  <Grid container spacing={2.5}>
                    {/* Product Name */}
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '8px',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Inventory sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                        </Box>
                        <Box flex={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Product Name
                          </Typography>
                          <Typography variant="body1" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                            {product.name}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    {/* Category */}
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '8px',
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Category sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Category
                          </Typography>
                          <Chip
                            label={product.categoryName}
                            size="small"
                            sx={{
                              mt: 0.5,
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                      </Stack>
                    </Grid>

                    {/* Product Code */}
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '8px',
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <LocalOffer sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Product Code
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {product.code || 'Not assigned'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    {/* Barcode */}
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '8px',
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <QrCode2 sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Barcode
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {product.barcode || 'Not assigned'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    {/* Manufacturer */}
                    {product.manufacturer && (
                      <Grid item xs={12}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '8px',
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Business sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              Manufacturer
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {product.manufacturer}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    )}

                    {/* Description */}
                    {product.description && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Description
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                          {product.description}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>

              {/* Stock & Pricing Information */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.success.main, 0.02)
                  }}
                >
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, fontSize: '1.125rem' }}>
                    Stock & Pricing
                  </Typography>
                  <Grid container spacing={2.5}>
                    {/* Current Stock */}
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Current Stock
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ mt: 1 }}>
                          {product.quantity}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.unit}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Min Stock Level */}
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Min Stock Level
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color="warning.main" sx={{ mt: 1 }}>
                          {product.minStockLevel}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.unit}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Unit Price */}
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Unit Price
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color="success.main" sx={{ mt: 1 }}>
                          ${product.unitPrice?.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          per {product.unit}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Total Value */}
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Total Value
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color="info.main" sx={{ mt: 1 }}>
                          ${(product.quantity * product.unitPrice).toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          inventory value
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Additional Details */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.warning.main, 0.02)
                  }}
                >
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, fontSize: '1.125rem' }}>
                    Additional Details
                  </Typography>
                  <Grid container spacing={2.5}>
                    {/* Expiry Date */}
                    {product.expiryDate && (
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '8px',
                              bgcolor: alpha(product.isExpiringSoon ? theme.palette.warning.main : theme.palette.info.main, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <CalendarToday sx={{ 
                              color: product.isExpiringSoon ? theme.palette.warning.main : theme.palette.info.main, 
                              fontSize: 20 
                            }} />
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              Expiry Date
                            </Typography>
                            <Typography 
                              variant="body1" 
                              fontWeight={600}
                              sx={{ 
                                color: product.isExpiringSoon ? 'warning.main' : 'text.primary'
                              }}
                            >
                              {formatDate(product.expiryDate)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    )}

                    {/* Batch Number */}
                    {product.batchNumber && (
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '8px',
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Functions sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              Batch Number
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {product.batchNumber}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    )}

                    {/* Created Date */}
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '8px',
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <CalendarToday sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Added to System
                          </Typography>
                          <Typography variant="body1" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                            {formatDate(product.createdAt)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    {/* Last Updated */}
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '8px',
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <CalendarToday sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Last Updated
                          </Typography>
                          <Typography variant="body1" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                            {formatDate(product.updatedAt)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default ProductDetailsDialog