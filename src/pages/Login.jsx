import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Fade,
  useTheme,
  alpha
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  LocalHospital,
  AccountCircle,
  Lock,
  HealthAndSafety
} from '@mui/icons-material'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const from = location.state?.from?.pathname || '/'

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password')
      return
    }

    setLoading(true)
    setError('')

    const result = await login(formData.username, formData.password)
    
    if (!result.success) {
      setError(result.error)
      setLoading(false)
    }
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.08)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.light, 0.1)} 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%)
          `,
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="sm">
        <Fade in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 5, md: 6 },
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: `
                0 20px 40px ${alpha(theme.palette.common.black, 0.08)},
                0 10px 20px ${alpha(theme.palette.common.black, 0.05)}
              `,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative medical pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 150,
                height: 150,
                opacity: 0.03,
                transform: 'rotate(15deg)'
              }}
            >
              <HealthAndSafety sx={{ width: '100%', height: '100%' }} />
            </Box>

            {/* Logo and Title Section */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4
              }}
            >
              {/* Temporary Medical Icon */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '20px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  boxShadow: `
                    0 10px 20px ${alpha(theme.palette.primary.main, 0.3)},
                    0 6px 6px ${alpha(theme.palette.primary.main, 0.2)}
                  `,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: -1,
                    borderRadius: '20px',
                    padding: 1,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.5)}, ${alpha(theme.palette.primary.dark, 0.5)})`,
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    opacity: 0.5
                  }
                }}
              >
                <LocalHospital sx={{ fontSize: 40, color: 'white' }} />
              </Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 1,
                  letterSpacing: '-0.5px'
                }}
              >
                MediCoreX
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 400,
                  fontSize: '0.95rem'
                }}
              >
                Healthcare Inventory Management System
              </Typography>
            </Box>

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                autoComplete="username"
                autoFocus
                sx={{ mb: 2.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '10px',
                    '&.Mui-focused': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.02)
                    }
                  }
                }}
                InputLabelProps={{
                  sx: {
                    '&.Mui-focused': {
                      color: theme.palette.primary.main
                    }
                  }
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="current-password"
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                        size="small"
                        disabled={loading}
                        sx={{
                          color: theme.palette.text.secondary,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08)
                          }
                        }}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '10px',
                    '&.Mui-focused': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.02)
                    }
                  }
                }}
                InputLabelProps={{
                  sx: {
                    '&.Mui-focused': {
                      color: theme.palette.primary.main
                    }
                  }
                }}
              />
              
              {/* Error Alert */}
              <Fade in={!!error}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: '10px',
                    '& .MuiAlert-icon': {
                      fontSize: 20
                    }
                  }}
                >
                  {error}
                </Alert>
              </Fade>
              
              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !formData.username || !formData.password}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '10px',
                  textTransform: 'none',
                  background: loading 
                    ? theme.palette.action.disabledBackground
                    : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: loading 
                    ? 'none'
                    : `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                    transform: 'translateY(-1px)'
                  },
                  '&:active': {
                    transform: 'translateY(0)'
                  },
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transform: 'translateX(-100%)',
                    transition: 'transform 0.6s',
                    display: loading ? 'block' : 'none',
                    animation: loading ? 'shimmer 2s infinite' : 'none'
                  },
                  '@keyframes shimmer': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                  }
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CircularProgress size={20} sx={{ color: 'inherit' }} />
                    <span>Signing in...</span>
                  </Box>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Footer Text */}
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: '0.75rem'
                  }}
                >
                  © 2025 MediCoreX. All rights reserved.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  )
}

export default Login