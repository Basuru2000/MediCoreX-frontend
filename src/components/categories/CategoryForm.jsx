import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  Chip
} from '@mui/material'
import { getCategories, getCategoryTree } from '../../services/api'

function CategoryForm({ open, onClose, onSubmit, category }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: null
  })

  const [errors, setErrors] = useState({})
  const [parentCategories, setParentCategories] = useState([])

  useEffect(() => {
    if (open) {
      fetchParentCategories()
    }
    
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        parentId: category.parentId || null
      })
    } else {
      setFormData({
        name: '',
        description: '',
        parentId: null
      })
    }
    setErrors({})
  }, [category, open])
  
  const fetchParentCategories = async () => {
    try {
      // Get ALL categories, not just root ones
      const response = await getCategories()
      
      // If editing, filter out:
      // 1. The current category itself
      // 2. Any descendants of the current category (to prevent circular references)
      let filtered = response.data
      
      if (category) {
        // Get IDs of current category and its descendants
        const descendantIds = await getDescendantIds(category.id)
        filtered = response.data.filter(c => 
          c.id !== category.id && !descendantIds.includes(c.id)
        )
      }
      
      // Sort by level and name for better display
      filtered.sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level
        return a.name.localeCompare(b.name)
      })
      
      setParentCategories(filtered)
    } catch (error) {
      console.error('Failed to fetch parent categories', error)
    }
  }
  
  // Helper function to get descendant IDs
  const getDescendantIds = async (categoryId) => {
    try {
      const response = await getCategoryTree()
      const descendants = []
      
      const findDescendants = (categories) => {
        for (const cat of categories) {
          if (cat.parentId === categoryId) {
            descendants.push(cat.id)
            if (cat.children) {
              findDescendants(cat.children)
            }
          }
        }
      }
      
      // Find the category in the tree and get all its descendants
      const findInTree = (categories) => {
        for (const cat of categories) {
          if (cat.id === categoryId && cat.children) {
            cat.children.forEach(child => {
              descendants.push(child.id)
              if (child.children) {
                findDescendants(child.children)
              }
            })
          }
          if (cat.children) {
            findInTree(cat.children)
          }
        }
      }
      
      findInTree(response.data)
      return descendants
    } catch (error) {
      console.error('Failed to get descendant IDs', error)
      return []
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Category name must not exceed 100 characters'
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {category ? 'Edit Category' : 'Add New Category'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            select
            label="Parent Category"
            name="parentId"
            value={formData.parentId || ''}
            onChange={handleChange}
            sx={{ mb: 2 }}
            helperText="Leave empty for root category"
          >
            <MenuItem value="">
              <em>None (Root Category)</em>
            </MenuItem>
            {parentCategories.map(cat => (
              <MenuItem key={cat.id} value={cat.id}>
                <Box component="span" sx={{ pl: cat.level * 2 }}>
                  {cat.level > 0 && '└─ '}
                  {cat.name}
                  {cat.productCount > 0 && (
                    <Chip 
                      label={cat.productCount} 
                      size="small" 
                      sx={{ ml: 1, height: 20 }} 
                    />
                  )}
                </Box>
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
            multiline
            rows={3}
            placeholder="Enter a brief description of this category..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {category ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CategoryForm