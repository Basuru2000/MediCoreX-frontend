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
  Chip,
  Typography,
  IconButton,
  useTheme,
  alpha,
  InputAdornment,
  FormHelperText,
  Divider,
  Fade
} from '@mui/material'
import {
  Close,
  FolderOutlined,
  DescriptionOutlined,
  AccountTreeOutlined,
  InfoOutlined
} from '@mui/icons-material'
import { getCategories, getCategoryTree } from '../../services/api'

function CategoryForm({ open, onClose, onSubmit, category }) {
  const theme = useTheme()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: null
  })
  const [errors, setErrors] = useState({})
  const [parentCategories, setParentCategories] = useState([])
  const [loading, setLoading] = useState(false)

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
      const response = await getCategories()
      let filtered = response.data
      
      if (category) {
        const descendantIds = await getDescendantIds(category.id)
        filtered = response.data.filter(c => 
          c.id !== category.id && !descendantIds.includes(c.id)
        )
      }
      
      // Build hierarchy paths for each category
      const buildHierarchyPath = (cat) => {
        const path = []
        let current = cat
        
        // Build the path from bottom to top
        while (current) {
          path.unshift(current.name)
          current = filtered.find(c => c.id === current.parentId)
        }
        
        return path.join(' → ')
      }
      
      // Add full path to each category
      const categoriesWithPath = filtered.map(cat => ({
        ...cat,
        fullPath: buildHierarchyPath(cat)
      }))
      
      // Sort by full path for better hierarchy display
      categoriesWithPath.sort((a, b) => a.fullPath.localeCompare(b.fullPath))
      
      setParentCategories(categoriesWithPath)
    } catch (error) {
      console.error('Failed to fetch parent categories', error)
    }
  }
  
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

  const handleSubmit = async () => {
    if (validate()) {
      setLoading(true)
      try {
        await onSubmit(formData)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main
            }}
          >
            <FolderOutlined />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {category ? 'Edit Category' : 'Create New Category'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {category ? 'Update category information' : 'Add a new category to organize products'}
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose}
          size="small"
          sx={{ 
            color: theme.palette.text.secondary,
            '&:hover': {
              bgcolor: alpha(theme.palette.text.secondary, 0.08)
            }
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Fade in timeout={300}>
          <Box>
            {/* Category Name Field */}
            <TextField
              fullWidth
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              required
              placeholder="Enter category name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FolderOutlined sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                  </InputAdornment>
                )
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main
                  }
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.875rem',
                  fontWeight: 500
                }
              }}
            />
            
            {/* Parent Category Field */}
            <TextField
              fullWidth
              select
              label="Parent Category"
              name="parentId"
              value={formData.parentId || ''}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountTreeOutlined sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                  </InputAdornment>
                )
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main
                  }
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.875rem',
                  fontWeight: 500
                }
              }}
            >
              <MenuItem value="">
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    None (Root Category)
                  </Typography>
                </Box>
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              {parentCategories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>
                  <Box display="flex" alignItems="center" width="100%" gap={1}>
                    <Box component="span" sx={{ 
                      pl: cat.level * 2,
                      display: 'flex',
                      alignItems: 'center',
                      flex: 1
                    }}>
                      {cat.level > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                          └─
                        </Typography>
                      )}
                      <Typography variant="body2">
                        {cat.name}
                      </Typography>
                    </Box>
                    {cat.productCount > 0 && (
                      <Chip 
                        label={`${cat.productCount} products`}
                        size="small"
                        sx={{ 
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main
                        }}
                      />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            
            {/* Helper Text for Parent Category */}
            <Box display="flex" alignItems="center" gap={0.5} mb={2} sx={{ mt: -2 }}>
              <InfoOutlined sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
              <FormHelperText sx={{ m: 0 }}>
                Leave empty to create a root category
              </FormHelperText>
            </Box>
            
            {/* Description Field */}
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description || `${formData.description.length}/500 characters`}
              multiline
              rows={4}
              placeholder="Enter a brief description of this category..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                    <DescriptionOutlined sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                  </InputAdornment>
                )
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main
                  }
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.875rem',
                  fontWeight: 500
                }
              }}
            />
          </Box>
        </Fade>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            px: 3,
            py: 1,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            borderColor: theme.palette.divider,
            color: theme.palette.text.secondary,
            '&:hover': {
              borderColor: theme.palette.text.secondary,
              bgcolor: alpha(theme.palette.text.secondary, 0.04)
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ 
            px: 3,
            py: 1,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: theme.shadows[2],
            '&:hover': {
              boxShadow: theme.shadows[4]
            },
            '&:disabled': {
              background: theme.palette.action.disabledBackground
            }
          }}
        >
          {loading ? 'Processing...' : (category ? 'Update Category' : 'Create Category')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CategoryForm