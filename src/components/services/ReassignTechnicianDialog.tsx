import React, { useState } from 'react';
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
} from '@mui/material';
import Button from '@mui/material/Button';
import type { User } from '../../types';

interface ReassignTechnicianDialogProps {
  open: boolean;
  currentTechnician: User | null;
  availableTechnicians: User[];
  onClose: () => void;
  onReassign: (newTechnicianId: string, reason: string) => Promise<void>;
  loading?: boolean;
}

const ReassignTechnicianDialog: React.FC<ReassignTechnicianDialogProps> = ({
  open,
  currentTechnician,
  availableTechnicians,
  onClose,
  onReassign,
  loading = false,
}) => {
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [reason, setReason] = useState('');

  const handleReassign = async () => {
    if (!selectedTechnicianId || !reason.trim()) return;

    try {
      await onReassign(selectedTechnicianId, reason);
      setSelectedTechnicianId('');
      setReason('');
      onClose();
    } catch (error) {
      console.error('Reassignment failed:', error);
    }
  };

  const otherTechnicians = availableTechnicians.filter(
    (t) => t.id !== currentTechnician?.id,
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Change Technician</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {/* Current Technician */}
          {currentTechnician && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Currently Assigned To:
              </Typography>
              <Chip
                avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>
                  {currentTechnician.name[0].toUpperCase()}
                </Avatar>}
                label={currentTechnician.name}
                color="primary"
                variant="outlined"
              />
            </Box>
          )}

          {/* Warning */}
          <Alert severity="warning">
            ⚠️ The current technician will be unassigned and notified about this change.
          </Alert>

          {/* Select New Technician */}
          <TextField
            select
            fullWidth
            label="Select New Technician *"
            value={selectedTechnicianId}
            onChange={(e) => setSelectedTechnicianId(e.target.value)}
            disabled={loading || otherTechnicians.length === 0}
            helperText={
              otherTechnicians.length === 0
                ? 'No other technicians available'
                : `${otherTechnicians.length} available`
            }
          >
            {otherTechnicians.map((tech) => (
              <MenuItem key={tech.id} value={tech.id}>
                {tech.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Reason for Reassignment */}
          <TextField
            select
            fullWidth
            label="Reason for Reassignment *"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
          >
            <MenuItem value="">-- Select Reason --</MenuItem>
            <MenuItem value="Technician unavailable">Technician Unavailable</MenuItem>
            <MenuItem value="Workload balancing">Workload Balancing</MenuItem>
            <MenuItem value="Skill mismatch">Skill Mismatch</MenuItem>
            <MenuItem value="Customer request">Customer Request</MenuItem>
            <MenuItem value="Performance issues">Performance Issues</MenuItem>
            <MenuItem value="Administrative">Administrative</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
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
          disabled={!selectedTechnicianId || !reason.trim() || loading}
        >
          {loading ? 'Changing...' : 'Change Technician'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReassignTechnicianDialog;
