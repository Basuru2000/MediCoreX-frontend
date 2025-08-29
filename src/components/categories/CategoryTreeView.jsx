import React from 'react'
import {
  Box,
  IconButton,
  Typography,
  Chip,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Paper,
  useTheme,
  alpha,
  Badge,
  Fade
} from '@mui/material'
import {
  ExpandMore,
  ChevronRight,
  Edit,
  Delete,
  FolderOutlined,
  FolderOpenOutlined,
  Inventory2Outlined
} from '@mui/icons-material'

function CategoryTreeItem({ category, level = 0, onEdit, onDelete, isManager, index = 0 }) {
  const theme = useTheme()
  const [open, setOpen] = React.useState(level === 0)
  const hasChildren = category.children && category.children.length > 0

  const handleToggle = () => {
    setOpen(!open)
  }

  // Define different styles based on level
  const getLevelStyles = () => {
    if (level === 0) {
      // Root categories - most prominent
      return {
        bgcolor: 'background.paper',
        borderColor: theme.palette.primary.main,
        borderWidth: '1.5px',
        boxShadow: theme.shadows[1]
      }
    } else if (level === 1) {
      // First level subcategories
      return {
        bgcolor: alpha(theme.palette.primary.main, 0.03),
        borderColor: alpha(theme.palette.primary.main, 0.3),
        borderWidth: '1px',
        borderStyle: 'solid'
      }
    } else {
      // Deeper subcategories
      return {
        bgcolor: alpha(theme.palette.grey[100], 0.5),
        borderColor: theme.palette.divider,
        borderWidth: '1px',
        borderStyle: 'dashed'
      }
    }
  }

  const levelStyles = getLevelStyles()

  return (
    <Fade in timeout={300 + index * 50}>
      <Box>
        <Paper
          elevation={0}
          sx={{
            mb: level === 0 ? 1.5 : 0.75,
            ml: level * 2.5,
            borderRadius: level === 0 ? '10px' : '6px',
            border: `${levelStyles.borderWidth} ${levelStyles.borderStyle || 'solid'} ${levelStyles.borderColor}`,
            bgcolor: levelStyles.bgcolor,
            boxShadow: levelStyles.boxShadow || 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              transform: 'translateX(2px)'
            }
          }}
        >
          <ListItem
            sx={{
              py: level === 0 ? 1.25 : 1,
              px: level === 0 ? 2 : 1.5,
              minHeight: level === 0 ? 52 : 44
            }}
          >
            <Box display="flex" alignItems="center" flex={1}>
              {/* Expand/Collapse Button */}
              {hasChildren ? (
                <IconButton 
                  size="small" 
                  onClick={handleToggle}
                  sx={{ 
                    mr: 0.75,
                    padding: '4px',
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main
                    }
                  }}
                >
                  {open ? <ExpandMore fontSize="small" /> : <ChevronRight fontSize="small" />}
                </IconButton>
              ) : (
                <Box width={28} mr={0.75} />
              )}
              
              {/* Folder Icon with level-based styling */}
              <Box
                sx={{
                  width: level === 0 ? 32 : 28,
                  height: level === 0 ? 32 : 28,
                  borderRadius: level === 0 ? '8px' : '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: level === 0 
                    ? alpha(theme.palette.primary.main, 0.12)
                    : alpha(theme.palette.primary.main, 0.08),
                  color: level === 0 
                    ? theme.palette.primary.main 
                    : theme.palette.primary.light,
                  mr: 1.25
                }}
              >
                {open && hasChildren ? (
                  <FolderOpenOutlined sx={{ fontSize: level === 0 ? 18 : 16 }} />
                ) : (
                  <FolderOutlined sx={{ fontSize: level === 0 ? 18 : 16 }} />
                )}
              </Box>
              
              {/* Level Indicator for subcategories */}
              {level > 0 && (
                <Chip
                  label={`L${level}`}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    mr: 0.75,
                    bgcolor: alpha(theme.palette.grey[400], 0.2),
                    color: theme.palette.text.secondary,
                    '& .MuiChip-label': {
                      px: 0.75
                    }
                  }}
                />
              )}
              
              {/* Category Information */}
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography 
                      variant={level === 0 ? "body2" : "caption"}
                      fontWeight={level === 0 ? 600 : 500}
                      sx={{ 
                        color: level === 0 
                          ? theme.palette.text.primary 
                          : theme.palette.text.secondary,
                        fontSize: level === 0 ? '0.875rem' : '0.8125rem'
                      }}
                    >
                      {category.name}
                    </Typography>
                    
                    {/* Product Count Badge */}
                    {category.productCount > 0 && (
                      <Tooltip title={`${category.productCount} products in this category`}>
                        <Chip
                          icon={<Inventory2Outlined sx={{ fontSize: 12 }} />}
                          label={category.productCount}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                            '& .MuiChip-icon': {
                              color: theme.palette.success.main,
                              ml: 0.25
                            },
                            '& .MuiChip-label': {
                              px: 0.5
                            }
                          }}
                        />
                      </Tooltip>
                    )}
                    
                    {/* Children Count */}
                    {hasChildren && (
                      <Tooltip title={`${category.children.length} subcategories`}>
                        <Chip
                          label={`${category.children.length}`}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            borderColor: theme.palette.divider,
                            color: theme.palette.text.secondary,
                            '& .MuiChip-label': {
                              px: 0.75
                            }
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                }
                secondary={
                  category.description && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ 
                        mt: 0.25,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '350px',
                        fontSize: '0.7rem'
                      }}
                    >
                      {category.description}
                    </Typography>
                  )
                }
                sx={{
                  '& .MuiListItemText-primary': {
                    mb: 0
                  },
                  '& .MuiListItemText-secondary': {
                    mt: 0.25
                  }
                }}
              />
            </Box>
            
            {/* Action Buttons */}
            <ListItemSecondaryAction>
              {isManager && (
                <Box display="flex" gap={0.25}>
                  <Tooltip title="Edit category">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(category)}
                      sx={{ 
                        padding: '6px',
                        color: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.15)
                        }
                      }}
                    >
                      <Edit sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip 
                    title={
                      (category.productCount > 0 || hasChildren)
                        ? category.productCount > 0 
                          ? `Cannot delete: ${category.productCount} products assigned`
                          : `Cannot delete: Has ${category.children.length} subcategories`
                        : 'Delete category'
                    }
                  >
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => onDelete(category.id)}
                        disabled={category.productCount > 0 || hasChildren}
                        sx={{ 
                          padding: '6px',
                          color: theme.palette.error.main,
                          bgcolor: alpha(theme.palette.error.main, 0.08),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.error.main, 0.15)
                          },
                          '&:disabled': {
                            color: theme.palette.action.disabled,
                            bgcolor: theme.palette.action.disabledBackground
                          }
                        }}
                      >
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              )}
            </ListItemSecondaryAction>
          </ListItem>
        </Paper>
        
        {/* Children Categories */}
        {hasChildren && (
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ 
              ml: 0.75,
              mt: 0.25,
              mb: level === 0 ? 0.5 : 0.25,
              borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              pl: 0.75
            }}>
              {category.children.map((child, childIndex) => (
                <CategoryTreeItem
                  key={child.id}
                  category={child}
                  level={level + 1}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isManager={isManager}
                  index={childIndex}
                />
              ))}
            </Box>
          </Collapse>
        )}
      </Box>
    </Fade>
  )
}

function CategoryTreeView({ categories, onEdit, onDelete, isManager }) {
  const theme = useTheme()
  
  if (!categories || categories.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.primary.main, 0.02)
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}
        >
          <FolderOutlined sx={{ fontSize: 40 }} />
        </Box>
        <Typography variant="h6" gutterBottom>
          No Categories Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start by creating your first category to organize products
        </Typography>
      </Paper>
    )
  }

  return (
    <Box>
      {categories.map((category, index) => (
        <CategoryTreeItem
          key={category.id}
          category={category}
          level={0}
          onEdit={onEdit}
          onDelete={onDelete}
          isManager={isManager}
          index={index}
        />
      ))}
    </Box>
  )
}

export default CategoryTreeView