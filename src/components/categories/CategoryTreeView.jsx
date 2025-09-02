import React from 'react'
import {
  Box,
  IconButton,
  Typography,
  Chip,
  Collapse,
  Tooltip,
  Paper,
  useTheme,
  alpha,
  Fade
} from '@mui/material'
import {
  ExpandMore,
  ChevronRight,
  Edit,
  Delete,
  FolderOutlined,
  FolderOpenOutlined,
  Inventory2Outlined,
  AccountTreeOutlined
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'

function CategoryTreeItem({ category, level = 0, onEdit, onDelete, isManager, index = 0, categoryChildrenCount }) {
  const theme = useTheme()
  const [open, setOpen] = React.useState(level === 0)
  const hasChildren = category.children && category.children.length > 0
  const childrenCount = categoryChildrenCount?.[category.id] || 0

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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              py: level === 0 ? 1 : 0.75,  // REDUCED from 1.25 : 1
              px: level === 0 ? 2 : 1.5,
              minHeight: level === 0 ? 48 : 40,  // REDUCED from 52 : 44
              position: 'relative'
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
                  width: level === 0 ? 28 : 24,  // REDUCED from 32 : 28
                  height: level === 0 ? 28 : 24,  // REDUCED from 32 : 28
                  borderRadius: level === 0 ? '6px' : '4px',  // REDUCED from 8px : 6px
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
                  <FolderOpenOutlined sx={{ fontSize: level === 0 ? 16 : 14 }} />
                ) : (
                  <FolderOutlined sx={{ fontSize: level === 0 ? 16 : 14 }} />
                )}
              </Box>
              
              {/* Level Indicator for subcategories */}
              {level > 0 && (
                <Chip
                  label={`L${level}`}
                  size="small"
                  sx={{
                    height: 16,  // REDUCED from 18
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    mr: 0.75,
                    bgcolor: alpha(theme.palette.grey[400], 0.2),
                    color: theme.palette.text.secondary,
                    '& .MuiChip-label': {
                      px: 0.5  // REDUCED from 0.75
                    }
                  }}
                />
              )}
              
              {/* Category Name and Description */}
              <Box flex={1}>
                <Typography 
                  variant={level === 0 ? "body2" : "caption"}
                  fontWeight={level === 0 ? 600 : 500}
                  sx={{ 
                    fontSize: level === 0 ? '0.875rem' : '0.813rem',
                    color: theme.palette.text.primary
                  }}
                >
                  {category.name}
                </Typography>
                {category.description && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: '0.75rem',
                      display: 'block',
                      mt: 0.25,
                      lineHeight: 1.3
                    }}
                  >
                    {category.description}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Actions Section */}
            <Box display="flex" alignItems="center" gap={0.5}>
              {/* Subcategories Count - RESTORED */}
              {childrenCount > 0 && (
                <Tooltip title={`${childrenCount} subcategories`}>
                  <Chip
                    size="small"
                    icon={<AccountTreeOutlined sx={{ fontSize: 14 }} />}
                    label={childrenCount}
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.dark,
                      '& .MuiChip-icon': {
                        ml: 0.5,
                        mr: -0.5
                      }
                    }}
                  />
                </Tooltip>
              )}
              
              {/* Product Count Badge */}
              {category.productCount > 0 && (
                <Tooltip title={`${category.productCount} products`}>
                  <Chip
                    size="small"
                    icon={<Inventory2Outlined sx={{ fontSize: 14 }} />}
                    label={category.productCount}
                    sx={{
                      height: 20,  // REDUCED from 22
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.dark,
                      '& .MuiChip-icon': {
                        ml: 0.5,
                        mr: -0.5
                      }
                    }}
                  />
                </Tooltip>
              )}
              
              {/* Edit Button - Only for managers */}
              {isManager && onEdit && (
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(category)
                    }}
                    sx={{
                      p: 0.5,  // REDUCED padding
                      color: theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                      }
                    }}
                  >
                    <Edit sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
              
              {/* Delete Button - Only for managers */}
              {isManager && onDelete && (
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(category.id)
                    }}
                    sx={{
                      p: 0.5,  // REDUCED padding
                      color: theme.palette.error.main,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.error.main, 0.1)
                      }
                    }}
                  >
                    <Delete sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Render children recursively */}
        {hasChildren && (
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ 
              ml: level === 0 ? 0.5 : 0.25,
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
                  categoryChildrenCount={categoryChildrenCount}
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

function CategoryTreeView({ categories, onEdit, onDelete, searchQuery, categoryChildrenCount }) {
  const theme = useTheme()
  const { isManager } = useAuth()
  
  // Helper function to highlight search text
  const highlightText = (text, query) => {
    if (!query || typeof text !== 'string') return text
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <span key={index} style={{ backgroundColor: alpha(theme.palette.warning.main, 0.3) }}>{part}</span> : 
        part
    )
  }

  // Apply search highlighting if needed
  const processCategories = (cats) => {
    if (!searchQuery) return cats
    
    return cats.map(cat => ({
      ...cat,
      name: highlightText(cat.name, searchQuery),
      description: cat.description ? highlightText(cat.description, searchQuery) : cat.description,
      children: cat.children ? processCategories(cat.children) : []
    }))
  }
  
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

  const processedCategories = searchQuery ? processCategories(categories) : categories

  return (
    <Box sx={{ listStyle: 'none' }}>  {/* Added to remove list dots */}
      {processedCategories.map((category, index) => (
        <CategoryTreeItem
          key={category.id}
          category={category}
          level={0}
          onEdit={onEdit}
          onDelete={onDelete}
          isManager={isManager}
          categoryChildrenCount={categoryChildrenCount}
          index={index}
        />
      ))}
    </Box>
  )
}

export default CategoryTreeView