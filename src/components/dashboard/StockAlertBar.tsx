import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';
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
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking close
    setShow(false);
  };

  if (!show || lowStockCount === 0) return null;

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#FFF4E5', // ✅ Light orange/amber background
        borderLeft: '4px solid #FF9800', // ✅ Orange left border
        p: 2,
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 1,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      {/* Left side: Icon + Message */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: '#FF9800', // Orange background for icon
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WarningIcon sx={{ fontSize: 24, color: 'white' }} />
        </Box>
        
        <Box>
          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
            ⚠️ Stock Alert
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {lowStockCount} {lowStockCount === 1 ? 'product is' : 'products are'} running low on stock
          </Typography>
        </Box>
      </Box>

      {/* Right side: View Details Button + Close Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="contained"
          size="medium"
          onClick={handleNavigate}
          sx={{
            bgcolor: '#FF9800',
            color: 'white',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#F57C00',
            },
          }}
        >
          View Details
        </Button>

        {/* ✅ Close Button */}
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.05)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default StockAlertBar;
