import React, { useState } from 'react';
import { Container, Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import QuarantineDashboard from '../components/quarantine/QuarantineDashboard';

const Quarantine = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link
            component={RouterLink}
            to="/"
            color="inherit"
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            Home
          </Link>
          <Link
            component={RouterLink}
            to="/inventory"
            color="inherit"
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            Inventory
          </Link>
          <Typography
            sx={{ display: 'flex', alignItems: 'center' }}
            color="text.primary"
          >
            Quarantine Management
          </Typography>
        </Breadcrumbs>

        {/* Main Dashboard */}
        <QuarantineDashboard key={refreshTrigger} />
      </Box>
    </Container>
  );
};

export default Quarantine;