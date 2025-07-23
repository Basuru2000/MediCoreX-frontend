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
  Tooltip
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { Add, Edit, Delete, Block, CheckCircle, Person } from '@mui/icons-material'
import { getUsers, createUser, updateUser, deleteUser, toggleUserStatus } from '../services/api'
import UserForm from '../components/users/UserForm'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
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
    switch (gender) {
      case 'MALE':
        return '#ADD8E6' // Light Blue
      case 'FEMALE':
        return '#FFB6C1' // Light Pink
      default:
        return '#D3D3D3' // Light Gray
    }
  }

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'profileImage',
      headerName: 'Profile',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <Avatar
          src={params.row.profileImageUrl ? `http://localhost:8080${params.row.profileImageUrl}` : null}
          sx={{
            width: 40,
            height: 40,
            bgcolor: getGenderColor(params.row.gender || 'NOT_SPECIFIED')
          }}
        >
          {!params.row.profileImageUrl && (params.row.fullName ? params.row.fullName[0].toUpperCase() : <Person />)}
        </Avatar>
      )
    },
    { field: 'username', headerName: 'Username', width: 130 },
    { field: 'fullName', headerName: 'Full Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 100,
      renderCell: (params) => {
        const gender = params.value || 'NOT_SPECIFIED'
        const genderDisplay = gender === 'NOT_SPECIFIED' ? 'Not Specified' : 
                             gender.charAt(0) + gender.slice(1).toLowerCase()
        return (
          <Chip
            label={genderDisplay}
            size="small"
            sx={{
              bgcolor: getGenderColor(gender),
              color: 'text.primary'
            }}
          />
        )
      }
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 180,
      renderCell: (params) => (
        <Chip
          label={params.value.replace('_', ' ')}
          color="primary"
          size="small"
        />
      )
    },
    {
      field: 'active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
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
          <IconButton
            size="small"
            onClick={() => handleOpenDialog(params.row)}
            color="primary"
          >
            <Edit />
          </IconButton>
          <Tooltip title={params.row.active ? 'Deactivate' : 'Activate'}>
            <IconButton
              size="small"
              onClick={() => handleToggleStatus(params.row.id)}
              color={params.row.active ? 'warning' : 'success'}
            >
              {params.row.active ? <Block /> : <CheckCircle />}
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.id)}
            color="error"
          >
            <Delete />
          </IconButton>
        </>
      )
    }
  ]

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          loading={loading}
          disableSelectionOnClick
        />
      </Paper>

      {openDialog && (
        <UserForm
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
          user={editingUser}
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

export default Users