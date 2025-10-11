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
  FilterList,
  Visibility
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { getUsers, createUser, updateUser, deleteUser, toggleUserStatus } from '../services/api'
import UserForm from '../components/users/UserForm'
import UserDetailsDialog from '../components/users/UserDetailsDialog'

function Users() {
  const theme = useTheme()
  const { user, isManager, isStaff } = useAuth() // Get user role info
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [openDetails, setOpenDetails] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

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
    // Only managers can open the dialog
    if (!isManager) {
      showSnackbar('You do not have permission to perform this action', 'warning')
      return
    }
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
    if (!isManager) {
      showSnackbar('You do not have permission to delete users', 'warning')
      return
    }
    
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
    if (!isManager) {
      showSnackbar('You do not have permission to change user status', 'warning')
      return
    }
    
    try {
      await toggleUserStatus(id)
      showSnackbar('User status updated', 'success')
      fetchUsers()
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to update user status', 'error')
    }
  }

  const handleViewDetails = (user) => {
    setSelectedUser(user)
    setOpenDetails(true)
  }

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity })
  }

  const getGenderColor = (gender) => {
    const colors = {
      'MALE': '#64B5F6',
      'FEMALE': '#F06292',
      'NOT_SPECIFIED': '#BDBDBD'
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
            (params.row.fullName ? 
              params.row.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() :
              params.row.username ? params.row.username.slice(0, 2).toUpperCase() : 'U')}
        </Avatar>
      )
    },
    { 
      field: 'username', 
      headerName: 'Username', 
      flex: 1,
      minWidth: 130
    },
    { 
      field: 'fullName', 
      headerName: 'Full Name', 
      flex: 1.2,
      minWidth: 150
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      flex: 1.3,
      minWidth: 180
    },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 110,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const genderDisplay = {
          'MALE': 'Male',
          'FEMALE': 'Female',
          'NOT_SPECIFIED': '-'
        }
        return (
          <Typography 
            variant="body2" 
            sx={{ 
              color: params.row.gender === 'NOT_SPECIFIED' ? 'text.secondary' : 'text.primary',
              fontWeight: params.row.gender !== 'NOT_SPECIFIED' ? 500 : 400
            }}
          >
            {genderDisplay[params.row.gender] || '-'}
          </Typography>
        )
      }
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 160,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.row.role?.replace(/_/g, ' ')}
          color={getRoleChipColor(params.row.role)}
          size="small"
          sx={{ 
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'capitalize'
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
          label={params.row.active ? 'Active' : 'Inactive'}
          color={params.row.active ? 'success' : 'default'}
          size="small"
          variant={params.row.active ? 'filled' : 'outlined'}
          sx={{ 
            fontSize: '0.75rem',
            fontWeight: 500
          }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: isManager ? 180 : 80,  // Adjusted width to accommodate View button
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {/* View Details Button - Available for all roles */}
          <Tooltip title="View Details" arrow>
            <IconButton
              size="small"
              onClick={() => handleViewDetails(params.row)}
              sx={{
                color: theme.palette.info.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.info.main, 0.1)
                }
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Edit/Toggle/Delete Buttons - Only for managers */}
          {isManager ? (
            <>
              <Tooltip title="Edit User" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(params.row)}
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
              <Tooltip title={params.row.active ? "Deactivate" : "Activate"} arrow>
                <IconButton
                  size="small"
                  onClick={() => handleToggleStatus(params.row.id)}
                  sx={{
                    color: params.row.active ? theme.palette.warning.main : theme.palette.success.main,
                    '&:hover': {
                      bgcolor: alpha(params.row.active ? theme.palette.warning.main : theme.palette.success.main, 0.1)
                    }
                  }}
                >
                  {params.row.active ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete User" arrow>
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
            </>
          ) : null}
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
              {isManager 
                ? 'Manage system users and their access permissions'
                : 'View system users and their information'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh" arrow>
              <IconButton 
                onClick={fetchUsers}
                sx={{
                  bgcolor: 'background.paper',
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': { 
                    bgcolor: 'background.paper',
                    borderColor: theme.palette.primary.main
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>

            {/* Only show Add User button for managers */}
            {isManager && (
              <Grow in={true}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    boxShadow: theme.shadows[2],
                    '&:hover': {
                      boxShadow: theme.shadows[4]
                    }
                  }}
                >
                  Add User
                </Button>
              </Grow>
            )}
          </Box>
        </Box>

        {/* Info Alert for Staff */}
        {isStaff && (
          <Alert 
            severity="info" 
            sx={{ mb: 3, borderRadius: '8px' }}
          >
            You have read-only access to user information. Contact a Hospital Manager to make changes.
          </Alert>
        )}

        {/* Search Bar */}
        <Paper 
          sx={{ 
            p: 2, 
            mb: 3,
            borderRadius: '12px',
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '8px'
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.default
              }
            }}
          />
        </Paper>

        {/* Data Grid */}
        <Paper 
          sx={{ 
            borderRadius: '12px',
            boxShadow: 'none',
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
          }}
        >
          <DataGrid
            rows={filteredUsers}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20, 50]}
            autoHeight
            disableSelectionOnClick
            loading={loading}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${theme.palette.divider}`
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: theme.palette.grey[50],
                borderBottom: `2px solid ${theme.palette.divider}`,
                fontSize: '0.875rem',
                fontWeight: 600
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          />
        </Paper>

        {/* User Form Dialog - Only rendered for managers */}
        {isManager && (
          <UserForm
            open={openDialog}
            onClose={handleCloseDialog}
            onSubmit={handleSubmit}
            user={editingUser}
          />
        )}

        {/* User Details Dialog */}
        <UserDetailsDialog
          open={openDetails}
          onClose={() => {
            setOpenDetails(false)
            setSelectedUser(null)
          }}
          user={selectedUser}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
    </Fade>
  )
}

export default Users