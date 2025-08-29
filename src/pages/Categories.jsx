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
        })).filter(cat => 
          cat.name.toLowerCase().includes(query) ||
          cat.description?.toLowerCase().includes(query) ||
          (cat.children && cat.children.length > 0)
        )
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
      setCategories(flatResponse.data)
      setCategoryTree(treeResponse.data)
      setFilteredCategories(flatResponse.data)
      setFilteredTree(treeResponse.data)
      
      const childrenCount = {}
      flatResponse.data.forEach(category => {
        const childCount = flatResponse.data.filter(c => c.parentId === category.id).length
        childrenCount[category.id] = childCount
      })
      setCategoryChildrenCount(childrenCount)
    } catch (error) {
      showSnackbar('Failed to fetch categories', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (category = null) => {
    setEditingCategory(category)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingCategory(null)
  }

  const handleSubmit = async (formData) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData)
        showSnackbar('Category updated successfully', 'success')
      } else {
        await createCategory(formData)
        showSnackbar('Category created successfully', 'success')
      }
      handleCloseDialog()
      fetchCategories()
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Operation failed', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await deleteCategory(id)
        showSnackbar('Category deleted successfully', 'success')
        fetchCategories()
      } catch (error) {
        showSnackbar(error.response?.data?.message || 'Failed to delete category', 'error')
      }
    }
  }

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity })
  }

  const getTotalProducts = () => {
    return filteredCategories.reduce((sum, category) => sum + (category.productCount || 0), 0)
  }

  const columns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 70,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'name', 
      headerName: 'Category Name', 
      width: 250,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <FolderOutlined sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" sx={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {params.value || '—'}
        </Typography>
      )
    },
    { 
      field: 'parentName', 
      headerName: 'Parent Category', 
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || '—'}
        </Typography>
      )
    },
    { 
      field: 'level', 
      headerName: 'Level', 
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Chip 
          label={`L${params.value}`}
          size="small" 
          variant="outlined"
          sx={{ 
            minWidth: 45,
            borderColor: theme.palette.divider,
            fontSize: '0.75rem'
          }}
        />
      )
    },
    { 
      field: 'productCount', 
      headerName: 'Products', 
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Badge 
          badgeContent={params.value} 
          color={params.value > 0 ? 'primary' : 'default'}
          showZero
          sx={{
            '& .MuiBadge-badge': {
              position: 'relative',
              transform: 'none',
              fontSize: '0.875rem',
              height: 24,
              minWidth: 24
            }
          }}
        />
      )
    },
    { 
      field: 'childrenCount', 
      headerName: 'Subcategories', 
      width: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const count = categoryChildrenCount[params.row.id] || 0
        return (
          <Badge 
            badgeContent={count} 
            color={count > 0 ? 'secondary' : 'default'}
            showZero
            sx={{
              '& .MuiBadge-badge': {
                position: 'relative',
                transform: 'none',
                fontSize: '0.875rem',
                height: 24,
                minWidth: 24
              }
            }}
          />
        )
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const childCount = categoryChildrenCount[params.row.id] || 0
        const canDelete = params.row.productCount === 0 && childCount === 0
        
        return (
          <Box display="flex" gap={0.5}>
            {isManager && (
              <>
                <Tooltip title="Edit category">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(params.row)}
                    sx={{ 
                      color: theme.palette.primary.main,
                      '&:hover': { 
                        bgcolor: alpha(theme.palette.primary.main, 0.08) 
                      }
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip 
                  title={
                    !canDelete 
                      ? params.row.productCount > 0 
                        ? `Cannot delete: ${params.row.productCount} products assigned`
                        : `Cannot delete: ${childCount} subcategories exist`
                      : 'Delete category'
                  }
                >
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(params.row.id)}
                      disabled={!canDelete}
                      sx={{ 
                        color: canDelete ? theme.palette.error.main : theme.palette.action.disabled,
                        '&:hover': canDelete ? {
                          bgcolor: alpha(theme.palette.error.main, 0.08)
                        } : {}
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            )}
          </Box>
        )
      }
    }
  ]

  const statsCards = [
    {
      title: 'Total Categories',
      value: filteredCategories.length,
      icon: <FolderOutlined />,
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.08)
    },
    {
      title: 'Total Products',
      value: getTotalProducts(),
      icon: <Inventory2Outlined />,
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.08)
    },
    {
      title: 'Root Categories',
      value: filteredCategories.filter(c => !c.parentId).length,
      icon: <AccountTreeOutlined />,
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.08)
    },
    {
      title: 'Empty Categories',
      value: filteredCategories.filter(c => c.productCount === 0).length,
      icon: <InfoOutlined />,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.08)
    }
  ]

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Fade in timeout={600}>
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography 
              variant="h4" 
              fontWeight={600}
              color="text.primary"
            >
              Category Management
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <Tooltip title="Refresh data">
                <IconButton 
                  onClick={fetchCategories}
                  sx={{ 
                    color: theme.palette.text.secondary,
                    '&:hover': { color: theme.palette.primary.main }
                  }}
                >
                  <RefreshOutlined />
                </IconButton>
              </Tooltip>
              
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
                sx={{
                  bgcolor: 'background.paper',
                  '& .MuiToggleButton-root': {
                    px: 2,
                    py: 0.75,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    border: `1px solid ${theme.palette.divider}`,
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
                  <AccountTreeOutlined sx={{ mr: 1, fontSize: 18 }} />
                  Tree View
                </ToggleButton>
                <ToggleButton value="grid">
                  <GridView sx={{ mr: 1, fontSize: 18 }} />
                  List View
                </ToggleButton>
              </ToggleButtonGroup>
              
              {isManager && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                  sx={{
                    px: 3,
                    py: 1,
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

      {/* Search Bar */}
      <Fade in timeout={1000}>
        <Paper 
          sx={{ 
            p: 2,
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
            InputProps={{
              startAdornment: (
                <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
                  <SearchOutlined sx={{ color: theme.palette.text.secondary }} />
                </Box>
              ),
              endAdornment: searchQuery && (
                <IconButton 
                  size="small" 
                  onClick={() => setSearchQuery('')}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  <Close fontSize="small" />
                </IconButton>
              ),
              sx: {
                borderRadius: '10px',
                '& fieldset': {
                  border: 'none'
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

      {/* Main Content Area */}
      <Grow in timeout={1200}>
        <Paper 
          sx={{ 
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
            boxShadow: theme.shadows[0]
          }}
        >
          {viewMode === 'grid' ? (
            <DataGrid
              rows={filteredCategories}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              loading={loading}
              disableSelectionOnClick
              autoHeight
              getRowClassName={(params) => 
                params.row.productCount === 0 ? 'empty-category' : ''
              }
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#FAFAFA',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: theme.palette.text.secondary
                  }
                },
                '& .MuiDataGrid-row': {
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                  },
                  '&.empty-category': {
                    bgcolor: alpha(theme.palette.warning.main, 0.02)
                  }
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  fontSize: '0.875rem'
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: `1px solid ${theme.palette.divider}`,
                  bgcolor: '#FAFAFA'
                }
              }}
            />
          ) : (
            <Box sx={{ 
              maxHeight: 450,
              overflow: 'auto',
              p: 2,
              bgcolor: '#FAFAFA'
            }}>
              {loading ? (
                <Stack spacing={2}>
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                  ))}
                </Stack>
              ) : (
                <CategoryTreeView
                  categories={filteredTree}
                  onEdit={handleOpenDialog}
                  onDelete={handleDelete}
                  isManager={isManager}
                />
              )}
            </Box>
          )}
        </Paper>
      </Grow>

      {/* Category Form Dialog */}
      {openDialog && (
        <CategoryForm
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          category={editingCategory}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            borderRadius: '8px',
            boxShadow: theme.shadows[4]
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default Categories