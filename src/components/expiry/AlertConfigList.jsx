import { useState } from 'react'
import {
  Box,
  Grid,
  Typography,
  Alert,
  LinearProgress,
  Fade,
  useTheme,
  alpha
} from '@mui/material'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import AlertTierCard from './AlertTierCard'
import { updateExpiryAlertConfigSortOrder } from '../../services/api'
import { InfoOutlined } from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'

// Strict mode fix for react-beautiful-dnd
const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false)
  
  useState(() => {
    const animation = requestAnimationFrame(() => setEnabled(true))
    return () => {
      cancelAnimationFrame(animation)
      setEnabled(false)
    }
  }, [])
  
  if (!enabled) {
    return null
  }
  
  return <Droppable {...props}>{children}</Droppable>
}

function AlertConfigList({ configs, loading, onEdit, onDelete, onToggle, onReorder }) {
  const theme = useTheme()
  const { isManager } = useAuth()
  const [reordering, setReordering] = useState(false)

  const handleDragEnd = async (result) => {
    if (!result.destination || !isManager) return

    const items = Array.from(configs)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Optimistically update UI
    if (onReorder) {
      onReorder(items)
    }

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
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress 
          sx={{ 
            borderRadius: '4px',
            height: 6,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: '4px'
            }
          }} 
        />
      </Box>
    )
  }

  if (configs.length === 0) {
    return (
      <Fade in={true}>
        <Alert 
          severity="info"
          icon={<InfoOutlined />}
          sx={{ 
            borderRadius: '8px',
            border: `1px solid ${theme.palette.info.light}`,
            bgcolor: alpha(theme.palette.info.main, 0.05),
            '& .MuiAlert-icon': {
              color: theme.palette.info.main
            }
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            No alert configurations found
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Create your first configuration to start monitoring product expiry.
          </Typography>
        </Alert>
      </Fade>
    )
  }

  // If not manager or only one config, just display the cards without drag functionality
  if (!isManager || configs.length <= 1) {
    return (
      <Box>
        <Grid container spacing={3}>
          {configs.map((config, index) => (
            <Grid item xs={12} md={6} lg={4} key={config.id}>
              <Fade in={true} timeout={300 + index * 100}>
                <Box>
                  <AlertTierCard
                    config={config}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggle={onToggle}
                    isDraggable={false}
                  />
                </Box>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  // Manager view with drag and drop
  return (
    <Box>
      {reordering && (
        <LinearProgress 
          sx={{ 
            mb: 2,
            borderRadius: '4px',
            height: 4,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: '4px'
            }
          }} 
        />
      )}
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <StrictModeDroppable droppableId="alert-configs-droppable">
          {(provided, snapshot) => (
            <Grid
              container
              spacing={3}
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{
                transition: snapshot.isDraggingOver ? 'background 0.2s' : undefined,
                borderRadius: '8px',
                p: snapshot.isDraggingOver ? 1 : 0,
                bgcolor: snapshot.isDraggingOver ? alpha(theme.palette.primary.main, 0.02) : 'transparent'
              }}
            >
              {configs.map((config, index) => (
                <Draggable
                  key={config.id.toString()}
                  draggableId={config.id.toString()}
                  index={index}
                  isDragDisabled={!config.active}
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
                      style={{
                        ...provided.draggableProps.style
                      }}
                    >
                      <Fade in={true} timeout={300 + index * 100}>
                        <Box
                          sx={{
                            transform: snapshot.isDragging ? 'rotate(1deg) scale(1.02)' : 'none',
                            transition: snapshot.isDragging ? 'none' : 'transform 0.2s',
                            opacity: snapshot.isDragging ? 0.9 : 1
                          }}
                        >
                          <AlertTierCard
                            config={config}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onToggle={onToggle}
                            isDragging={snapshot.isDragging}
                            isDraggable={true}
                          />
                        </Box>
                      </Fade>
                    </Grid>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Grid>
          )}
        </StrictModeDroppable>
      </DragDropContext>
    </Box>
  )
}

export default AlertConfigList