import React from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BuildIcon from "@mui/icons-material/Build";
import HandymanIcon from "@mui/icons-material/Handyman";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import TimerIcon from "@mui/icons-material/Timer";
import { TransitionProps } from "@mui/material/transitions";
import { formatDate } from "../../utils/helpers";
import WorkMediaGallery from "../../pages/service-requests/WorkMediaGallery";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ServiceDetailModalProps {
  open: boolean;
  onClose: () => void;
  service: any; // replace with exact type if available
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  open,
  onClose,
  service,
}) => {
  if (!service) return null;

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "INSTALLATION":
      case "RE_INSTALLATION":
        return <BuildIcon />;
      case "SERVICE":
        return <HandymanIcon />;
      case "COMPLAINT":
        return <ReportProblemIcon />;
      case "ENQUIRY":
        return <HelpOutlineIcon />;
      default:
        return <HandymanIcon />;
    }
  };

  const getTypeColor = (type?: string): any => {
    switch (type) {
      case "INSTALLATION":
        return "primary";
      case "RE_INSTALLATION":
        return "secondary";
      case "SERVICE":
        return "success";
      case "COMPLAINT":
        return "error";
      case "ENQUIRY":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusColor = (status?: string): any => {
    const statusColors: Record<
      string,
      "success" | "warning" | "error" | "info" | "default"
    > = {
      COMPLETED: "success",
      IN_PROGRESS: "info",
      PENDING_APPROVAL: "warning",
      REJECTED: "error",
      ASSIGNED: "default",
      WORK_COMPLETED: "success",
    };
    return status ? statusColors[status] || "default" : "default";
  };

  // safe accessors + computed values
  const requestId = service.id || service.requestId || "N/A";
  const requestedBy = service.requestedBy || {
    id: service.requestedById,
    name: "N/A",
    email: "",
  };
  const assignedTo =
    service.assignedTo ||
    (service.assignedToId
      ? { id: service.assignedToId, name: service.assignedToId }
      : null);
  const approvedBy =
    service.approvedBy ||
    (service.approvedById ? { id: service.approvedById } : null);
  const acknowledgedBy =
    service.acknowledgedBy ||
    (service.acknowledgedById ? { id: service.acknowledgedById } : null);
  const region =
    service.region ||
    (service.regionId
      ? { id: service.regionId, name: service.regionId }
      : null);

  // total work minutes/seconds from logs
  const totalWorkDuration = (service.workLogs || []).reduce(
    (sum: number, l: any) => sum + (l.duration || 0),
    0
  );

  // prepare media for gallery — keep fileUrl as-is (WorkMediaGallery likely expects it)
  const media = (service.workMedia || []).map((m: any) => ({
    ...m,
    // if your gallery needs absolute URLs uncomment next line and adjust base
    // fileUrl: m.fileUrl && !m.fileUrl.startsWith('http') ? `${window.location.origin}${m.fileUrl}` : m.fileUrl,
  }));

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      sx={{
        "& .MuiDialog-paper": {
          bgcolor: "background.default",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
          position: "sticky",
          top: 0,
          bgcolor: "background.paper",
          zIndex: 2,
          boxShadow: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
              {String(service.type || "REQUEST").replace("_", " ")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {service.createdAt ? formatDate(service.createdAt) : "—"}
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
          {/* Top chips (type / status / priority / salesApproved) */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Stack
                  direction="row"
                  spacing={2}
                  flexWrap="wrap"
                  alignItems="center"
                >
                  <Chip
                    label={String(service.type || "N/A").replace("_", " ")}
                    color={getTypeColor(service.type)}
                    icon={getTypeIcon(service.type)}
                  />
                  {service.type !== "ENQUIRY" && (
                    <Chip
                      label={String(service.status || "N/A").replace("_", " ")}
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
                  {service.description || "N/A"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Customer & Region info */}
          <Grid size={{ xs: 12}}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Customer & Location
                </Typography>

                <Stack spacing={2}>
                  {/* Customer name if available; fallback to customerId */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Customer
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {service.customer?.name || service.customerId || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Contact (customer) */}
                  {service.customer?.primaryPhone ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                  ) : service.requestedBy?.email ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PhoneIcon color="primary" fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Requested By (email)
                        </Typography>
                        <Typography variant="body1">
                          {service.requestedBy.email}
                        </Typography>
                      </Box>
                    </Box>
                  ) : null}

                  {/* Region */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOnIcon color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Region
                      </Typography>
                      <Typography variant="body1">
                        {region?.name || region?.id || "N/A"}
                      </Typography>
                      {region?.city && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {region.city} • {region.pincode || ""}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Installation block (if exists) */}
                  {service.installation ? (
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
                  ) : null}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Request meta (requestedBy / assigned / approval / created) */}
          <Grid size={{ xs: 12}}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Request Details
                </Typography>

                <Grid container spacing={1}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Request ID
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {requestId}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Requested By
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {requestedBy.name || requestedBy.id}
                    </Typography>
                    {requestedBy.email && (
                      <Typography variant="caption" color="text.secondary">
                        {requestedBy.email}
                      </Typography>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Assigned Technician
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {assignedTo?.name || assignedTo?.id || "N/A"}
                    </Typography>
                    {assignedTo?.email && (
                      <Typography variant="caption" color="text.secondary">
                        {assignedTo.email}
                      </Typography>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Approved By
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {approvedBy?.name || approvedBy?.id || "N/A"}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {service.createdAt
                        ? formatDate(service.createdAt)
                        : "N/A"}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {service.category?.name || service.categoryId || "N/A"}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Acknowledged
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {service.acknowledgedAt
                        ? formatDate(service.acknowledgedAt)
                        : "Not acknowledged"}
                    </Typography>
                    {service.acknowledgmentComments && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {service.acknowledgmentComments}
                      </Typography>
                    )}
                    {acknowledgedBy && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        By: {acknowledgedBy.name || acknowledgedBy.id}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Work logs (if any) */}
          {service.workLogs && service.workLogs.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Work Logs
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Sessions performed by technician
                  </Typography>

                  <List>
                    {service.workLogs.map((log: any, idx: number) => (
                      <React.Fragment key={log.id || idx}>
                        {idx > 0 && <Divider />}
                        <ListItem alignItems="flex-start" sx={{ py: 1 }}>
                          <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                            <TimerIcon />
                          </Avatar>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={600}
                                >
                                  Session #{idx + 1}
                                </Typography>
                                <Chip
                                  label={`${log.duration || 0} sec`}
                                  size="small"
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Started:{" "}
                                  {log.startTime
                                    ? formatDate(log.startTime)
                                    : "N/A"}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Ended:{" "}
                                  {log.endTime
                                    ? formatDate(log.endTime)
                                    : "In Progress"}
                                </Typography>
                                {log.notes && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ mt: 0.5 }}
                                  >
                                    {log.notes}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>

                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: "primary.light",
                      borderRadius: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      Total Work Duration:
                    </Typography>
                    <Chip label={`${totalWorkDuration} seconds`} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Approval history (if any) */}
          {service.approvalHistory && service.approvalHistory.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Approval History
                  </Typography>
                  <List>
                    {service.approvalHistory.map((a: any, i: number) => (
                      <React.Fragment key={a.id || i}>
                        {i > 0 && <Divider />}
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  alignItems: "center",
                                }}
                              >
                                <Typography variant="body2" fontWeight={600}>
                                  {a.approver?.name ||
                                    a.approverId ||
                                    "Unknown"}
                                </Typography>
                                <Chip
                                  label={a.status}
                                  size="small"
                                  color={
                                    a.status === "APPROVED"
                                      ? "success"
                                      : "error"
                                  }
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {a.approverRole} •{" "}
                                  {a.approvedAt ? formatDate(a.approvedAt) : ""}
                                </Typography>
                                {a.comments && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 0.5 }}
                                  >
                                    {a.comments}
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


          {/* Media gallery (bottom) */}
          {media.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <WorkMediaGallery media={media} />
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetailModal;
