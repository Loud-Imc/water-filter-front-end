import React, { useEffect, useState } from "react";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Divider,
  Chip,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Alert,
  IconButton,
  Stack,
} from "@mui/material";
import { useParams } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import UploadIcon from "@mui/icons-material/Upload";
import TimerIcon from "@mui/icons-material/Timer";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchRequestById,
  approveRequest,
  rejectRequest,
  assignTechnician,
  startWork,
  stopWork,
  uploadWorkMedia,
  acknowledgeCompletion,
} from "../../app/slices/requestSlice";
import { fetchAllUsers } from "../../app/slices/userSlice";
import PageHeader from "../../components/common/PageHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatusChip from "../../components/common/StatusChip";
import SnackbarNotification from "../../components/common/SnackbarNotification";
import { formatDate } from "../../utils/helpers";
import { canApproveRequest, canAssignTechnician } from "../../utils/helpers";
import { customerService } from "../../api/services/customerService";
import LocationCapture from "../../components/location/LocationCapture";

const ServiceRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedRequest, loading } = useAppSelector(
    (state) => state.requests
  );

  const { user } = useAppSelector((state) => state.auth);
  const { users } = useAppSelector((state) => state.users);

  // ✅ ALL useState hooks at the top
  const [isWorking, setIsWorking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [workNotes, setWorkNotes] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [acknowledgeDialog, setAcknowledgeDialog] = useState(false);
  const [acknowledgeComments, setAcknowledgeComments] = useState("");
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [comments, setComments] = useState("");
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as any,
  });
  const [customerLocation, setCustomerLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // ✅ useEffect to set customerLocation when request loads
  useEffect(() => {
    if (selectedRequest?.customer) {
      if (
        selectedRequest.customer.latitude &&
        selectedRequest.customer.longitude
      ) {
        setCustomerLocation({
          latitude: selectedRequest.customer.latitude,
          longitude: selectedRequest.customer.longitude,
        });
      } else {
        setCustomerLocation(null);
      }
    }
  }, [selectedRequest]);

  useEffect(() => {
    if (id) {
      dispatch(fetchRequestById(id));
      dispatch(fetchAllUsers());
    }
  }, [id, dispatch]);

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorking && startTime) {
      interval = setInterval(() => {
        setElapsedTime(
          Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorking, startTime]);

  // Auto-start timer if status is IN_PROGRESS
useEffect(() => {
  if (
    selectedRequest?.status === "IN_PROGRESS" &&
    selectedRequest.workLogs &&  // ✅ Check exists first
    selectedRequest.workLogs.length > 0
  ) {
    const lastWorkLog =
      selectedRequest.workLogs[selectedRequest.workLogs.length - 1];
    if (lastWorkLog.startTime && !lastWorkLog.endTime) {
      setStartTime(new Date(lastWorkLog.startTime));
      setIsWorking(true);
    }
  }
}, [selectedRequest]);

  // ✅ Early return AFTER all hooks
  if (loading || !selectedRequest) {
    return <LoadingSpinner />;
  }

  const request = selectedRequest;

  // ✅ Handler functions
  const handleLocationCapture = async (location: {
    latitude: number;
    longitude: number;
  }) => {
    try {
      await customerService.updateLocation(request.customer.id, {
        latitude: location.latitude,
        longitude: location.longitude,
      });

      setCustomerLocation(location);
      await dispatch(fetchRequestById(request.id));
      setSnackbar({
        open: true,
        message: "Customer location saved successfully!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to save location",
        severity: "error",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartWork = async () => {
    if (!request.id) return;

    try {
      await dispatch(startWork({ requestId: request.id })).unwrap();

      setStartTime(new Date());
      setIsWorking(true);
      setSnackbar({
        open: true,
        message: "Work timer started!",
        severity: "success",
      });

      await dispatch(fetchRequestById(request.id));
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to start work",
        severity: "error",
      });
    }
  };

  const handleStopWork = async () => {
    if (!request.id) return;

    try {
      await dispatch(
        stopWork({ requestId: request.id, notes: workNotes })
      ).unwrap();

      setIsWorking(false);
      setStartTime(null);
      setElapsedTime(0);
      setSnackbar({
        open: true,
        message: "Work completed successfully!",
        severity: "success",
      });

      await dispatch(fetchRequestById(request.id));
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to stop work",
        severity: "error",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async () => {
    if (!request.id || selectedFiles.length === 0) return;

    try {
      for (const file of selectedFiles) {
        await dispatch(
          uploadWorkMedia({ requestId: request.id, file })
        ).unwrap();
      }

      setSnackbar({
        open: true,
        message: `${selectedFiles.length} image(s) uploaded successfully!`,
        severity: "success",
      });
      setUploadDialog(false);
      setSelectedFiles([]);
      await dispatch(fetchRequestById(request.id));
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to upload images",
        severity: "error",
      });
    }
  };

  const handleAcknowledge = async () => {
    try {
      await dispatch(
        acknowledgeCompletion({
          id: request.id,
          comments: acknowledgeComments,
        })
      ).unwrap();

      setSnackbar({
        open: true,
        message: "Work acknowledged and completed!",
        severity: "success",
      });
      setAcknowledgeDialog(false);
      setAcknowledgeComments("");
      dispatch(fetchRequestById(request.id));
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to acknowledge",
        severity: "error",
      });
    }
  };

  const userCanApprove =
    user && canApproveRequest(user.role.name, request.requestedBy.role.name);
  const userCanAssign = user && canAssignTechnician(user.role.name);
  const isSalesCreated = [
    "Salesman",
    "Sales Team Lead",
    "Sales Manager",
  ].includes(request.requestedBy.role.name);

  const handleApprove = async () => {
    try {
      const approvalType =
        isSalesCreated && !request.salesApproved ? "sales" : "service";
      await dispatch(
        approveRequest({
          id: request.id,
          comments,
          type: approvalType,
        })
      ).unwrap();

      setSnackbar({
        open: true,
        message: "Request approved successfully!",
        severity: "success",
      });
      setApproveDialog(false);
      setComments("");
      dispatch(fetchRequestById(request.id));
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to approve request",
        severity: "error",
      });
    }
  };

  const handleReject = async () => {
    try {
      await dispatch(
        rejectRequest({
          id: request.id,
          comments,
        })
      ).unwrap();

      setSnackbar({
        open: true,
        message: "Request rejected",
        severity: "info",
      });
      setRejectDialog(false);
      setComments("");
      dispatch(fetchRequestById(request.id));
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to reject request",
        severity: "error",
      });
    }
  };

  const handleAssign = async (auto: boolean) => {
    try {
      await dispatch(
        assignTechnician({
          id: request.id,
          technicianId: selectedTechnicianId,
          auto,
        })
      ).unwrap();

      setSnackbar({
        open: true,
        message: "Technician assigned successfully!",
        severity: "success",
      });
      setAssignDialog(false);
      setSelectedTechnicianId("");
      dispatch(fetchRequestById(request.id));
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to assign technician",
        severity: "error",
      });
    }
  };

  const availableTechnicians = users.filter(
    (u) =>
      u.role?.name === "Technician" &&
      u.status === "ACTIVE" &&
      u.regionId === request.regionId
  );

  return (
    <Box>
      <PageHeader
        title="Service Request Details"
        breadcrumbs={[
          { label: "Service Requests", path: "/service-requests" },
          { label: "Details" },
        ]}
      />

      <Grid container spacing={3}>
        {/* Technician Work Panel */}
        {user?.role.name === "Technician" &&
          request.assignedTo?.id === user.id && (
            <Grid size={12}>
              <Card
                sx={{ bgcolor: "primary.light", color: "primary.contrastText" }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <TimerIcon />
                    Work Progress
                  </Typography>

                  {request.status === "ASSIGNED" && (
                    <>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Click "Start Work" to begin this task. Timer will start
                        automatically.
                      </Alert>
                      <Button
                        variant="contained"
                        color="success"
                        size="large"
                        startIcon={<PlayArrowIcon />}
                        onClick={handleStartWork}
                        fullWidth
                      >
                        Start Work
                      </Button>
                    </>
                  )}

                  {request.status === "IN_PROGRESS" && (
                    <>
                      <Grid container spacing={3} alignItems="center">
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ textAlign: "center" }}>
                            <Typography variant="h2" fontWeight={600}>
                              {formatTime(elapsedTime)}
                            </Typography>
                            <Typography variant="caption">
                              Timer Running
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 8 }}>
                          <Box
                            sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}
                          >
                            <Button
                              variant="contained"
                              color="error"
                              size="large"
                              startIcon={<StopIcon />}
                              onClick={handleStopWork}
                            >
                              Complete Work
                            </Button>

                            <Button
                              variant="outlined"
                              startIcon={<UploadIcon />}
                              onClick={() => setUploadDialog(true)}
                              sx={{
                                color: "primary.contrastText",
                                borderColor: "primary.contrastText",
                              }}
                            >
                              Upload Images
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 3 }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Work Notes"
                          value={workNotes}
                          onChange={(e) => setWorkNotes(e.target.value)}
                          placeholder="Add notes about the work being performed..."
                          sx={{
                            "& .MuiInputLabel-root": {
                              color: "primary.contrastText",
                            },
                            "& .MuiInputBase-root": {
                              color: "primary.contrastText",
                            },
                          }}
                        />
                      </Box>
                    </>
                  )}

                  {request.status === "WORK_COMPLETED" && (
                    <>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        ✅ Work completed! Waiting for manager acknowledgment.
                      </Alert>
                      <Button
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        onClick={() => setUploadDialog(true)}
                        fullWidth
                        sx={{
                          color: "primary.contrastText",
                          borderColor: "primary.contrastText",
                        }}
                      >
                        Upload Additional Images
                      </Button>
                    </>
                  )}

                  {request.status === "COMPLETED" && (
                    <Alert severity="success">
                      ✅ Task completed and acknowledged by manager.
                    </Alert>
                  )}
                </CardContent>
              </Card>
              
              {/* Customer Location Card */}
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Customer Location
                  </Typography>

                  <LocationCapture
                    initialLocation={customerLocation}
                    onLocationCapture={handleLocationCapture}
                    disabled={request.status === "COMPLETED"}
                  />
                </CardContent>
              </Card>
            </Grid>
          )}

        {/* Main Details Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Work Images Gallery */}
              {request.workMedia && request.workMedia.length > 0 && (
                <Card sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Work Images ({request.workMedia.length})
                    </Typography>

                    <Grid container spacing={2}>
                      {request.workMedia.map((media) => (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={media.id}>
                          <Box
                            sx={{
                              position: "relative",
                              paddingTop: "100%",
                              borderRadius: 2,
                              overflow: "hidden",
                              cursor: "pointer",
                              border: "2px solid",
                              borderColor: "divider",
                              "&:hover": {
                                opacity: 0.8,
                                transform: "scale(1.02)",
                                transition: "all 0.2s",
                              },
                            }}
                            onClick={() => window.open(`http://localhost:3000${media.fileUrl}`, "_blank")}
                          >
                            <Box
                              component="img"
                              src={`http://localhost:3000${media.fileUrl}`}
                              alt="Work image"
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />

                            {/* Upload Date Overlay */}
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                bgcolor: "rgba(0,0,0,0.7)",
                                color: "white",
                                p: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                display="block"
                                noWrap
                              >
                                {formatDate(media.uploadedAt)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h5" fontWeight={600}>
                  Request Information
                </Typography>
                <StatusChip status={request.status} size="medium" />
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Request ID
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {request.id.slice(0, 8)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Chip label={request.type} color="primary" size="small" />
                </Grid>

                <Grid size={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Customer
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {request.customer?.name || "N/A"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {request.customer?.address || ""}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Contact
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {request.customer?.primaryPhone || "N/A"}
                  </Typography>
                </Grid>

                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">
                    Region
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {request.region?.name || "N/A"}
                  </Typography>
                </Grid>

                <Grid size={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid size={12}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Description
                  </Typography>
                  <Typography variant="body1">{request.description}</Typography>
                </Grid>

                <Grid size={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Requested By
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {request.requestedBy?.name || "N/A"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {request.requestedBy?.role?.name || ""}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatDate(request.createdAt)}
                  </Typography>
                </Grid>

                {request.assignedTo && (
                  <>
                    <Grid size={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Assigned Technician
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {request.assignedTo.name}
                      </Typography>
                    </Grid>
                  </>
                )}

                {request.approvedBy && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Approved By
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {request.approvedBy.name}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap" }}>
                {userCanApprove && request.status === "PENDING_APPROVAL" && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => setApproveDialog(true)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => setRejectDialog(true)}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {userCanAssign && request.status === "APPROVED" && (
                  <Button
                    variant="contained"
                    startIcon={<AssignmentIndIcon />}
                    onClick={() => setAssignDialog(true)}
                  >
                    Assign Technician
                  </Button>
                )}

                {userCanAssign && request.status === "WORK_COMPLETED" && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => setAcknowledgeDialog(true)}
                  >
                    Acknowledge Completion
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Approval History */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Approval History
              </Typography>
              {request.approvalHistory && request.approvalHistory.length > 0 ? (
                <List>
                  {request.approvalHistory.map((approval) => (
                    <ListItem key={approval.id} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor:
                              approval.status === "APPROVED"
                                ? "success.main"
                                : "error.main",
                          }}
                        >
                          {approval.status === "APPROVED" ? (
                            <CheckCircleIcon />
                          ) : (
                            <CancelIcon />
                          )}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={approval.approver?.name || "N/A"}
                        secondary={
                          <>
                            <Typography variant="caption" display="block">
                              {approval.approverRole} • {approval.status}
                            </Typography>
                            {approval.comments && (
                              <Typography variant="caption" display="block">
                                {approval.comments}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.disabled">
                              {formatDate(approval.approvedAt)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No approval history yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Approve Dialog */}
      <Dialog
        open={approveDialog}
        onClose={() => setApproveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Request</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comments (Optional)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog(false)}>Cancel</Button>
          <Button onClick={handleApprove} variant="contained" color="success">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog}
        onClose={() => setRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Request</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for Rejection"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            required
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={!comments.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Technician Dialog */}
      <Dialog
        open={assignDialog}
        onClose={() => setAssignDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Technician</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Request Region: <strong>{request.region?.name}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Available Technicians in this region:{" "}
              <strong>{availableTechnicians.length}</strong>
            </Typography>
          </Box>

          <TextField
            select
            fullWidth
            label="Select Technician"
            value={selectedTechnicianId}
            onChange={(e) => setSelectedTechnicianId(e.target.value)}
            sx={{ mt: 2 }}
            helperText={
              availableTechnicians.length === 0
                ? "No technicians available in this region"
                : ""
            }
          >
            {availableTechnicians.length === 0 && (
              <MenuItem disabled>No technicians available</MenuItem>
            )}
            {availableTechnicians.map((tech) => (
              <MenuItem key={tech.id} value={tech.id}>
                {tech.name} {tech.region?.name ? `(${tech.region.name})` : ""}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleAssign(true)}
              disabled={availableTechnicians.length === 0}
            >
              Auto Assign (System will select)
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleAssign(false)}
            variant="contained"
            disabled={!selectedTechnicianId}
          >
            Assign Selected
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Images Dialog */}
      {/* ✅ ENHANCED: Image Upload Dialog with Camera & Preview */}
      <Dialog
        open={uploadDialog}
        onClose={() => setUploadDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload Work Images</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Capture photos using your camera or select from gallery. You can
              upload multiple images.
            </Typography>

            {/* ✅ Camera & Gallery Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 2, mb: 2 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CameraAltIcon />}
                fullWidth
              >
                Take Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  capture="environment" // ✅ Opens camera on mobile
                  onChange={handleFileSelect}
                />
              </Button>

              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
              >
                Choose from Gallery
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                />
              </Button>
            </Stack>

            {/* ✅ Image Previews */}
            {selectedFiles.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Images ({selectedFiles.length}):
                </Typography>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {selectedFiles.map((file, index) => (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                      <Box
                        sx={{
                          position: "relative",
                          paddingTop: "100%",
                          borderRadius: 1,
                          overflow: "hidden",
                          border: "2px solid",
                          borderColor: "divider",
                        }}
                      >
                        {/* Preview Image */}
                        <Box
                          component="img"
                          src={URL.createObjectURL(file)}
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />

                        {/* Remove Button */}
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFile(index)}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "error.main",
                            color: "white",
                            "&:hover": { bgcolor: "error.dark" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>

                        {/* File Size */}
                        <Chip
                          label={`${(file.size / 1024).toFixed(0)} KB`}
                          size="small"
                          sx={{
                            position: "absolute",
                            bottom: 4,
                            left: 4,
                            bgcolor: "rgba(0,0,0,0.6)",
                            color: "white",
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {selectedFiles.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No images selected. Use camera to take photos or choose from
                gallery.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setUploadDialog(false);
              setSelectedFiles([]); // Clear on cancel
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleFileUpload}
            variant="contained"
            disabled={selectedFiles.length === 0}
            startIcon={<UploadIcon />}
          >
            Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Acknowledge Completion Dialog */}
      <Dialog
        open={acknowledgeDialog}
        onClose={() => setAcknowledgeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Acknowledge Work Completion</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Confirm that the technician has completed the work satisfactorily.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Acknowledgment Comments (Optional)"
            value={acknowledgeComments}
            onChange={(e) => setAcknowledgeComments(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Add any comments about the completed work..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAcknowledgeDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAcknowledge}
            variant="contained"
            color="success"
          >
            Acknowledge & Complete
          </Button>
        </DialogActions>
      </Dialog>

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default ServiceRequestDetail;
