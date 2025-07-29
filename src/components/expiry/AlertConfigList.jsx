import { useState } from 'react'
import {
  Box,
  Grid,
  Typography,
  Alert,
  LinearProgress
} from '@mui/material'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import AlertTierCard from './AlertTierCard'
import { updateExpiryAlertConfigSortOrder } from '../../services/api'

function AlertConfigList({ configs, loading, onEdit, onDelete, onToggle, onReorder }) {
  const [reordering, setReordering] = useState(false)

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const items = Array.from(configs)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Optimistically update UI
    onReorder(items)

    // Update sort order in backend
    try {
      setReordering(true)
      const configIds = items.map(item => item.id)
      await updateExpiryAlertConfigSortOrder(configIds)
    } catch (error) {
      console.error('Failed to update sort order:', error)
      // Revert on error by refetching
      window.location.reload()
    } finally {
      setReordering(false)
    }
  }

  if (loading) {
    return <LinearProgress />
  }

  if (configs.length === 0) {
    return (
      <Alert severity="info">
        No alert configurations found. Create your first configuration to start monitoring product expiry.
      </Alert>
    )
  }

  return (
    <Box>
      {reordering && <LinearProgress sx={{ mb: 2 }} />}
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="alert-configs">
          {(provided) => (
            <Grid
              container
              spacing={3}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {configs.map((config, index) => (
                <Draggable
                  key={config.id}
                  draggableId={String(config.id)}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <Grid
                      item
                      xs={12}
                      md={6}
                      lg={4}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <AlertTierCard
                        config={config}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggle={onToggle}
                        draggable={false}
                      />
                    </Grid>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  )
}

export default AlertConfigList