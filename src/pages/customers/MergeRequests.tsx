import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stack,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  CompareArrows as CompareArrowsIcon,
  History as HistoryIcon,
  PendingActions as PendingIcon,
} from '@mui/icons-material';
import { customerService } from '../../api/services/customerService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const MergeRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'APPROVED' | 'REJECTED' | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await customerService.getMergeRequests();
      setRequests(data);
    } catch (err) {
      toast.error('Failed to load merge requests');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const historyRequests = requests.filter(r => r.status !== 'PENDING');
  const displayRequests = activeTab === 0 ? pendingRequests : historyRequests;

  const handleOpenProcessDialog = (request: any) => {
    setSelectedRequest(request);
    setProcessDialogOpen(true);
    setAdminNotes('');
  };

  const handleInitiateProcess = (status: 'APPROVED' | 'REJECTED') => {
    setPendingStatus(status);
    setConfirmDialogOpen(true);
  };

  const handleProcess = async () => {
    if (!selectedRequest || !pendingStatus) return;
    
    setProcessing(true);
    try {
      await customerService.processMergeRequest(selectedRequest.id, pendingStatus, adminNotes);
      toast.success(`Merge request ${pendingStatus.toLowerCase()} successfully`);
      setConfirmDialogOpen(false);
      setProcessDialogOpen(false);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process request');
    } finally {
      setProcessing(false);
      setPendingStatus(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Customer Merge Requests
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and approve requests to merge duplicate customer records.
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="merge request tabs">
          <Tab icon={<PendingIcon />} iconPosition="start" label={`Pending (${pendingRequests.length})`} />
          <Tab icon={<HistoryIcon />} iconPosition="start" label="Merge History" />
        </Tabs>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Source Customer</TableCell>
              <TableCell align="center"><CompareArrowsIcon /></TableCell>
              <TableCell>Target Customer</TableCell>
              <TableCell>Requested By</TableCell>
              {activeTab === 1 && <TableCell>Processed By</TableCell>}
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={activeTab === 1 ? 8 : 7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    {activeTab === 0 ? 'No pending merge requests found.' : 'No merge history found.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              displayRequests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>
                    <Typography variant="body2">{new Date(request.createdAt).toLocaleDateString('en-IN')}</Typography>
                    {activeTab === 1 && request.processedAt && (
                      <Typography variant="caption" color="text.secondary">
                        Proc: {new Date(request.processedAt).toLocaleDateString('en-IN')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{request.source.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{request.source.primaryPhone}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <CompareArrowsIcon color="action" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{request.target.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{request.target.primaryPhone}</Typography>
                  </TableCell>
                  <TableCell>
                    {request.requestedBy.name}
                  </TableCell>
                  {activeTab === 1 && (
                    <TableCell>
                      {request.status !== 'PENDING' ? 'Admin' : '-'}
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip
                      label={request.status}
                      size="small"
                      color={
                        request.status === 'PENDING' ? 'warning' :
                          request.status === 'APPROVED' ? 'success' : 'error'
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    {request.status === 'PENDING' ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenProcessDialog(request)}
                      >
                        Process
                      </Button>
                    ) : (
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {request.adminNotes && (
                          <Tooltip title={request.adminNotes}>
                            <IconButton size="small">
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Process Dialog */}
      <Dialog open={processDialogOpen} onClose={() => setProcessDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Process Merge Request</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ py: 1 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>Warning:</strong> Approving this merge will transfer ALL data from
                <strong> {selectedRequest.source.name} </strong> to
                <strong> {selectedRequest.target.name} </strong> and mark the source as merged.
                This action cannot be easily undone.
              </Alert>

              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.selected' }}>
                        <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Field</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>SOURCE (To Merge)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>TARGET (To Keep)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell>{selectedRequest.source.name}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{selectedRequest.target.name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                        <TableCell>{selectedRequest.source.primaryPhone}</TableCell>
                        <TableCell>{selectedRequest.target.primaryPhone}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Sec. Phone</TableCell>
                        <TableCell>{selectedRequest.source.secondaryPhone || '-'}</TableCell>
                        <TableCell>{selectedRequest.target.secondaryPhone || '-'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                        <TableCell>{selectedRequest.source.email || '-'}</TableCell>
                        <TableCell>{selectedRequest.target.email || '-'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                        <TableCell>
                          <Typography variant="caption">{selectedRequest.source.address}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{selectedRequest.target.address}</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Region</TableCell>
                        <TableCell>{selectedRequest.source.region?.name || '-'}</TableCell>
                        <TableCell>{selectedRequest.target.region?.name || '-'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>

              {selectedRequest.reason && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Staff Reason:</Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>"{selectedRequest.reason}"</Typography>
                </Box>
              )}

              <TextField
                fullWidth
                label="Admin Notes"
                multiline
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setProcessDialogOpen(false)} disabled={processing}>Cancel</Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<CloseIcon />}
            onClick={() => handleInitiateProcess('REJECTED')}
            disabled={processing}
          >
            Reject
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<CheckIcon />}
            onClick={() => handleInitiateProcess('APPROVED')}
            disabled={processing}
          >
            Approve & Merge
          </Button>
        </DialogActions>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Final Confirmation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to <strong>{pendingStatus === 'APPROVED' ? 'APPROVE and MERGE' : 'REJECT'}</strong> this request?
          </Typography>
          {pendingStatus === 'APPROVED' && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              This will permanently move all service history and installations. This action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDialogOpen(false)} disabled={processing}>No, Cancel</Button>
          <Button 
            variant="contained" 
            color={pendingStatus === 'APPROVED' ? 'success' : 'error'}
            onClick={handleProcess}
            disabled={processing}
          >
            Yes, Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MergeRequests;
