import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  Slide,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import BuildIcon from '@mui/icons-material/Build';
import HandymanIcon from '@mui/icons-material/Handyman';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { formatDate } from '../../utils/helpers';
import WorkMediaGallery from '../../pages/service-requests/WorkMediaGallery';  // ✅ IMPORT YOUR COMPONENT

// Slide transition
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ServiceDetailModalProps {
  open: boolean;
  onClose: () => void;
  service: any; // Use proper type if available
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  open,
  onClose,
  service,
}) => {
  if (!service) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INSTALLATION':
      case 'RE_INSTALLATION':
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

  const getTypeColor = (type: string): any => {
    switch (type) {
      case 'INSTALLATION':
        return 'primary';
      case 'RE_INSTALLATION':
        return 'secondary';
      case 'SERVICE':
        return 'success';
      case 'COMPLAINT':
        return 'error';
      case 'ENQUIRY':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string): any => {
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

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: 'background.default',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 2,
          boxShadow: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: `${getTypeColor(service.type)}.main`,
              width: 40,
              height: 40,
            }}
          >
            {getTypeIcon(service.type)}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {service.type.replace('_', ' ')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(service.createdAt)}
            </Typography>
          </Box>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Grid container spacing={3}>
          {/* Status & Type */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Chip
                    label={service.type.replace('_', ' ')}
                    color={getTypeColor(service.type)}
                    icon={getTypeIcon(service.type)}
                  />
                  {service.type !== 'ENQUIRY' && (
                    <Chip
                      label={service.status.replace('_', ' ')}
                      color={getStatusColor(service.status)}
                    />
                  )}
                  {service.priority && (
                    <Chip
                      label={`Priority: ${service.priority}`}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Description */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {service.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Customer & Location Info */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Customer & Location
                </Typography>
                
                <Stack spacing={2}>
                  {/* Customer Name */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Customer
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {service.customer?.name || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Phone */}
                  {service.customer?.primaryPhone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon color="primary" fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Contact
                        </Typography>
                        <Typography variant="body1">
                          {service.customer.primaryPhone}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Location/Region */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Region
                      </Typography>
                      <Typography variant="body1">
                        {service.region?.name || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Installation */}
                  {service.installation && (
                    <Box sx={{ pl: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Installation Location
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {service.installation.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {service.installation.address}
                      </Typography>
                      {service.installation.contactPerson && (
                        <Typography variant="caption" color="text.secondary">
                          Contact: {service.installation.contactPerson}
                          {service.installation.contactPhone &&
                            ` • ${service.installation.contactPhone}`}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Assigned Technician */}
          {service.assignedTo && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Assigned Technician
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {service.assignedTo.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {service.assignedTo.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {service.assignedTo.email}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Used Products */}
          {service.usedProducts && service.usedProducts.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Products Used
                  </Typography>
                  <List>
                    {service.usedProducts.map((item: any, index: number) => (
                      <React.Fragment key={item.id || index}>
                        {index > 0 && <Divider />}
                        <ListItem>
                          <ListItemText
                            primary={item.product?.name || 'Unknown Product'}
                            secondary={
                              <Box>
                                <Typography variant="caption" component="div">
                                  Quantity: {item.quantityUsed}
                                </Typography>
                                {item.notes && (
                                  <Typography variant="caption" color="text.secondary">
                                    Notes: {item.notes}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Approval History */}
          {service.approvalHistory && service.approvalHistory.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Approval History
                  </Typography>
                  <List>
                    {service.approvalHistory.map((approval: any, index: number) => (
                      <React.Fragment key={approval.id || index}>
                        {index > 0 && <Divider />}
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight={500}>
                                  {approval.approver?.name || 'Unknown'}
                                </Typography>
                                <Chip
                                  label={approval.status}
                                  size="small"
                                  color={approval.status === 'APPROVED' ? 'success' : 'error'}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  {approval.approverRole} • {formatDate(approval.approvedAt)}
                                </Typography>
                                {approval.comments && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 0.5 }}
                                  >
                                    {approval.comments}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Timestamps */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Timeline
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Created
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(service.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  {service.acknowledgedAt && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarTodayIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Completed
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(service.acknowledgedAt)}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ✅ UPDATED: Use WorkMediaGallery component instead of ImageList */}
        {service.workMedia && service.workMedia.length > 0 && (
          <WorkMediaGallery media={service.workMedia} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetailModal;
