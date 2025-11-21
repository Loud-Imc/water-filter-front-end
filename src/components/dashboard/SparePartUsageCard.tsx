import React from 'react';
import { Card, CardContent, Typography, Box, Chip, List, ListItem, ListItemText } from '@mui/material';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import type { SparePartUsage } from '../../types';

const SparePartUsageCard: React.FC<{ data: SparePartUsage }> = ({ data }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <BuildCircleIcon sx={{ mr: 1, fontSize: 22, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={600}>
          Spare Part Usage
        </Typography>
      </Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Total Spares Value Consumed: <b>₹{data.totalSparePartsValue}</b>
      </Typography>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Spare Parts Used: <b>{data.totalSparePartsUsed}</b>
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ mt: 2 }}>
        Most Used Spare Parts:
      </Typography>
      <List dense>
        {data.mostUsedSpareParts.map((part) => (
          <ListItem key={part.sparePartId || part.name}>
            <ListItemText
              primary={`${part.name} (SKU: ${part.sku})`}
              secondary={`Used: ${part.totalQuantityUsed} • Stock: ${part.currentStock}`}
            />
            <Chip label={`₹${part.estimatedValue}`} color="info" size="small" sx={{ ml: 1 }} />
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);

export default SparePartUsageCard;
