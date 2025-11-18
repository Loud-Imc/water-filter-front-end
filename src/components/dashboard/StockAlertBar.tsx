import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../api/services/productService';
import { sparePartsService } from '../../api/services/sparePartsService';

interface StockAlertBarProps {
  userRole?: string;
}

const StockAlertBar: React.FC<StockAlertBarProps> = ({ userRole }) => {
  const [lowStockProductsCount, setLowStockProductsCount] = useState(0);
  const [lowStockSparePartsCount, setLowStockSparePartsCount] = useState(0);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole === 'Technician') return;

    const fetchLowStockCounts = async () => {
      try {
        const [productCount, sparePartsCount] = await Promise.all([
          productService.getLowStockCount(),
          sparePartsService.getLowStockCount(),
        ]);
        if (productCount > 0 || sparePartsCount > 0) {
          setLowStockProductsCount(productCount);
          setLowStockSparePartsCount(sparePartsCount);
          setShow(true);
        }
      } catch (error) {
        console.error('Error fetching low stock counts:', error);
      }
    };

    fetchLowStockCounts();
    const interval = setInterval(fetchLowStockCounts, 60000);

    return () => clearInterval(interval);
  }, [userRole]);

  const handleNavigateProducts = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/products?filter=lowStock');
  };

  const handleNavigateSpareParts = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/products?tab=Spare Parts&filter=lowStock');
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShow(false);
  };

  if (!show) return null;

  const totalLowStockCount = lowStockProductsCount + lowStockSparePartsCount;
  if (totalLowStockCount === 0) return null;

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#FFF4E5',
        borderLeft: '4px solid #FF9800',
        p: 2,
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 1,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: '#FF9800',
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
          <Typography variant="body2" color="text.secondary" component="div">
            {lowStockProductsCount > 0 && (
              <>
                {lowStockProductsCount}{' '}
                <Typography
                  component="span"
                  onClick={handleNavigateProducts}
                  sx={{
                    color: '#FF9800',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    '&:hover': {
                      color: '#F57C00',
                    },
                  }}
                >
                  {lowStockProductsCount === 1 ? 'product' : 'products'}
                </Typography>
              </>
            )}
            {lowStockProductsCount > 0 && lowStockSparePartsCount > 0 && ' and '}
            {lowStockSparePartsCount > 0 && (
              <>
                {lowStockSparePartsCount}{' '}
                <Typography
                  component="span"
                  onClick={handleNavigateSpareParts}
                  sx={{
                    color: '#FF9800',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    '&:hover': {
                      color: '#F57C00',
                    },
                  }}
                >
                  {lowStockSparePartsCount === 1 ? 'spare part' : 'spare parts'}
                </Typography>
              </>
            )}{' '}
            {totalLowStockCount === 1 ? 'is' : 'are'} running low on stock
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
