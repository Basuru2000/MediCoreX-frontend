import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  Avatar,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Alert,
  Divider,
  Grid,
  InputAdornment,
  alpha,
  useTheme,
  Fade,
  Paper,
  Tooltip
} from '@mui/material'
import { 
  Upload, 
  Close, 
  Person,
  Email,
  Badge,
  Lock,
  AccountCircle,
  CameraAlt
} from '@mui/icons-material'
import { uploadUserProfileImage } from '../../services/api'

function UserForm({ open, onClose, onSubmit, user }) {
  const theme = useTheme()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    role: 'PHARMACY_STAFF',
    gender: 'NOT_SPECIFIED',
    profileImageUrl: ''
  })

  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        fullName: user.fullName || '',
        role: user.role || 'PHARMACY_STAFF',
        gender: user.gender || 'NOT_SPECIFIED',
        profileImageUrl: user.profileImageUrl || ''
      })
      setImagePreview(user.profileImageUrl ? 
        `http://localhost:8080${user.profileImageUrl}` : null)
    } else {
      setFormData({
        username: '',
        password: '',
        email: '',
        fullName: '',
        role: 'PHARMACY_STAFF',
        gender: 'NOT_SPECIFIED',
        profileImageUrl: ''
      })
      setImagePreview(null)
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!user) {
      if (!formData.username) newErrors.username = 'Username is required'
      if (!formData.password) newErrors.password = 'Password is required'
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }
    }
    
    if (!formData.email) newErrors.email = 'Email is required'
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.fullName) newErrors.fullName = 'Full name is required'
    
    return newErrors
  }

  const handleSubmit = () => {
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image size must be less than 5MB' })
      return
    }

    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: 'Please upload a valid image file' })
      return
    }

    setUploadingImage(true)
    try {
      const response = await uploadUserProfileImage(file)
      const imageUrl = response.data.imageUrl
      setFormData({ ...formData, profileImageUrl: imageUrl })
      setImagePreview(`http://localhost:8080${imageUrl}`)
      setErrors({ ...errors, image: null })
    } catch (error) {
      setErrors({ ...errors, image: 'Failed to upload image' })
    } finally {
      setUploadingImage(false)
    }
  }

  const getGenderColor = (gender) => {
    const colors = {
      'MALE': '#64B5F6',
      'FEMALE': '#F06292',
      'NOT_SPECIFIED': '#BDBDBD'
    }
    return colors[gender] || colors.NOT_SPECIFIED
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <DialogTitle sx={{ 
        p: 3,
        pb: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {user ? 'Edit User' : 'Add New User'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {user ? 'Update user information and permissions' : 'Create a new system user account'}
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.action.active, 0.05),
            '&:hover': {
              bgcolor: alpha(theme.palette.action.active, 0.1)
            }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {/* Profile Image Section */}
        <Paper 
          sx={{ 
            p: 2,
            mb: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            borderRadius: '8px'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={imagePreview}
                sx={{ 
                  width: 80,
                  height: 80,
                  bgcolor: getGenderColor(formData.gender),
                  fontSize: '1.5rem',
                  fontWeight: 500,
                  border: `3px solid ${theme.palette.background.paper}`,
                  boxShadow: theme.shadows[2]
                }}
              >
                {imagePreview ? null : (formData.fullName ? formData.fullName[0] : <Person />)}
              </Avatar>
              <input
                type="file"
                id="profile-image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="profile-image-upload">
                <Tooltip title="Upload Profile Image" arrow>
                  <IconButton
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark
                      },
                      boxShadow: theme.shadows[2]
                    }}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 
                      <CircularProgress size={16} sx={{ color: 'white' }} /> : 
                      <CameraAlt sx={{ fontSize: 16 }} />
                    }
                  </IconButton>
                </Tooltip>
              </label>
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                Profile Picture
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Upload a profile photo (optional). If not provided, a colored avatar will be shown.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {errors.image && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: '8px'
            }}
          >
            {errors.image}
          </Alert>
        )}

        {/* Form Fields */}
        <Grid container spacing={2}>
          {!user && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!errors.username}
                  helperText={errors.username}
                  required
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: '8px'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: '8px'
                    }
                  }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '8px'
                }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              error={!!errors.fullName}
              helperText={errors.fullName}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '8px'
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                label="Gender"
                sx={{
                  borderRadius: '8px'
                }}
              >
                <MenuItem value="MALE">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%',
                      bgcolor: '#64B5F6'
                    }} />
                    Male
                  </Box>
                </MenuItem>
                <MenuItem value="FEMALE">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%',
                      bgcolor: '#F06292'
                    }} />
                    Female
                  </Box>
                </MenuItem>
                <MenuItem value="NOT_SPECIFIED">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%',
                      bgcolor: '#BDBDBD'
                    }} />
                    Not Specified
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              SelectProps={{
                sx: {
                  borderRadius: '8px'
                }
              }}
            >
              <MenuItem value="HOSPITAL_MANAGER">Hospital Manager</MenuItem>
              <MenuItem value="PHARMACY_STAFF">Pharmacy Staff</MenuItem>
              <MenuItem value="PROCUREMENT_OFFICER">Procurement Officer</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            borderRadius: '8px',
            px: 3,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          sx={{ 
            borderRadius: '8px',
            px: 3,
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: theme.shadows[2],
            '&:hover': {
              boxShadow: theme.shadows[4]
            }
          }}
        >
          {user ? 'Update User' : 'Create User'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserForm