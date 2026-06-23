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
import type { TechnicianWithWorkload } from "../../types";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import QuickAddTechnicianDialog from "./QuickAddTechnicianDialog";
import { requestService } from "../../api/services/requestService";

interface AssignTechnicianDialogProps {
  open: boolean;
  onClose: () => void;
  onAssign: (technicianId: string) => Promise<void>;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  watchRegionId?: string;
}

const AssignTechnicianDialog: React.FC<AssignTechnicianDialogProps> = ({
  open,
  onClose,
  onAssign,
  loading = false,
  title = "Assign Technician",
  subtitle,
  watchRegionId,
}) => {
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const [showAllTechnicians, setShowAllTechnicians] = useState(false);
  const [technicianDialog, setTechnicianDialog] = useState(false);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);

  const [technicians, setTechnicians] = useState<TechnicianWithWorkload[]>([]);
  const [allTechnicians, setAllTechnicians] = useState<TechnicianWithWorkload[]>([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

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

  useEffect(() => {
    if (open && watchRegionId) {
      fetchRegionTechnicians(watchRegionId);
    }
  }, [open, watchRegionId]);

  useEffect(() => {
    if (open && showAllTechnicians && allTechnicians.length === 0) {
      fetchAllTechnicians();
    }
  }, [open, showAllTechnicians]);

  const techniciansToShow = showAllTechnicians ? allTechnicians : technicians;

  useEffect(() => {
    if (open) {
      setSelectedTechnicianId("");
      setShowAllTechnicians(false);
    }
  }, [open]);

  const handleTechnicianCreated = async (technicianId: string) => {
    setSelectedTechnicianId(technicianId);

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

  const handleAssign = async () => {
    if (!selectedTechnicianId) return;

    try {
      await onAssign(selectedTechnicianId);
      setSelectedTechnicianId("");
      onClose();
    } catch (error) {
      console.error("Assignment failed:", error);
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

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              mt: 1,
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

          <TextField
            select
            fullWidth
            label="Select Technician *"
            value={selectedTechnicianId}
            onChange={(e) => setSelectedTechnicianId(e.target.value)}
            disabled={loading || loadingTechnicians}
            helperText={
              loadingTechnicians
                ? "Loading technicians..."
                : techniciansToShow.length === 0
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
            ) : techniciansToShow.length === 0 ? (
              <MenuItem disabled>
                {showAllTechnicians
                  ? "No technicians available"
                  : "No technicians in this region"}
              </MenuItem>
            ) : (
              techniciansToShow.map((tech) => (
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
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            variant="contained"
            color="primary"
            disabled={!selectedTechnicianId || loading}
          >
            {loading ? "Processing..." : "Assign Technician"}
          </Button>
        </DialogActions>
      </Dialog>

      <QuickAddTechnicianDialog
        open={technicianDialog}
        onClose={() => setTechnicianDialog(false)}
        onTechnicianCreated={handleTechnicianCreated}
        preSelectedRegionId={watchRegionId}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </>
  );
};

export default AssignTechnicianDialog;
