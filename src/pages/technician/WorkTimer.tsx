import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, TextField, Divider, Alert,  } from '@mui/material';
import { Grid } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import UploadIcon from '@mui/icons-material/Upload';
import { useParams, useNavigate } from 'react-router-dom';
import { requestService } from '../../api/services/requestService';
import PageHeader from '../../components/common/PageHeader';
import SnackbarNotification from '../../components/common/SnackbarNotification';

const WorkTimer: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [isWorking, setIsWorking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorking && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorking, startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartWork = async () => {
    if (!requestId) return;

    try {
      await requestService.startWork(requestId);
      setStartTime(new Date());
      setIsWorking(true);
      setSnackbar({ open: true, message: 'Work started!', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to start work', severity: 'error' });
    }
  };

  const handleStopWork = async () => {
    if (!requestId) return;

    try {
      await requestService.stopWork(requestId, notes);
      setIsWorking(false);
      setSnackbar({ open: true, message: 'Work stopped successfully!', severity: 'success' });
      
      // Upload file if selected
      if (selectedFile) {
        await handleFileUpload();
      }

      setTimeout(() => navigate('/technician/my-tasks'), 2000);
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to stop work', severity: 'error' });
    }
  };

  const handleFileUpload = async () => {
    if (!requestId || !selectedFile) return;

    try {
      await requestService.uploadWorkMedia(requestId, selectedFile);
      setSnackbar({ open: true, message: 'Media uploaded successfully!', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to upload media', severity: 'error' });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Work Timer"
        breadcrumbs={[
          { label: 'My Tasks', path: '/technician/my-tasks' },
          { label: 'Timer' },
        ]}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Timer Control
              </Typography>

              <Box sx={{ my: 4, textAlign: 'center' }}>
                <Typography variant="h1" fontWeight={600} color="primary">
                  {formatTime(elapsedTime)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                {!isWorking ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleStartWork}
                    fullWidth
                  >
                    Start Work
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={<StopIcon />}
                    onClick={handleStopWork}
                    fullWidth
                  >
                    Stop Work
                  </Button>
                )}
              </Box>

              {isWorking && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  Timer is running. Complete your work and stop the timer when done.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Work Details
              </Typography>

              <Divider sx={{ my: 2 }} />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Work Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about the work completed..."
                sx={{ mb: 3 }}
              />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Upload Work Photos
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  fullWidth
                >
                  Select Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </Button>
                {selectedFile && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Selected: {selectedFile.name}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <SnackbarNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default WorkTimer;
