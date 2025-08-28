import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Avatar,
  Tooltip,
  InputAdornment,
  TextField,
  useTheme,
  alpha,
  Fade,
  Grow
} from '@mui/material'
import { DataGrid, GridToolbar } from '@mui/x-data-grid'
import { 
  Add, 
  Edit, 
  Delete, 
  Block, 
  CheckCircle, 
  Person,
  Search,
  Refresh,
  Download,
  FilterList
} from '@mui/icons-material'
import { getUsers, createUser, updateUser, deleteUser, toggleUserStatus } from '../services/api'
import UserForm from '../components/users/UserForm'

function Users() {
  const theme = useTheme()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await getUsers()
      setUsers(response.data)
    } catch (error) {
      showSnackbar('Failed to fetch users', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (user = null) => {
    setEditingUser(user)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingUser(null)
  }

  const handleSubmit = async (formData) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData)
        showSnackbar('User updated successfully', 'success')
      } else {
        await createUser(formData)
        showSnackbar('User created successfully', 'success')
      }
      handleCloseDialog()
      fetchUsers()
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Operation failed', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id)
        showSnackbar('User deleted successfully', 'success')
        fetchUsers()
      } catch (error) {
        showSnackbar(error.response?.data?.message || 'Failed to delete user', 'error')
      }
    }
  }

  const handleToggleStatus = async (id) => {
    try {
      await toggleUserStatus(id)
      showSnackbar('User status updated', 'success')
      fetchUsers()
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to update user status', 'error')
    }
  }

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity })
  }

  const getGenderColor = (gender) => {
    const colors = {
      'MALE': '#64B5F6',    // Light Blue
      'FEMALE': '#F06292',  // Light Pink
      'NOT_SPECIFIED': '#BDBDBD' // Gray
    }
    return colors[gender] || colors.NOT_SPECIFIED
  }

  const getRoleChipColor = (role) => {
    const roleColors = {
      'HOSPITAL_MANAGER': 'error',
      'PHARMACY_STAFF': 'primary',
      'PROCUREMENT_OFFICER': 'warning'
    }
    return roleColors[role] || 'default'
  }

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const columns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 70,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'profileImage',
      headerName: 'Profile',
      width: 80,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Avatar
          src={params.row.profileImageUrl ? 
            `http://localhost:8080${params.row.profileImageUrl}` : undefined}
          sx={{ 
            bgcolor: getGenderColor(params.row.gender),
            width: 40,
            height: 40,
            fontSize: '1rem',
            fontWeight: 500
          }}
        >
          {params.row.profileImageUrl ? null : 
            (params.row.fullName ? params.row.fullName[0] : <Person />)}
        </Avatar>
      )
    },
    {
      field: 'username',
      headerName: 'Username',
      width: 130,
      headerAlign: 'left',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={500}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'fullName',
      headerName: 'Full Name',
      flex: 1,
      minWidth: 180,
      headerAlign: 'left',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
      headerAlign: 'left',
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value.replace(/_/g, ' ')}
          color={getRoleChipColor(params.value)}
          size="small"
          sx={{ 
            fontWeight: 500,
            borderRadius: '8px',
            height: '28px'
          }}
        />
      )
    },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: getGenderColor(params.value),
            border: `2px solid ${alpha(getGenderColor(params.value), 0.3)}`,
            boxShadow: `0 0 0 4px ${alpha(getGenderColor(params.value), 0.1)}`
          }}
        />
      )
    },
    {
      field: 'active',
      headerName: 'Status',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
          sx={{ 
            fontWeight: 500,
            borderRadius: '8px',
            height: '24px',
            fontSize: '0.75rem'
          }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(params.row)}
              sx={{
                color: 'primary.main',
                '&:hover': { 
                  bgcolor: alpha(theme.palette.primary.main, 0.08)
                }
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.active ? 'Deactivate' : 'Activate'} arrow placement="top">
            <IconButton
              size="small"
              onClick={() => handleToggleStatus(params.row.id)}
              sx={{
                color: params.row.active ? 'warning.main' : 'success.main',
                '&:hover': { 
                  bgcolor: params.row.active 
                    ? alpha(theme.palette.warning.main, 0.08)
                    : alpha(theme.palette.success.main, 0.08)
                }
              }}
            >
              {params.row.active ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.id)}
              sx={{
                color: 'error.main',
                '&:hover': { 
                  bgcolor: alpha(theme.palette.error.main, 0.08)
                }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  return (
    <Fade in={true}>
      <Box>
        {/* Page Header */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 4
          }}
        >
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.5
              }}
            >
              User Management
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: 'text.secondary' }}
            >
              Manage system users and their access permissions
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh" arrow>
              <IconButton 
                onClick={fetchUsers}
                sx={{
                  bgcolor: 'background.paper',
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                height: 40,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              Add User
            </Button>
          </Box>
        </Box>

        {/* Search Bar */}
        <Paper 
          sx={{ 
            p: 2, 
            mb: 3,
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none'
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.divider
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

        {/* Data Table */}
        <Grow in={true}>
          <Paper 
            sx={{ 
              height: 600,
              width: '100%',
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              boxShadow: theme.shadows[1],
              '& .MuiDataGrid-root': {
                border: 'none'
              },
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
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.06)
                  }
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
          >
            <DataGrid
              rows={filteredUsers}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              loading={loading}
              disableSelectionOnClick
              disableColumnMenu={false}
              density="comfortable"
              sx={{
                '& .MuiDataGrid-virtualScroller': {
                  bgcolor: 'background.paper'
                }
              }}
            />
          </Paper>
        </Grow>

        {/* User Form Dialog */}
        {openDialog && (
          <UserForm
            open={openDialog}
            onClose={handleCloseDialog}
            onSubmit={handleSubmit}
            user={editingUser}
          />
        )}

        {/* Snackbar Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          TransitionComponent={Grow}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ 
              width: '100%',
              borderRadius: '8px',
              boxShadow: theme.shadows[4]
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  )
}

export default Users