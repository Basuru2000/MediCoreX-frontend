import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Chip,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import {
  Add,
  Edit,
  Delete,
  Category as CategoryIcon,
  List as ListIcon,
  AccountTree
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
  const { isManager } = useAuth()
  const [categories, setCategories] = useState([])
  const [categoryTree, setCategoryTree] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('tree') // 'tree' or 'grid'
  const [openDialog, setOpenDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const [flatResponse, treeResponse] = await Promise.all([
        getCategories(),
        getCategoryTree()
      ])
      setCategories(flatResponse.data)
      setCategoryTree(treeResponse.data)
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

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'name', 
      headerName: 'Category Name', 
      width: 200,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
          {params.value}
        </Box>
      )
    },
    { field: 'description', headerName: 'Description', width: 300 },
    { 
      field: 'parentName', 
      headerName: 'Parent Category', 
      width: 150,
      renderCell: (params) => params.value || '-'
    },
    { 
      field: 'level', 
      headerName: 'Level', 
      width: 80,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          variant="outlined"
        />
      )
    },
    { 
      field: 'productCount', 
      headerName: 'Products', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={params.value > 0 ? 'primary' : 'default'}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <>
          {isManager && (
            <>
              <IconButton
                size="small"
                onClick={() => handleOpenDialog(params.row)}
                color="primary"
              >
                <Edit />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDelete(params.row.id)}
                color="error"
                disabled={params.row.productCount > 0}
              >
                <Delete />
              </IconButton>
            </>
          )}
        </>
      )
    }
  ]

  const getTotalProducts = () => {
    return categories.reduce((sum, category) => sum + (category.productCount || 0), 0)
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Category Management</Typography>
        <Box display="flex" gap={2} alignItems="center">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="tree">
              <AccountTree sx={{ mr: 1 }} />
              Tree View
            </ToggleButton>
            <ToggleButton value="grid">
              <ListIcon sx={{ mr: 1 }} />
              List View
            </ToggleButton>
          </ToggleButtonGroup>
          
          {isManager && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Category
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Categories
                  </Typography>
                  <Typography variant="h4">
                    {categories.length}
                  </Typography>
                </Box>
                <CategoryIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant="h4">
                    {getTotalProducts()}
                  </Typography>
                </Box>
                <CategoryIcon color="secondary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {!isManager && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You can view categories but only Hospital Managers can add, edit, or delete them.
        </Alert>
      )}

      <Paper sx={{ height: 400, width: '100%' }}>
        {viewMode === 'grid' ? (
          <DataGrid
            rows={categories}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            disableSelectionOnClick
            getRowClassName={(params) => 
              params.row.productCount === 0 ? 'empty-category' : ''
            }
            sx={{
              '& .empty-category': {
                backgroundColor: 'action.hover',
              }
            }}
          />
        ) : (
          <Box sx={{ height: '100%', overflow: 'auto', p: 2 }}>
            {loading ? (
              <Typography>Loading...</Typography>
            ) : (
              <CategoryTreeView
                categories={categoryTree}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
                isManager={isManager}
              />
            )}
          </Box>
        )}
      </Paper>

      {openDialog && (
        <CategoryForm
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          category={editingCategory}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Categories