import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Button,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BuildIcon from '@mui/icons-material/Build';
import HandymanIcon from '@mui/icons-material/Handyman';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ImageIcon from '@mui/icons-material/Image';
import { formatDate } from '../../utils/helpers';

interface ServiceHistoryTimelineProps {
  serviceHistory: any[];
}

const ServiceHistoryTimeline: React.FC<ServiceHistoryTimelineProps> = ({
  serviceHistory,
}) => {
  const navigate = useNavigate();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INSTALLATION':
        return <BuildIcon />;
      case 'SERVICE':
        return <HandymanIcon />;
      case 'COMPLAINT':
        return <ReportProblemIcon />;
      case 'ENQUIRY':
        return <HelpOutlineIcon />;
      default:
        return <HandymanIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INSTALLATION':
        return 'primary';
      case 'SERVICE':
        return 'success';
      case 'COMPLAINT':
        return 'error';
      case 'ENQUIRY':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
      COMPLETED: 'success',
      IN_PROGRESS: 'info',
      PENDING_APPROVAL: 'warning',
      REJECTED: 'error',
      ASSIGNED: 'default',
      WORK_COMPLETED: 'success',
    };
    return statusColors[status] || 'default';
  };

  if (serviceHistory.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Service History
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No service history yet
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Service History ({serviceHistory.length} records)
        </Typography>

        <Stack spacing={2} sx={{ mt: 2 }}>
          {serviceHistory.map((service) => (
            <Card
              key={service.id}
              variant="outlined"
              sx={{
                cursor: 'pointer',
                '&:hover': { boxShadow: 2 },
                transition: 'all 0.2s',
              }}
              onClick={() => navigate(`/service-requests/${service.id}`)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                  {/* Icon */}
                  <Avatar
                    sx={{
                      bgcolor: `${getTypeColor(service.type)}.main`,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {getTypeIcon(service.type)}
                  </Avatar>

                  {/* Content */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {service.type}
                      </Typography>
                      <Chip
                        label={service.status.replace('_', ' ')}
                        size="small"
                        color={getStatusColor(service.status)}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {service.description}
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.disabled">
                        📅 {formatDate(service.createdAt)}
                      </Typography>
                      {service.assignedTo && (
                        <Typography variant="caption" color="text.disabled">
                          👨‍🔧 {service.assignedTo.name}
                        </Typography>
                      )}
                      {service.workMedia && service.workMedia.length > 0 && (
                        <Typography variant="caption" color="primary.main">
                          <ImageIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          {service.workMedia.length} images
                        </Typography>
                      )}
                    </Stack>
                  </Box>

                  {/* View Button */}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/service-requests/${service.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ServiceHistoryTimeline;
