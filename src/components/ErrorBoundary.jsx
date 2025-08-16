import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            p: 3
          }}
        >
          <Paper 
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 500,
              textAlign: 'center'
            }}
          >
            <ErrorIcon 
              sx={{ 
                fontSize: 64, 
                color: 'error.main',
                mb: 2 
              }} 
            />
            
            <Typography variant="h5" gutterBottom>
              Oops! Something went wrong
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary" 
              paragraph
            >
              We encountered an unexpected error. The issue has been logged 
              and we'll look into it.
            </Typography>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box 
                sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  textAlign: 'left'
                }}
              >
                <Typography 
                  variant="caption" 
                  component="pre"
                  sx={{ 
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                onClick={this.handleReset}
              >
                Try Again
              </Button>
              
              <Button 
                variant="outlined"
                onClick={() => window.location.href = '/'}
              >
                Go Home
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;