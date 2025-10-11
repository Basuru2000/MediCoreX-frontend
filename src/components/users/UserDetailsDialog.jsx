import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Grid,
  Avatar,
  Chip,
  Divider,
  Paper,
  Stack,
  useTheme,
  alpha
} from '@mui/material'
import {
  Close,
  Email,
  Person,
  Badge,
  CalendarToday,
  CheckCircle,
  Cancel,
  Security,
  Wc
} from '@mui/icons-material'
import { format } from 'date-fns'

function UserDetailsDialog({ open, onClose, user }) {
  const theme = useTheme()

  if (!user) return null

  const getGenderColor = (gender) => {
    const colors = {
      'MALE': '#64B5F6',
      'FEMALE': '#F06292',
      'NOT_SPECIFIED': '#BDBDBD'
    }
    return colors[gender] || colors.NOT_SPECIFIED
  }

  const getGenderDisplay = (gender) => {
    const display = {
      'MALE': 'Male',
      'FEMALE': 'Female',
      'NOT_SPECIFIED': 'Not Specified'
    }
    return display[gender] || 'Not Specified'
  }

  const getRoleChipColor = (role) => {
    const roleColors = {
      'HOSPITAL_MANAGER': 'error',
      'PHARMACY_STAFF': 'primary',
      'PROCUREMENT_OFFICER': 'warning'
    }
    return roleColors[role] || 'default'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch (error) {
      return dateString
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: theme.shadows[24]
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            p: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={user.profileImageUrl ? `http://localhost:8080${user.profileImageUrl}` : undefined}
              sx={{
                width: 80,
                height: 80,
                bgcolor: getGenderColor(user.gender),
                fontSize: '1.75rem',
                fontWeight: 600,
                border: `3px solid ${theme.palette.background.paper}`,
                boxShadow: theme.shadows[4]
              }}
            >
              {!user.profileImageUrl && (user.fullName 
                ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                : user.username ? user.username.slice(0, 2).toUpperCase() : 'U')}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {user.fullName || user.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                User ID: #{user.id}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  icon={user.active ? <CheckCircle sx={{ fontSize: 16 }} /> : <Cancel sx={{ fontSize: 16 }} />}
                  label={user.active ? 'Active' : 'Inactive'}
                  size="small"
                  color={user.active ? 'success' : 'default'}
                  sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                />
                <Chip
                  label={user.role?.replace(/_/g, ' ')}
                  size="small"
                  color={getRoleChipColor(user.role)}
                  sx={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}
                />
              </Box>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.action.active, 0.05),
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Personal Information Section */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '12px',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.primary.main, 0.02)
              }}
            >
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, fontSize: '1.125rem' }}>
                Personal Information
              </Typography>
              <Grid container spacing={2.5}>
                {/* Username */}
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Person sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Username
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {user.username}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Email sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Email Address
                      </Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight={600}
                        sx={{ 
                          wordBreak: 'break-word',
                          fontSize: '0.875rem'
                        }}
                      >
                        {user.email}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                {/* Full Name */}
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Badge sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Full Name
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {user.fullName || 'Not provided'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                {/* Gender */}
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        bgcolor: alpha(getGenderColor(user.gender), 0.15),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Wc sx={{ color: getGenderColor(user.gender), fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Gender
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {getGenderDisplay(user.gender)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* System Information Section */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '12px',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.warning.main, 0.02)
              }}
            >
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, fontSize: '1.125rem' }}>
                System Information
              </Typography>
              <Grid container spacing={2.5}>
                {/* Role */}
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Security sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Role / Permission Level
                      </Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                        {user.role?.replace(/_/g, ' ')}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                {/* Account Status */}
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        bgcolor: alpha(user.active ? theme.palette.success.main : theme.palette.error.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {user.active ? 
                        <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 20 }} /> :
                        <Cancel sx={{ color: theme.palette.error.main, fontSize: 20 }} />
                      }
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Account Status
                      </Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight={600}
                        sx={{ color: user.active ? 'success.main' : 'error.main' }}
                      >
                        {user.active ? 'Active' : 'Inactive'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                {/* Created Date */}
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CalendarToday sx={{ color: theme.palette.info.main, fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Account Created
                      </Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                        {formatDate(user.createdAt)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                {/* Last Updated */}
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CalendarToday sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Last Updated
                      </Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                        {formatDate(user.updatedAt)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Profile Image Section (if available) */}
          {user.profileImageUrl && (
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, fontSize: '1.125rem' }}>
                  Profile Picture
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 2
                  }}
                >
                  <Avatar
                    src={`http://localhost:8080${user.profileImageUrl}`}
                    sx={{
                      width: 200,
                      height: 200,
                      border: `4px solid ${theme.palette.divider}`,
                      boxShadow: theme.shadows[8]
                    }}
                  />
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default UserDetailsDialog