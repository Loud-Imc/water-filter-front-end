import React, { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../api/services/productService';

interface StockAlertBarProps {
  userRole?: string;
}

const StockAlertBar: React.FC<StockAlertBarProps> = ({ userRole }) => {
  const [lowStockCount, setLowStockCount] = useState(0);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Hide for technicians
    if (userRole === 'Technician') return;

    const fetchLowStockCount = async () => {
      try {
        const count = await productService.getLowStockCount();
        if (count > 0) {
          setLowStockCount(count);
          setShow(true);
        }
      } catch (error) {
        console.error('Error fetching low stock count:', error);
      }
    };

    fetchLowStockCount();
    const interval = setInterval(fetchLowStockCount, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [userRole]);

  const handleNavigate = () => {
    navigate('/products?filter=lowStock');
    setShow(false);
  };

  if (!show || lowStockCount === 0) return null;

  return (
    <Box
      onClick={handleNavigate}
      sx={{
        width: '100%',
        bgcolor: 'error.main',
        color: 'white',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        '&:hover': { bgcolor: 'error.dark' },
        transition: 'background-color 0.3s',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <WarningIcon sx={{ fontSize: 24 }} />
        <Typography variant="subtitle1" fontWeight={600}>
          ⚠️ {lowStockCount} {lowStockCount === 1 ? 'product' : 'products'} going out of stock
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="inherit"
        size="small"
        onClick={handleNavigate}
      >
        View Details
      </Button>
    </Box>
  );
};

export default StockAlertBar;
