import { Box, Typography, Button, Container, Paper } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Lock, Home } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'

function Unauthorized() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={3}
      >
        <Paper
          elevation={3}
          sx={{
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            borderRadius: 3
          }}
        >
          <Lock sx={{ fontSize: 80, color: 'error.main' }} />
          
          <Typography variant="h4" fontWeight={600} textAlign="center">
            Access Denied
          </Typography>
          
          <Typography variant="body1" color="text.secondary" textAlign="center">
            You don't have permission to access this page.
          </Typography>

          {user && (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Your role: <strong>{user.role.replace('_', ' ')}</strong>
            </Typography>
          )}

          <Box display="flex" gap={2} mt={2}>
            <Button 
              variant="contained" 
              startIcon={<Home />}
              onClick={() => navigate('/')}
              size="large"
            >
              Go to Home
            </Button>
            <Button 
              variant="outlined"
              onClick={() => navigate(-1)}
              size="large"
            >
              Go Back
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default Unauthorized