import React, { useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchMyTasks } from '../../app/slices/requestSlice';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusChip from '../../components/common/StatusChip';
import { formatDate } from '../../utils/helpers';
import AssignmentIcon from '@mui/icons-material/Assignment';

const MyTasks: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { myTasks, loading } = useAppSelector((state) => state.requests);

  useEffect(() => {
    dispatch(fetchMyTasks());
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (myTasks.length === 0) {
    return (
      <Box>
        <PageHeader title="My Tasks" />
        <EmptyState
          icon={<AssignmentIcon sx={{ fontSize: 80, color: 'text.disabled' }} />}
          title="No tasks assigned"
          description="You don't have any tasks assigned at the moment"
        />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="My Tasks" />

      {/* ✅ Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
      <Grid container spacing={3}>
        {myTasks.map((task) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={task.id}>
            <Card sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <StatusChip status={task.status} />
                  <Typography variant="caption" color="text.secondary">
                    {task.type}
                  </Typography>
                </Box>

                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {task.customer.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {task.customer.address}
                </Typography>

                <Typography variant="body2" sx={{ my: 2 }}>
                  {task.description.substring(0, 100)}
                  {task.description.length > 100 && '...'}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Created: {formatDate(task.createdAt)}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate(`/service-requests/${task.id}`)}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyTasks;
