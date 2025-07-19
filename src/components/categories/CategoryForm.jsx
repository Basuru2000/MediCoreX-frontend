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
import { getRootCategories } from '../../services/api'

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
      const response = await getRootCategories()
      // If editing, filter out the current category and its descendants
      const filtered = category 
        ? response.data.filter(c => c.id !== category.id)
        : response.data
      setParentCategories(filtered)
    } catch (error) {
      console.error('Failed to fetch parent categories', error)
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
                {cat.fullPath || cat.name}
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