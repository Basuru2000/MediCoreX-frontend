import React, { useState, useEffect } from 'react'
import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse
} from '@mui/material'
import { ExpandMore, ExpandLess, Warning } from '@mui/icons-material'
import { getExpiringDocuments } from '../../services/api'
import { format } from 'date-fns'

function DocumentExpiryAlert({ supplierId }) {
  const [expiringDocs, setExpiringDocs] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetchExpiringDocuments()
  }, [supplierId])

  const fetchExpiringDocuments = async () => {
    try {
      setLoading(true)
      const response = await getExpiringDocuments(30)
      const filtered = supplierId 
        ? response.data.filter(doc => doc.supplierId === supplierId)
        : response.data
      setExpiringDocs(filtered)
    } catch (error) {
      console.error('Failed to fetch expiring documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysUntilExpiry = (expiryDate) => {
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    return days
  }

  if (loading || expiringDocs.length === 0) return null

  return (
    <Alert 
      severity="warning" 
      icon={<Warning />}
      action={
        <IconButton size="small" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      }
    >
      <AlertTitle>
        {expiringDocs.length} Document{expiringDocs.length > 1 ? 's' : ''} Expiring Soon
      </AlertTitle>
      <Collapse in={expanded}>
        <List dense>
          {expiringDocs.map((doc) => {
            const days = getDaysUntilExpiry(doc.expiryDate)
            return (
              <ListItem key={doc.id}>
                <ListItemText
                  primary={doc.documentName}
                  secondary={`Type: ${doc.documentType}`}
                />
                <Chip 
                  label={`${days} days`}
                  color={days <= 7 ? 'error' : 'warning'}
                  size="small"
                />
              </ListItem>
            )
          })}
        </List>
      </Collapse>
    </Alert>
  )
}

export default DocumentExpiryAlert