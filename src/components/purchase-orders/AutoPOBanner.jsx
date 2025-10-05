import React, { useState, useEffect } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Collapse
} from '@mui/material'
import {
  AutoAwesome,
  Settings,
  Close,
  PlayArrow
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { getAutoPOConfig } from '../../services/api'

function AutoPOBanner() {
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

  return (
    <Collapse in={show}>
      <Alert
        severity={config.enabled ? "info" : "warning"}
        icon={<AutoAwesome />}
        sx={{ mb: 2 }}
        action={
          <Box display="flex" gap={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => navigate('/auto-po-settings')}
            >
              Configure
            </Button>
            <IconButton
              size="small"
              onClick={() => setShow(false)}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <Box display="flex" alignItems="center" gap={2}>
          <strong>Automated PO Generation</strong>
          <Chip
            label={config.enabled ? "Enabled" : "Disabled"}
            color={config.enabled ? "success" : "default"}
            size="small"
          />
          {config.lastRunAt && (
            <Box component="span" fontSize="0.875rem" color="text.secondary">
              Last run: {new Date(config.lastRunAt).toLocaleString()}
              {config.lastRunStatus && (
                <Chip
                  label={config.lastRunStatus}
                  size="small"
                  color={
                    config.lastRunStatus === 'SUCCESS' ? 'success' :
                    config.lastRunStatus === 'PARTIAL' ? 'warning' : 'error'
                  }
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          )}
        </Box>
      </Alert>
    </Collapse>
  )
}

export default AutoPOBanner