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
} from "@mui/material";
import type { User } from "../../types";

interface ReassignTechnicianDialogProps {
  open: boolean;
  currentTechnician: User| undefined ;
  availableTechnicians: User[];
  onClose: () => void;
  onReassign: (newTechnicianId: string, reason: string) => Promise<void>;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  reasonRequired?: boolean;
  allowCurrentTechnician?: boolean;
}

const ReassignTechnicianDialog: React.FC<ReassignTechnicianDialogProps> = ({
  open,
  currentTechnician,
  availableTechnicians,
  onClose,
  onReassign,
  loading = false,
  title = "Change Technician",
  subtitle,
  reasonRequired = true,
  allowCurrentTechnician = false,
}) => {
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const [reason, setReason] = useState("");
  const [customNote, setCustomNote] = useState("");

  const techniciansToShow = allowCurrentTechnician
    ? availableTechnicians
    : availableTechnicians.filter((t) => t.id !== currentTechnician?.id);

  useEffect(() => {
    if (allowCurrentTechnician && currentTechnician) {
      setSelectedTechnicianId(currentTechnician.id);
    } else {
      setSelectedTechnicianId("");
    }
    setReason("");
    setCustomNote("");
  }, [open, currentTechnician, allowCurrentTechnician]);

  const handleReassign = async () => {
    if (!selectedTechnicianId || (reasonRequired && !reason.trim())) return;

    // If "Other" is selected, use custom note as reason
    const finalReason = reason === "Other" ? customNote : reason;

    if (reason === "Other" && !customNote.trim()) {
      return; // Don't proceed if Other is selected but no custom note
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

  const isOtherSelected = reason === "Other";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {subtitle}
          </Typography>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {/* Current Technician */}
          {currentTechnician && (
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
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
          <Alert severity="warning">
            ⚠️ The current technician will be unassigned and notified about this
            change.
          </Alert>

          {/* Select New Technician */}
          <TextField
            select
            fullWidth
            label="Select New Technician *"
            value={selectedTechnicianId}
            onChange={(e) => setSelectedTechnicianId(e.target.value)}
            disabled={loading || techniciansToShow.length === 0}
            helperText={
              techniciansToShow.length === 0
                ? "No technicians available"
                : `${techniciansToShow.length} available`
            }
          >
            {techniciansToShow.length === 0 && (
              <MenuItem disabled>No technicians available</MenuItem>
            )}
            {techniciansToShow.map((tech) => (
              <MenuItem key={tech.id} value={tech.id}>
                {tech.name}
                {tech.region?.name ? ` (${tech.region.name})` : ""}
              </MenuItem>
            ))}
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
          {isOtherSelected && (
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
            />
          )}
        </Box>
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
            (isOtherSelected && !customNote.trim()) ||
            loading
          }
        >
          {loading ? "Processing..." : "Change Technician"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReassignTechnicianDialog;
