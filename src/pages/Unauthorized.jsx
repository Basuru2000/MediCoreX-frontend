import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Block } from '@mui/icons-material'

function Unauthorized() {
  const navigate = useNavigate()

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      <Block sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
      <Typography variant="h4" gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        You don't have permission to access this page.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate('/')}
        sx={{ mt: 3 }}
      >
        Go to Home
      </Button>
    </Box>
  )
}

export default Unauthorized