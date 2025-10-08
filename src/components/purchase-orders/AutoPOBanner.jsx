import React, { useState, useEffect } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Collapse,
  Stack,
  Typography,
  useTheme,
  alpha
} from '@mui/material'
import {
  AutoAwesome,
  Settings,
  Close,
  Check,
  Error
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { getAutoPOConfig } from '../../services/api'

function AutoPOBanner() {
  const theme = useTheme()
  const navigate = useNavigate()
  const [show, setShow] = useState(true)
  const [config, setConfig] = useState(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await getAutoPOConfig()
      setConfig(response.data)
    } catch (error) {
      console.error('Error fetching auto PO config:', error)
    }
  }

  if (!show || !config) return null

  const statusColor = config.enabled ? theme.palette.info.main : theme.palette.warning.main
  const bgColor = config.enabled ? alpha(theme.palette.info.main, 0.05) : alpha(theme.palette.warning.main, 0.05)

  return (
    <Collapse in={show}>
      <Box
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: '12px',
          border: `1px solid ${alpha(statusColor, 0.3)}`,
          bgcolor: bgColor
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(statusColor, 0.1),
                color: statusColor
              }}
            >
              <AutoAwesome />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Automated PO Generation
                </Typography>
                <Chip
                  icon={config.enabled ? <Check sx={{ fontSize: 16 }} /> : <Error sx={{ fontSize: 16 }} />}
                  label={config.enabled ? "Enabled" : "Disabled"}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    bgcolor: config.enabled ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.grey[500], 0.1),
                    color: config.enabled ? theme.palette.success.main : theme.palette.grey[600],
                    border: `1px solid ${alpha(config.enabled ? theme.palette.success.main : theme.palette.grey[500], 0.3)}`
                  }}
                />
              </Stack>
              {config.lastRunAt && (
                <Typography variant="caption" color="text.secondary">
                  Last run: {new Date(config.lastRunAt).toLocaleString()}
                  {config.lastRunStatus && (
                    <>
                      {' • '}
                      <Chip
                        label={config.lastRunStatus}
                        size="small"
                        color={
                          config.lastRunStatus === 'SUCCESS' ? 'success' :
                          config.lastRunStatus === 'PARTIAL' ? 'warning' : 'error'
                        }
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          ml: 0.5
                        }}
                      />
                    </>
                  )}
                </Typography>
              )}
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => navigate('/auto-po-settings')}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                borderColor: alpha(statusColor, 0.5),
                color: statusColor,
                '&:hover': {
                  borderColor: statusColor,
                  bgcolor: alpha(statusColor, 0.1)
                }
              }}
            >
              Configure
            </Button>
            <IconButton
              size="small"
              onClick={() => setShow(false)}
              sx={{
                '&:hover': {
                  bgcolor: alpha(theme.palette.grey[500], 0.1)
                }
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </Collapse>
  )
}

export default AutoPOBanner