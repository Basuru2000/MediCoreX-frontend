import React from 'react'
import { Chip } from '@mui/material'
import { Star } from '@mui/icons-material'

function PreferredSupplierBadge() {
  return (
    <Chip
      size="small"
      icon={<Star />}
      label="Preferred"
      color="warning"
      variant="outlined"
      sx={{ ml: 1 }}
    />
  )
}

export default PreferredSupplierBadge