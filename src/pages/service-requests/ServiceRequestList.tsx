import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAllRequests } from '../../app/slices/requestSlice';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusChip from '../../components/common/StatusChip';
import { formatDate } from '../../utils/helpers';
import type { ServiceRequest, RequestStatus } from '../../types';

const ServiceRequestList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { requests, loading } = useAppSelector((state) => state.requests);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchAllRequests());
  }, [dispatch]);

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (row: ServiceRequest) => {
    navigate(`/service-requests/${row.id}`);
  };

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;
    
    const matchesSearch = !searchQuery || 
      request?.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request?.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const paginatedRequests = filteredRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const columns = [
    { id: 'id', label: 'ID', minWidth: 100, format: (value: string) => value.slice(0, 8) },
    { id: 'type', label: 'Type', minWidth: 100 },
    {
      id: 'customer',
      label: 'Customer',
      minWidth: 150,
      format: (value: any) => value?.name || 'N/A',
    },
    { id: 'description', label: 'Description', minWidth: 200 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 130,
      // ✅ OPTION 1: Pass both status and type to StatusChip
      format: (value: RequestStatus, row: ServiceRequest) => (
        <StatusChip status={value} requestType={row.type} />
      ),
    },
    {
      id: 'assignedTo',
      label: 'Technician',
      minWidth: 150,
      format: (value: any) => value?.name || 'Not Assigned',
    },
    {
      id: 'createdAt',
      label: 'Created',
      minWidth: 150,
      format: (value: string) => formatDate(value),
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <PageHeader
        title="Service Requests"
        action={{
          label: 'New Request',
          icon: <AddIcon />,
          onClick: () => navigate('/service-requests/create'),
        }}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: 250 }}
            />
            <TextField
              select
              label="Status"
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="PENDING_APPROVAL">Pending Approval</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="ASSIGNED">Assigned</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="WORK_COMPLETED">Work Completed</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {filteredRequests.length === 0 ? (
        <EmptyState
          title="No service requests found"
          description="Create your first service request to get started"
          actionLabel="Create Request"
          onAction={() => navigate('/service-requests/create')}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={paginatedRequests}
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={filteredRequests.length}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onRowClick={handleRowClick}
        />
      )}
    </Box>
  );
};

export default ServiceRequestList;
