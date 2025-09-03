import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Fade,
  Container,
  Stack,
  useTheme,
  alpha,
  Breadcrumbs,
  Link
} from '@mui/material'
import {
  NavigateNext,
  Warning,
  Add,
  AutorenewRounded,
  FileDownload
} from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'
import QuarantineDashboard from '../components/quarantine/QuarantineDashboard'

const Quarantine = () => {
  const theme = useTheme()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export quarantine report')
  }

  const handleNewQuarantine = () => {
    // TODO: Open modal to create new quarantine record
    console.log('Create new quarantine record')
  }

  return (
    <Fade in timeout={300}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff', pb: 4 }}>
        <Container maxWidth="xl">
          {/* Breadcrumbs */}
          <Box sx={{ py: 2 }}>
            <Breadcrumbs
              separator={<NavigateNext fontSize="small" sx={{ color: theme.palette.text.secondary }} />}
              sx={{
                '& .MuiBreadcrumbs-ol': {
                  alignItems: 'center'
                }
              }}
            >
              <Link
                component={RouterLink}
                to="/"
                sx={{
                  color: theme.palette.text.secondary,
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: theme.palette.primary.main
                  }
                }}
              >
                Dashboard
              </Link>
              <Link
                component={RouterLink}
                to="/inventory"
                sx={{
                  color: theme.palette.text.secondary,
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'color 0.2s',
                  '&:hover': {
                    color: theme.palette.primary.main
                  }
                }}
              >
                Inventory
              </Link>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: theme.palette.text.primary
                }}
              >
                Quarantine Management
              </Typography>
            </Breadcrumbs>
          </Box>

          {/* Page Header */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              backgroundColor: theme.palette.background.paper,
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.02)} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
            >
              {/* Title Section */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Warning sx={{ color: theme.palette.error.main, fontSize: 24 }} />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      fontSize: '1.5rem'
                    }}
                  >
                    Quarantine Management
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '0.875rem',
                    pl: 7
                  }}
                >
                  Manage quarantined items, review pending cases, and track disposal processes
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  startIcon={<AutorenewRounded />}
                  onClick={handleRefresh}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderColor: theme.palette.divider,
                    color: theme.palette.text.primary,
                    px: 2,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  Refresh
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<FileDownload />}
                  onClick={handleExport}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderColor: theme.palette.divider,
                    color: theme.palette.text.primary,
                    px: 2,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  Export
                </Button>

                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleNewQuarantine}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2.5,
                    backgroundColor: theme.palette.error.main,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
                    '&:hover': {
                      backgroundColor: theme.palette.error.dark,
                      boxShadow: `0 6px 16px ${alpha(theme.palette.error.main, 0.4)}`
                    }
                  }}
                >
                  New Quarantine
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* Main Content */}
          <QuarantineDashboard key={refreshTrigger} onRefresh={handleRefresh} />
        </Container>
      </Box>
    </Fade>
  )
}

export default Quarantine