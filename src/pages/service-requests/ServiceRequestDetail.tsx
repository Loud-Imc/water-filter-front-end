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
  IconButton as MuiIconButton,
  Slide,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import StopIcon from "@mui/icons-material/Stop";
import UploadIcon from "@mui/icons-material/Upload";
import TimerIcon from "@mui/icons-material/Timer";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
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
import ConfirmDialog from "../../components/common/ConfirmDialog";
import PromptDialog from "../../components/common/PromptDialog";
import { formatDate } from "../../utils/helpers";
import { canApproveRequest, canAssignTechnician } from "../../utils/helpers";
import { customerService } from "../../api/services/customerService";
import LocationCapture from "../../components/location/LocationCapture";
import ReassignTechnicianDialog from "../../components/services/ReassignTechnicianDialog";
import {
  reassignTechnician,
  // fetchReassignmentHistory,
  updateRequest,
} from "../../app/slices/requestSlice";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AddUsedProductsDialog from "../../components/services/AddUsedProductsDialog";
import { requestService } from "../../api/services/requestService";
import { productService } from "../../api/services/productService";
import { sparePartsService } from "../../api/services/sparePartsService";
import { installationService } from "../../api/services/installationService";

import { BuildCircleOutlined } from "@mui/icons-material";
import WorkMediaGallery from "./WorkMediaGallery";
import { Product, SparePart, TechnicianStock } from "../../types";
import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import { TransitionProps } from "@mui/material/transitions";
import ServiceHistoryTimeline from "../../components/customer/ServiceHistoryTimeline";
import { technicianStockService } from "../../api/services/technicianStockService";
import imageCompression from "browser-image-compression";

