import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Chip,
  Avatar,
  ListItemAvatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';
import StatusChip from '../common/StatusChip';

interface RecentRequestsProps {
  requests: any[];
}

const RecentRequests: React.FC<RecentRequestsProps> = ({ requests }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Recent Requests
        </Typography>

        {requests.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No requests yet
            </Typography>
          </Box>
        ) : (
          <List>
            {requests.map((request) => (
              <ListItem
                key={request.id}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  borderRadius: 1,
                  mb: 1,
                }}
                onClick={() => navigate(`/service-requests/${request.id}`)}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {request.customer?.name?.charAt(0) || 'C'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight={500}>
                        {request.customer?.name || 'Unknown'}
                      </Typography>
                      <Chip label={request.type} size="small" />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="caption" display="block">
                        {request.description}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {formatDate(request.createdAt)}
                      </Typography>
                    </Box>
                  }
                />
                <StatusChip  status={request.status} />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentRequests;
