import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EngineeringIcon from '@mui/icons-material/Engineering';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface TechnicianTasksProps {
  tasks: {
    assigned: number;
    inProgress: number;
    workCompleted: number;
  };
}

const TechnicianTasks: React.FC<TechnicianTasksProps> = ({ tasks }) => {
  // const navigate = useNavigate();

  const taskCards = [
    {
      title: 'Assigned to Me',
      count: tasks.assigned,
      icon: <AssignmentIcon fontSize="large" />,
      color: 'warning',
      filter: 'ASSIGNED',
    },
    {
      title: 'In Progress',
      count: tasks.inProgress,
      icon: <EngineeringIcon fontSize="large" />,
      color: 'info',
      filter: 'IN_PROGRESS',
    },
    {
      title: 'Awaiting Approval',
      count: tasks.workCompleted,
      icon: <CheckCircleOutlineIcon fontSize="large" />,
      color: 'success',
      filter: 'WORK_COMPLETED',
    },
  ];

  return (
    <Card sx={{ mb: 3, bgcolor: 'primary.light' }}>
      <CardContent>
        <Typography sx={{ color: 'white' }} variant="h5" fontWeight={600} gutterBottom>
          My Tasks Today
        </Typography>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {taskCards.map((card) => (
            <Grid size={{ xs: 12, sm: 4 }} key={card.title}>
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  p: 2,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                // onClick={() => navigate(`/service-requests?status=${card.filter}`)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      color: `${card.color}.main`,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="h3" fontWeight={700}>
                      {card.count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TechnicianTasks;
