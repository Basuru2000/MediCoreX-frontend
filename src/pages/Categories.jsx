import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Alert,
  Snackbar,
  Card,
  Grid,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Fade,
  Grow,
  Container,
  useTheme,
  alpha,
  Skeleton,
  Stack,
  Badge,
  TextField
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import {
  Add,
  Edit,
  Delete,
  Category as CategoryIcon,
  GridView,
  AccountTreeOutlined,
  FolderOutlined,
  Inventory2Outlined,
  RefreshOutlined,
  InfoOutlined,
  Close,
  SearchOutlined
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { 
  getCategories,
  getCategoryTree,
  createCategory, 
  updateCategory, 
  deleteCategory
} from '../services/api'
import CategoryForm from '../components/categories/CategoryForm'
import CategoryTreeView from '../components/categories/CategoryTreeView'

function Categories() {
  const theme = useTheme()
  const { isManager } = useAuth()
  
  // All state declarations at the top
  const [categories, setCategories] = useState([])
  const [categoryTree, setCategoryTree] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('tree')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [categoryChildrenCount, setCategoryChildrenCount] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCategories, setFilteredCategories] = useState([])
  const [filteredTree, setFilteredTree] = useState([])

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Filter categories when search query or categories change
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const filtered = categories.filter(cat => 
        cat.name.toLowerCase().includes(query) ||
        cat.description?.toLowerCase().includes(query) ||
        cat.parentName?.toLowerCase().includes(query)
      )
      setFilteredCategories(filtered)
      
      // Filter tree as well
      const filterTree = (cats) => {
        return cats.map(cat => ({
          ...cat,
          children: cat.children ? filterTree(cat.children) : []
        })).filter(cat => {
          const matches = cat.name.toLowerCase().includes(query) ||
                         cat.description?.toLowerCase().includes(query)
          const hasMatchingChildren = cat.children && cat.children.length > 0
          return matches || hasMatchingChildren
        })
      }
      setFilteredTree(filterTree(categoryTree))
    } else {
      setFilteredCategories(categories)
      setFilteredTree(categoryTree)
    }
  }, [searchQuery, categories, categoryTree])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const [flatResponse, treeResponse] = await Promise.all([
        getCategories(),
        getCategoryTree()
      ])
      
      const flatData = flatResponse.data
      const treeData = treeResponse.data
      
      // Calculate children count for each category
      const childrenCount = {}
      flatData.forEach(cat => {
        if (cat.parentId) {
          childrenCount[cat.parentId] = (childrenCount[cat.parentId] || 0) + 1
        }
      })
      
      setCategoryChildrenCount(childrenCount)
      setCategories(flatData)
      setCategoryTree(treeData)
      setFilteredCategories(flatData)
      setFilteredTree(treeData)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setSnackbar({
        open: true,
        message: 'Failed to load categories',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingCategory(null)
    setOpenDialog(true)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setOpenDialog(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All subcategories will also be deleted.')) {
      return
    }

    try {
      await deleteCategory(id)
      setSnackbar({
        open: true,
        message: 'Category deleted successfully',
        severity: 'success'
      })
      fetchCategories()
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete category',
        severity: 'error'
      })
    }
  }

  const handleSave = async (categoryData) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData)
        setSnackbar({
          open: true,
          message: 'Category updated successfully',
          severity: 'success'
        })
      } else {
        await createCategory(categoryData)
        setSnackbar({
          open: true,
          message: 'Category created successfully',
          severity: 'success'
        })
      }
      setOpenDialog(false)
      fetchCategories()
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Operation failed',
        severity: 'error'
      })
    }
  }

  // Grid columns for table view
  const columns = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <FolderOutlined sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
          {categoryChildrenCount[params.row.id] > 0 && (
            <Chip 
              label={`${categoryChildrenCount[params.row.id]} subcategories`}
              size="small"
              sx={{ 
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 600,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }}
            />
          )}
        </Box>
      )
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      flex: 1.5,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {params.value || '-'}
        </Typography>
      )
    },
    { 
      field: 'parentName', 
      headerName: 'Parent Category',
      flex: 1,
      renderCell: (params) => (
        params.value ? (
          <Chip
            label={params.value}
            size="small"
            variant="outlined"
            sx={{ 
              height: 24,
              fontSize: '0.75rem',
              fontWeight: 500,
              borderColor: theme.palette.divider,
              '& .MuiChip-label': {
                px: 1.5
              }
            }}
          />
        ) : (
          <Typography variant="caption" color="text.disabled">
            Root Category
          </Typography>
        )
      )
    },
    { 
      field: 'productCount', 
      headerName: 'Products',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Badge 
          badgeContent={params.value} 
          color="primary"
          max={999}
          sx={{
            '& .MuiBadge-badge': {
              position: 'relative',
              transform: 'none',
              fontSize: '0.75rem',
              height: 22,
              minWidth: 22,
              borderRadius: '11px'
            }
          }}
        />
      )
    },
    ...(isManager ? [{
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={0.5}>
          <Tooltip title="Edit">
            <IconButton 
              size="small" 
              onClick={() => handleEdit(params.row)}
              sx={{ 
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              onClick={() => handleDelete(params.row.id)}
              sx={{ 
                color: theme.palette.error.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.1)
                }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }] : [])
  ]

  // Stats cards data
  const statsCards = [
    {
      title: 'Total Categories',
      value: categories.length,
      icon: <CategoryIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.1)
    },
    {
      title: 'Root Categories',
      value: categories.filter(c => !c.parentId).length,
      icon: <AccountTreeOutlined sx={{ fontSize: 28 }} />,
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.1)
    },
    {
      title: 'Subcategories',
      value: categories.filter(c => c.parentId).length,
      icon: <FolderOutlined sx={{ fontSize: 28 }} />,
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.1)
    },
    {
      title: 'Total Products',
      value: categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0),
      icon: <Inventory2Outlined sx={{ fontSize: 28 }} />,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.1)
    }
  ]

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Header Section */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Box display="flex" alignItems="center" gap={2}>
              <CategoryIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
              <Typography variant="h4" fontWeight={700} color="text.primary">
                Categories
              </Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <IconButton 
                onClick={fetchCategories}
                sx={{ 
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main
                  }
                }}
              >
                <RefreshOutlined />
              </IconButton>
              {isManager && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAdd}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    boxShadow: theme.shadows[2],
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Add Category
                </Button>
              )}
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Organize and manage product categories with hierarchical structure
          </Typography>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Grow in timeout={800 + index * 100}>
              <Card 
                sx={{ 
                  p: 2.5,
                  height: '100%',
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.shadows[0],
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      fontWeight={500}
                      gutterBottom
                    >
                      {stat.title}
                    </Typography>
                    {loading ? (
                      <Skeleton variant="text" width={60} height={40} />
                    ) : (
                      <Typography variant="h4" fontWeight={700}>
                        {stat.value}
                      </Typography>
                    )}
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: stat.bgColor,
                      color: stat.color
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </Card>
            </Grow>
          </Grid>
        ))}
      </Grid>

      {/* Search Bar - REDUCED HEIGHT */}
      <Fade in timeout={1000}>
        <Paper 
          sx={{ 
            p: 1.5,  // Reduced from p: 2
            mb: 3,
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[0]
          }}
        >
          <TextField
            fullWidth
            placeholder="Search categories by name, description, or parent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"  // Added size="small"
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  <SearchOutlined sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                </Box>
              ),
              endAdornment: searchQuery && (
                <IconButton 
                  size="small" 
                  onClick={() => setSearchQuery('')}
                  sx={{ color: theme.palette.text.secondary, p: 0.5 }}
                >
                  <Close fontSize="small" />
                </IconButton>
              ),
              sx: {
                borderRadius: '8px',  // Reduced from 10px
                height: 40,  // Set explicit height
                '& fieldset': {
                  border: 'none'
                },
                '& input': {
                  py: 0.5  // Reduced padding
                }
              }
            }}
            sx={{ 
              '& .MuiInputBase-input': {
                fontSize: '0.875rem'
              }
            }}
          />
        </Paper>
      </Fade>

      {/* Info Alert for Non-Managers */}
      {!isManager && (
        <Fade in timeout={1100}>
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              borderRadius: '8px',
              '& .MuiAlert-icon': {
                fontSize: 24
              }
            }}
          >
            You can view categories but only Hospital Managers can add, edit, or delete them.
          </Alert>
        </Fade>
      )}

      {/* View Mode Toggle and Main Content */}
      <Fade in timeout={1200}>
        <Paper 
          sx={{ 
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[0],
            overflow: 'hidden'
          }}
        >
          {/* View Mode Toggle */}
          <Box 
            sx={{ 
              p: 2,
              bgcolor: alpha(theme.palette.grey[100], 0.5),
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              {filteredCategories.length} Categories
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 2,
                  py: 0.5,
                  fontSize: '0.813rem',
                  fontWeight: 500,
                  borderRadius: '6px',
                  textTransform: 'none',
                  '&.Mui-selected': {
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark
                    }
                  }
                }
              }}
            >
              <ToggleButton value="tree">
                <AccountTreeOutlined sx={{ mr: 0.75, fontSize: 18 }} />
                Tree View
              </ToggleButton>
              <ToggleButton value="grid">
                <GridView sx={{ mr: 0.75, fontSize: 18 }} />
                Grid View
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Content Area */}
          <Box sx={{ p: 3 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <Stack spacing={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Loading categories...
                  </Typography>
                  <Box sx={{ width: 200 }}>
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1, mb: 1 }} />
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1, mb: 1 }} />
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                  </Box>
                </Stack>
              </Box>
            ) : filteredCategories.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CategoryIcon sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchQuery ? 'No categories found' : 'No categories yet'}
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                  {searchQuery 
                    ? 'Try adjusting your search criteria'
                    : 'Create your first category to organize products'}
                </Typography>
                {isManager && !searchQuery && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAdd}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Create First Category
                  </Button>
                )}
              </Box>
            ) : viewMode === 'tree' ? (
              <CategoryTreeView
                categories={filteredTree}
                onEdit={isManager ? handleEdit : undefined}
                onDelete={isManager ? handleDelete : undefined}
                searchQuery={searchQuery}
                categoryChildrenCount={categoryChildrenCount}
              />
            ) : (
              <DataGrid
                rows={filteredCategories}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                autoHeight
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-root': {
                    border: 'none'
                  },
                  '& .MuiDataGrid-cell': {
                    borderColor: theme.palette.divider,
                    fontSize: '0.875rem'
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    bgcolor: alpha(theme.palette.grey[100], 0.5),
                    borderColor: theme.palette.divider,
                    fontSize: '0.875rem',
                    fontWeight: 600
                  },
                  '& .MuiDataGrid-row': {
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04)
                    }
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderColor: theme.palette.divider
                  }
                }}
              />
            )}
          </Box>
        </Paper>
      </Fade>

      {/* Category Form Dialog */}
      <CategoryForm
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSave}
        category={editingCategory}
        categories={categories}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ 
            borderRadius: '8px',
            boxShadow: theme.shadows[3]
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default Categories