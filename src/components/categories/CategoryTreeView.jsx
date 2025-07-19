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
  Tooltip
} from '@mui/material'
import {
  ExpandMore,
  ChevronRight,
  Edit,
  Delete,
  Category as CategoryIcon
} from '@mui/icons-material'

function CategoryTreeItem({ category, level = 0, onEdit, onDelete, isManager }) {
  const [open, setOpen] = React.useState(true)
  const hasChildren = category.children && category.children.length > 0

  const handleToggle = () => {
    setOpen(!open)
  }

  return (
    <>
      <ListItem
        sx={{
          pl: level * 4,
          '&:hover': { backgroundColor: 'action.hover' }
        }}
      >
        <Box display="flex" alignItems="center" flex={1}>
          {hasChildren ? (
            <IconButton size="small" onClick={handleToggle}>
              {open ? <ExpandMore /> : <ChevronRight />}
            </IconButton>
          ) : (
            <Box width={40} /> // Spacer for alignment
          )}
          
          <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
          
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body1">{category.name}</Typography>
                {category.productCount > 0 && (
                  <Chip
                    label={category.productCount}
                    size="small"
                    color="primary"
                  />
                )}
              </Box>
            }
            secondary={category.description}
          />
        </Box>
        
        <ListItemSecondaryAction>
          {isManager && (
            <>
              <IconButton
                edge="end"
                size="small"
                onClick={() => onEdit(category)}
                sx={{ mr: 1 }}
              >
                <Edit />
              </IconButton>
              <Tooltip 
                title={
                  (category.productCount > 0 || hasChildren)
                    ? category.productCount > 0 
                      ? `Cannot delete: ${category.productCount} products assigned`
                      : `Cannot delete: Has subcategories`
                    : 'Delete category'
                }
              >
                <span>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onDelete(category.id)}
                    disabled={category.productCount > 0 || hasChildren}
                  >
                    <Delete />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          )}
        </ListItemSecondaryAction>
      </ListItem>
      
      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {category.children.map(child => (
              <CategoryTreeItem
                key={child.id}
                category={child}
                level={level + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                isManager={isManager}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  )
}

function CategoryTreeView({ categories, onEdit, onDelete, isManager }) {
  return (
    <List>
      {categories.map(category => (
        <CategoryTreeItem
          key={category.id}
          category={category}
          level={0}
          onEdit={onEdit}
          onDelete={onDelete}
          isManager={isManager}
        />
      ))}
    </List>
  )
}

export default CategoryTreeView