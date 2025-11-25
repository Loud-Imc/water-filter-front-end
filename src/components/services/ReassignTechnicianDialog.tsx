import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  Typography,
  Alert,
  Avatar,
  Chip,
  Button,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
  LinearProgress,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { TechnicianWithWorkload, User } from "../../types";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import QuickAddTechnicianDialog from "./QuickAddTechnicianDialog";
import { requestService } from "../../api/services/requestService";

interface ReassignTechnicianDialogProps {
  open: boolean;
  currentTechnician: User | undefined;
  onClose: () => void;
  onReassign: (newTechnicianId: string, reason: string) => Promise<void>;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  reasonRequired?: boolean;
  allowCurrentTechnician?: boolean;
  watchRegionId?: string;
  availableTechnicians?: User[]; // 🆕 Keep for backward compatibility but won't use
}

const ReassignTechnicianDialog: React.FC<ReassignTechnicianDialogProps> = ({
  open,
  currentTechnician,
  onClose,
  onReassign,
  loading = false,
  title = "Change Technician",
  subtitle,
  reasonRequired = true,
  allowCurrentTechnician = false,
  watchRegionId,
}) => {
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const [showAllTechnicians, setShowAllTechnicians] = useState(false);
  const [reason, setReason] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [technicianDialog, setTechnicianDialog] = useState(false);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);

  // 🆕 Two separate lists like CreateServiceRequest
  const [technicians, setTechnicians] = useState<TechnicianWithWorkload[]>([]);
  const [allTechnicians, setAllTechnicians] = useState<TechnicianWithWorkload[]>([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // 🆕 Fetch region-specific technicians
  const fetchRegionTechnicians = async (regionId: string) => {
    setLoadingTechnicians(true);
    try {
      const data = await requestService.getTechniciansWithWorkload(regionId);
      setTechnicians(data);
    } catch (error) {
      console.error("Failed to fetch region technicians:", error);
      setSnackbar({
        open: true,
        message: "Failed to load technicians for this region",
        severity: "error",
      });
    } finally {
      setLoadingTechnicians(false);
    }
  };

  // 🆕 Fetch all technicians (no region filter)
  const fetchAllTechnicians = async () => {
    setLoadingTechnicians(true);
    try {
      const data = await requestService.getTechniciansWithWorkload();
      setAllTechnicians(data);
    } catch (error) {
      console.error("Failed to fetch all technicians:", error);
      setSnackbar({
        open: true,
        message: "Failed to load all technicians",
        severity: "error",
      });
    } finally {
      setLoadingTechnicians(false);
    }
  };

  // 🆕 Fetch region technicians when watchRegionId changes or dialog opens
  useEffect(() => {
    if (open && watchRegionId) {
      fetchRegionTechnicians(watchRegionId);
    }
  }, [open, watchRegionId]);

  // 🆕 Fetch all technicians when toggle is enabled
  useEffect(() => {
    if (open && showAllTechnicians && allTechnicians.length === 0) {
      fetchAllTechnicians();
    }
  }, [open, showAllTechnicians]);

  // 🆕 Determine which list to show
  const techniciansToShow = showAllTechnicians ? allTechnicians : technicians;

  // 🆕 Filter out current technician if not allowed
  const filteredTechnicians = allowCurrentTechnician
    ? techniciansToShow
    : techniciansToShow.filter((t) => t.id !== currentTechnician?.id);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      // Set initial selection
      if (allowCurrentTechnician && currentTechnician) {
        setSelectedTechnicianId(currentTechnician.id);
      } else {
        setSelectedTechnicianId("");
      }
      setReason("");
      setCustomNote("");
      setShowAllTechnicians(false); // Reset toggle
    }
  }, [open, currentTechnician, allowCurrentTechnician]);

  // 🆕 Handle technician creation callback
  const handleTechnicianCreated = async (technicianId: string) => {
    setSelectedTechnicianId(technicianId);

    // Refresh both lists
    if (watchRegionId) {
      await fetchRegionTechnicians(watchRegionId);
    }
    if (showAllTechnicians || allTechnicians.length > 0) {
      await fetchAllTechnicians();
    }

    setSnackbar({
      open: true,
      message: "Technician created and selected successfully!",
      severity: "success",
    });
  };

  const handleReassign = async () => {
    if (!selectedTechnicianId || (reasonRequired && !reason.trim())) return;

    const finalReason = reason === "Other" ? customNote : reason;

    if (reason === "Other" && !customNote.trim()) {
      return;
    }

    try {
      await onReassign(selectedTechnicianId, finalReason);
      setSelectedTechnicianId("");
      setReason("");
      setCustomNote("");
      onClose();
    } catch (error) {
      console.error("Reassignment failed:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
              {subtitle}
            </Typography>
          )}

          {/* Toggle and Add Button */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={showAllTechnicians}
                  onChange={(e) => setShowAllTechnicians(e.target.checked)}
                  disabled={!watchRegionId || loading}
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  Show technicians from all regions
                </Typography>
              }
            />

            <Tooltip title="Create new technician">
              <IconButton
                color="primary"
                onClick={() => setTechnicianDialog(true)}
                disabled={!watchRegionId || loading}
                sx={{
                  border: 1,
                  borderColor: "primary.main",
                  borderRadius: 1,
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Current Technician */}
          {currentTechnician && !allowCurrentTechnician && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Currently Assigned To:
              </Typography>
              <Chip
                avatar={
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {currentTechnician.name[0].toUpperCase()}
                  </Avatar>
                }
                label={currentTechnician.name}
                color="primary"
                variant="outlined"
              />
            </Box>
          )}

          {/* Warning */}
          {!allowCurrentTechnician && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              ⚠️ The current technician will be unassigned and notified about this
              change.
            </Alert>
          )}

          {/* Select New Technician */}
          <TextField
            select
            fullWidth
            label="Select New Technician *"
            value={selectedTechnicianId}
            onChange={(e) => setSelectedTechnicianId(e.target.value)}
            disabled={loading || loadingTechnicians}
            helperText={
              loadingTechnicians
                ? "Loading technicians..."
                : filteredTechnicians.length === 0
                ? showAllTechnicians
                  ? "No technicians available"
                  : "No technicians in this region"
                : showAllTechnicians
                ? "Showing all technicians (any region)"
                : "Showing technicians from selected region only"
            }
          >
            {loadingTechnicians ? (
              <MenuItem disabled>
                <LinearProgress sx={{ width: "100%" }} />
              </MenuItem>
            ) : filteredTechnicians.length === 0 ? (
              <MenuItem disabled>
                {showAllTechnicians
                  ? "No technicians available"
                  : "No technicians in this region"}
              </MenuItem>
            ) : (
              filteredTechnicians.map((tech) => (
                <MenuItem key={tech.id} value={tech.id}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {/* Left: Name and Region */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {tech.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tech.region?.name || "N/A"}
                        {showAllTechnicians && tech.regionId !== watchRegionId && (
                          <Chip
                            label="Different Region"
                            size="small"
                            color="warning"
                            sx={{ ml: 1, height: 16, fontSize: "0.65rem" }}
                          />
                        )}
                      </Typography>
                    </Box>

                    {/* Right: Badges */}
                    <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                      <Chip
                        icon={tech.isExternal ? <BusinessIcon /> : <PersonIcon />}
                        label={tech.isExternal ? "External" : "In-House"}
                        size="small"
                        color={tech.isExternal ? "warning" : "primary"}
                        variant="outlined"
                        sx={{
                          height: 20,
                          fontSize: "0.7rem",
                          "& .MuiChip-icon": { fontSize: 14 },
                        }}
                      />
                      <Chip
                        label={`${tech.pendingTasks} pending`}
                        size="small"
                        color={
                          tech.pendingTasks === 0
                            ? "success"
                            : tech.pendingTasks <= 2
                            ? "warning"
                            : "error"
                        }
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    </Box>
                  </Box>
                </MenuItem>
              ))
            )}
          </TextField>

          {/* Reason for Reassignment */}
          <TextField
            select
            fullWidth
            label={`Reason for Reassignment${
              reasonRequired ? " *" : " (Optional)"
            }`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
            required={reasonRequired}
            sx={{ mt: 2 }}
          >
            <MenuItem value="">-- Select Reason --</MenuItem>
            <MenuItem value="Technician unavailable">
              Technician Unavailable
            </MenuItem>
            <MenuItem value="Workload balancing">Workload Balancing</MenuItem>
            <MenuItem value="Skill mismatch">Skill Mismatch</MenuItem>
            <MenuItem value="Customer request">Customer Request</MenuItem>
            <MenuItem value="Performance issues">Performance Issues</MenuItem>
            <MenuItem value="Administrative">Administrative</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>

          {/* Custom Note - Only show when "Other" is selected */}
          {reason === "Other" && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Custom Note *"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Please specify the reason for reassignment..."
              disabled={loading}
              required
              helperText="This note will be stored as the reassignment reason"
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleReassign}
            variant="contained"
            color="warning"
            disabled={
              !selectedTechnicianId ||
              (reasonRequired && !reason.trim()) ||
              (reason === "Other" && !customNote.trim()) ||
              loading
            }
          >
            {loading ? "Processing..." : "Change Technician"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Add Technician Dialog */}
      <QuickAddTechnicianDialog
        open={technicianDialog}
        onClose={() => setTechnicianDialog(false)}
        onTechnicianCreated={handleTechnicianCreated}
        preSelectedRegionId={watchRegionId}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </>
  );
};

export default ReassignTechnicianDialog;
