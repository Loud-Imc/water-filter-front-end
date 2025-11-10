import React from 'react';
import { Card, CardContent, Typography, Box, List, ListItem, ListItemText, Chip } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import type { ProductUsage } from '../../types';

interface Props {
  data: ProductUsage;
}

const ProductUsageCard: React.FC<Props> = ({ data }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={600}>
            Product Usage
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Total Value Consumed
          </Typography>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            ₹{data.totalValueConsumed}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Products Used
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {data.totalProductsUsed}
          </Typography>
        </Box>

        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
          Most Used Products
        </Typography>
        <List dense>
          {data.mostUsedProducts.slice(0, 5).map((product) => (
            <ListItem key={product.productId}>
              <ListItemText
                primary={product.name}
                secondary={`Used: ${product.totalQuantityUsed} • Stock: ${product.currentStock}`}
              />
            </ListItem>
          ))}
        </List>

        {data.lowStockProducts.length > 0 && (
          <>
            <Typography variant="subtitle2" fontWeight={600} color="error" sx={{ mt: 2, mb: 1 }}>
              Low Stock Alert
            </Typography>
            <List dense>
              {data.lowStockProducts.slice(0, 3).map((product) => (
                <ListItem key={product.id}>
                  <ListItemText
                    primary={product.name}
                    secondary={`Stock: ${product.stock}`}
                  />
                  <Chip label="Low" color="error" size="small" />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductUsageCard;
