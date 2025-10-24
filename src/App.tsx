import React from 'react';
import { Box } from '@mui/material';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Box sx={{ minHeight: '100vh' }}>
        <AppRoutes />
      </Box>
    </ErrorBoundary>
  );
};

export default App;
