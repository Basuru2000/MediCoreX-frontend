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
  Alert
} from '@mui/material'
import { Upload, Close, Person } from '@mui/icons-material'
import { uploadUserProfileImage } from '../../services/api'

function UserForm({ open, onClose, onSubmit, user }) {
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
      setImagePreview(user.profileImageUrl ? `http://localhost:8080${user.profileImageUrl}` : null)
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
    setErrors({})
  }, [user, open])

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

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, image: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)' })
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image size must be less than 5MB' })
      return
    }

    setUploadingImage(true)
    setErrors({ ...errors, image: '' })

    try {
      const response = await uploadUserProfileImage(file)
      const imageUrl = response.data.imageUrl
      
      setFormData(prev => ({ ...prev, profileImageUrl: imageUrl }))
      setImagePreview(`http://localhost:8080${imageUrl}`)
    } catch (error) {
      setErrors({ ...errors, image: 'Failed to upload image' })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, profileImageUrl: '' }))
    setImagePreview(null)
  }

  const validate = () => {
    const newErrors = {}
    
    if (!user) {
      // Only validate username and password for new users
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required'
      } else if (formData.username.length < 3 || formData.username.length > 20) {
        newErrors.username = 'Username must be between 3 and 20 characters'
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData)
    }
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user ? 'Edit User' : 'Create New User'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Profile Image Upload */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={imagePreview}
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: getGenderColor(formData.gender),
                  fontSize: 48
                }}
              >
                {!imagePreview && (formData.fullName ? formData.fullName[0].toUpperCase() : <Person />)}
              </Avatar>
              
              {imagePreview && (
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    bgcolor: 'background.paper',
                    boxShadow: 1
                  }}
                  onClick={handleRemoveImage}
                >
                  <Close />
                </IconButton>
              )}
              
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-image-upload"
                type="file"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              <label htmlFor="profile-image-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    }
                  }}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? <CircularProgress size={20} /> : <Upload />}
                </IconButton>
              </label>
            </Box>
          </Box>

          {errors.image && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.image}
            </Alert>
          )}

          {!user && (
            <>
              <TextField
                autoFocus
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                required
                sx={{ mb: 2 }}
              />
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
                sx={{ mb: 2 }}
              />
            </>
          )}

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={!!errors.fullName}
            helperText={errors.fullName}
            required
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              label="Gender"
            >
              <MenuItem value="MALE">Male</MenuItem>
              <MenuItem value="FEMALE">Female</MenuItem>
              <MenuItem value="NOT_SPECIFIED">Not Specified</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <MenuItem value="HOSPITAL_MANAGER">Hospital Manager</MenuItem>
            <MenuItem value="PHARMACY_STAFF">Pharmacy Staff</MenuItem>
            <MenuItem value="PROCUREMENT_OFFICER">Procurement Officer</MenuItem>
          </TextField>

          <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center' }}>
            Profile image is optional. If not provided, a colored avatar will be shown based on gender.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {user ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserForm