import React from 'react';
import { Card, CardContent, Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import type { CustomerActivity } from '../../types';

interface Props {
  data: CustomerActivity;
}

const CustomerInsightsCard: React.FC<Props> = ({ data }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={600}>
            Customer Insights
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            New Customers
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {data.newCustomers}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Total Customers
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {data.totalCustomers}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Avg Services per Customer
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {data.avgServicesPerCustomer}
          </Typography>
        </Box>

        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
          Top Customers
        </Typography>
        <List dense>
          {data.topCustomers.slice(0, 5).map((customer) => (
            <ListItem key={customer.customerId}>
              <ListItemText
                primary={customer.name}
                secondary={`${customer.totalServices} services • ${customer.region}`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default CustomerInsightsCard;