interface UsedItem {
  type: "product" | "sparePart";
  id: string; // productId or sparePartId
  quantityUsed: number;
  notes?: string;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
  const [usedProductsDialog, setUsedProductsDialog] = useState(false);
  const [usedProducts, setUsedProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allSpareParts, setAllSpareParts] = React.useState<SparePart[]>([]);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [customerHistory, setCustomerHistory] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [technicianStock, setTechnicianStock] = useState<TechnicianStock[]>([]);
  const [reassignDialog, setReassignDialog] = useState(false);
  const [reassignForReworkDialog, setReassignForReworkDialog] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as any,
  });
  const [customerLocation, setCustomerLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editQtyOpen, setEditQtyOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<{ id: string; qty: number } | null>(
    null
  );

  // Description edit state
  const [editingDescription, setEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");

  // ✅ NEW: Priority and Type edit state
  const [editPriorityOpen, setEditPriorityOpen] = useState(false);
  const [editTypeOpen, setEditTypeOpen] = useState(false);

  // ✅ Maintenance Alert States
  const [spunChangeDialogOpen, setSpunChangeDialogOpen] = useState(false);
  const [daysNextChange, setDaysNextChange] = useState("90");
  const [maintenanceUnit, setMaintenanceUnit] = useState<"days" | "minutes">("days");

  const handleViewCustomerHistory = async () => {
    if (!request?.customer?.id) return;

    try {
      setLoadingHistory(true);
      setHistoryModalOpen(true);

      const data = await requestService.getCustomerServiceHistory(id!);
      setCustomerHistory(data);
    } catch (error: any) {
      console.error("Failed to fetch customer history:", error);
      setSnackbar({
        open: true,
        message: "Failed to load customer history",
        severity: "error",
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  // For pre-work reassignment
  const handleReassign = async (techId: string, reason: string) => {
    await dispatch(
      reassignTechnician({
        id: request.id,
        newTechnicianId: techId,
        reason,
      })
    ).unwrap();
    dispatch(fetchRequestById(request.id));
    setReassignDialog(false);
  };

  // For rework reassignment
  const handleReassignForRework = async (techId: string, reason: string) => {
    await dispatch(
      reassignTechnician({
        id: request.id,
        newTechnicianId: techId,
        reason,
      })
    ).unwrap();
    dispatch(fetchRequestById(request.id));
    setReassignForReworkDialog(false);
  };

  // ✅ NEW: Close modal
  const handleCloseHistoryModal = () => {
    setHistoryModalOpen(false);
    setCustomerHistory(null);
  };

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

  // Fetch technician stock when component loads (if user is technician)
  useEffect(() => {
    if (user?.role?.name === "Technician") {
      technicianStockService
        .getMyStock()
        .then(setTechnicianStock)
        .catch(console.error);
    }
  }, [user]);

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
      selectedRequest.workLogs && // ✅ Check exists first
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

  useEffect(() => {
    productService.getAllProducts().then(setAllProducts).catch(console.error);

    if (selectedRequest?.id && selectedRequest.status === "WORK_COMPLETED") {
      requestService
        .getUsedProducts(selectedRequest.id)
        .then(setUsedProducts)
        .catch(console.error);
    }
  }, [selectedRequest?.id, selectedRequest?.status]);
  useEffect(() => {
    async function fetchSpareParts() {
      try {
        const data = await sparePartsService.getAll();
        setAllSpareParts(data);
      } catch (error) {
        console.error("Failed to fetch spare parts", error);
      }
    }

    fetchSpareParts();
  }, []);

  // ✅ Early return AFTER all hooks
  if (loading || !selectedRequest) {
    return <LoadingSpinner />;
  }

  const request = selectedRequest;
  const isCreator = user?.id === request?.requestedById;

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

    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddUsedProducts = async (usedItems: UsedItem[]) => {
    if (!request.id) return;
    setIsSubmitting(true);
    try {
      await requestService.addUsedItems(request.id, usedItems);
      setSnackbar({
        open: true,
        message: "Used items added successfully! Stock updated.",
        severity: "success",
      });
      const updatedProducts = await requestService.getUsedProducts(request.id);
      const updatedSpareParts = await requestService.getUsedSpareParts(
        request.id
      );
      setUsedProducts([...updatedProducts, ...updatedSpareParts]);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to add used items",
        severity: "error",
      });
      throw error; // Propagate to dialog
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUsedItem = (usedItemId: string) => {
    setItemToDelete(usedItemId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteUsedItem = async () => {
    if (!itemToDelete || !request.id) return;
    try {
      await requestService.deleteUsedItem(request.id, itemToDelete);
      setSnackbar({
        open: true,
        message: "Item deleted successfully! Stock restored.",
        severity: "success",
      });
      // Refresh used items
      const updatedProducts = await requestService.getUsedProducts(request.id);
      const updatedSpareParts = await requestService.getUsedSpareParts(
        request.id
      );
      setUsedProducts([...updatedProducts, ...updatedSpareParts]);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to delete item",
        severity: "error",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEditUsedItemQuantity = (
    usedItemId: string,
    currentQty: number
  ) => {
    setItemToEdit({ id: usedItemId, qty: currentQty });
    setEditQtyOpen(true);
  };

  const confirmEditUsedItemQuantity = async (newQtyStr: string) => {
    if (!itemToEdit || !request.id) return;

    const newQty = parseInt(newQtyStr);
    if (isNaN(newQty) || newQty < 1) {
      setSnackbar({
        open: true,
        message: "Please enter a valid quantity (min 1)",
        severity: "error",
      });
      return;
    }

    try {
      await requestService.updateUsedItem(request.id, itemToEdit.id, newQty);
      setSnackbar({
        open: true,
        message: "Quantity updated successfully!",
        severity: "success",
      });
      // Refresh used items
      const updatedProducts = await requestService.getUsedProducts(request.id);
      const updatedSpareParts = await requestService.getUsedSpareParts(
        request.id
      );
      setUsedProducts([...updatedProducts, ...updatedSpareParts]);
      setEditQtyOpen(false);
      setItemToEdit(null);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to update quantity",
        severity: "error",
      });
    }
  };

  const handleStopWork = async () => {
    if (!request.id) return;

    setIsSubmitting(true);
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

      // ✅ NEW: Show Spun Change Dialog after stopping work if it's a maintenance-related request
      if (["SERVICE", "INSTALLATION", "RE_INSTALLATION", "COMPLAINT"].includes(request.type)) {
        setSpunChangeDialogOpen(true);
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to stop work",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setCompressing(true);

    try {
      const compressedFiles: File[] = [];
      let totalOriginalSize = 0;
      let totalCompressedSize = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        totalOriginalSize += file.size;

        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
          fileType: "image/jpeg",
          initialQuality: 0.8,
        });

        totalCompressedSize += compressedFile.size;
        compressedFiles.push(compressedFile);
      }

      // const savedPercentage = (
      //   ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) *
      //   100
      // ).toFixed(0);

      setSelectedFiles([...selectedFiles, ...compressedFiles]);

      // setSnackbar({
      //   open: true,
      //   message: `${compressedFiles.length} image(s) optimized (${savedPercentage}% smaller)`,
      //   severity: "success",
      // });

      event.target.value = "";
    } catch (error) {
      console.error("Error processing images:", error);
      setSnackbar({
        open: true,
        message: "Failed to process images. Please try again.",
        severity: "error",
      });
    } finally {
      setCompressing(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleFileUpload = async () => {
    if (!request.id || selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      // ✅ Files are ALREADY compressed, just upload
      for (const file of selectedFiles) {
        console.log("📤 Uploading:", (file.size / 1024).toFixed(0) + " KB");

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
    } finally {
      setIsUploading(false);
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
    user &&
    canApproveRequest(user?.role?.name, request?.requestedBy?.role?.name);
  const userCanAssign = user && canAssignTechnician(user?.role?.name);
  const isSalesCreated = [
    "Salesman",
    "Sales Team Lead",
    "Sales Manager",
  ].includes(request?.requestedBy?.role?.name);

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

  // const handleReassignTechnician = async (
  //   newTechnicianId: string,
  //   reason: string
  // ) => {
  //   if (!request.id) return;

  //   try {
  //     await dispatch(
  //       reassignTechnician({
  //         id: request.id,
  //         newTechnicianId,
  //         reason,
  //       })
  //     ).unwrap();

  //     setSnackbar({
  //       open: true,
  //       message:
  //         "Technician reassigned successfully! Old technician has been notified.",
  //       severity: "success",
  //     });

  //     // Fetch updated request
  //     dispatch(fetchRequestById(request.id));
  //   } catch (error: any) {
  //     setSnackbar({
  //       open: true,
  //       message: error || "Failed to reassign technician",
  //       severity: "error",
  //     });
  //   }
  // };

  const handleUpdatePriority = async (newPriority: string) => {
    if (!request.id) return;
    try {
      await dispatch(
        updateRequest({ id: request.id, data: { priority: newPriority as any } })
      ).unwrap();
      setSnackbar({
        open: true,
        message: "Priority updated successfully!",
        severity: "success",
      });
      setEditPriorityOpen(false);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to update priority",
        severity: "error",
      });
    }
  };

  const handleUpdateType = async (newType: string) => {
    if (!request.id) return;
    try {
      await dispatch(
        updateRequest({ id: request.id, data: { type: newType as any } })
      ).unwrap();
      setSnackbar({
        open: true,
        message: "Request type updated successfully!",
        severity: "success",
      });
      setEditTypeOpen(false);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error || "Failed to update request type",
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
        {/* ✅ SERVICE LOCATION DETAILS - VISIBLE TO ALL USERS */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Service Location Details
              </Typography>

              {/* ✅ Installation Information */}
              {request.installation ? (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "background.default",
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <LocationOnIcon color="info" fontSize="small" />
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="info.dark"
                    >
                      Installation Location
                    </Typography>
                    {request.installation.isPrimary && (
                      <Chip label="Primary" size="small" color="primary" />
                    )}
                    {request.installation.installationType && (
                      <Chip
                        label={request.installation.installationType}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="info.dark"
                    gutterBottom
                  >
                    {request.installation?.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="info.dark"
                    sx={{ mb: 0.5 }}
                  >
                    📍 {request.installation.address}
                  </Typography>

                  {request.installation.landmark && (
                    <Typography
                      variant="body2"
                      color="info.dark"
                      sx={{ mb: 0.5 }}
                    >
                      🏛️ Landmark: {request.installation.landmark}
                    </Typography>
                  )}

                  {/* ✅ Smart Phone Display */}
                  {(() => {
                    const installationPhone = request.installation.contactPhone;
                    const customerPhone = request.customer?.primaryPhone;
                    const phonesAreSame = installationPhone === customerPhone;

                    return (
                      <>
                        {request.installation.contactPerson && (
                          <Typography
                            variant="body2"
                            color="info.dark"
                            sx={{ mb: 0.5 }}
                          >
                            👤 Contact: {request.installation.contactPerson}
                            {installationPhone && ` • 📞 ${installationPhone}`}
                          </Typography>
                        )}

                        {!phonesAreSame && customerPhone && (
                          <Typography
                            variant="body2"
                            color="info.dark"
                            sx={{ mb: 0.5 }}
                          >
                            📞 Customer: {request?.customer?.name} •{" "}
                            {customerPhone}
                          </Typography>
                        )}
                      </>
                    );
                  })()}

                  {request.installation.notes && (
                    <Typography
                      variant="caption"
                      color="info.dark"
                      sx={{ fontStyle: "italic", display: "block", mt: 1 }}
                    >
                      📝 Note: {request.installation?.notes}
                    </Typography>
                  )}
                </Box>
              ) : (
                /* ✅ Show customer details if no installation */
                <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    {request.customer?.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    📍 {request.customer?.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📞 {request.customer?.primaryPhone}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ✅ TECHNICIAN WORK PANEL - ONLY FOR ASSIGNED TECHNICIAN */}
        {user?.role?.name === "Technician" &&
          request.assignedTo?.id === user.id && (
            <>
              {/* Work Progress Card */}
              <Grid size={12}>
                <Card
                  sx={{
                    bgcolor: "background.paper",
                    color: "primary.light",
                  }}
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

                    {(request.status === "ASSIGNED" ||
                      request.status === "RE_ASSIGNED") && (
                        <>
                          <Alert severity="info" sx={{ mb: 2 }}>
                            Click "Start Work" to begin this task. Timer will
                            start automatically.
                          </Alert>
                            <Button
                              variant="contained"
                              color="success"
                              size="large"
                              startIcon={isSubmitting ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                              onClick={handleStartWork}
                              fullWidth
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? "Starting..." : "Start Work"}
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
                              sx={{
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                              }}
                            >
                              <Button
                                variant="contained"
                                color="error"
                                size="large"
                                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <StopIcon />}
                                onClick={handleStopWork}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? "Completing..." : "Complete Work"}
                              </Button>

                              <Button
                                variant="outlined"
                                startIcon={isUploading ? <CircularProgress size={20} /> : <UploadIcon />}
                                onClick={() => setUploadDialog(true)}
                                disabled={isUploading}
                                sx={{
                                  color: "primary.light",
                                  borderColor: "primary.light",
                                }}
                              >
                                {isUploading ? "Uploading..." : "Upload Images"}
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
                                color: "primary.light",
                              },
                              "& .MuiInputBase-root": {
                                color: "primary.light",
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
                        <Button
                          variant="contained"
                          color="info"
                          sx={{ mt: 2, backgroundColor: "primary.main" }}
                          startIcon={<BuildCircleOutlined />}
                          onClick={() => setUsedProductsDialog(true)}
                        >
                          {usedProducts.length === 0
                            ? "Add Used Products"
                            : "Add More Products"}
                        </Button>

                        {/* ✅ NEW: Re-open Maintenance Dialog Button */}
                        <Button
                          variant="outlined"
                          color="warning"
                          sx={{ mt: 2, ml: { sm: 1 } }}
                          startIcon={<HistoryIcon />}
                          onClick={() => setSpunChangeDialogOpen(true)}
                        >
                          Update Maintenance Schedule
                        </Button>
                      </>
                    )}

                    {request.status === "COMPLETED" && (
                      <>
                        <Alert severity="success" sx={{ mb: 2 }}>
                          ✅ Task completed and acknowledged by manager.
                        </Alert>
                        {/* ✅ NEW: Re-open Maintenance Dialog Button even after completion */}
                        <Button
                          variant="outlined"
                          color="warning"
                          startIcon={<HistoryIcon />}
                          onClick={() => setSpunChangeDialogOpen(true)}
                        >
                          Update Maintenance Schedule
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Customer Location Capture Card */}
              <Grid size={12}>
                <Card>
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
            </>
          )}

        {/* Main Details Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Work Images Gallery */}
          {request.workMedia && request.workMedia.length > 0 && (
            <WorkMediaGallery media={request.workMedia} />
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
                {request.type !== "ENQUIRY" && (
                  <StatusChip
                    postWorkReassignCount={request.postWorkReassignCount ?? 0} // pass zero if undefined
                    status={request.status}
                    size="medium"
                  />
                )}
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Type
                    </Typography>
                    <Chip label={request.type} color="primary" size="small" />
                    {isCreator && (
                      <IconButton
                        size="small"
                        onClick={() => setEditTypeOpen(true)}
                        sx={{ ml: 0.5, p: 0.5 }}
                      >
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    )}
                  </Box>
                </Grid>

                {/* 🆕 NEW: Priority Status */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Priority
                    </Typography>
                    <Chip
                      label={request.priority}
                      color={
                        request.priority === "HIGH"
                          ? "error"
                          : request.priority === "MEDIUM"
                          ? "warning"
                          : request.priority === "NORMAL"
                          ? "info"
                          : "default"
                      }
                      size="small"
                      icon={
                        request.priority === "HIGH" ? (
                          <PriorityHighIcon />
                        ) : undefined
                      }
                    />
                    {isCreator && (
                      <IconButton
                        size="small"
                        onClick={() => setEditPriorityOpen(true)}
                        sx={{ ml: 0.5, p: 0.5 }}
                      >
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    )}
                  </Box>
                </Grid>

                <Grid size={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    onClick={handleViewCustomerHistory}
                    sx={{
                      cursor: "pointer",
                      // p: 1.5,
                      borderRadius: 1,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "action.hover",
                        transform: "translateY(-2px)",
                      },
                      "&:active": {
                        transform: "translateY(0)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Customer
                      </Typography>
                      <HistoryIcon
                        sx={{
                          fontSize: 20,
                          color: "primary.main",
                          animation: "pulse 2s infinite",
                          "@keyframes pulse": {
                            "0%, 100%": { opacity: 1 },
                            "50%": { opacity: 0.5 },
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        color="primary.main"
                        sx={{ fontWeight: 800 }}
                      >
                        View History
                      </Typography>
                    </Box>

                    <Typography variant="body1" fontWeight={500}>
                      {request.customer?.name || "N/A"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {request.customer?.address || ""}
                    </Typography>
                  </Box>
                </Grid>

                {/* ✅ NEW: Installation Information */}
                {/* {request.installation && (
                  <>
                    <Grid size={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>

                    <Grid size={12}>
                      <Box
                        sx={{ p: 2, bgcolor: "info.light", borderRadius: 1 }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <LocationOnIcon color="info" fontSize="small" />
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            color="info.dark"
                          >
                            Installation Location
                          </Typography>
                          {request.installation.isPrimary && (
                            <Chip
                              label="Primary"
                              size="small"
                              color="primary"
                            />
                          )}
                          {request.installation.installationType && (
                            <Chip
                              label={request.installation.installationType}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>

                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="info.dark"
                          gutterBottom
                        >
                          {request?.installation?.name}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="info.dark"
                          sx={{ mb: 0.5 }}
                        >
                          📍 {request.installation.address}
                        </Typography>

                        {request.installation.landmark && (
                          <Typography
                            variant="body2"
                            color="info.dark"
                            sx={{ mb: 0.5 }}
                          >
                            🏛️ Landmark: {request.installation.landmark}
                          </Typography>
                        )}

                        {request.installation.contactPerson && (
                          <Typography
                            variant="body2"
                            color="info.dark"
                            sx={{ mb: 0.5 }}
                          >
                            👤 Contact: {request.installation.contactPerson}
                            {request.installation.contactPhone &&
                              ` • 📞 ${request.installation.contactPhone}`}
                          </Typography>
                        )}

                        {request.installation.notes && (
                          <Typography
                            variant="caption"
                            color="info.dark"
                            sx={{
                              fontStyle: "italic",
                              display: "block",
                              mt: 1,
                            }}
                          >
                            Note: {request.installation.notes}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </>
                )} */}

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Contact
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {request.customer?.primaryPhone || "N/A"}
                  </Typography>

                  {/* Show installation contact if different */}
                  {request.installation?.contactPhone &&
                    request.installation.contactPhone !==
                    request.customer?.primaryPhone && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mt: 0.5 }}
                      >
                        Installation: {request.installation.contactPhone}
                      </Typography>
                    )}
                </Grid>

                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">
                    Region
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {request.region?.name || "N/A"}
                  </Typography>
                </Grid>

                {/* Divider */}
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                {/* Description */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Description
                    </Typography>
                    {/* ✅ Edit button - visible only for allowed roles */}
                    {user?.role?.name && ['Super Admin', 'Service Admin', 'Tele Caller'].includes(user.role.name) && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingDescription(true);
                          setEditedDescription(request.description);
                        }}
                        disabled={editingDescription}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  {editingDescription ? (
                    <>
                      <TextField
                        fullWidth
                        multiline
                        rows={6}
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                        <Button
                          size="small"
                          onClick={() => {
                            setEditingDescription(false);
                            setEditedDescription("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={async () => {
                            try {
                              await requestService.updateDescription(request.id, editedDescription);
                              setSnackbar({
                                open: true,
                                message: "Description updated successfully",
                                severity: "success",
                              });
                              setEditingDescription(false);
                              dispatch(fetchRequestById(request.id));
                            } catch (error: any) {
                              setSnackbar({
                                open: true,
                                message: error.response?.data?.message || "Failed to update description",
                                severity: "error",
                              });
                            }
                          }}
                        >
                          Save
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ p: 2, bgcolor: "grey.300", borderRadius: 1 }}>
                      {(() => {
                        const lines = request.description.split("\n");
                        const sections: {
                          type: "text" | "products" | "spareParts";
                          content: string[];
                        }[] = [];
                        let currentSection: (typeof sections)[0] = {
                          type: "text",
                          content: [],
                        };

                        lines.forEach((line) => {
                          if (!line.trim()) return;

                          if (line.includes("📦 Products:")) {
                            if (currentSection.content.length > 0)
                              sections.push(currentSection);
                            currentSection = { type: "products", content: [] };
                          } else if (line.includes("🔧 Spare Parts:")) {
                            if (currentSection.content.length > 0)
                              sections.push(currentSection);
                            currentSection = { type: "spareParts", content: [] };
                          } else {
                            currentSection.content.push(line);
                          }
                        });

                        if (currentSection.content.length > 0)
                          sections.push(currentSection);

                        return sections.map((section, sectionIndex) => {
                          if (section.type === "text") {
                            return (
                              <Box key={sectionIndex} sx={{ mb: 2 }}>
                                {section.content.map((line, lineIndex) => (
                                  <Typography
                                    key={lineIndex}
                                    variant="body1"
                                    sx={{ mb: 1 }}
                                  >
                                    {line}
                                  </Typography>
                                ))}
                              </Box>
                            );
                          }

                          return (
                            <Card
                              key={sectionIndex}
                              variant="outlined"
                              sx={{
                                mb: 2,
                                bgcolor:
                                  section.type === "products"
                                    ? "primary.50"
                                    : "secondary.50",
                              }}
                            >
                              <CardContent
                                sx={{ p: 2, "&:last-child": { pb: 2 } }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={600}
                                  gutterBottom
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  {section.type === "products"
                                    ? "📦 Products"
                                    : "🔧 Spare Parts"}
                                </Typography>
                                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                  {section.content.map((line, lineIndex) => {
                                    const text = line.replace("•", "").trim();
                                    if (!text) return null;
                                    return (
                                      <li key={lineIndex}>
                                        <Typography variant="body2">
                                          {text}
                                        </Typography>
                                      </li>
                                    );
                                  })}
                                </Box>
                              </CardContent>
                            </Card>
                          );
                        });
                      })()}
                    </Box>
                  )}
                </Grid>

                {/* Reassignment Reasons */}
                {request.reassignmentHistory &&
                  request.reassignmentHistory.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Reassignment Reason
                        {request.reassignmentHistory.length > 1 ? "s" : ""}
                      </Typography>
                      {request.reassignmentHistory.map((history) => (
                        <Typography
                          key={history.id}
                          variant="body1"
                          sx={{
                            fontWeight: "bold",
                            color: "warning.dark", // Highlight with a warning color
                            mb: 1,
                            whiteSpace: "pre-line", // Preserves line breaks if any
                          }}
                        >
                          {history.reason}
                        </Typography>
                      ))}
                    </Grid>
                  )}

                {/* Category */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontWeight: 800 }}
                  >
                    Category
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {request?.category?.name || "N/A"}
                  </Typography>
                </Grid>

                {/* Approval Remarks */}
                {request?.approvalHistory?.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Remarks
                    </Typography>
                    <Typography variant="body1">
                      {request.approvalHistory[0].comments || "N/A"}
                    </Typography>
                  </Grid>
                )}

                <Grid size={12}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Acknowledgment Comments
                  </Typography>
                  <Typography variant="body1">
                    {request.acknowledgmentComments || "N/A"}
                  </Typography>
                </Grid>

                <Grid size={12}>
                  {/* Used Products & Spare Parts Summary */}
                  {usedProducts.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        gutterBottom
                      >
                        ✅ Items Used ({usedProducts.length})
                      </Typography>
                      {usedProducts.map((item, index) => {
                        const name =
                          item.product?.name || item.sparePart?.name || "N/A";
                        const quantity = item.quantityUsed;
                        const company =
                          item.product?.company ||
                          item.sparePart?.company ||
                          "N/A";
                        return (
                          <Box
                            key={`${item.id}-${index}`}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                              flexWrap: "wrap",
                              gap: 1,
                            }}
                          >
                            <Chip
                              label={`${name} - ( company - ${company} ): ${quantity} qty`}
                              variant="outlined"
                            />
                            {request.status === "WORK_COMPLETED" && (
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() =>
                                    handleEditUsedItemQuantity(item.id, quantity)
                                  }
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteUsedItem(item.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                      {/* Show notes if any item has notes */}
                      {usedProducts.some((item) => item.notes) && (
                        <Box
                          sx={{
                            mt: 1,
                            p: 1,
                            bgcolor: "grey.100",
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Notes:{" "}
                            {usedProducts.find((item) => item.notes)?.notes}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
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
                        {request?.assignedTo?.name}
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
                      {request?.approvedBy?.name}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {/* Action Buttons */}
              {request.type !== "ENQUIRY" && (
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

                  {/* {(request.status === "WORK_COMPLETED" ||
                      request.status === "COMPLETED") && (
                      <Button
                        variant="contained"
                        startIcon={<SwapHorizIcon />}
                        onClick={() => setReassignForReworkDialog(true)}
                      >
                        Reassign for Rework
                      </Button>
                    )} */}

                  {/* Change Technician Button - Only if ASSIGNED and already has technician */}
                  {/* {userCanAssign &&
                    request.status === "ASSIGNED" &&
                    request.assignedTo && (
                      <Button
                        variant="contained"
                        color="warning"
                        startIcon={<SwapHorizIcon />}
                        onClick={() => setReassignDialog(true)}
                      >
                        Change Technician
                      </Button>
                    )} */}

                  {/* Change Technician - Only when ASSIGNED (before work starts) */}
                  {userCanAssign &&
                    request.status === "ASSIGNED" &&
                    request.assignedTo && (
                      <Button
                        variant="contained"
                        color="warning"
                        startIcon={<SwapHorizIcon />}
                        onClick={() => setReassignDialog(true)}
                      >
                        Change Technician
                      </Button>
                    )}

                  {/* Reassign for Rework - Only when WORK_COMPLETED or COMPLETED */}
                  {userCanAssign &&
                    (request.status === "WORK_COMPLETED" ||
                      request.status === "COMPLETED") && (
                      <Button
                        variant="contained"
                        color="warning"
                        startIcon={<SwapHorizIcon />}
                        onClick={() => setReassignForReworkDialog(true)}
                      >
                        Reassign for Rework
                      </Button>
                    )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Approval History and all comments and remarks */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Comments & Remarks
              </Typography>

              {/* Acknowledgment Comments */}
              {request.acknowledgmentComments && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="success.main"
                    gutterBottom
                  >
                    ✅ Acknowledgment Comments
                  </Typography>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "success.lighter",
                      borderRadius: 1,
                      border: 1,
                      borderColor: "success.light",
                    }}
                  >
                    <Typography variant="body2">
                      {request.acknowledgmentComments}
                    </Typography>
                    {request.acknowledgedBy && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mt: 1 }}
                      >
                        By: {request.acknowledgedBy.name} •{" "}
                        {request.acknowledgedAt
                          ? formatDate(request.acknowledgedAt)
                          : "N/A"}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

              {/* Work Notes from WorkLogs */}
              {request.workLogs?.some((log) => log.notes) && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="info.main"
                    gutterBottom
                  >
                    📝 Technician Work Notes
                  </Typography>
                  {request.workLogs
                    .filter((log) => log.notes)
                    .map((log, index) => (
                      <Box
                        key={log.id}
                        sx={{
                          p: 1.5,
                          bgcolor: "info.lighter",
                          borderRadius: 1,
                          border: 1,
                          borderColor: "info.light",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          display="block"
                        >
                          Session #{index + 1}
                        </Typography>
                        <Typography variant="body2">{log.notes}</Typography>
                      </Box>
                    ))}
                </Box>
              )}

              {/* Approval History Comments */}
              {request.approvalHistory?.some(
                (approval) => approval.comments
              ) && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="warning.main"
                      gutterBottom
                    >
                      💬 Approval Remarks
                    </Typography>
                    {request.approvalHistory
                      .filter((approval) => approval.comments)
                      .map((approval) => (
                        <Box
                          key={approval.id}
                          sx={{
                            p: 1.5,
                            bgcolor: "warning.lighter",
                            borderRadius: 1,
                            border: 1,
                            borderColor: "warning.light",
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2">
                            {approval.comments}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ mt: 0.5 }}
                          >
                            By: {approval.approver?.name} •{" "}
                            {approval.approverRole}
                          </Typography>
                        </Box>
                      ))}
                  </Box>
                )}

              {/* No comments state */}
              {!request.acknowledgmentComments &&
                !request.workLogs?.some((log) => log.notes) &&
                !request.approvalHistory?.some(
                  (approval) => approval.comments
                ) && (
                  <Typography variant="body2" color="text.secondary">
                    No comments or remarks available
                  </Typography>
                )}
            </CardContent>
          </Card>

          {/* <Card>
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
          </Card> */}
        </Grid>
        {/* 🆕 NEW: Work Logs - Show technician work details */}
        {request.workLogs && request.workLogs.length > 0 && (
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Work Logs
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Detailed timeline of technician work sessions
                </Typography>

                <List>
                  {request.workLogs.map((log, index) => (
                    <React.Fragment key={log.id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          bgcolor: "background.default",
                          borderRadius: 1,
                          mb: 1,
                          border: 1,
                          borderColor: "divider",
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            <TimerIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primaryTypographyProps={{ component: "div" }}
                          secondaryTypographyProps={{ component: "div" }}
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: 1,
                              }}
                            >
                              <Typography variant="subtitle2" fontWeight={600}>
                                Session #{index + 1}
                              </Typography>
                              <Chip
                                size="small"
                                color="primary"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                ⏰ <strong>Started:</strong>{" "}
                                {log?.startTime
                                  ? formatDate(log.startTime)
                                  : "N/A"}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                🏁 <strong>Ended:</strong>{" "}
                                {log.endTime
                                  ? formatDate(log.endTime)
                                  : "In Progress"}
                              </Typography>
                              {log.notes && (
                                <Box
                                  sx={{
                                    mt: 1,
                                    p: 1,
                                    bgcolor: "grey.100",
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    <strong>Notes:</strong> {log.notes}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>

                {/* Summary Box */}
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
                  <Chip
                    label={`${request.workLogs.reduce(
                      (total, log) => total + (log.duration || 0),
                      0
                    )} seconds`}
                    color="primary"
                    size="medium"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
      <Dialog
        fullScreen
        open={historyModalOpen}
        onClose={handleCloseHistoryModal}
        TransitionComponent={Transition}
        sx={{
          "& .MuiDialog-paper": {
            bgcolor: "background.default",
          },
        }}
      >
        {/* Modal Header */}
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
            zIndex: 1,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Customer Service History
            </Typography>
            {customerHistory?.customer && (
              <Typography variant="body2" color="text.secondary">
                {customerHistory?.customer?.name}
              </Typography>
            )}
          </Box>
          <MuiIconButton
            edge="end"
            color="inherit"
            onClick={handleCloseHistoryModal}
            aria-label="close"
          >
            <CloseIcon />
          </MuiIconButton>
        </DialogTitle>

        {/* Modal Content */}
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {loadingHistory ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : customerHistory ? (
            <Grid container spacing={3}>
              {/* Customer Info Card - Mobile Optimized */}
              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      gutterBottom
                    >
                      Customer Information
                    </Typography>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Name
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {customerHistory?.customer?.name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">
                          {customerHistory.customer.primaryPhone}
                        </Typography>
                      </Box>
                      {customerHistory.customer.email && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="body1">
                            {customerHistory.customer.email}
                          </Typography>
                        </Box>
                      )}
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Address
                        </Typography>
                        <Typography variant="body1">
                          {customerHistory.customer.address}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Statistics - Mobile Optimized Grid */}
              <Grid size={{ xs: 12 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Card>
                      <CardContent sx={{ textAlign: "center", py: 2 }}>
                        <Typography
                          variant="h4"
                          color="primary.main"
                          fontWeight={600}
                        >
                          {customerHistory.statistics.totalServices}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Services
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Card>
                      <CardContent sx={{ textAlign: "center", py: 2 }}>
                        <Typography
                          variant="h4"
                          color="success.main"
                          fontWeight={600}
                        >
                          {customerHistory.statistics.completedServices}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Completed
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Card>
                      <CardContent sx={{ textAlign: "center", py: 2 }}>
                        <Typography
                          variant="h4"
                          color="info.main"
                          fontWeight={600}
                        >
                          {customerHistory.statistics.installations}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Installations
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Card>
                      <CardContent sx={{ textAlign: "center", py: 2 }}>
                        <Typography
                          variant="h4"
                          color="warning.main"
                          fontWeight={600}
                        >
                          {customerHistory.statistics.complaints}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Complaints
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Card>
                      <CardContent sx={{ textAlign: "center", py: 2 }}>
                        <Typography
                          variant="h4"
                          color="secondary.main"
                          fontWeight={600}
                        >
                          {customerHistory.statistics.services}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Services
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Card>
                      <CardContent sx={{ textAlign: "center", py: 2 }}>
                        <Typography variant="h4" fontWeight={600}>
                          {customerHistory.statistics.enquiries}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Enquiries
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              {/* Service History Timeline */}
              <Grid size={{ xs: 12 }}>
                <ServiceHistoryTimeline
                  serviceHistory={customerHistory.serviceHistory}
                />
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">No history data available</Alert>
          )}
        </DialogContent>
      </Dialog>
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
                {tech?.name} {tech.region?.name ? `(${tech.region.name})` : ""}
              </MenuItem>
            ))}
          </TextField>

          {/* <Box sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleAssign(true)}
              disabled={availableTechnicians.length === 0}
            >
              Auto Assign (System will select)
            </Button>
          </Box> */}
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
                startIcon={
                  compressing ? (
                    <CircularProgress size={20} />
                  ) : (
                    <CameraAltIcon />
                  )
                }
                fullWidth
                disabled={compressing}
              >
                {compressing ? "Processing..." : "Take Photo"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                />
              </Button>

              <Button
                variant="outlined"
                component="label"
                startIcon={
                  compressing ? <CircularProgress size={20} /> : <UploadIcon />
                }
                fullWidth
                disabled={compressing}
              >
                {compressing ? "Processing..." : "Choose from Gallery"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                />
              </Button>
            </Stack>

            {compressing && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Optimizing images for faster upload and storage...
              </Alert>
            )}

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
            disabled={selectedFiles.length === 0 || isUploading}
            startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
          >
            {isUploading ? "Uploading..." : `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}`}
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
      {/* ✅ FIXED: ReassignTechnicianDialog with correct props */}
      {/* <ReassignTechnicianDialog
        open={reassignDialog}
        currentTechnician={request.assignedTo || null}
        availableTechnicians={availableTechnicians}
        onClose={() => setReassignDialog(false)}
        onReassign={handleReassignTechnician}
        loading={loading}
      /> */}

      {/* ✅ Priority Edit Dialog */}
      <PromptDialog
        open={editPriorityOpen}
        title="Update Priority"
        message="Select the new priority for this request:"
        confirmLabel="Update"
        onConfirm={handleUpdatePriority}
        onCancel={() => setEditPriorityOpen(false)}
        type="select"
        options={[
          { label: "High", value: "HIGH" },
          { label: "Medium", value: "MEDIUM" },
          { label: "Normal", value: "NORMAL" },
          { label: "Low", value: "LOW" },
        ]}
        initialValue={request.priority}
      />

      {/* ✅ Type Edit Dialog */}
      <PromptDialog
        open={editTypeOpen}
        title="Update Request Type"
        message="Select the new type for this request:"
        confirmLabel="Update"
        onConfirm={handleUpdateType}
        onCancel={() => setEditTypeOpen(false)}
        type="select"
        options={[
          { label: "Service", value: "SERVICE" },
          { label: "Installation", value: "INSTALLATION" },
          { label: "Complaint", value: "COMPLAINT" },
          { label: "Enquiry", value: "ENQUIRY" },
          { label: "Re-Installation", value: "RE_INSTALLATION" },
        ]}
        initialValue={request.type}
      />

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
      <AddUsedProductsDialog
        open={usedProductsDialog}
        onClose={() => setUsedProductsDialog(false)}
        onConfirm={handleAddUsedProducts}
        allProducts={allProducts}
        allSpareParts={allSpareParts}
        technicianStock={technicianStock}
        loading={isSubmitting}
      />
      {/* // Reassign dialog */}
      <ReassignTechnicianDialog
        open={reassignDialog}
        currentTechnician={request.assignedTo}
        availableTechnicians={availableTechnicians}
        onClose={() => setReassignDialog(false)}
        onReassign={handleReassign}
        title="Change Technician"
        reasonRequired={false}
        allowCurrentTechnician={false}
        watchRegionId={request?.region?.id} // from parent state
      />
      <ReassignTechnicianDialog
        open={reassignForReworkDialog}
        currentTechnician={request.assignedTo}
        availableTechnicians={availableTechnicians}
        onClose={() => setReassignForReworkDialog(false)}
        onReassign={handleReassignForRework}
        title="Reassign for Rework"
        subtitle="Customer says issue unresolved. Please select a technician."
        allowCurrentTechnician={true}
        watchRegionId={request?.region?.id} // from parent state
      />

      {/* Custom Dialogs */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Used Item"
        message="Are you sure you want to delete this item? This will restore the stock."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        severity="error"
        onConfirm={confirmDeleteUsedItem}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setItemToDelete(null);
        }}
      />

      <PromptDialog
        open={editQtyOpen}
        title="Edit Item Quantity"
        message="Enter new quantity:"
        initialValue={itemToEdit?.qty.toString() || ""}
        confirmLabel="Update"
        cancelLabel="Cancel"
        inputType="number"
        onConfirm={confirmEditUsedItemQuantity}
        onCancel={() => {
          setEditQtyOpen(false);
          setItemToEdit(null);
        }}
      />

      {/* ✅ NEW: Spun Change Schedule Dialog */}
      <Dialog 
        open={spunChangeDialogOpen} 
        onClose={() => setSpunChangeDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>Schedule Next Spun Change</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Did you change the water filter spun today? If so, set when the admin should be notified for the next change:
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
            <TextField
              label="Value"
              type="number"
              fullWidth
              value={daysNextChange}
              onChange={(e) => setDaysNextChange(e.target.value)}
              variant="outlined"
              size="small"
            />
            <TextField
              select
              label="Unit"
              value={maintenanceUnit}
              onChange={(e) => setMaintenanceUnit(e.target.value as any)}
              variant="outlined"
              size="small"
              sx={{ minWidth: 100 }}
            >
              <MenuItem value="days">Days</MenuItem>
              <MenuItem value="minutes">Minutes (Test)</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSpunChangeDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={async () => {
              let targetInstallationId = request.installationId;
              
              // 🔍 If request isn't linked to an installation, try to find one for the customer
              if (!targetInstallationId && request.customer?.id) {
                try {
                  const customerInstallations = await installationService.getByCustomer(request.customer.id);
                  if (customerInstallations && customerInstallations.length > 0) {
                    targetInstallationId = customerInstallations[0].id;
                  }
                } catch (err) {
                  console.error("Failed to auto-find installation:", err);
                }
              }

              if (!targetInstallationId) {
                setSnackbar({
                  open: true,
                  message: "Error: No installation found for this customer. Please create an installation first.",
                  severity: "error",
                });
                setSpunChangeDialogOpen(false);
                return;
              }

              try {
                const val = parseInt(daysNextChange) || (maintenanceUnit === 'days' ? 90 : 5);
                await installationService.updateSpunChange(
                  targetInstallationId, 
                  maintenanceUnit === 'days' ? val : undefined,
                  maintenanceUnit === 'minutes' ? val : undefined
                );
                setSnackbar({
                  open: true,
                  message: `Next maintenance scheduled for ${val} ${maintenanceUnit} from now!`,
                  severity: "success",
                });
              } catch (err) {
                console.error("Failed to schedule maintenance:", err);
                setSnackbar({
                  open: true,
                  message: "Failed to save maintenance schedule. Please try again.",
                  severity: "error",
                });
              } finally {
                setSpunChangeDialogOpen(false);
              }
            }}
          >
            Save & Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServiceRequestDetail;
