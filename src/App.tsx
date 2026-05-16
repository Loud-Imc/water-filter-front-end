import React from 'react';
import { Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Box sx={{ minHeight: '100vh' }}>
        <Toaster position="top-right" />
        <AppRoutes />
      </Box>
    </ErrorBoundary>
  );
};

export default App;
